import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthUserProfile } from "@/providers/AuthContext";
import type { ShoppingCartItem } from "@/services/cart";
import RentalRequirementsDialog from "./RentalRequirementsDialog";

afterEach(cleanup);

const user: AuthUserProfile = {
  id: 10,
  nombre: "Victoria Cliente",
  correo: "victoria@cemydi.test",
  telefono: "5551234567",
  direccion: "Av. Salud 123",
  activo: true,
  rol: "CLIENT",
  emailVerified: true,
  emailVerifiedAt: "2026-07-18T12:00:00.000Z",
};

function rentalItem(withDocument = false): ShoppingCartItem {
  return {
    id: 41,
    mode: "RENTA",
    configurationStatus: "COMPLETE",
    quantity: 1,
    rentalStartDate: "2026-08-01T00:00:00.000Z",
    rentalEndDate: "2026-08-03T00:00:00.000Z",
    rentalDays: 3,
    rentalNotes: null,
    createdAt: "2026-07-18T12:00:00.000Z",
    updatedAt: "2026-07-18T12:00:00.000Z",
    lineTotal: 660,
    rentalSummary: {
      dailyPrice: 120,
      minDays: 2,
      deposit: 300,
      subtotal: 360,
      depositTotal: 300,
      total: 660,
    },
    document: withDocument
      ? {
          id: "document-1",
          originalFilename: "receta.pdf",
          mimeType: "application/pdf",
          bytes: 2048,
          status: "PENDIENTE",
          uploadedAt: "2026-07-18T12:00:00.000Z",
          associatedAt: null,
        }
      : null,
    availability: { isAvailable: true, maxQuantity: 4, reason: null },
    product: {
      id: 20,
      nombre: "Silla de ruedas",
      marca: "Drive",
      modelo: "RX",
      descripcion: "Equipo de movilidad",
      precio: 1000,
      clasificacion: "Movilidad",
      stock: 4,
      proveedor: "CEMYDI",
      tipoAdquisicion: "RENTA",
      requiereReceta: true,
      rentalDailyPrice: 120,
      rentalMinDays: 2,
      rentalDeposit: 300,
      rentalTerms: null,
      activo: true,
      imageUrl: null,
    },
  };
}

function renderDialog(item: ShoppingCartItem, onSubmit = vi.fn()) {
  render(
    <RentalRequirementsDialog
      open
      onOpenChange={vi.fn()}
      user={user}
      items={[item]}
      submitting={false}
      prescriptionPendingItemId={null}
      prescriptionProgress={{}}
      onUploadPrescription={vi.fn()}
      onDeletePrescription={vi.fn()}
      onSubmit={onSubmit}
    />,
  );
  return onSubmit;
}

describe("RentalRequirementsDialog", () => {
  it("preloads the authenticated user and allows review with a missing prescription", () => {
    renderDialog(rentalItem());

    expect(screen.getByLabelText("Nombre completo")).toHaveValue(user.nombre);
    expect(screen.getByLabelText("Correo")).toHaveValue(user.correo);
    expect(screen.getByLabelText("Teléfono")).toHaveValue(user.telefono);

    fireEvent.click(screen.getByRole("button", { name: "Revisar solicitud" }));

    expect(
      screen.getByRole("heading", { name: "Revisión final" }),
    ).toBeVisible();
    expect(screen.getByText("Receta pendiente")).toBeVisible();
    expect(screen.getByText(/falta la receta requerida/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Enviar solicitud de renta" }),
    ).toBeDisabled();
  });

  it("enables submission only after documents and both consents are complete", async () => {
    const onSubmit = renderDialog(rentalItem(true));
    fireEvent.click(screen.getByRole("button", { name: "Revisar solicitud" }));

    const submitButton = screen.getByRole("button", {
      name: "Enviar solicitud de renta",
    });
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/Acepto las condiciones de renta/i));
    fireEvent.click(screen.getByLabelText(/Acepto el tratamiento de datos/i));
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          applicantName: user.nombre,
          applicantEmail: user.correo,
          applicantPhone: user.telefono,
          deliveryMethod: "PICKUP",
          acceptRentalTerms: true,
          acceptPrivacy: true,
        }),
      ),
    );
  });
});
