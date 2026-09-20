import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  listMyRentals,
  getMyRental,
  createRentalFromCart,
  cancelMyRental,
  deleteCartItemPrescription,
  getRentalDocumentContent,
} from "../rentals";
import * as apiFetchModule from "@/lib/api-fetch";

describe("Rentals Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listMyRentals builds query and fetches rentals list", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        rentals: [],
        pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
        counts: {
          all: 0,
          pending: 0,
          documentationPending: 0,
          scheduled: 0,
          active: 0,
          dueSoon: 0,
          finalized: 0,
          rejected: 0,
          cancelled: 0,
        },
      }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await listMyRentals({
      status: "PENDING",
      search: "cama",
      page: 1,
      pageSize: 10,
    });

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/\/rentals\/mine\?status=PENDING&search=cama&page=1&pageSize=10/),
      { method: "GET" },
    );
    expect(result.rentals).toEqual([]);
  });

  it("getMyRental fetches a single rental by id", async () => {
    const mockRental = { id: "req-123", folio: "FOL-001", status: "PENDING" };
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({ rental: mockRental }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await getMyRental("req-123");
    expect(spy).toHaveBeenCalledWith("/rentals/mine/req-123", { method: "GET" });
    expect(result.rental.id).toBe("req-123");
  });

  it("createRentalFromCart posts requirement payload", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        rental: { id: "req-456" },
        message: "Solicitud de renta creada",
      }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const payload = {
      applicantName: "Juan Perez",
      applicantEmail: "juan@example.com",
      applicantPhone: "7711234567",
      isForAnotherPerson: false,
      deliveryMethod: "PICKUP" as const,
      acceptRentalTerms: true,
      acceptPrivacy: true,
    };

    const result = await createRentalFromCart(payload);
    expect(spy).toHaveBeenCalledWith("/rentals/from-cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(result.message).toBe("Solicitud de renta creada");
  });

  it("cancelMyRental sends PATCH to cancel endpoint", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        rental: { id: "req-123", status: "CANCELLED" },
        message: "Solicitud cancelada",
      }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await cancelMyRental("req-123");
    expect(spy).toHaveBeenCalledWith("/rentals/req-123/cancel", { method: "PATCH" });
    expect(result.message).toBe("Solicitud cancelada");
  });

  it("deleteCartItemPrescription sends DELETE request", async () => {
    const mockApiResponse = {
      ok: true,
      status: 200,
      json: async () => ({ message: "Receta eliminada" }),
    };
    const spy = vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const result = await deleteCartItemPrescription(10);
    expect(spy).toHaveBeenCalledWith("/rentals/cart-items/10/prescription", {
      method: "DELETE",
    });
    expect(result.message).toBe("Receta eliminada");
  });

  it("getRentalDocumentContent returns blob on success", async () => {
    const dummyBlob = new Blob(["dummy content"], { type: "application/pdf" });
    const mockApiResponse = {
      ok: true,
      status: 200,
      blob: async () => dummyBlob,
    };
    vi.spyOn(apiFetchModule, "apiFetch").mockResolvedValue(mockApiResponse as unknown as Response);

    const blob = await getRentalDocumentContent("doc-999");
    expect(blob).toEqual(dummyBlob);
  });
});
