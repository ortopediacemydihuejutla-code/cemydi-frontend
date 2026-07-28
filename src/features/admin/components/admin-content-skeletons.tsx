import { cn } from "@/features/admin/lib/utils";

import { Skeleton } from "./ui/skeleton";

type SkeletonCountProps = {
  count?: number;
  className?: string;
};

type AdminTableSkeletonProps = SkeletonCountProps & {
  columns?: number;
  rows?: number;
  showAvatar?: boolean;
};

export function AdminTableSkeleton({
  columns = 5,
  rows = 6,
  showAvatar = false,
  className,
}: AdminTableSkeletonProps) {
  const template = `minmax(180px, 1.7fr) repeat(${Math.max(
    1,
    columns - 1,
  )}, minmax(110px, 1fr))`;

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--card)]",
        className,
      )}
      role="status"
      aria-label="Cargando tabla"
    >
      <div className="min-w-[720px]" aria-hidden="true">
        <div
          className="grid gap-5 border-b border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4"
          style={{ gridTemplateColumns: template }}
        >
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton
              key={index}
              className={cn("h-3", index === 0 ? "w-28" : "w-20")}
            />
          ))}
        </div>

        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid items-center gap-5 border-b border-[var(--border-soft)] px-5 py-4 last:border-b-0"
            style={{ gridTemplateColumns: template }}
          >
            {Array.from({ length: columns }, (_, columnIndex) => (
              <div
                key={columnIndex}
                className="flex min-w-0 items-center gap-3"
              >
                {showAvatar && columnIndex === 0 ? (
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                ) : null}
                <Skeleton
                  className={cn(
                    "h-4",
                    columnIndex === 0
                      ? "w-36"
                      : columnIndex === columns - 1
                        ? "w-16"
                        : "w-24",
                  )}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCardListSkeleton({
  count = 6,
  className,
}: SkeletonCountProps) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}
      role="status"
      aria-label="Cargando elementos"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card)] shadow-sm"
          aria-hidden="true"
        >
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-2 border-t border-[var(--border-soft)] pt-3">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminChartGridSkeleton({
  count = 4,
  className,
}: SkeletonCountProps) {
  return (
    <div
      className={cn("grid gap-5 lg:grid-cols-2", className)}
      role="status"
      aria-label="Cargando gráficas"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-xl border border-[var(--border-soft)] bg-[var(--card)] p-5 shadow-sm"
          aria-hidden="true"
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-56 max-w-full" />
          <div className="mt-8 flex h-52 items-end gap-3">
            {[42, 68, 54, 82, 63, 91, 72].map((height, barIndex) => (
              <Skeleton
                key={barIndex}
                className="flex-1 rounded-t-md rounded-b-none"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminFormSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-6 rounded-xl border border-[var(--border-soft)] bg-[var(--card)] p-6 shadow-sm md:grid-cols-2",
        className,
      )}
      role="status"
      aria-label="Cargando formulario"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className={cn("space-y-2", index > 3 && "md:col-span-2")}
          aria-hidden="true"
        >
          <Skeleton className="h-3 w-28" />
          <Skeleton className={cn("w-full", index > 3 ? "h-24" : "h-11")} />
        </div>
      ))}
    </div>
  );
}
