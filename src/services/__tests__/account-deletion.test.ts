import { beforeEach, expect, test, vi } from "vitest";
import * as transport from "@/lib/api-fetch";
import {
  confirmAccountDeletion,
  requestAccountDeletion,
} from "../account-deletion";

beforeEach(() => vi.restoreAllMocks());
test("request and confirmation use the exact OTP contract", async () => {
  const spy = vi
    .spyOn(transport, "apiFetch")
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "Enviado",
          resendAt: "2026-11-03T12:01:00.000Z",
          expiresAt: "2026-11-03T12:10:00.000Z",
        }),
        { status: 200 },
      ),
    );
  await requestAccountDeletion("fixture@example.test");
  expect(spy).toHaveBeenCalledWith(
    "/account-deletion/request",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ correo: "fixture@example.test" }),
    }),
  );
  spy.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        id: "0cb2c7f9-e344-41f7-a307-c3a6adbde419",
        status: "WAITING_OBLIGATIONS",
        message: "Registrada",
      }),
      { status: 200 },
    ),
  );
  expect(
    (await confirmAccountDeletion("fixture@example.test", "12345678")).status,
  ).toBe("WAITING_OBLIGATIONS");
});
test("an unknown status or an HTTP rejection never becomes a successful deletion", async () => {
  const spy = vi
    .spyOn(transport, "apiFetch")
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "invalid",
          status: "UNKNOWN",
          message: "Registrada",
        }),
        { status: 200 },
      ),
    );
  await expect(
    confirmAccountDeletion("fixture@example.test", "12345678"),
  ).rejects.toThrow();
  spy.mockResolvedValueOnce(
    new Response(JSON.stringify({ message: "Código inválido" }), {
      status: 400,
    }),
  );
  await expect(
    confirmAccountDeletion("fixture@example.test", "12345678"),
  ).rejects.toThrow();
});
