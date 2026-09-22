export default function CatalogLoading() {
  return (
    <div
      className="min-h-[calc(100vh-110px)] bg-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="grid min-h-[inherit] w-full grid-cols-1 gap-7 px-4 py-6 lg:grid-cols-[286px_minmax(0,1fr)] lg:px-8 lg:py-8 xl:gap-9 xl:px-10 2xl:px-12">
        <aside className="sticky top-24 hidden self-start lg:block" aria-hidden="true">
          <div className="rounded-lg border border-[#ebeff0] bg-[#f9f9f9] p-5 shadow-[0_14px_32px_rgba(18,39,49,0.04)]">
            <div className="grid gap-3 border-b border-[#e1e7e9] pb-4">
              <div className="inline-flex items-center gap-2 text-[0.95rem] font-semibold text-[#122731]">
                Filtros
              </div>
              <div className="h-10 rounded-md border border-[#d8e1e4] bg-white" />
            </div>
            <div className="mt-4 grid gap-4">
              {["Categoria", "Marca", "Tipo de adquisicion", "Disponibilidad"].map((item) => (
                <section key={item} className="border-b border-[#e7ecee] pb-4 last:border-b-0">
                  <div className="flex min-h-11 items-center justify-between text-sm font-semibold text-[#1a3039]">
                    <span>{item}</span>
                    <span className="text-[#7a8e97]">˅</span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex min-h-10 items-center gap-3 rounded-md px-2 py-2">
                        <div className="size-[18px] rounded border border-[#9db5bc] bg-white" />
                        <div className="h-4 w-28 rounded bg-[#eef6f5]" />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </aside>

        <div className="grid min-w-0 content-start gap-5 pb-8 lg:pb-12">
          <header className="pb-1">
            <h1 className="text-[clamp(1.9rem,3vw,2.55rem)] font-semibold leading-tight text-[#122731]">
              Catalogo de productos
            </h1>
            <p className="mt-3 max-w-[760px] text-[0.98rem] leading-7 text-[#5c7078]">
              Explora suministros medicos, movilidad, rehabilitacion y soporte.
            </p>
          </header>

          <section className="grid gap-3 border-b border-[#e5ecee] pb-5">
            <div className="grid gap-4">
              <div className="relative min-w-0">
                <div className="h-13 w-full rounded-lg border border-[#d6e0e3] bg-white px-14 pr-28 shadow-[0_8px_20px_rgba(18,39,49,0.04)]" />
                <span className="absolute left-4 top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-[#7a8e97]" />
                <div className="absolute left-14 top-1/2 h-4 w-72 max-w-[45vw] -translate-y-1/2 rounded bg-[#edf5f5]" />
                <div className="absolute right-1.5 top-1.5 h-10 w-20 rounded-md bg-[#172932]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-[auto_auto_auto] sm:items-end sm:justify-between">
                <div className="h-11 rounded-md border border-[#d7e3e6] bg-white lg:hidden" />
                <div className="grid gap-1">
                  <div className="h-3 w-16 rounded bg-[#edf5f5]" />
                  <div className="h-11 w-44 rounded-md border border-[#d7e3e6] bg-white" />
                </div>
                <div className="h-11 w-24 rounded-md border border-[#d7e3e6] bg-white" />
              </div>
            </div>
          </section>

          <section className="flex min-h-[320px] items-center justify-center rounded-2xl border border-[#e5ecee] bg-[#fbfdfd]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative grid size-14 place-items-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#258e8b]/20" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#258e8b] border-r-[#258e8b]/70" />
                <div className="size-5 rounded-full bg-[#258e8b] shadow-[0_0_0_6px_rgba(37,142,139,0.14)]" />
              </div>
              <div className="grid gap-1">
                <p className="m-0 text-sm font-bold text-[#142734]">
                  Cargando productos
                </p>
                <p className="m-0 text-xs text-[#5f7780]">
                  El buscador ya esta listo.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <span className="sr-only">Cargando catalogo...</span>
    </div>
  );
}
