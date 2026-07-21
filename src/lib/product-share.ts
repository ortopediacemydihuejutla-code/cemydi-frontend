import type { CatalogProduct } from "@/services/catalog";

const DEFAULT_SHARE_IMAGE_PATH = "/logoOriginalEslogan.png";
const CLOUDINARY_SHARE_TRANSFORMATION = "c_fill,w_1200,h_630,q_auto,f_auto";

const salePhrases = [
  "Calidad y confianza para tu bienestar.",
  "Encuentra productos ortopédicos confiables en CEMYDI.",
  "Atención personalizada y productos para tu recuperación.",
  "Disponible en CEMYDI para apoyar tu movilidad y cuidado.",
] as const;

const rentalPhrases = [
  "Renta equipo médico de forma práctica y segura.",
  "Solicita disponibilidad y recibe atención personalizada.",
  "Equipo médico en renta sujeto a validación operativa.",
  "CEMYDI te acompaña con soluciones para tu cuidado.",
] as const;

const medicalPhrases = [
  "Consulta requisitos antes de solicitar este producto.",
  "Algunos productos pueden requerir receta médica o validación previa.",
  "CEMYDI revisará disponibilidad y condiciones antes de confirmar.",
] as const;

export type ProductShareData = {
  title: string;
  text: string;
  url: string;
};

export type ProductShareResult = "shared" | "copied";

function cleanText(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/$/, "");
}

export function slugifyProductName(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "producto";
}

export function getProductSlug(
  product: Pick<CatalogProduct, "nombre"> & Partial<Pick<CatalogProduct, "slug">>,
) {
  return product.slug?.trim() || slugifyProductName(product.nombre);
}

function getStableIndex(product: CatalogProduct, total: number) {
  return Math.abs(product.id) % total;
}

function getPrimaryShareMode(product: CatalogProduct) {
  return product.tipoAdquisicion === "RENTA" ? "RENTA" : "VENTA";
}

function formatMxPrice(value: number | null | undefined) {
  if (!Number.isFinite(value) || Number(value) <= 0) {
    return null;
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function getProductUrl(
  product: Pick<CatalogProduct, "nombre"> & Partial<Pick<CatalogProduct, "slug">>,
  baseUrl: string,
) {
  return `${normalizeBaseUrl(baseUrl)}/producto/${encodeURIComponent(getProductSlug(product))}`;
}

export function getProductSharePhrase(product: CatalogProduct) {
  if (product.requiereReceta) {
    return medicalPhrases[getStableIndex(product, medicalPhrases.length)];
  }

  if (getPrimaryShareMode(product) === "RENTA") {
    return rentalPhrases[getStableIndex(product, rentalPhrases.length)];
  }

  return salePhrases[getStableIndex(product, salePhrases.length)];
}

export function getProductSharePrice(product: CatalogProduct) {
  if (getPrimaryShareMode(product) === "RENTA") {
    return formatMxPrice(product.rentalDailyPrice ?? product.precio);
  }

  return formatMxPrice(product.precio);
}

export function getProductTypeLabel(product: CatalogProduct) {
  if (product.tipoAdquisicion === "RENTA") return "Renta";
  if (product.tipoAdquisicion === "MIXTO") return "Venta y renta";
  return "Venta";
}

export function buildProductShareText(product: CatalogProduct, url: string) {
  const price = getProductSharePrice(product);
  const phrase = getProductSharePhrase(product);
  const prescriptionNote = product.requiereReceta
    ? " Este producto puede requerir receta o validación previa."
    : "";

  if (getPrimaryShareMode(product) === "RENTA") {
    const priceText = price ? ` desde ${price} por día` : "";
    return `Renta ${product.nombre} en CEMYDI${priceText}. ${phrase}${prescriptionNote} Ver producto: ${url}`;
  }

  const priceText = price ? ` Precio: ${price}.` : "";
  return `Conoce ${product.nombre} en CEMYDI.${priceText} ${phrase}${prescriptionNote} Ver producto: ${url}`;
}

export function buildProductShareData(
  product: CatalogProduct,
  baseUrl: string,
): ProductShareData {
  const url = getProductUrl(product, baseUrl);

  return {
    title: `${product.nombre} | CEMYDI`,
    text: buildProductShareText(product, url),
    url,
  };
}

export function buildProductShareDescription(product: CatalogProduct) {
  const price = getProductSharePrice(product);
  const mode = getPrimaryShareMode(product);
  const typeText = mode === "RENTA" ? "renta" : "venta";
  const priceText = price
    ? mode === "RENTA"
      ? ` Tarifa desde ${price} por día.`
      : ` Precio ${price}.`
    : "";
  const sourceDescription = cleanText(product.descripcion);
  const fallbackDescription = `Disponible para ${typeText} en CEMYDI.${priceText} Solicita disponibilidad y atención personalizada.`;
  const description = sourceDescription || fallbackDescription;
  const prescriptionNote = product.requiereReceta
    ? " Puede requerir receta o validación previa."
    : "";

  return `${description}${priceText && sourceDescription ? priceText : ""}${prescriptionNote}`.trim();
}

export function truncateShareDescription(text: string, maxLength = 180) {
  const clean = cleanText(text);
  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength - 1).trimEnd()}...`;
}

export function getPrimaryProductImageUrl(product: CatalogProduct) {
  return product.images[0]?.imageUrl ?? product.imageUrl ?? null;
}

export function getAbsoluteUrl(url: string, baseUrl: string) {
  try {
    return new URL(url, normalizeBaseUrl(baseUrl)).toString();
  } catch {
    return new URL(DEFAULT_SHARE_IMAGE_PATH, normalizeBaseUrl(baseUrl)).toString();
  }
}

export function getOptimizedCloudinaryShareImage(url: string) {
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.hostname !== "res.cloudinary.com" ||
      !parsed.pathname.includes("/image/upload/")
    ) {
      return url;
    }

    parsed.pathname = parsed.pathname.replace(
      "/image/upload/",
      `/image/upload/${CLOUDINARY_SHARE_TRANSFORMATION}/`,
    );

    return parsed.toString();
  } catch {
    return url;
  }
}

export function getProductShareImageUrl(product: CatalogProduct, baseUrl: string) {
  const primaryImage = getPrimaryProductImageUrl(product);
  const absoluteImage = primaryImage
    ? getAbsoluteUrl(primaryImage, baseUrl)
    : getAbsoluteUrl(DEFAULT_SHARE_IMAGE_PATH, baseUrl);

  return getOptimizedCloudinaryShareImage(absoluteImage);
}

export function getWhatsAppShareUrl(shareData: ProductShareData) {
  return `https://wa.me/?text=${encodeURIComponent(shareData.text)}`;
}

export function getFacebookShareUrl(shareData: ProductShareData) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
}

export async function copyProductShareLink(shareData: ProductShareData) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareData.url);
    return "copied" satisfies ProductShareResult;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard API is not available.");
  }

  const input = document.createElement("textarea");
  input.value = shareData.url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  input.style.top = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(input);

  if (!copied) {
    throw new Error("Could not copy share URL.");
  }

  return "copied" satisfies ProductShareResult;
}

export async function handleShareProduct(shareData: ProductShareData) {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share(shareData);
    return "shared" satisfies ProductShareResult;
  }

  return copyProductShareLink(shareData);
}
