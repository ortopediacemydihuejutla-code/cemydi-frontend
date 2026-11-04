import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse } from "@/lib/api-error";
import { z } from "@/lib/zod";

const challengeSchema = z.object({
  message: z.string(),
  resendAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
});
const receiptSchema = z.object({
  id: z.uuid(),
  status: z.enum(["WAITING_OBLIGATIONS", "PROCESSING", "COMPLETED"]),
  message: z.string(),
});
export type AccountDeletionReceipt = z.infer<typeof receiptSchema>;
export async function requestAccountDeletion(correo: string) {
  const response = await apiFetch("/account-deletion/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo }),
  });
  return parseApiResponse(
    response,
    "No pudimos enviar el código.",
    challengeSchema,
  );
}
export async function confirmAccountDeletion(correo: string, codigo: string) {
  const response = await apiFetch("/account-deletion/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, codigo }),
  });
  return parseApiResponse(
    response,
    "No pudimos confirmar la eliminación.",
    receiptSchema,
  );
}
