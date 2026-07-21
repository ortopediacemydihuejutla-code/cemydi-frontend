import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("rental phase 3 structure", () => {
  const listSource = readFileSync(
    join(process.cwd(), "src/app/mis-rentas/page.tsx"),
    "utf8",
  );
  const detailSource = readFileSync(
    join(process.cwd(), "src/app/mis-rentas/[id]/page.tsx"),
    "utf8",
  );
  const cancellationSource = readFileSync(
    join(process.cwd(), "src/components/rentals/RentalCancellationDialog.tsx"),
    "utf8",
  );

  it("does not introduce Card components inside rental surfaces", () => {
    expect(listSource).not.toMatch(/<Card(?:\s|>)/);
    expect(detailSource).not.toMatch(/<Card(?:\s|>)/);
    expect(cancellationSource).not.toMatch(/<Card(?:\s|>)/);
  });

  it("provides server filters, pagination, due-soon state and direct detail navigation", () => {
    expect(listSource).toContain("Buscar por folio o producto");
    expect(listSource).toContain("Próximas a vencer");
    expect(listSource).toContain("listMyRentals({");
    expect(listSource).toContain("result.counts");
    expect(listSource).toContain("pagination.totalPages");
    expect(listSource).toContain("/mis-rentas/");
  });

  it("keeps protected documents and pending cancellation in the detail view", () => {
    expect(detailSource).toContain("getRentalDocumentContent");
    expect(detailSource).toContain('"inline"');
    expect(detailSource).toContain('"attachment"');
    expect(detailSource).toContain('rental.status === "PENDING"');
    expect(detailSource).toContain("uploadRentalItemPrescription");
    expect(detailSource).toContain("RentalCancellationDialog");
    expect(cancellationSource).toContain("AlertDialog");
  });
});
