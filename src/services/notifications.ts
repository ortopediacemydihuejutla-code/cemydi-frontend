import { apiFetch } from "@/lib/api-fetch";
import { parseApiResponse } from "@/lib/api-error";
import { z } from "@/lib/zod";
import {
  inboxSchema,
  preferencesResponseSchema,
  notificationDetailSchema,
  notificationPromotionSchema,
  type CustomerNotification,
  type NotificationPreferences,
} from "@/lib/schemas/notifications";

const messageSchema = z.object({ message: z.string() });
export async function getNotificationDetail(id: string) {
  return parseApiResponse(
    await apiFetch(`/notifications/${encodeURIComponent(id)}`, {
      cache: "no-store",
    }),
    "No se pudo cargar la notificación.",
    notificationDetailSchema,
  );
}
export async function getNotificationPromotion(id: string) {
  return parseApiResponse(
    await apiFetch(`/notifications/promotion/${encodeURIComponent(id)}`, {
      cache: "no-store",
    }),
    "Esta promoción ya no está disponible.",
    notificationPromotionSchema,
  );
}
export async function getNotifications(page = 1, category?: string) {
  const query = new URLSearchParams({ page: String(page) });
  if (category) query.set("category", category);
  return parseApiResponse(
    await apiFetch(`/notifications?${query}`, { cache: "no-store" }),
    "No se pudieron cargar las notificaciones.",
    inboxSchema,
  );
}
export async function getNotificationPreferences() {
  return parseApiResponse(
    await apiFetch("/notifications/preferences", { cache: "no-store" }),
    "No se pudieron cargar tus preferencias.",
    preferencesResponseSchema,
  );
}
export async function saveNotificationPreferences(
  preferences: NotificationPreferences,
) {
  return parseApiResponse(
    await apiFetch("/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    }),
    "No se pudieron guardar tus preferencias.",
    preferencesResponseSchema,
  );
}
export async function readNotifications(ids: string[]) {
  return parseApiResponse(
    await apiFetch("/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }),
    "No se pudieron marcar como leídas.",
    messageSchema,
  );
}
export async function readAllNotifications() {
  return parseApiResponse(
    await apiFetch("/notifications/read-all", { method: "PATCH" }),
    "No se pudieron marcar todas las notificaciones como leídas.",
    messageSchema,
  );
}
export async function getWebPushConfig() {
  return parseApiResponse(
    await apiFetch("/notifications/push-config", { cache: "no-store" }),
    "No se pudo consultar la configuración push.",
    z.object({ publicKey: z.string().nullable() }),
  );
}
export async function registerWebPush(subscription: PushSubscription) {
  const value = subscription.toJSON();
  return parseApiResponse(
    await apiFetch("/notifications/subscriptions/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: "WEB",
        endpoint: value.endpoint,
        p256dh: value.keys?.p256dh,
        auth: value.keys?.auth,
      }),
    }),
    "No se pudo activar este navegador.",
    z.object({ id: z.string() }),
  );
}
export function notificationHref(
  item: Pick<CustomerNotification, "destinationType" | "destinationId">,
) {
  const id = encodeURIComponent(item.destinationId ?? "");
  if (item.destinationType === "PRODUCT" && id) return `/producto/${id}`;
  if (item.destinationType === "PROMOTION" && id) return `/ofertas/${id}`;
  if (item.destinationType === "RENTAL" && id) return `/mis-rentas/${id}`;
  if (item.destinationType === "ACCOUNT") return "/configuracion";
  return null;
}
