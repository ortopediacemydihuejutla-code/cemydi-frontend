import type { CatalogProduct } from "@/services/catalog";

export const FALLBACK_CLASSIFICATIONS = [
  "Movilidad",
  "Rehabilitacion",
  "Soporte",
  "Terapia",
];

export const TIPO_OPTIONS = [
  { value: "VENTA" as const, label: "Solo venta" },
  { value: "RENTA" as const, label: "Solo renta" },
  { value: "MIXTO" as const, label: "Ambos (venta y renta)" },
];

import { formatCurrencyMx } from "@/lib/formatters";

export function formatMoney(value: number) {
  return formatCurrencyMx(value, { fractionDigits: 0 });
}

export function formatTipo(value: CatalogProduct["tipoAdquisicion"]) {
  if (value === "VENTA") return "Venta";
  if (value === "RENTA") return "Renta";
  return "Ambos";
}

export function getProductMonogram(nombre: string) {
  const clean = nombre.trim().toUpperCase();
  if (!clean) return "PR";
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2);
  }

  return `${parts[0][0]}${parts[1][0]}`;
}

export function normalizeClassificationKey(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\uFFFD/g, "")
    .toLowerCase();
}

export function formatClassificationLabel(value: string) {
  const normalized = normalizeClassificationKey(value).replace(/[^a-z0-9\s]/g, "");

  if (
    normalized === "equipomedico" ||
    normalized === "equipomdico" ||
    (normalized.startsWith("equipo m") && normalized.endsWith("dico"))
  ) {
    return "Equipo Medico";
  }

  return value.replace(/\uFFFD/g, "");
}

export function dedupeClassifications(values: string[]) {
  const normalized = new Map<string, string>();

  for (const value of values.map((item) => item.trim()).filter(Boolean)) {
    const key = normalizeClassificationKey(value);
    const current = normalized.get(key);

    if (!current || current.includes("\uFFFD")) {
      normalized.set(key, value);
    }
  }

  return Array.from(normalized.values()).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }),
  );
}

export function mergeAvailableClassifications(serverClassifications: string[] = []) {
  return dedupeClassifications(
    [...FALLBACK_CLASSIFICATIONS, ...serverClassifications].map((item) =>
      normalizeClassificationKey(item) === "equipomedico" ? "Equipo Medico" : item,
    ),
  );
}
