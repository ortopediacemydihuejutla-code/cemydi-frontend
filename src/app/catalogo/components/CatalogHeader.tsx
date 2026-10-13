export default function CatalogHeader({ searchQuery = "" }: { searchQuery?: string }) {
  const query = searchQuery.trim();

  return (
    <header className="min-w-0">
      <h1 className="m-0 text-3xl font-semibold leading-tight text-[#122731] [overflow-wrap:anywhere] sm:text-4xl">
        {query ? `Resultados para "${query}"` : "Catálogo de productos"}
      </h1>
      <p className="mb-0 mt-3 max-w-[70ch] text-base leading-7 text-[#5c7078]">
        {query
          ? "Usa filtros y ordenamiento para ubicar la mejor opción."
          : "Explora suministros médicos, movilidad, rehabilitación y soporte con una experiencia clara, ordenada y funcional."}
      </p>
    </header>
  );
}
