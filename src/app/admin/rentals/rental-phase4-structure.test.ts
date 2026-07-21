import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("rental phase 4 structure", () => {
  const adminSource = readFileSync(
    join(process.cwd(), "src/app/admin/rentals/page.tsx"),
    "utf8",
  );
  const detailSource = readFileSync(
    join(process.cwd(), "src/app/mis-rentas/[id]/page.tsx"),
    "utf8",
  );
  const serviceSource = readFileSync(
    join(process.cwd(), "src/services/admin/rentals.ts"),
    "utf8",
  );

  it("keeps one Card surface and uses flat dialog sections", () => {
    expect(adminSource.match(/<Card(?:\s|>)/g) ?? []).toHaveLength(1);
    expect(adminSource.match(/<\/Card>/g) ?? []).toHaveLength(1);
    expect(adminSource).toContain("<DialogContent");
    expect(adminSource).not.toContain(
      'className="grid gap-3 rounded-xl border border-border p-4"',
    );
  });

  it("exposes review and idempotent operational actions", () => {
    expect(serviceSource).toContain("reviewRentalDocument");
    expect(serviceSource).toContain("cancelApprovedRental");
    expect(serviceSource).toContain("updateRentalDeposit");
    expect(adminSource).toMatch(/Aprobar\s+receta/);
    expect(adminSource).toContain("Cancelar y restaurar stock");
    expect(adminSource).toContain("Resolución del depósito");
  });

  it("shows backend history and deposit resolution to the client", () => {
    expect(detailSource).toContain("rental.statusHistory");
    expect(detailSource).toContain("Estado del depósito");
    expect(detailSource).toContain("depositRetainedAmount");
  });
});
