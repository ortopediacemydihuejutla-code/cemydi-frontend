export function formatDate(value?: string) {
  if (!value) return "Sin fecha";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function sortByName<T extends { nombre: string }>(items: T[]) {
  return [...items].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }),
  );
}
