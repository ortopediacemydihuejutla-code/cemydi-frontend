export type ProductClusterCode = "C1" | "C2" | "C3" | "C4";

export type ProductAcquisitionType = "VENTA" | "RENTA" | "VENTA_RENTA";

export type ProductCluster = {
  id: number;
  productName: string;
  price: number;
  stock: number;
  acquisitionType: ProductAcquisitionType;
  soldQuantity: number;
  rentedQuantity: number;
  viewCount: number;
  generatedRevenue: number;
  cluster: ProductClusterCode;
};

export type ProductClusterDefinition = {
  code: ProductClusterCode;
  name: string;
  description: string;
  action: string;
  chartColor: string;
};

export const productClusterDefinitions: Record<
  ProductClusterCode,
  ProductClusterDefinition
> = {
  C1: {
    code: "C1",
    name: "Venta frecuente y alta rotación",
    description: "Productos accesibles con movimiento constante.",
    action: "Priorizar reposición y promociones.",
    chartColor: "#0ea5e9",
  },
  C2: {
    code: "C2",
    name: "Renta frecuente y alto valor",
    description: "Equipos de alto valor con demanda recurrente de renta.",
    action: "Revisar disponibilidad y mantenimiento.",
    chartColor: "#8b5cf6",
  },
  C3: {
    code: "C3",
    name: "Productos estratégicos",
    description: "Artículos mixtos con alta demanda e ingresos relevantes.",
    action: "Asegurar inventario de productos estratégicos.",
    chartColor: "#10b981",
  },
  C4: {
    code: "C4",
    name: "Demanda media y stock limitado",
    description: "Productos con actividad moderada y pocas existencias.",
    action: "Monitorear stock y demanda.",
    chartColor: "#f59e0b",
  },
};

export const productClusters: ProductCluster[] = [
  {
    id: 1,
    productName: "Rodillera elástica con ajuste",
    price: 350,
    stock: 30,
    acquisitionType: "VENTA",
    soldQuantity: 45,
    rentedQuantity: 0,
    viewCount: 95,
    generatedRevenue: 15750,
    cluster: "C1",
  },
  {
    id: 2,
    productName: "Bastón de aluminio ajustable",
    price: 620,
    stock: 24,
    acquisitionType: "VENTA",
    soldQuantity: 38,
    rentedQuantity: 0,
    viewCount: 104,
    generatedRevenue: 23560,
    cluster: "C1",
  },
  {
    id: 3,
    productName: "Faja lumbar reforzada",
    price: 850,
    stock: 18,
    acquisitionType: "VENTA",
    soldQuantity: 31,
    rentedQuantity: 0,
    viewCount: 89,
    generatedRevenue: 26350,
    cluster: "C1",
  },
  {
    id: 4,
    productName: "Collarín cervical semirrígido",
    price: 480,
    stock: 26,
    acquisitionType: "VENTA",
    soldQuantity: 42,
    rentedQuantity: 0,
    viewCount: 112,
    generatedRevenue: 20160,
    cluster: "C1",
  },
  {
    id: 5,
    productName: "Muletas de aluminio adulto",
    price: 1200,
    stock: 16,
    acquisitionType: "VENTA",
    soldQuantity: 27,
    rentedQuantity: 0,
    viewCount: 81,
    generatedRevenue: 32400,
    cluster: "C1",
  },
  {
    id: 6,
    productName: "Cama hospitalaria eléctrica",
    price: 14500,
    stock: 3,
    acquisitionType: "RENTA",
    soldQuantity: 2,
    rentedQuantity: 18,
    viewCount: 210,
    generatedRevenue: 98000,
    cluster: "C2",
  },
  {
    id: 7,
    productName: "Silla de ruedas reclinable",
    price: 11200,
    stock: 4,
    acquisitionType: "RENTA",
    soldQuantity: 1,
    rentedQuantity: 16,
    viewCount: 186,
    generatedRevenue: 82400,
    cluster: "C2",
  },
  {
    id: 8,
    productName: "Grúa para traslado de pacientes",
    price: 24000,
    stock: 2,
    acquisitionType: "RENTA",
    soldQuantity: 1,
    rentedQuantity: 12,
    viewCount: 164,
    generatedRevenue: 104000,
    cluster: "C2",
  },
  {
    id: 9,
    productName: "Silla de ruedas estándar",
    price: 3200,
    stock: 8,
    acquisitionType: "VENTA_RENTA",
    soldQuantity: 15,
    rentedQuantity: 9,
    viewCount: 120,
    generatedRevenue: 72000,
    cluster: "C3",
  },
  {
    id: 10,
    productName: "Andadera plegable con ruedas",
    price: 1450,
    stock: 10,
    acquisitionType: "VENTA_RENTA",
    soldQuantity: 23,
    rentedQuantity: 8,
    viewCount: 132,
    generatedRevenue: 48650,
    cluster: "C3",
  },
  {
    id: 11,
    productName: "Scooter eléctrico de movilidad",
    price: 28500,
    stock: 3,
    acquisitionType: "VENTA_RENTA",
    soldQuantity: 6,
    rentedQuantity: 10,
    viewCount: 198,
    generatedRevenue: 186000,
    cluster: "C3",
  },
  {
    id: 12,
    productName: "Cama hospitalaria manual",
    price: 9600,
    stock: 5,
    acquisitionType: "VENTA_RENTA",
    soldQuantity: 8,
    rentedQuantity: 14,
    viewCount: 176,
    generatedRevenue: 132800,
    cluster: "C3",
  },
  {
    id: 13,
    productName: "Bota ortopédica tipo walker",
    price: 950,
    stock: 6,
    acquisitionType: "VENTA_RENTA",
    soldQuantity: 8,
    rentedQuantity: 4,
    viewCount: 76,
    generatedRevenue: 15200,
    cluster: "C4",
  },
  {
    id: 14,
    productName: "Cojín antiescaras de gel",
    price: 980,
    stock: 7,
    acquisitionType: "VENTA",
    soldQuantity: 12,
    rentedQuantity: 0,
    viewCount: 69,
    generatedRevenue: 11760,
    cluster: "C4",
  },
  {
    id: 15,
    productName: "Órtesis estabilizadora de rodilla",
    price: 2200,
    stock: 4,
    acquisitionType: "VENTA",
    soldQuantity: 5,
    rentedQuantity: 0,
    viewCount: 58,
    generatedRevenue: 11000,
    cluster: "C4",
  },
  {
    id: 16,
    productName: "Banco de seguridad para ducha",
    price: 1350,
    stock: 6,
    acquisitionType: "VENTA_RENTA",
    soldQuantity: 7,
    rentedQuantity: 3,
    viewCount: 63,
    generatedRevenue: 12850,
    cluster: "C4",
  },
];
