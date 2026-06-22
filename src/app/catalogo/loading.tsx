function CatalogCardSkeleton() {
  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-xl border border-[rgba(42,160,157,0.14)] bg-white text-inherit [pointer-events:none]"
      aria-hidden="true"
    >
      <div className="relative aspect-square shrink-0 border-b border-[rgba(42,160,157,0.08)] bg-[#f4f9f9]">
        <div className="h-full w-full animate-pulse bg-[#e8f3f2]" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-[12px] pb-[14px]">
        <div className="mb-2 h-3 w-1/4 animate-pulse rounded bg-[#eef6f5]" />
        <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-[#e8f3f2]" />
        <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-[#eef6f5]" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-[#e8f3f2]" />
      </div>
    </div>
  );
}

export default function CatalogLoading() {
  return (
    <div className="min-h-[calc(100vh-110px)] w-full bg-white" role="status" aria-live="polite" aria-busy="true">
      <div className="grid min-h-[inherit] w-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className="sticky top-0 hidden h-[calc(100vh-110px)] self-start overflow-y-auto border-r border-[rgba(42,160,157,0.14)] bg-[#f8fcfc] px-6 pb-8 pt-7 lg:block"
          aria-hidden="true"
        >
          <div className="mb-4 h-5 w-24 animate-pulse rounded bg-[#e8f3f2]" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="mb-4 h-20 animate-pulse rounded bg-[#eef6f5]" />
          ))}
        </aside>

        <div className="grid content-start gap-[18px] px-[14px] pb-8 pt-4 min-[561px]:px-5 min-[561px]:pb-10 min-[561px]:pt-5 lg:px-9 lg:pb-12 lg:pt-7">
          <header>
            <div className="mb-2 h-3 w-32 animate-pulse rounded bg-[#e8f3f2]" />
            <div className="mb-3 h-8 w-72 animate-pulse rounded-lg bg-[#e8f3f2]" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[#eef6f5]" />
          </header>

          <div className="grid gap-3 border-b border-[rgba(42,160,157,0.14)] pb-4">
            <div className="h-11 w-full animate-pulse rounded-lg bg-[#e8f3f2]" />
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 min-[561px]:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
            {Array.from({ length: 8 }).map((_, index) => (
              <CatalogCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Cargando catálogo...</span>
    </div>
  );
}
