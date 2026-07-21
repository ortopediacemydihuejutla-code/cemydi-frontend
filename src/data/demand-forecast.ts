export type DemandForecastStatus =
  | "Stock suficiente"
  | "Revisar inventario"
  | "Posible faltante"
  | "Alta demanda";

export type DemandForecast = {
  id: number;
  productName: string;
  shortName: string;
  price: number;
  currentStock: number;
  month: number;
  previousMonthSales: number;
  previousMonthRentals: number;
  previousMonthViews: number;
  activePromotion: boolean;
  predictedDemand: number;
  recommendation: string;
};

export function getDemandDifference(forecast: DemandForecast) {
  return forecast.predictedDemand - forecast.currentStock;
}

export function getDemandStatus(
  currentStock: number,
  predictedDemand: number,
): DemandForecastStatus {
  const difference = predictedDemand - currentStock;

  if (difference >= 10) return "Alta demanda";
  if (difference > 0) return "Posible faltante";
  if (difference === 0) return "Revisar inventario";
  return "Stock suficiente";
}

export const demandForecast: DemandForecast[] = [
  {
    id: 1,
    productName: "Silla de ruedas estándar",
    shortName: "Silla estándar",
    price: 3200,
    currentStock: 8,
    month: 8,
    previousMonthSales: 10,
    previousMonthRentals: 5,
    previousMonthViews: 95,
    activePromotion: true,
    predictedDemand: 18,
    recommendation: "Priorizar la reposición de 10 unidades.",
  },
  {
    id: 2,
    productName: "Rodillera elástica con ajuste",
    shortName: "Rodillera elástica",
    price: 350,
    currentStock: 30,
    month: 8,
    previousMonthSales: 32,
    previousMonthRentals: 0,
    previousMonthViews: 70,
    activePromotion: false,
    predictedDemand: 38,
    recommendation: "Programar una compra preventiva de 8 unidades.",
  },
  {
    id: 3,
    productName: "Cama hospitalaria eléctrica",
    shortName: "Cama eléctrica",
    price: 14500,
    currentStock: 3,
    month: 8,
    previousMonthSales: 1,
    previousMonthRentals: 12,
    previousMonthViews: 140,
    activePromotion: true,
    predictedDemand: 15,
    recommendation: "Asegurar 12 unidades adicionales para renta.",
  },
  {
    id: 4,
    productName: "Bota ortopédica tipo walker",
    shortName: "Bota walker",
    price: 950,
    currentStock: 6,
    month: 8,
    previousMonthSales: 8,
    previousMonthRentals: 4,
    previousMonthViews: 55,
    activePromotion: false,
    predictedDemand: 9,
    recommendation: "Reponer al menos 3 unidades.",
  },
  {
    id: 5,
    productName: "Faja lumbar reforzada",
    shortName: "Faja lumbar",
    price: 700,
    currentStock: 12,
    month: 8,
    previousMonthSales: 14,
    previousMonthRentals: 0,
    previousMonthViews: 60,
    activePromotion: true,
    predictedDemand: 20,
    recommendation: "Preparar la reposición de 8 unidades.",
  },
  {
    id: 6,
    productName: "Andadera plegable con ruedas",
    shortName: "Andadera plegable",
    price: 1450,
    currentStock: 17,
    month: 8,
    previousMonthSales: 12,
    previousMonthRentals: 6,
    previousMonthViews: 88,
    activePromotion: false,
    predictedDemand: 17,
    recommendation: "Monitorear la rotación antes de reponer.",
  },
  {
    id: 7,
    productName: "Bastón de aluminio ajustable",
    shortName: "Bastón ajustable",
    price: 620,
    currentStock: 24,
    month: 8,
    previousMonthSales: 18,
    previousMonthRentals: 0,
    previousMonthViews: 80,
    activePromotion: true,
    predictedDemand: 22,
    recommendation: "Mantener el nivel actual de inventario.",
  },
  {
    id: 8,
    productName: "Cojín antiescaras de gel",
    shortName: "Cojín antiescaras",
    price: 980,
    currentStock: 15,
    month: 8,
    previousMonthSales: 7,
    previousMonthRentals: 0,
    previousMonthViews: 49,
    activePromotion: false,
    predictedDemand: 11,
    recommendation: "Conservar el stock y revisar la rotación mensual.",
  },
];
