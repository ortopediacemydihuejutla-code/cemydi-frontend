import type { RentalRequest, RentalStatus } from "@/services/rentals";

export type RentalStatusFilter = "ALL" | "DUE_SOON" | RentalStatus;
export type RentalVisualStatus = RentalStatus | "DUE_SOON";

const STATUS_PRESENTATION: Record<
  RentalStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pendiente",
    className: "bg-[#fff7e8] text-[#845b12]",
  },
  APPROVED: {
    label: "Aprobada",
    className: "bg-[#e9f4ff] text-[#176c83]",
  },
  REJECTED: {
    label: "Rechazada",
    className: "bg-[#fff1f1] text-[#b42318]",
  },
  CANCELLED: {
    label: "Cancelada",
    className: "bg-[#eef2f3] text-[#405b65]",
  },
  DELIVERED: {
    label: "Activa",
    className: "bg-[#e8f4f3] text-[#1f6a67]",
  },
  RETURNED: {
    label: "Devuelta",
    className: "bg-[#e4f6ee] text-[#1e7c55]",
  },
};

function utcCalendarDay(value: Date) {
  return Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
}

function mexicoCalendarDay(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(value);
  const part = (type: "year" | "month" | "day") =>
    Number(parts.find((candidate) => candidate.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day"));
}

export function getRentalDueDate(rental: RentalRequest) {
  const dates = rental.items
    .map((item) => new Date(item.endDate))
    .filter((date) => !Number.isNaN(date.getTime()));
  if (dates.length === 0) return null;
  return dates.reduce((latest, date) =>
    date.getTime() > latest.getTime() ? date : latest,
  );
}

export function isRentalDueSoon(rental: RentalRequest, now = new Date()) {
  if (rental.status !== "DELIVERED") return false;
  const dueDate = getRentalDueDate(rental);
  if (!dueDate) return false;
  const daysRemaining =
    (utcCalendarDay(dueDate) - mexicoCalendarDay(now)) / 86_400_000;
  return daysRemaining >= 0 && daysRemaining <= 3;
}

export function getRentalStatusPresentation(
  rental: RentalRequest,
  now = new Date(),
) {
  if (isRentalDueSoon(rental, now)) {
    return {
      key: "DUE_SOON" as const,
      label: "Próxima a vencer",
      className: "bg-[#fff1df] text-[#a15c08]",
      calculated: true,
    };
  }

  return {
    key: rental.status,
    ...STATUS_PRESENTATION[rental.status],
    calculated: false,
  };
}

export function matchesRentalStatusFilter(
  rental: RentalRequest,
  filter: RentalStatusFilter,
  now = new Date(),
) {
  if (filter === "ALL") return true;
  if (filter === "DUE_SOON") return isRentalDueSoon(rental, now);
  return rental.status === filter;
}

export function matchesRentalSearch(rental: RentalRequest, search: string) {
  const normalized = search.trim().toLocaleLowerCase("es-MX");
  if (!normalized) return true;
  const values = [
    rental.folio,
    rental.id,
    rental.applicantName,
    rental.patientName,
    ...rental.items.flatMap((item) => [
      item.product.nombre,
      item.product.modelo,
      item.productNameSnapshot,
      item.productBrandSnapshot,
      item.productModelSnapshot,
      item.productSkuSnapshot,
    ]),
  ];
  return values.some((value) =>
    String(value ?? "")
      .toLocaleLowerCase("es-MX")
      .includes(normalized),
  );
}

export function rentalStatusLabel(status: RentalStatus) {
  if (status === "DELIVERED") return "Entregada";
  return STATUS_PRESENTATION[status].label;
}
