export type AdminSearchDestination = {
  title: string;
  description: string;
  href: string;
  keywords: string[];
};

export const ADMIN_SEARCH_DESTINATIONS: AdminSearchDestination[] = [
  { title: "Inicio", description: "Resumen y actividad reciente", href: "/admin", keywords: ["dashboard", "resumen"] },
  { title: "Productos", description: "Catálogo, inventario y precios", href: "/admin/products", keywords: ["producto", "stock", "inventario", "precio"] },
  { title: "Nuevo producto", description: "Registrar un producto", href: "/admin/products/new", keywords: ["crear", "agregar", "alta"] },
  { title: "Categorías", description: "Clasificación del catálogo", href: "/admin/categories", keywords: ["categoria", "clasificacion"] },
  { title: "Marcas", description: "Marcas de productos", href: "/admin/brands", keywords: ["marca"] },
  { title: "Proveedores", description: "Directorio de proveedores", href: "/admin/suppliers", keywords: ["proveedor", "fabricante"] },
  { title: "Usuarios", description: "Cuentas y permisos", href: "/admin/users", keywords: ["usuario", "cuenta", "cliente", "rol"] },
  { title: "Rentas", description: "Solicitudes, entregas y devoluciones", href: "/admin/rentals", keywords: ["renta", "solicitud", "entrega", "devolucion"] },
  { title: "Promociones", description: "Descuentos y campañas", href: "/admin/promotions", keywords: ["promocion", "descuento", "oferta"] },
  { title: "Reseñas", description: "Moderación de opiniones", href: "/admin/reviews", keywords: ["resena", "comentario", "opinion", "aprobar"] },
  { title: "Analytics", description: "Métricas operativas", href: "/admin/analytics", keywords: ["analiticas", "metrica", "reporte"] },
  {
    title: "Segmentación de clientes",
    description: "Grupos de clientes según compras, rentas y consultas",
    href: "/admin/analytics/product-segmentation",
    keywords: ["segmentacion", "cluster", "clientes", "compras", "rentas", "consultas"],
  },
  {
    title: "Predicción de demanda",
    description: "Estimación mensual y reposición de inventario",
    href: "/admin/analytics/demand-forecast",
    keywords: ["prediccion", "demanda", "pronostico", "reposicion", "stock"],
  },
  { title: "Monitoreo de BD", description: "Respaldos y mantenimiento", href: "/admin/database", keywords: ["base de datos", "respaldo", "backup", "mantenimiento"] },
  { title: "Quiénes somos", description: "Contenido de la página pública", href: "/admin/about", keywords: ["nosotros", "contenido"] },
  { title: "Páginas legales", description: "Privacidad y términos", href: "/admin/legal", keywords: ["legal", "privacidad", "terminos"] },
];

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function searchAdminDestinations(query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return [];

  return ADMIN_SEARCH_DESTINATIONS.filter((item) =>
    normalizeSearchValue(
      [item.title, item.description, ...item.keywords].join(" "),
    ).includes(normalizedQuery),
  ).slice(0, 6);
}

export type AdminNotificationSnapshot = {
  productsLowStock: number;
  reviewsPending: number;
  rentalsPending: number;
};

export type AdminNotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "warning" | "info" | "success";
  actionable: boolean;
};

export function buildAdminNotifications(
  snapshot: AdminNotificationSnapshot,
): AdminNotificationItem[] {
  const items: AdminNotificationItem[] = [];

  if (snapshot.rentalsPending > 0) {
    items.push({
      id: "rentals-pending",
      title: "Rentas pendientes",
      description: `${snapshot.rentalsPending} solicitud${snapshot.rentalsPending === 1 ? " requiere" : "es requieren"} revisión.`,
      href: "/admin/rentals",
      tone: "info",
      actionable: true,
    });
  }

  if (snapshot.reviewsPending > 0) {
    items.push({
      id: "reviews-pending",
      title: "Reseñas pendientes",
      description: `${snapshot.reviewsPending} reseña${snapshot.reviewsPending === 1 ? " espera" : "s esperan"} aprobación.`,
      href: "/admin/reviews",
      tone: "info",
      actionable: true,
    });
  }

  if (snapshot.productsLowStock > 0) {
    items.push({
      id: "products-low-stock",
      title: "Inventario bajo",
      description: `${snapshot.productsLowStock} producto${snapshot.productsLowStock === 1 ? " tiene" : "s tienen"} menos de 5 unidades.`,
      href: "/admin/products",
      tone: "warning",
      actionable: true,
    });
  }

  if (items.length === 0) {
    items.push({
      id: "all-clear",
      title: "Todo al día",
      description: "No hay alertas operativas pendientes.",
      href: "/admin",
      tone: "success",
      actionable: false,
    });
  }

  return items;
}

export function formatNotificationTime(
  value: string,
  now = Date.now(),
): string {
  const date = new Date(value);
  const timestamp = date.getTime();

  if (!Number.isFinite(timestamp)) return "Ahora";

  const elapsedSeconds = Math.max(0, Math.floor((now - timestamp) / 1_000));
  if (elapsedSeconds < 60) return "Ahora";

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `Hace ${elapsedMinutes} min`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `Hace ${elapsedHours} ${elapsedHours === 1 ? "hora" : "horas"}`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `Hace ${elapsedDays} ${elapsedDays === 1 ? "día" : "días"}`;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(date);
}
