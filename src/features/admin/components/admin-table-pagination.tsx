import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type AdminTablePaginationProps = {
  resultStart: number;
  resultEnd: number;
  totalCount: number;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  /** Si true, deshabilita anterior/siguiente cuando no hay filas. */
  disableWhenEmpty?: boolean;
  pageLabel?: "long" | "compact";
};

export function AdminTablePagination({
  resultStart,
  resultEnd,
  totalCount,
  page,
  totalPages,
  onPrev,
  onNext,
  disableWhenEmpty = true,
  pageLabel = "long",
}: AdminTablePaginationProps) {
  const empty = totalCount === 0;
  const navDisabled = disableWhenEmpty && empty;

  return (
    <>
      <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
        Mostrando {resultStart}-{resultEnd} de {totalCount} resultados
      </p>
      <Pagination className="w-auto flex-wrap" aria-label="Paginación del listado">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              aria-label="Página anterior"
              disabled={page === 1 || navDisabled}
              onClick={onPrev}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 text-sm text-[var(--text-muted)] select-none">
              {pageLabel === "long"
                ? `Página ${page} de ${totalPages}`
                : `${page} / ${totalPages}`}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              aria-label="Página siguiente"
              disabled={page === totalPages || navDisabled}
              onClick={onNext}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}

