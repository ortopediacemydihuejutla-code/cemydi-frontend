export default function ProductDetailLoading() {
  return (
    <div
      className="mx-auto max-w-[1280px] px-4 pb-11 pt-[26px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mb-5 h-10 w-full max-w-xl animate-pulse rounded-2xl bg-[#e8f3f2]" aria-hidden="true" />
      <div className="grid gap-6 max-[1080px]:grid-cols-1 min-[1081px]:grid-cols-2">
        <div
          className="grid min-h-[500px] animate-pulse content-center justify-items-center gap-[18px] rounded-[28px] border border-[#dbe4e6] bg-[#f4f8f8] p-6"
          aria-hidden="true"
        />
        <div className="grid gap-4" aria-hidden="true">
          <div className="h-10 w-3/4 animate-pulse rounded bg-[#e8f3f2]" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-[#e8f3f2]" />
          <div className="h-24 w-full animate-pulse rounded-2xl bg-[#eef6f5]" />
          <div className="h-32 w-full animate-pulse rounded-2xl bg-[#eef6f5]" />
        </div>
      </div>
      <span className="sr-only">Cargando producto...</span>
    </div>
  );
}
