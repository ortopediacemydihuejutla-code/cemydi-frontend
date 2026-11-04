import { useEffect } from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import AdminReviewsPage from "./page";
import {
  listAdminReviews,
  rejectReview,
  approveReview,
} from "@/services/admin";
import type { AdminReview } from "@/services/admin";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/reviews" }));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("@/services/admin", () => ({
  listAdminReviews: vi.fn(),
  rejectReview: vi.fn(),
  approveReview: vi.fn(),
  deleteReview: vi.fn(),
  setReviewHomeVisibility: vi.fn(),
}));
vi.mock("@/features/admin/hooks/use-admin-data-bootstrap", () => ({
  useAdminDataBootstrap: ({ load }: { load: () => Promise<void> }) => {
    useEffect(() => {
      void load();
    }, [load]);
    return { initLoading: false };
  },
}));
const original: AdminReview = {
  id: 12,
  productId: 10,
  userId: 7,
  rating: 4,
  comment: "Muy buen producto",
  status: "APPROVED",
  showOnHome: true,
  approvedAt: "2026-11-01T12:00:00.000Z",
  createdAt: "2026-11-01T12:00:00.000Z",
  product: { id: 10, nombre: "Andadera" },
  user: { id: 7, nombre: "Cliente", correo: "cliente@example.test" },
  approvedBy: { id: 8, nombre: "Admin", correo: "admin@example.test" },
};
const rejected = {
  ...original,
  status: "REJECTED",
  showOnHome: false,
  approvedAt: null,
  approvedBy: null,
} satisfies AdminReview;
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.mocked(listAdminReviews).mockResolvedValue({ reviews: [original] });
  vi.mocked(rejectReview).mockResolvedValue({
    message: "Reseña rechazada",
    review: rejected,
  });
});
async function actions() {
  const button = await screen.findByRole("button", {
    name: "Acciones para la reseña de Cliente",
  });
  fireEvent.keyDown(button, { key: "Enter" });
  return screen.findByRole("menuitem", { name: "Rechazar reseña" });
}
describe("moderación de reseñas", () => {
  it("confirma el rechazo, actualiza estado y permite una nueva aprobación", async () => {
    render(<AdminReviewsPage />);
    fireEvent.click(await actions());
    const dialog = screen.getByRole("alertdialog", { name: "Rechazar reseña" });
    expect(
      within(dialog).getByText(/El cliente recibirá un aviso/),
    ).toBeInTheDocument();
    expect(rejectReview).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Rechazar reseña" }),
    );
    await waitFor(() =>
      expect(rejectReview).toHaveBeenCalledExactlyOnceWith(12),
    );
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    const row = screen.getByText("Muy buen producto").closest("tr")!;
    expect(within(row).getByText("Rechazada")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Reseña rechazada");
    fireEvent.keyDown(
      screen.getByRole("button", {
        name: "Acciones para la reseña de Cliente",
      }),
      { key: "Enter" },
    );
    expect(
      await screen.findByRole("menuitem", { name: "Aprobar reseña" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Rechazar reseña" }),
    ).not.toBeInTheDocument();
    vi.mocked(approveReview).mockResolvedValue({
      message: "Aprobada",
      review: { ...original, showOnHome: false },
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "Aprobar reseña" }));
    await waitFor(() =>
      expect(approveReview).toHaveBeenCalledExactlyOnceWith(12),
    );
    await waitFor(() =>
      expect(within(row).getByText("Aprobada")).toBeInTheDocument(),
    );
  });
  it("cancelar no modifica la reseña ni llama al servidor", async () => {
    render(<AdminReviewsPage />);
    fireEvent.click(await actions());
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Cancelar",
      }),
    );
    expect(rejectReview).not.toHaveBeenCalled();
    expect(screen.getByText("Muy buen producto")).toBeInTheDocument();
  });
  it("conserva la reseña y permite reintentar cuando falla el rechazo", async () => {
    vi.mocked(rejectReview).mockRejectedValueOnce(new Error("Sin conexión"));
    render(<AdminReviewsPage />);
    fireEvent.click(await actions());
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Rechazar reseña",
      }),
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Sin conexión"),
    );
    const dialog = screen.getByRole("alertdialog", { name: "Rechazar reseña" });
    expect(
      within(dialog).getByRole("button", { name: "Rechazar reseña" }),
    ).toBeEnabled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Rechazar reseña" }),
    );
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Reseña rechazada"),
    );
  });
});
