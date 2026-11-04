import { z } from "@/lib/zod";
import {
  automationResponseSchema,
  campaignHistorySchema,
  type CampaignPayload,
} from "@/lib/schemas/notifications";
import { adminRequest } from "./request";

const base = "/admin/notification-campaigns";
export async function getCampaignHistory(page = 1) {
  return campaignHistorySchema.parse(
    await adminRequest<unknown>(`${base}?page=${page}`),
  );
}
export async function sendCampaign(payload: CampaignPayload) {
  return z
    .object({ id: z.string(), message: z.string() })
    .parse(
      await adminRequest<unknown>(base, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
}
export async function findNotificationRecipients(search: string) {
  return z
    .object({
      users: z.array(
        z.object({
          id: z.number().int(),
          nombre: z.string(),
          correo: z.string(),
        }),
      ),
    })
    .parse(
      await adminRequest<unknown>(
        `${base}/recipients?${new URLSearchParams({ search })}`,
      ),
    );
}
export async function getNotificationAutomation() {
  return automationResponseSchema.parse(
    await adminRequest<unknown>(`${base}/automation`),
  );
}
export async function findNotificationDestinations(
  type: string,
  search: string,
  userId?: number,
) {
  const query = new URLSearchParams({ type, search });
  if (userId) query.set("userId", String(userId));
  return z
    .object({ items: z.array(z.object({ id: z.string(), label: z.string() })) })
    .parse(await adminRequest<unknown>(`${base}/destinations?${query}`));
}
export async function saveNotificationAutomation(
  settings: z.infer<typeof automationResponseSchema>["settings"],
) {
  return automationResponseSchema.parse(
    await adminRequest<unknown>(`${base}/automation`, {
      method: "PATCH",
      body: JSON.stringify(settings),
    }),
  );
}
