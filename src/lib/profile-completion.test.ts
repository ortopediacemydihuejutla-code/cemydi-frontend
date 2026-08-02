import { describe, expect, it } from "vitest";

import { isProfileComplete } from "./profile-completion";

describe("isProfileComplete", () => {
  it("requires name, email, phone and address", () => {
    expect(
      isProfileComplete({
        nombre: "Ana Pérez",
        correo: "ana@example.com",
        telefono: "7711234567",
        direccion: "Av. Principal 123",
      }),
    ).toBe(true);
  });

  it("returns false when a required profile field is blank", () => {
    expect(
      isProfileComplete({
        nombre: "Ana Pérez",
        correo: "ana@example.com",
        telefono: " ",
        direccion: "Av. Principal 123",
      }),
    ).toBe(false);
  });
});
