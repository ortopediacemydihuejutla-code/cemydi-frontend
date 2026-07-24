import { adminRequest } from "./request";
import type {
  AnalyticsDashboardData,
  CustomerSegmentationData,
  DemandForecastData,
} from "./types";

export function getAnalyticsDashboard(days?: number) {
  const q = days != null ? `?days=${days}` : "";
  return adminRequest<AnalyticsDashboardData>(`/analytics${q}`, {
    method: "GET",
  });
}

export function getCustomerSegmentation() {
  return adminRequest<CustomerSegmentationData>("/analytics/customer-segmentation", {
    method: "GET",
  });
}

export function getDemandForecast() {
  return adminRequest<DemandForecastData>("/analytics/demand-forecast", {
    method: "GET",
  });
}
