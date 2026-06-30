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
  compact?: boolean;
  showClearAll?: boolean;
};

function ActiveChip({
  label,
  onRemove,
  ariaLabel,
  compact = false,
}: {
  label: string;
  onRemove: () => void;
  ariaLabel: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border border-[#dce6e9] bg-white font-medium text-[#21414d] outline-none transition hover:border-[#b8ccd1] hover:bg-[#f8fbfb] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2 ${
        compact ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm"
      }`}
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
  compact = false,
  showClearAll = true,
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
    <section className={compact ? "" : "border-b border-[#e3ebee] pb-4"} aria-label="Filtros activos">
      <div className={compact ? "grid gap-2" : "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"}>
        <div>
          <p className="text-sm font-semibold text-[#18313f]">Filtros activos</p>
          <p className={`${compact ? "mt-0.5 text-xs leading-5" : "mt-1 text-sm"} text-[#61747d]`}>
            Quita chips individuales o reinicia toda la búsqueda.
          </p>
        </div>
        {showClearAll ? (
          <button
            type="button"
            className={`rounded-lg border border-[#d7e3e6] bg-white font-semibold text-[#21414d] outline-none transition hover:border-[#b8ccd1] hover:bg-[#f8fbfb] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2 ${
              compact ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm"
            }`}
            onClick={onClearAll}
          >
            Limpiar todo
          </button>
        ) : null}
      </div>

      <div className={`${compact ? "mt-3 gap-2" : "mt-4 gap-2.5"} flex flex-wrap`}>
        {applied.searchQuery.trim() ? (
          <ActiveChip
            label={`Búsqueda: ${applied.searchQuery}`}
            onRemove={onRemoveSearch}
            ariaLabel={`Quitar búsqueda ${applied.searchQuery}`}
            compact={compact}
          />
        ) : null}

        {applied.clasificaciones.map((item) => (
          <ActiveChip
            key={normalizeClassificationKey(item)}
            label={item}
            onRemove={() => onRemoveClassification(item)}
            ariaLabel={`Quitar categoría ${item}`}
            compact={compact}
          />
        ))}

        {applied.marcas.map((item) => (
          <ActiveChip
            key={normalizeMarcaKey(item)}
            label={item}
            onRemove={() => onRemoveMarca(item)}
            ariaLabel={`Quitar marca ${item}`}
            compact={compact}
          />
        ))}

        {applied.tipos.map((tipo) => (
          <ActiveChip
            key={tipo}
            label={formatTipo(tipo)}
            onRemove={() => onRemoveTipo(tipo)}
            ariaLabel={`Quitar tipo ${formatTipo(tipo)}`}
            compact={compact}
          />
        ))}

        {applied.receta === "con" ? (
          <ActiveChip
            label="Receta requerida"
            onRemove={onRemoveReceta}
            ariaLabel="Quitar filtro receta requerida"
            compact={compact}
          />
        ) : null}

        {applied.receta === "sin" ? (
          <ActiveChip
            label="Sin receta"
            onRemove={onRemoveReceta}
            ariaLabel="Quitar filtro sin receta"
            compact={compact}
          />
        ) : null}

        {applied.soloDisponibles ? (
          <ActiveChip
            label="Solo disponibles"
            onRemove={onRemoveSoloDisponibles}
            ariaLabel="Quitar filtro solo disponibles"
            compact={compact}
          />
        ) : null}
      </div>
    </section>
  );
}
