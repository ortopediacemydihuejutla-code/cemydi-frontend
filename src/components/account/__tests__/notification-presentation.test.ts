import { describe, expect, it } from "vitest";
import {
  notificationTime,
  notificationAction,
} from "../notification-presentation";

describe("notification presentation", () => {
  it("uses relative, compact labels for recent and older notifications", () => {
    const now = Date.parse("2026-10-18T18:00:00Z");
    expect(
      notificationTime(new Date(now - 10 * 60000).toISOString(), now),
    ).toBe("Hace 10 min");
    expect(notificationTime(new Date(now - 86400000).toISOString(), now)).toBe(
      "Ayer",
    );
    expect(
      notificationTime(new Date(now - 60 * 86400000).toISOString(), now),
    ).toBe("Hace 2 meses");
    expect(notificationTime(new Date(now + 60000).toISOString(), now)).toBe(
      "Ahora",
    );
    expect(notificationTime("invalid", now)).toBe("Recientemente");
  });
  it("only offers actions that exist in the current destination contract", () => {
    expect(
      notificationAction({ category: "OFFER", destinationType: "PRODUCT" }),
    ).toBe("Ver oferta");
    expect(
      notificationAction({ category: "SYSTEM", destinationType: "ACCOUNT" }),
    ).toBe("Revisar cuenta");
    expect(
      notificationAction({ category: "RENTAL", destinationType: "RENTAL" }),
    ).toBe("Ver renta");
    expect(
      notificationAction({ category: "OFFER", destinationType: "NONE" }),
    ).toBeNull();
  });
});
