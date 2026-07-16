"use client";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { AdminFilterTabs } from "@/features/admin/components/admin-filter-tabs";
import { AdminSearchField } from "@/features/admin/components/admin-search-field";
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
      <AdminFilterTabs
        tabs={STATUS_FILTERS.map((tab) => ({
          ...tab,
          count: filterCounts[tab.id],
        }))}
        activeId={statusFilter}
        onChange={onStatusFilterChange}
        formatCount={formatNumberEsMx}
      />

      <AdminSearchField
        value={search}
        onChange={onSearchChange}
        placeholder="Buscar por producto, categoría o descripción…"
        wrapperClassName="max-w-md"
      />
    </>
  );
}
