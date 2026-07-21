import { describe, expect, it } from "vitest";
import type { RentalRequest, RentalStatus } from "@/services/rentals";
import {
  getRentalStatusPresentation,
  isRentalDueSoon,
  matchesRentalSearch,
  matchesRentalStatusFilter,
  rentalStatusLabel,
} from "./rental-status";

function rental(
  status: RentalStatus,
  endDate: string,
  overrides: Partial<RentalRequest> = {},
) {
  return {
    id: "rental-1",
    folio: "REN-2026-000001",
    status,
    applicantName: "Victoria Cliente",
    patientName: null,
    items: [
      {
        endDate,
        product: { nombre: "Silla de ruedas", modelo: "RX" },
        productNameSnapshot: "Silla de ruedas",
        productModelSnapshot: "RX",
      },
    ],
    ...overrides,
  } as RentalRequest;
}

describe("rental visual status", () => {
  const now = new Date("2026-07-18T12:00:00.000Z");

  it("shows due soon only for an active delivered rental within three days", () => {
    const active = rental("DELIVERED", "2026-07-21T00:00:00.000Z");
    expect(isRentalDueSoon(active, now)).toBe(true);
    expect(getRentalStatusPresentation(active, now)).toMatchObject({
      key: "DUE_SOON",
      label: "Próxima a vencer",
      calculated: true,
    });
  });

  it("does not replace delivered when the due date passed or is farther away", () => {
    expect(
      isRentalDueSoon(rental("DELIVERED", "2026-07-17T00:00:00.000Z"), now),
    ).toBe(false);
    expect(
      isRentalDueSoon(rental("DELIVERED", "2026-07-22T00:00:00.000Z"), now),
    ).toBe(false);
  });

  it("uses the Mexico City calendar day near the UTC date boundary", () => {
    const mexicoEvening = new Date("2026-07-19T01:00:00.000Z");
    const fourLocalDaysAway = rental("DELIVERED", "2026-07-22T00:00:00.000Z");
    expect(isRentalDueSoon(fourLocalDaysAway, mexicoEvening)).toBe(false);
  });

  it("never derives due soon from a non-delivered operational state", () => {
    const approved = rental("APPROVED", "2026-07-19T00:00:00.000Z");
    expect(isRentalDueSoon(approved, now)).toBe(false);
    expect(getRentalStatusPresentation(approved, now).key).toBe("APPROVED");
    expect(rentalStatusLabel("DELIVERED")).toBe("Entregada");
  });

  it("filters calculated states and searches folio or product", () => {
    const active = rental("DELIVERED", "2026-07-20T00:00:00.000Z");
    expect(matchesRentalStatusFilter(active, "DUE_SOON", now)).toBe(true);
    expect(matchesRentalSearch(active, "000001")).toBe(true);
    expect(matchesRentalSearch(active, "silla")).toBe(true);
    expect(matchesRentalSearch(active, "andadera")).toBe(false);
  });
});
