type CurrencyOptions = {
  fractionDigits?: 0 | 2;
};

type DateStyle = "short" | "long" | "datetime";

export function formatNumberEsMx(value: number): string {
  return new Intl.NumberFormat("es-MX").format(value);
}

export function formatCurrencyMx(
  value: number,
  options: CurrencyOptions = {},
): string {
  const fractionDigits = options.fractionDigits ?? 2;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDateEsMx(
  value?: string | Date | null,
  options: { style?: DateStyle } = {},
): string {
  if (!value) {
    return "Sin fecha";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  if (options.style === "datetime") {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (options.style === "long") {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateOnlyEsMx(
  value?: string | Date | null,
  options: { style?: Exclude<DateStyle, "datetime"> } = {},
): string {
  if (!value) return "Sin fecha";

  const isoValue = value instanceof Date ? value.toISOString() : value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoValue);
  if (!match) return String(value);

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );

  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    day: options.style === "long" ? "numeric" : "2-digit",
    month: options.style === "long" ? "long" : "short",
    year: "numeric",
  }).format(date);
}

export function formatOfferEnd(value?: string | Date | null): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(date);
}
