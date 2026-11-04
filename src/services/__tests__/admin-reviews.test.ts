import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-fetch";
import { rejectReview } from "../admin/reviews";
vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));
const review = {
  id: 12,
  productId: 10,
  userId: 7,
  rating: 4,
  comment: "Buen producto",
  status: "REJECTED",
  showOnHome: false,
  approvedAt: null,
  createdAt: "2026-11-01T12:00:00.000Z",
  product: { id: 10, nombre: "Andadera" },
  user: { id: 7, nombre: "Cliente", correo: "cliente@example.test" },
  approvedBy: null,
};
beforeEach(() => vi.resetAllMocks());
describe("admin review rejection", () => {
  it("usa el endpoint protegido y valida la respuesta confirmada", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      Response.json({ message: "Rechazada", review }),
    );
    expect(await rejectReview(12)).toEqual({ message: "Rechazada", review });
    expect(apiFetch).toHaveBeenCalledWith(
      "/reviews/12/reject",
      expect.objectContaining({ method: "PATCH" }),
    );
  });
  it("rechaza respuestas que no confirman el estado y visibilidad esperados", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      Response.json({
        message: "OK",
        review: { ...review, status: "APPROVED", showOnHome: true },
      }),
    );
    await expect(rejectReview(12)).rejects.toThrow(
      "No pudimos confirmar el rechazo",
    );
  });
  it("propaga falta de permisos y conflictos sin simular un rechazo", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      Response.json({ message: "Sin permisos" }, { status: 403 }),
    );
    await expect(rejectReview(12)).rejects.toThrow("Sin permisos");
    vi.mocked(apiFetch).mockResolvedValueOnce(
      Response.json(
        { message: "La reseña cambió. Actualiza la lista." },
        { status: 409 },
      ),
    );
    await expect(rejectReview(12)).rejects.toThrow("La reseña cambió");
  });
});
