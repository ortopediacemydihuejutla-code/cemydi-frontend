import { NextResponse } from "next/server";
import { z } from "@/lib/zod";

const clientErrorPayloadSchema = z.object({
  message: z.string().max(1000),
  name: z.string().max(100).optional(),
  digest: z.string().max(200).optional(),
  scope: z.string().max(100).optional(),
  stack: z.string().max(2000).optional(),
  url: z.string().max(2000).optional(),
  timestamp: z.string().optional(),
});

export type ClientErrorPayload = z.infer<typeof clientErrorPayloadSchema>;

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
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
      url: payload.url ?? null,
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
