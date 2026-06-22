"use client";

import { Search } from "lucide-react";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { cn } from "@/features/admin/lib/utils";
import { Input } from "@/features/admin/components/ui/input";
import { STATUS_FILTERS, type StatusFilter } from "../utils/promotion-validators";

type PromotionFiltersProps = {
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  filterCounts: Record<StatusFilter, number>;
  search: string;
  onSearchChange: (value: string) => void;
};

export function PromotionFilters({
  statusFilter,
  onStatusFilterChange,
  filterCounts,
  search,
  onSearchChange,
}: PromotionFiltersProps) {
  return (
    <>
      <div className="inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl bg-[var(--surface)] p-1">
        {STATUS_FILTERS.map((tab) => {
          const isActive = statusFilter === tab.id;
          const count = filterCounts[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusFilterChange(tab.id)}
              className={cn(
                "inline-flex min-h-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--card)] text-[var(--brand-900)] shadow-[0_1px_3px_rgba(15,61,59,0.14)]"
                  : "text-[var(--text-muted)] hover:text-[var(--brand-800)]",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 text-xs",
                  isActive
                    ? "bg-[color-mix(in_srgb,var(--brand-600)_12%,var(--surface))] text-[var(--brand-800)]"
                    : "bg-[var(--card)] text-[var(--brand-800)]",
                )}
              >
                {formatNumberEsMx(count)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative w-full max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por producto, categoría o descripción…"
          className="h-11 rounded-md border-[var(--border-soft)] bg-[var(--surface)] pl-10"
        />
      </div>
    </>
  );
}
