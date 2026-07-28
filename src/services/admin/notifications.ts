import { adminRequest } from "./request";
import type { AdminNotificationItem } from "./types";

export type AdminNotificationsResponse = {
  items: AdminNotificationItem[];
  checkedAt: string;
};

export function getAdminNotifications(limit = 40) {
  return adminRequest<AdminNotificationsResponse>(
    `/admin/notifications?limit=${limit}`,
    { method: "GET" },
  );
}

export function markAdminNotificationsAsRead(ids: string[]) {
  return adminRequest<{
    ids: string[];
    readAt: string;
  }>("/admin/notifications/read", {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
}
