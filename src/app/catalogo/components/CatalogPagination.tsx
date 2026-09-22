"use client";

import { useMemo } from "react";

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function buildPageItems(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index];
    const previous = sorted[index - 1];

    if (index > 0 && page - previous > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  }

  return items;
}

export default function CatalogPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CatalogPaginationProps) {
  const pageItems = useMemo(
    () => buildPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Paginación del catálogo">
      <button
        type="button"
        className="cursor-pointer rounded-[10px] border border-[#cfe0e0] bg-white px-[10px] py-2 text-[0.8rem] font-extrabold text-[#258e8b] transition hover:bg-[#f0f9f8] disabled:cursor-not-allowed disabled:opacity-40 sm:px-[14px] sm:text-[0.84rem]"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        Anterior
      </button>

      <div className="flex items-center gap-1">
        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 font-extrabold text-[#6d8e97]"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`h-9 min-w-9 cursor-pointer rounded-[10px] border text-[0.86rem] font-extrabold transition ${
                item === currentPage
                  ? "border-[#258e8b] bg-[#258e8b] text-white"
                  : "border-transparent bg-transparent text-[#4f7d87] hover:bg-[#f0f9f8]"
              }`}
              onClick={() => onPageChange(item)}
              aria-label={`Ir a página ${item}`}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        className="cursor-pointer rounded-[10px] border border-[#cfe0e0] bg-white px-[10px] py-2 text-[0.8rem] font-extrabold text-[#258e8b] transition hover:bg-[#f0f9f8] disabled:cursor-not-allowed disabled:opacity-40 sm:px-[14px] sm:text-[0.84rem]"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </nav>
  );
}
