import { AdminTablePagination } from "@/features/admin/components/admin-table-pagination";

export function AccountPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const resultStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const resultEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-[#deebeb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <AdminTablePagination
        resultStart={resultStart}
        resultEnd={resultEnd}
        totalCount={total}
        page={page}
        totalPages={Math.max(totalPages, 1)}
        onPrev={() => onPageChange(Math.max(1, page - 1))}
        onNext={() => onPageChange(Math.min(Math.max(totalPages, 1), page + 1))}
      />
    </div>
  );
}
