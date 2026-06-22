"use client";

import { X } from "lucide-react";

import {
  formatTipo,
  normalizeClassificationKey,
} from "../utils/catalog-formatters";
import type { CatalogAppliedParams } from "../utils/catalog-params";
import { normalizeMarcaKey } from "../utils/catalog-params";

type CatalogActiveFiltersProps = {
  applied: CatalogAppliedParams;
  onRemoveSearch: () => void;
  onRemoveClassification: (value: string) => void;
  onRemoveMarca: (value: string) => void;
  onRemoveTipo: (value: "VENTA" | "RENTA" | "MIXTO") => void;
  onRemoveReceta: () => void;
  onRemoveSoloDisponibles: () => void;
  onClearAll: () => void;
};

function ActiveChip({
  label,
  onRemove,
  ariaLabel,
}: {
  label: string;
  onRemove: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dce6e9] bg-white px-4 text-sm font-medium text-[#21414d] outline-none transition hover:border-[#b8ccd1] hover:bg-[#f8fbfb] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
      onClick={onRemove}
      aria-label={ariaLabel}
    >
      <span>{label}</span>
      <X className="size-4 text-[#6f8590]" aria-hidden="true" />
    </button>
  );
}

export default function CatalogActiveFilters({
  applied,
  onRemoveSearch,
  onRemoveClassification,
  onRemoveMarca,
  onRemoveTipo,
  onRemoveReceta,
  onRemoveSoloDisponibles,
  onClearAll,
}: CatalogActiveFiltersProps) {
  const hasFilters =
    applied.searchQuery.trim().length > 0 ||
    applied.clasificaciones.length > 0 ||
    applied.marcas.length > 0 ||
    applied.tipos.length > 0 ||
    applied.receta !== null ||
    applied.soloDisponibles;

  if (!hasFilters) {
    return null;
  }

  return (
    <section className="border-b border-[#e3ebee] pb-4" aria-label="Filtros activos">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#18313f]">Filtros activos</p>
          <p className="mt-1 text-sm text-[#61747d]">
            Quita chips individuales o reinicia toda la búsqueda.
          </p>
        </div>
        <button
          type="button"
          className="min-h-11 rounded-xl border border-[#d7e3e6] bg-white px-4 text-sm font-semibold text-[#21414d] outline-none transition hover:border-[#b8ccd1] hover:bg-[#f8fbfb] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
          onClick={onClearAll}
        >
          Limpiar todo
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {applied.searchQuery.trim() ? (
          <ActiveChip
            label={`Búsqueda: ${applied.searchQuery}`}
            onRemove={onRemoveSearch}
            ariaLabel={`Quitar búsqueda ${applied.searchQuery}`}
          />
        ) : null}

        {applied.clasificaciones.map((item) => (
          <ActiveChip
            key={normalizeClassificationKey(item)}
            label={item}
            onRemove={() => onRemoveClassification(item)}
            ariaLabel={`Quitar categoría ${item}`}
          />
        ))}

        {applied.marcas.map((item) => (
          <ActiveChip
            key={normalizeMarcaKey(item)}
            label={item}
            onRemove={() => onRemoveMarca(item)}
            ariaLabel={`Quitar marca ${item}`}
          />
        ))}

        {applied.tipos.map((tipo) => (
          <ActiveChip
            key={tipo}
            label={formatTipo(tipo)}
            onRemove={() => onRemoveTipo(tipo)}
            ariaLabel={`Quitar tipo ${formatTipo(tipo)}`}
          />
        ))}

        {applied.receta === "con" ? (
          <ActiveChip
            label="Receta requerida"
            onRemove={onRemoveReceta}
            ariaLabel="Quitar filtro receta requerida"
          />
        ) : null}

        {applied.receta === "sin" ? (
          <ActiveChip
            label="Sin receta"
            onRemove={onRemoveReceta}
            ariaLabel="Quitar filtro sin receta"
          />
        ) : null}

        {applied.soloDisponibles ? (
          <ActiveChip
            label="Solo disponibles"
            onRemove={onRemoveSoloDisponibles}
            ariaLabel="Quitar filtro solo disponibles"
          />
        ) : null}
      </div>
    </section>
  );
}
