import { adminRequest } from "./request";
import type { AnalyticsDashboardData } from "./types";

export function getAnalyticsDashboard(days?: number) {
  const q = days != null ? `?days=${days}` : "";
  return adminRequest<AnalyticsDashboardData>(`/analytics${q}`, {
    method: "GET",
  });
}
