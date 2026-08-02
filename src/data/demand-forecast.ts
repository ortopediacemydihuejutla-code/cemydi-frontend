export type DemandForecastStatus =
  | "Stock suficiente"
  | "Stock justo"
  | "Posible faltante"
  | "Faltante crítico";

export type DemandForecast = {
  id: number;
  productName: string;
  shortName: string;
  classification: string;
  acquisitionType: "VENTA" | "RENTA" | "MIXTO";
  active: boolean;
  price: number;
  currentStock: number;
  month: number;
  previousMonthSales: number;
  previousMonthRentals: number;
  previousMonthViews: number;
  activePromotion: boolean;
  predictedDemand: number;
  shortage: number;
  recommendation: string;
};

export function getDemandDifference(forecast: DemandForecast) {
  return forecast.shortage;
}

export function getDemandStatus(
  currentStock: number,
  predictedDemand: number,
): DemandForecastStatus {
  const difference = predictedDemand - currentStock;

  if (difference >= 10) return "Faltante crítico";
  if (difference > 0) return "Posible faltante";
  if (difference === 0) return "Stock justo";
  return "Stock suficiente";
}
