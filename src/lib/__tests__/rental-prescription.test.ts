import { describe, expect, it } from "vitest";

import { validatePrescriptionFile } from "@/lib/rental-prescription";

describe("rental prescription validation", () => {
  it("rejects empty files and MIME/extension mismatches", () => {
    expect(
      validatePrescriptionFile(
        new File([], "receta.pdf", { type: "application/pdf" }),
      ),
    ).toContain("vacía");
    expect(
      validatePrescriptionFile(
        new File(["data"], "receta.pdf", { type: "image/png" }),
      ),
    ).toContain("extensión");
  });

  it("accepts a declared PDF within the client-side size limit", () => {
    expect(
      validatePrescriptionFile(
        new File(["%PDF-"], "receta.pdf", { type: "application/pdf" }),
      ),
    ).toBeNull();
  });
});
