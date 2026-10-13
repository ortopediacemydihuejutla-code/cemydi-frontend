import CatalogHeader from "./components/CatalogHeader";

export default function CatalogLoading() {
  return (
    <div className="min-h-[calc(100vh-110px)] bg-white" role="status" aria-live="polite" aria-busy="true">
      <div className="grid min-h-[inherit] w-full grid-cols-1 gap-7 px-4 py-6 lg:grid-cols-[286px_minmax(0,1fr)] lg:px-8 lg:py-8 xl:gap-9 xl:px-10 2xl:px-12">
        <div className="lg:col-span-2"><CatalogHeader /></div>
        <aside className="hidden self-start lg:block" aria-hidden="true">
          <div className="rounded-lg border border-[#ebeff0] bg-[#f9f9f9] p-5">
            <div className="grid gap-3 border-b border-[#e1e7e9] pb-4">
              <div className="text-[0.95rem] font-semibold text-[#122731]">Filtros</div>
              <div className="h-10 rounded-md border border-[#d8e1e4] bg-white" />
            </div>
            <div className="mt-4 grid gap-4">
              {["Categoría", "Marca", "Tipo de adquisición", "Disponibilidad", "Receta médica"].map((item) => (
                <section key={item} className="border-b border-[#e7ecee] pb-4 last:border-b-0">
                  <div className="flex min-h-11 items-center text-sm font-semibold text-[#1a3039]">{item}</div>
                  <div className="mt-3 grid gap-2">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="flex min-h-11 items-center gap-3 px-2 py-2">
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
          <div className="grid min-w-0 gap-3 border-b border-[#e5ecee] pb-5" aria-hidden="true">
            <div className="flex gap-2">
              <div className="h-13 min-w-0 flex-1 rounded-lg border border-[#d6e0e3] bg-white" />
              <div className="h-13 w-20 rounded-lg bg-[#172932] sm:w-24" />
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-24 rounded-lg border border-[#d7e3e6] lg:hidden" />
              <div className="h-12 min-w-0 flex-1 rounded-lg border border-[#d7e3e6] sm:max-w-64" />
              <div className="ml-auto hidden h-12 w-24 rounded-lg border border-[#d7e3e6] md:block" />
            </div>
          </div>
          <section className="flex min-h-80 items-center justify-center rounded-2xl border border-[#e5ecee] bg-[#fbfdfd]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="size-10 animate-spin rounded-full border-4 border-[#258e8b]/20 border-t-[#258e8b] motion-reduce:animate-none" aria-hidden="true" />
              <p className="m-0 text-sm font-semibold text-[#142734]">Cargando productos…</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
