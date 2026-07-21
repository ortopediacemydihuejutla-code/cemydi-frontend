import { adminRequest } from "./request";
import type { AdminNotificationItem } from "./types";

export function getAdminNotifications(limit = 40) {
  return adminRequest<{
    items: AdminNotificationItem[];
    checkedAt: string;
  }>(`/admin/notifications?limit=${limit}`, { method: "GET" });
}
