"use client";

import { useState, type ReactNode } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import {
  normalizeClassificationKey,
  TIPO_OPTIONS,
} from "../utils/catalog-formatters";
import type { CatalogAppliedParams } from "../utils/catalog-params";
import { normalizeMarcaKey } from "../utils/catalog-params";

type CatalogFiltersProps = {
  availableClassifications: string[];
  availableBrands: string[];
  applied: CatalogAppliedParams;
  onToggleClassification: (value: string) => void;
  onToggleMarca: (value: string) => void;
  onToggleTipo: (value: "VENTA" | "RENTA" | "MIXTO") => void;
  onToggleReceta: (value: "con" | "sin") => void;
  onToggleSoloDisponibles: () => void;
  onClearAll: () => void;
  className?: string;
};

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-[#e7ecee] pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 bg-transparent text-left text-sm font-semibold text-[#1a3039] outline-none transition hover:text-[#0f6a67] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="flex items-center gap-2">
          <span
            className={`text-base text-[#7a8e97] transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            ˅
          </span>
        </span>
      </button>
      {open ? <div className="mt-3 grid gap-2">{children}</div> : null}
    </section>
  );
}

function FilterCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-[#335261] transition hover:bg-white">
      <input
        type="checkbox"
        className="m-0 size-[18px] shrink-0 rounded border border-[#9db5bc] accent-[#0f6a67]"
        checked={checked}
        onChange={onChange}
      />
      <span className="min-w-0 font-medium leading-5 text-[#28424e]">{label}</span>
    </label>
  );
}

export default function CatalogFilters({
  availableClassifications,
  availableBrands,
  applied,
  onToggleClassification,
  onToggleMarca,
  onToggleTipo,
  onToggleReceta,
  onToggleSoloDisponibles,
  onClearAll,
  className = "",
}: CatalogFiltersProps) {
  const hasActiveFilters =
    applied.clasificaciones.length > 0 ||
    applied.marcas.length > 0 ||
    applied.tipos.length > 0 ||
    applied.receta !== null ||
    applied.soloDisponibles;

  return (
    <aside className={className || undefined}>
      <div className="rounded-lg border border-[#ebeff0] bg-[#f9f9f9] p-5 shadow-[0_14px_32px_rgba(18,39,49,0.04)]">
        <div className="grid gap-3 border-b border-[#e1e7e9] pb-4">
          <div className="grid gap-1">
            <div className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-[#122731]">
              <SlidersHorizontal className="size-4" />
              Filtros
            </div>
          </div>
          <button
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-[#d8e1e4] bg-white px-3 text-sm font-semibold text-[#2a434d] outline-none transition hover:border-[#b8ccd1] focus-visible:ring-2 focus-visible:ring-[#0f6a67] focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-50"
            onClick={onClearAll}
            disabled={!hasActiveFilters}
          >
            <RotateCcw className="size-4" />
            Limpiar filtros
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <FilterSection title="Categoría">
            {availableClassifications.map((item) => (
              <FilterCheckbox
                key={item}
                checked={applied.clasificaciones.some(
                  (classification) =>
                    normalizeClassificationKey(classification) ===
                    normalizeClassificationKey(item),
                )}
                label={item}
                onChange={() => onToggleClassification(item)}
              />
            ))}
          </FilterSection>

          {availableBrands.length > 0 ? (
            <FilterSection title="Marca">
              {availableBrands.map((item) => (
                <FilterCheckbox
                  key={item}
                  checked={applied.marcas.some(
                    (marca) => normalizeMarcaKey(marca) === normalizeMarcaKey(item),
                  )}
                  label={item}
                  onChange={() => onToggleMarca(item)}
                />
              ))}
            </FilterSection>
          ) : null}

          <FilterSection title="Tipo de adquisición">
            {TIPO_OPTIONS.map((option) => (
              <FilterCheckbox
                key={option.value}
                checked={applied.tipos.includes(option.value)}
                label={option.label}
                onChange={() => onToggleTipo(option.value)}
              />
            ))}
          </FilterSection>

          <FilterSection title="Disponibilidad">
            <FilterCheckbox
              checked={applied.soloDisponibles}
              label="Solo productos con stock"
              onChange={onToggleSoloDisponibles}
            />
          </FilterSection>

          <FilterSection title="Receta médica">
            <FilterCheckbox
              checked={applied.receta === "con"}
              label="Receta requerida"
              onChange={() => onToggleReceta("con")}
            />
            <FilterCheckbox
              checked={applied.receta === "sin"}
              label="Sin receta"
              onChange={() => onToggleReceta("sin")}
            />
          </FilterSection>
        </div>
      </div>
    </aside>
  );
}
