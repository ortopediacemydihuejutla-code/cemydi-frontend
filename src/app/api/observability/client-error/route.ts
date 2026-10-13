import { NextResponse } from "next/server";
import { z } from "@/lib/zod";
import { telemetryUrl } from "@/lib/observability/telemetry-url";

const MAX_BODY_BYTES = 16 * 1024;
const REPORT_WINDOW_MS = 60_000;
const MAX_REPORTS_PER_WINDOW = 300;
let reportWindowStart = 0;
let reportCount = 0;

const clientErrorPayloadSchema = z.object({
  message: z.string().max(1000),
  name: z.string().max(100).optional(),
  digest: z.string().max(200).optional(),
  scope: z.string().max(100).optional(),
  stack: z.string().max(2000).optional(),
  url: z.string().max(2000).optional(),
  timestamp: z.iso.datetime().max(40).optional(),
});

export type ClientErrorPayload = z.infer<typeof clientErrorPayloadSchema>;

export async function POST(request: Request) {
  // Telemetry is public, but cross-origin submissions and unbounded logs are not needed.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return new NextResponse(null, { status: 403 });
  }
  const now = Date.now();
  if (now - reportWindowStart >= REPORT_WINDOW_MS) {
    reportWindowStart = now;
    reportCount = 0;
  }
  if (++reportCount > MAX_REPORTS_PER_WINDOW) {
    return new NextResponse(null, { status: 429, headers: { "Retry-After": "60" } });
  }

  try {
    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 413 });
    }
    // Count streamed bytes too; Content-Length may be absent or inaccurate.
    const reader = request.body?.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let body = "";
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_BODY_BYTES) {
            await reader.cancel();
            return new NextResponse(null, { status: 413 });
          }
          body += decoder.decode(value, { stream: true });
        }
        body += decoder.decode();
      } finally {
        reader.releaseLock();
      }
    }
    let json: unknown;
    try { json = JSON.parse(body); } catch { json = null; }
    const parsed = clientErrorPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload no válido" },
        { status: 400 },
      );
    }

    const payload = parsed.data;

    console.error("[CLIENT_ERROR_TELEMETRY]", JSON.stringify({
      level: "error",
      name: payload.name ?? "Error",
      message: payload.message,
      digest: payload.digest ?? null,
      scope: payload.scope ?? "client",
      url: telemetryUrl(payload.url) ?? null,
      stack: payload.stack ?? null,
      recordedAt: payload.timestamp ?? new Date().toISOString(),
    }));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CLIENT_ERROR_TELEMETRY_FAILED]", error);
    return NextResponse.json(
      { error: "Error al procesar reporte" },
      { status: 500 },
    );
  }
}
