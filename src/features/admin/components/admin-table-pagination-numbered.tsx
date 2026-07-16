import { buildPaginationPageItems } from "@/features/admin/lib/admin-list-utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

type AdminTablePaginationNumberedProps = {
  resultStart: number;
  resultEnd: number;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrev: () => void;
  onNext: () => void;
  disableWhenEmpty?: boolean;
};

export function AdminTablePaginationNumbered({
  resultStart,
  resultEnd,
  totalCount,
  page,
  totalPages,
  onPageChange,
  onPrev,
  onNext,
  disableWhenEmpty = true,
}: AdminTablePaginationNumberedProps) {
  const empty = totalCount === 0;
  const navDisabled = disableWhenEmpty && empty;
  const pageItems = buildPaginationPageItems(totalPages, page);

  return (
    <>
      <p className="text-sm text-[var(--text-muted)]" aria-live="polite">
        Mostrando {resultStart}-{resultEnd} de {totalCount} resultados
      </p>
      <Pagination className="w-auto flex-wrap" aria-label="Paginación del listado">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={page === 1 || navDisabled}
              onClick={onPrev}
            />
          </PaginationItem>

          {pageItems.map((item, index) => (
            <PaginationItem key={item === "gap" ? `gap-${index}` : item}>
              {item === "gap" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={item === page}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              disabled={page === totalPages || navDisabled}
              onClick={onNext}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
}

