import { adminRequest } from "./request";
import type { AdminActivityItem } from "./types";

export function getAdminRecentActivity(limit = 20) {
  return adminRequest<{ items: AdminActivityItem[] }>(
    `/admin/activity?limit=${limit}`,
    { method: "GET" },
  );
}
