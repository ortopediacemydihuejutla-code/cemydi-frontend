import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("rental phase 1 UI structure", () => {
  const cartSource = readFileSync(
    join(process.cwd(), "src/app/carrito/page.tsx"),
    "utf8",
  );
  const productSource = readFileSync(
    join(process.cwd(), "src/app/producto/[id]/ProductDetailClient.tsx"),
    "utf8",
  );
  const requirementsSource = readFileSync(
    join(process.cwd(), "src/components/rentals/RentalRequirementsDialog.tsx"),
    "utf8",
  );

  it("reuses the Radix dialog and does not introduce nested Card components", () => {
    expect(cartSource).toContain("<Dialog");
    expect(cartSource).toContain("<DialogContent");
    expect(cartSource).not.toMatch(/<Card(?:\s|>)/);
    expect(productSource).not.toMatch(/<Card(?:\s|>)/);
    expect(requirementsSource).not.toMatch(/<Card(?:\s|>)/);
  });

  it("keeps rental dates and notes out of the product detail form", () => {
    expect(productSource).not.toContain("rentalStartDate");
    expect(productSource).not.toContain("rentalEndDate");
    expect(productSource).not.toContain("rentalNotes");
    expect(productSource).toContain('mode: "RENTA"');
    expect(productSource).toContain("Ver carrito");
  });

  it("keeps configuration and prescription as independent persistent operations", () => {
    expect(cartSource).toContain("Configuración pendiente");
    expect(cartSource).toContain("Configuración completa");
    expect(cartSource).toContain("Receta pendiente");
    expect(cartSource).toMatch(/Puedes guardar las fechas\s+aunque la/);
    expect(cartSource).toContain("uploadCartItemPrescription");
    expect(cartSource).toContain("deleteCartItemPrescription");
    expect(cartSource).toContain("prescriptionProgress");
    expect(cartSource).toContain("Cambiar receta");
    expect(cartSource).not.toContain("setPrescriptionFiles");
  });

  it("keeps general requirements and final review in the same dialog", () => {
    expect(cartSource).toContain("Completar requisitos de renta");
    expect(requirementsSource).toContain("Revisión final");
    expect(requirementsSource).toContain("La renta es para otra persona");
    expect(requirementsSource).toContain("Receta pendiente");
    expect(requirementsSource).toContain("Enviar solicitud de renta");
  });
});
