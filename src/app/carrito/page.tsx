"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Edit3,
  FileText,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthContext";
import { useCart } from "@/providers/CartContext";
import type { ShoppingCartItem } from "@/services/cart";
import {
  createRentalFromCart,
  deleteCartItemPrescription,
  uploadCartItemPrescription,
  type RentalRequest,
} from "@/services/rentals";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import { getProductSlug } from "@/lib/product-share";
import {
  formatCurrencyMx,
  formatDateEsMx,
  formatDateOnlyEsMx,
} from "@/lib/formatters";
import DemoRecommendations from "@/components/recommendations/DemoRecommendations";
import RentalRequirementsDialog from "@/components/rentals/RentalRequirementsDialog";
import type { RentalRequirementsInput } from "@/services/rentals";
import {
  PRESCRIPTION_ACCEPT,
  validatePrescriptionFile,
} from "@/lib/rental-prescription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";

function buildQuantityOptions(currentQuantity: number, maxQuantity: number) {
  const options = new Set<number>();
  const safeMax = Math.max(maxQuantity, 0);

  if (currentQuantity > 0) {
    options.add(currentQuantity);
  }

  for (let value = 1; value <= safeMax; value += 1) {
    options.add(value);
  }

  return Array.from(options).sort((a, b) => a - b);
}

function getAcquisitionLabel(value: "VENTA" | "RENTA" | "MIXTO") {
  if (value === "RENTA") {
    return "Renta";
  }

  if (value === "MIXTO") {
    return "Venta y renta";
  }

  return "Venta";
}

function getDiscountLabel(percent?: number) {
  if (!percent || percent <= 0) {
    return "Promo";
  }

  return `-${Math.round(percent)}%`;
}

function dateInputFromIso(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

type RentalCartEdit = {
  quantity: number;
  rentalStartDate: string;
  rentalEndDate: string;
  rentalNotes: string;
};

type CartConfirmation = {
  folio: string | null;
  saleItems: ShoppingCartItem[];
  rentalItems: RentalRequest["items"];
  isMixed: boolean;
};

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function getTodayDateInputValue() {
  const today = new Date();
  const offsetDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60_000,
  );
  return offsetDate.toISOString().slice(0, 10);
}

export default function CarritoPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    cart,
    loading: cartLoading,
    error: cartError,
    refreshCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    clearRentals,
  } = useCart();
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearingRentals, setClearingRentals] = useState(false);
  const [submittingRental, setSubmittingRental] = useState(false);
  const [rentalEdits, setRentalEdits] = useState<
    Record<number, RentalCartEdit>
  >({});
  const [prescriptionProgress, setPrescriptionProgress] = useState<
    Record<number, number>
  >({});
  const [prescriptionPendingItemId, setPrescriptionPendingItemId] = useState<
    number | null
  >(null);
  const [editingRentalItemId, setEditingRentalItemId] = useState<number | null>(
    null,
  );
  const [rentalEditError, setRentalEditError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<CartConfirmation | null>(
    null,
  );
  const [requirementsOpen, setRequirementsOpen] = useState(false);

  const hasItems = cart.summary.totalQuantity > 0;
  const saleItems = cart.items.filter((item) => item.mode !== "RENTA");
  const rentalItems = cart.items.filter((item) => item.mode === "RENTA");
  const hasSaleItems = saleItems.length > 0;
  const hasRentalItems = rentalItems.length > 0;
  const cartDiscount = Math.max(0, cart.summary.discountTotal ?? 0);
  const cartTotal =
    cart.summary.total ?? Math.max(0, cart.summary.subtotal - cartDiscount);
  const hasUnavailableSaleItems = saleItems.some(
    (item) => !item.availability.isAvailable,
  );
  const rentalItemsMissingPrescription = rentalItems.filter(
    (item) => item.product.requiereReceta && !item.document,
  );
  const canProceedToPayment = hasSaleItems && !hasUnavailableSaleItems;
  const todayDateInputValue = useMemo(() => getTodayDateInputValue(), []);
  const lastUpdatedLabel = useMemo(() => {
    if (!cart.updatedAt) {
      return "Aún no has agregado productos.";
    }

    return `Actualizado el ${formatDateEsMx(cart.updatedAt, { style: "short" })}`;
  }, [cart.updatedAt]);

  const guardQuantity = (maxQuantity: number, nextQuantity: number) => {
    if (maxQuantity <= 0) {
      toast.error("Este producto ya no tiene stock disponible.");
      return false;
    }

    if (nextQuantity > maxQuantity) {
      toast.error("No hay más productos en stock.");
      return false;
    }

    if (nextQuantity < 1) {
      toast.error("La cantidad mínima es 1.");
      return false;
    }

    return true;
  };

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    const targetItem = cart.items.find((item) => item.id === itemId);
    if (
      targetItem &&
      !guardQuantity(targetItem.availability.maxQuantity, quantity)
    ) {
      return;
    }

    try {
      setPendingItemId(itemId);
      const result = await updateItemQuantity({ itemId, quantity });
      toast.success(result.message);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la cantidad.";
      toast.error(message);
    } finally {
      setPendingItemId(null);
    }
  };

  const getRentalEdit = (item: (typeof cart.items)[number]) =>
    rentalEdits[item.id] ?? {
      quantity: item.quantity,
      rentalStartDate: dateInputFromIso(item.rentalStartDate),
      rentalEndDate: dateInputFromIso(item.rentalEndDate),
      rentalNotes: item.rentalNotes ?? "",
    };

  const updateRentalEdit = (itemId: number, patch: Partial<RentalCartEdit>) => {
    const item = cart.items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    setRentalEditError(null);
    setRentalEdits((current) => ({
      ...current,
      [itemId]: {
        ...getRentalEdit(item),
        ...patch,
      },
    }));
  };

  const handleRentalDetailsSave = async (itemId: number) => {
    const item = cart.items.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const edit = getRentalEdit(item);

    if (!edit.rentalStartDate || !edit.rentalEndDate) {
      setRentalEditError("Selecciona fecha de inicio y fin para la renta.");
      toast.error("Selecciona fecha de inicio y fin para la renta.");
      return;
    }

    if (edit.rentalStartDate < todayDateInputValue) {
      setRentalEditError(
        "La fecha de inicio no puede ser menor a la fecha actual.",
      );
      toast.error("La fecha de inicio no puede ser menor a la fecha actual.");
      return;
    }

    if (edit.rentalEndDate < edit.rentalStartDate) {
      setRentalEditError(
        "La fecha de fin debe ser igual o posterior a la fecha de inicio.",
      );
      toast.error(
        "La fecha de fin debe ser igual o posterior a la fecha de inicio.",
      );
      return;
    }

    const rentalDays =
      Math.floor(
        (Date.parse(`${edit.rentalEndDate}T00:00:00Z`) -
          Date.parse(`${edit.rentalStartDate}T00:00:00Z`)) /
          86_400_000,
      ) + 1;
    const minimumDays =
      item.rentalSummary?.minDays ?? item.product.rentalMinDays ?? 1;
    if (rentalDays < minimumDays) {
      const message = `La renta mínima para este producto es de ${minimumDays} día(s).`;
      setRentalEditError(message);
      toast.error(message);
      return;
    }
    if (!guardQuantity(item.availability.maxQuantity, edit.quantity)) return;

    try {
      setPendingItemId(itemId);
      const result = await updateItemQuantity({
        itemId,
        quantity: edit.quantity,
        rentalStartDate: edit.rentalStartDate,
        rentalEndDate: edit.rentalEndDate,
        rentalNotes: edit.rentalNotes,
      });
      setRentalEdits((current) => {
        const next = { ...current };
        delete next[itemId];
        return next;
      });
      setEditingRentalItemId(null);
      setRentalEditError(null);
      toast.success(result.message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar la renta.";
      toast.error(message);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleProceedToPayment = () => {
    if (!canProceedToPayment) {
      toast.error("Revisa disponibilidad y stock antes de proceder al pago.");
      return;
    }

    toast.success("Listo para conectar el flujo de pago.");
  };

  const handleSubmitRental = async (requirements: RentalRequirementsInput) => {
    try {
      setSubmittingRental(true);
      const saleItemsSnapshot = saleItems;
      const result = await createRentalFromCart(requirements);
      setConfirmation({
        folio: result.rental.folio,
        saleItems: saleItemsSnapshot,
        rentalItems: result.rental.items,
        isMixed: saleItemsSnapshot.length > 0,
      });
      setRequirementsOpen(false);
      toast.success(result.message);
      await refreshCart();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo enviar la solicitud.";
      toast.error(message);
    } finally {
      setSubmittingRental(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      setPendingItemId(itemId);
      const result = await removeItem(itemId);
      toast.success(result.message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar el producto.";
      toast.error(message);
    } finally {
      setPendingItemId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      setClearing(true);
      const result = await clearCart();
      toast.success(result.message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo vaciar el carrito.";
      toast.error(message);
    } finally {
      setClearing(false);
    }
  };

  const handleClearRentals = async () => {
    try {
      setClearingRentals(true);
      const result = await clearRentals();
      toast.success(result.message);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudieron eliminar las rentas del carrito.",
      );
    } finally {
      setClearingRentals(false);
    }
  };

  const handlePrescriptionChange = async (
    itemId: number,
    fileList: FileList | null,
  ) => {
    const file = fileList?.[0];
    if (!file) return;

    const error = validatePrescriptionFile(file);
    if (error) {
      setRentalEditError(error);
      toast.error(error);
      return;
    }

    try {
      setRentalEditError(null);
      setPrescriptionPendingItemId(itemId);
      setPrescriptionProgress((current) => ({ ...current, [itemId]: 0 }));
      const result = await uploadCartItemPrescription(
        itemId,
        file,
        (percent) => {
          setPrescriptionProgress((current) => ({
            ...current,
            [itemId]: percent,
          }));
        },
      );
      await refreshCart();
      toast.success(result.message);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la receta. Puedes reintentar.";
      setRentalEditError(message);
      toast.error(message);
    } finally {
      setPrescriptionPendingItemId(null);
    }
  };

  const removePrescriptionFile = async (itemId: number) => {
    try {
      setPrescriptionPendingItemId(itemId);
      const result = await deleteCartItemPrescription(itemId);
      await refreshCart();
      toast.success(result.message);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la receta.";
      setRentalEditError(message);
      toast.error(message);
    } finally {
      setPrescriptionPendingItemId(null);
    }
  };

  const openRentalEditDialog = (item: (typeof cart.items)[number]) => {
    setRentalEdits((current) => ({
      ...current,
      [item.id]: getRentalEdit(item),
    }));
    setRentalEditError(null);
    setEditingRentalItemId(item.id);
  };

  const getPrimaryCartActionLabel = () => {
    if (hasRentalItems) {
      return "Completar requisitos de renta";
    }

    return "Proceder al pago";
  };

  const getPrimaryCartActionDisabled = () => {
    if (submittingRental) {
      return true;
    }

    if (hasRentalItems) {
      return false;
    }

    return !canProceedToPayment;
  };

  const handlePrimaryCartAction = () => {
    if (hasRentalItems) {
      setRequirementsOpen(true);
      return;
    }

    handleProceedToPayment();
  };

  const editingRentalItem =
    editingRentalItemId !== null
      ? (cart.items.find((item) => item.id === editingRentalItemId) ?? null)
      : null;
  const editingRental = editingRentalItem
    ? getRentalEdit(editingRentalItem)
    : null;
  const editingRentalDays =
    editingRental?.rentalStartDate &&
    editingRental.rentalEndDate &&
    editingRental.rentalEndDate >= editingRental.rentalStartDate
      ? Math.floor(
          (Date.parse(`${editingRental.rentalEndDate}T00:00:00Z`) -
            Date.parse(`${editingRental.rentalStartDate}T00:00:00Z`)) /
            86_400_000,
        ) + 1
      : null;
  const editingRentalSubtotal =
    editingRentalItem && editingRental && editingRentalDays
      ? editingRental.quantity *
        editingRentalDays *
        (editingRentalItem.rentalSummary?.dailyPrice ??
          editingRentalItem.product.rentalDailyPrice ??
          0)
      : null;
  const editingRentalDeposit =
    editingRentalItem && editingRental
      ? editingRental.quantity *
        (editingRentalItem.rentalSummary?.deposit ??
          editingRentalItem.product.rentalDeposit ??
          0)
      : null;

  if (authLoading || (user?.rol === "CLIENT" && cartLoading)) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#f5f8f8] px-4 py-8">
        <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-[#dbe5e7] bg-white"
              />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl border border-[#dbe5e7] bg-white" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#f3f7f7] px-4 py-10">
        <div className="mx-auto max-w-[720px] rounded-[30px] border border-[#dbe5e7] bg-white px-6 py-10 text-center shadow-[0_22px_40px_rgba(15,61,59,0.08)]">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e8f4f3] text-[#1f6a67]">
            <ShoppingBag className="size-7" />
          </div>
          <h1 className="mt-5 text-[2rem] font-semibold text-[#132633]">
            Tu carrito te espera
          </h1>
          <p className="mt-3 text-[1rem] leading-7 text-[#5b717c]">
            Inicia sesión para ver y conservar tus productos entre dispositivos
            y cambios de cuenta.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[#1f6a67] px-6 py-3 font-bold text-white no-underline"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/catalogo"
              className="rounded-full border border-[#1f6a67] px-6 py-3 font-bold text-[#1f6a67] no-underline"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.rol === "ADMIN") {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#f3f7f7] px-4 py-10">
        <div className="mx-auto max-w-[720px] rounded-[30px] border border-[#dbe5e7] bg-white px-6 py-10 text-center shadow-[0_22px_40px_rgba(15,61,59,0.08)]">
          <h1 className="text-[2rem] font-semibold text-[#132633]">
            Carrito no disponible
          </h1>
          <p className="mt-3 text-[1rem] leading-7 text-[#5b717c]">
            El carrito está habilitado solo para cuentas de cliente.
          </p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#f3f7f7] px-4 py-10">
        <div className="mx-auto max-w-[720px] rounded-[26px] border border-[#f3c7c2] bg-white px-6 py-10 text-center shadow-[0_18px_36px_rgba(16,50,49,0.08)]">
          <AlertTriangle className="mx-auto size-11 text-[#b42318]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#17333f]">
            No pudimos cargar tu carrito
          </h1>
          <p className="mt-2 text-[#607173]">{cartError}</p>
          <button
            type="button"
            onClick={() => void refreshCart().catch(() => undefined)}
            className="mt-6 rounded-full bg-[#1f6a67] px-6 py-3 font-bold text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="min-h-[calc(100vh-140px)] bg-[#f5f8f8] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-[920px] rounded-2xl border border-[#dbe5e7] bg-white p-6 shadow-[0_18px_34px_rgba(15,61,59,0.07)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-[#e4f6ee] text-[#1e7c55]">
              <CheckCircle2 className="size-7" />
            </div>
            <div>
              <h1 className="text-[1.9rem] font-semibold leading-tight text-[#132633]">
                Solicitud enviada correctamente.
              </h1>
              {confirmation.folio ? (
                <p className="mt-2 text-sm font-bold tracking-[0.08em] text-[#1f6a67]">
                  {confirmation.folio}
                </p>
              ) : null}
              <p className="mt-3 text-[1rem] leading-7 text-[#5b717c]">
                CEMYDI revisará la disponibilidad de los productos en renta, la
                receta médica si aplica y las condiciones de entrega. Te
                contactaremos para confirmar.
              </p>
              {confirmation.isMixed ? (
                <p className="mt-3 rounded-2xl border border-[#cfe0e3] bg-[#f8fbfb] px-4 py-3 text-sm leading-6 text-[#405b65]">
                  La renta fue enviada a revisión. Los productos de compra
                  permanecen en tu carrito para continuar con el flujo de pago
                  cuando esté disponible.
                </p>
              ) : null}
            </div>
          </div>

          {confirmation.saleItems.length > 0 ? (
            <section className="mt-7 border-t border-[#edf2f3] pt-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#405b65]">
                Productos para compra
              </h2>
              <div className="mt-3">
                {confirmation.saleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-[#edf2f3] py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17333f]">
                        {item.product.nombre}
                      </p>
                      <p className="text-xs text-[#60727a]">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <strong className="shrink-0 text-sm text-[#193844]">
                      {formatCurrencyMx(
                        item.finalLineTotal ?? item.lineTotal ?? 0,
                        {
                          fractionDigits: 0,
                        },
                      )}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {confirmation.rentalItems.length > 0 ? (
            <section className="mt-7 border-t border-[#edf2f3] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#405b65]">
                  Productos para renta
                </h2>
                <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-bold text-[#845b12]">
                  Pendiente de revisión
                </span>
              </div>
              <div className="mt-3">
                {confirmation.rentalItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-[#edf2f3] py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17333f]">
                        {item.product.nombre}
                      </p>
                      <p className="text-xs text-[#60727a]">
                        {item.days} día(s) · Cantidad: {item.quantity}
                      </p>
                    </div>
                    <strong className="shrink-0 text-sm text-[#193844]">
                      {formatCurrencyMx(item.lineTotal, { fractionDigits: 0 })}
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/mis-rentas"
              className="inline-flex items-center justify-center rounded-full bg-[#1f6a67] px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-[#185856]"
            >
              Ver mis rentas
            </Link>
            <Link
              href="/carrito"
              onClick={() => setConfirmation(null)}
              className="inline-flex items-center justify-center rounded-full border border-[#1f6a67] px-5 py-3 text-sm font-bold text-[#1f6a67] no-underline transition hover:bg-[#eef7f6]"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#f5f8f8] px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[2rem] font-semibold leading-tight text-[#132633] sm:text-[2.35rem]">
              {hasItems ? "Revisa tus productos" : "Tu carrito está vacío"}
            </h1>
            <p className="mt-2 text-[0.95rem] leading-6 text-[#5b717c]">
              {lastUpdatedLabel}
            </p>
          </div>
          {hasItems ? (
            <div className="flex flex-wrap gap-2">
              {hasRentalItems ? (
                <button
                  type="button"
                  onClick={handleClearRentals}
                  disabled={clearing || clearingRentals}
                  className="inline-flex items-center justify-center rounded-full border border-[#9abdc0] bg-white px-5 py-2.5 text-sm font-semibold text-[#176c83] shadow-[0_10px_22px_rgba(15,61,59,0.04)] transition hover:bg-[#edf9fb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearingRentals ? "Vaciando rentas..." : "Vaciar rentas"}
                </button>
              ) : null}
              {hasSaleItems ? (
                <button
                  type="button"
                  onClick={handleClearCart}
                  disabled={clearing || clearingRentals}
                  className="inline-flex items-center justify-center rounded-full border border-[#d0dddd] bg-white px-5 py-2.5 text-sm font-semibold text-[#31505c] shadow-[0_10px_22px_rgba(15,61,59,0.04)] transition hover:border-[#9bbfc0] hover:text-[#1f6a67] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {clearing
                    ? "Vaciando..."
                    : hasRentalItems
                      ? "Vaciar todo"
                      : "Vaciar carrito"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {!hasItems ? (
          <div className="mx-auto max-w-[640px] px-4 py-14 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#e5f2f1] text-[#1f6a67]">
              <ShoppingBag className="size-7" />
            </div>
            <h2 className="mt-5 text-[1.7rem] font-semibold text-[#132633]">
              Aún no agregas productos
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-[1rem] leading-7 text-[#5b717c]">
              Explora el catálogo y guarda aquí los productos que quieras
              conservar para después.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex rounded-full bg-[#1f6a67] px-6 py-3 font-bold text-white no-underline shadow-[0_14px_26px_rgba(31,106,103,0.18)] transition hover:bg-[#185856]"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div className="grid gap-5">
              {cart.summary.hasUnavailableItems ? (
                <div className="flex items-start gap-3 rounded-2xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-4 text-[#845b12]">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm leading-6">
                    Algunos productos requieren tu atención porque su
                    disponibilidad cambió. Ajusta la cantidad o elimínalos antes
                    de continuar.
                  </p>
                </div>
              ) : null}

              {[
                {
                  id: "sale",
                  title: "Productos para compra",
                  items: saleItems,
                },
                {
                  id: "rental",
                  title: "Productos para renta",
                  items: rentalItems,
                },
              ]
                .filter((section) => section.items.length > 0)
                .map((section) => (
                  <section
                    key={section.id}
                    className="overflow-hidden rounded-2xl border border-[#dbe5e7] bg-white shadow-[0_18px_34px_rgba(15,61,59,0.07)]"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-[#edf2f3] bg-[#fbfdfd] px-4 py-4">
                      <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#405b65]">
                        {section.title}
                      </h2>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#60727a]">
                        {section.items.length} producto
                        {section.items.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    {section.items.map((item) => {
                      const quantityOptions = buildQuantityOptions(
                        item.quantity,
                        item.availability.maxQuantity,
                      );
                      const isPending = pendingItemId === item.id;
                      const itemDiscount = Math.max(
                        0,
                        item.discountAmount ?? 0,
                      );
                      const hasPromotion = itemDiscount > 0;
                      const originalLineTotal =
                        item.originalLineTotal ??
                        (item.lineTotal ?? 0) + itemDiscount;
                      const finalLineTotal =
                        item.finalLineTotal ?? item.lineTotal;
                      const canDecrease = item.quantity > 1 && !isPending;
                      const hasMoreStock =
                        item.quantity < item.availability.maxQuantity &&
                        item.availability.maxQuantity > 0;
                      const acquisitionLabel = getAcquisitionLabel(
                        item.product.tipoAdquisicion,
                      );
                      const isRental = item.mode === "RENTA";

                      return (
                        <article
                          key={item.id}
                          className="relative grid items-start gap-5 border-b border-[#edf2f3] p-4 last:border-b-0 sm:grid-cols-[136px_minmax(0,1fr)] lg:grid-cols-[136px_minmax(0,1fr)_220px]"
                        >
                          <Link
                            href={`/producto/${encodeURIComponent(getProductSlug(item.product))}`}
                            className="relative flex h-[136px] w-full items-center justify-center overflow-hidden rounded-xl border border-[#e5edef] bg-[#f7fbfb] p-4"
                          >
                            {isOptimizableImageUrl(item.product.imageUrl) ? (
                              <Image
                                src={item.product.imageUrl!}
                                alt={item.product.nombre}
                                fill
                                sizes="140px"
                                className="object-contain p-3"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-[#1f6a67]">
                                Sin imagen
                              </span>
                            )}
                          </Link>

                          <div className="min-w-0 pr-10 lg:pr-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6c838c]">
                              {item.product.clasificacion}
                            </p>
                            <Link
                              href={`/producto/${encodeURIComponent(getProductSlug(item.product))}`}
                              className="mt-1 block text-[1.2rem] font-semibold leading-snug text-[#132633] no-underline hover:text-[#1f6a67]"
                            >
                              {item.product.nombre}
                            </Link>
                            <span className="mt-2 inline-flex min-h-0 min-w-0 rounded-full bg-[#e4f6ee] px-3 py-1 text-xs font-bold text-[#1e7c55]">
                              {isRental ? "Renta" : acquisitionLabel}
                            </span>
                            {item.product.requiereReceta ? (
                              <span className="ml-2 mt-2 inline-flex min-h-0 min-w-0 items-center gap-1 rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-bold text-[#243c78]">
                                <FileText className="size-3.5" />
                                Requiere receta
                              </span>
                            ) : null}
                            {isRental ? (
                              <span
                                className={`ml-2 mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                  item.configurationStatus === "COMPLETE"
                                    ? "bg-[#e4f6ee] text-[#1e7c55]"
                                    : "bg-[#fff7e8] text-[#845b12]"
                                }`}
                              >
                                {item.configurationStatus === "COMPLETE"
                                  ? "Configuración completa"
                                  : "Configuración pendiente"}
                              </span>
                            ) : null}
                            {isRental &&
                            item.product.requiereReceta &&
                            !item.document ? (
                              <span className="ml-2 mt-2 inline-flex rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-bold text-[#9b2c25]">
                                Receta pendiente
                              </span>
                            ) : null}
                            <p className="mt-3 text-sm leading-6 text-[#5b717c]">
                              Marca:{" "}
                              <strong className="font-semibold text-[#344f5b]">
                                {item.product.marca}
                              </strong>{" "}
                              · SKU:{" "}
                              <strong className="font-semibold text-[#344f5b]">
                                {item.product.modelo ||
                                  `CEMYDI-${item.product.id}`}
                              </strong>
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#6b7f87]">
                              {isRental
                                ? `Tarifa diaria ${formatCurrencyMx(item.rentalSummary?.dailyPrice ?? item.product.rentalDailyPrice ?? 0, { fractionDigits: 0 })}`
                                : `Precio unitario ${formatCurrencyMx(item.product.precio, { fractionDigits: 0 })}`}
                            </p>
                            {isRental ? (
                              <div className="mt-3 grid max-w-[640px] gap-3 text-sm text-[#405b65]">
                                <div className="grid gap-2 border-y border-[#e8eff1] py-3 sm:grid-cols-2">
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="size-4 shrink-0 text-[#1f6a67]" />
                                    <span>
                                      <strong className="font-semibold text-[#17333f]">
                                        Fecha inicio:
                                      </strong>{" "}
                                      {item.rentalStartDate
                                        ? formatDateOnlyEsMx(item.rentalStartDate, {
                                            style: "short",
                                          })
                                        : "Sin inicio"}
                                    </span>
                                  </div>
                                  <div>
                                    <strong className="font-semibold text-[#17333f]">
                                      Fecha fin:
                                    </strong>{" "}
                                    {item.rentalEndDate
                                      ? formatDateOnlyEsMx(item.rentalEndDate, {
                                          style: "short",
                                        })
                                      : "Sin fin"}
                                  </div>
                                  <div>
                                    <strong className="font-semibold text-[#17333f]">
                                      Número de días:
                                    </strong>{" "}
                                    {item.rentalDays
                                      ? `${item.rentalDays} día(s)`
                                      : "Periodo pendiente"}
                                  </div>
                                  <div>
                                    <strong className="font-semibold text-[#17333f]">
                                      Total estimado:
                                    </strong>{" "}
                                    {item.lineTotal === null
                                      ? "Pendiente de fechas"
                                      : formatCurrencyMx(
                                          item.finalLineTotal ?? item.lineTotal,
                                          {
                                            fractionDigits: 0,
                                          },
                                        )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() => openRentalEditDialog(item)}
                                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#9ac9d7] bg-white px-3 text-xs font-bold text-[#176c83] transition hover:bg-[#edf9fb] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Edit3 className="size-4" />
                                    {item.configurationStatus === "PENDING"
                                      ? "Configurar renta"
                                      : "Editar configuración"}
                                  </button>
                                  {item.product.requiereReceta ? (
                                    item.document ? (
                                      <span
                                        title={item.document.originalFilename}
                                        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-full border border-[#b9d8dd] bg-white px-3 text-xs font-bold text-[#176c83]"
                                      >
                                        <FileText className="size-4 shrink-0" />
                                        Receta adjunta
                                        <span className="max-w-[180px] truncate">
                                          {item.document.originalFilename}
                                        </span>
                                      </span>
                                    ) : (
                                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-[#d8a85c] bg-[#fffaf0] px-3 text-xs font-bold text-[#845b12] transition hover:bg-[#fff4dd]">
                                        <Upload className="size-4" />
                                        Adjuntar receta
                                        <input
                                          type="file"
                                          accept={PRESCRIPTION_ACCEPT}
                                          className="sr-only"
                                          onChange={(event) => {
                                            void handlePrescriptionChange(
                                              item.id,
                                              event.target.files,
                                            );
                                            event.currentTarget.value = "";
                                          }}
                                          disabled={
                                            prescriptionPendingItemId ===
                                            item.id
                                          }
                                        />
                                      </label>
                                    )
                                  ) : null}
                                  {item.rentalNotes ? (
                                    <span className="min-w-0 truncate text-sm text-[#60727a]">
                                      Nota: {item.rentalNotes}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}

                            {!item.availability.isAvailable &&
                            item.availability.reason ? (
                              <div className="mt-3 rounded-xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-3 text-sm leading-6 text-[#845b12]">
                                {item.availability.reason}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex flex-col gap-4 border-t border-[#edf2f3] pt-4 sm:col-span-2 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-5 lg:pr-12 lg:pt-0">
                            <div className="flex items-center justify-between gap-4 lg:justify-end">
                              <span className="text-sm font-semibold text-[#344f5b] lg:hidden">
                                Cantidad
                              </span>
                              <div className="inline-flex h-11 items-center overflow-hidden rounded-full border border-[#d6e2e4] bg-[#fbfdfd] text-[#17333f]">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleQuantityChange(
                                      item.id,
                                      item.quantity - 1,
                                    )
                                  }
                                  disabled={!canDecrease}
                                  aria-label="Disminuir cantidad"
                                  className="grid size-11 place-items-center text-[#45646d] transition hover:bg-[#eef7f6] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Minus className="size-4" />
                                </button>
                                <select
                                  value={String(item.quantity)}
                                  onChange={(event) =>
                                    void handleQuantityChange(
                                      item.id,
                                      Number(event.target.value),
                                    )
                                  }
                                  disabled={
                                    isPending ||
                                    item.availability.maxQuantity === 0
                                  }
                                  aria-label="Cantidad"
                                  className="h-11 min-w-14 appearance-none border-x border-[#d6e2e4] bg-white px-4 text-center text-sm font-bold text-[#17333f] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {quantityOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!hasMoreStock) {
                                      toast.error(
                                        "No hay más productos en stock.",
                                      );
                                      return;
                                    }

                                    void handleQuantityChange(
                                      item.id,
                                      item.quantity + 1,
                                    );
                                  }}
                                  disabled={
                                    isPending ||
                                    item.availability.maxQuantity === 0
                                  }
                                  aria-disabled={!hasMoreStock}
                                  aria-label="Aumentar cantidad"
                                  className="grid size-11 place-items-center text-[#45646d] transition hover:bg-[#eef7f6] disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-55"
                                >
                                  <Plus className="size-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid gap-1 text-left lg:text-right">
                              <span className="text-sm font-semibold text-[#5b717c]">
                                {isRental
                                  ? "Total estimado"
                                  : hasPromotion
                                    ? "Precio con promoción"
                                    : "Subtotal"}
                              </span>
                              {hasPromotion ? (
                                <div className="flex items-center gap-2 lg:justify-end">
                                  <span className="text-sm text-[#8a9aa1] line-through">
                                    {formatCurrencyMx(originalLineTotal, {
                                      fractionDigits: 0,
                                    })}
                                  </span>
                                  <span className="rounded-full bg-[#ffe8e6] px-2 py-0.5 text-xs font-bold text-[#c33127]">
                                    {getDiscountLabel(item.promotion?.percent)}
                                  </span>
                                </div>
                              ) : null}
                              <strong className="text-[1.45rem] leading-tight text-[#132633]">
                                {finalLineTotal === null
                                  ? "Pendiente"
                                  : formatCurrencyMx(finalLineTotal, {
                                      fractionDigits: 0,
                                    })}
                              </strong>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isPending}
                            aria-label="Eliminar producto"
                            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-[#b42318] transition hover:bg-[#fff1f1] hover:text-[#8f1d18] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </article>
                      );
                    })}
                  </section>
                ))}
            </div>

            <aside className="h-fit rounded-2xl border border-[#dbe5e7] bg-white p-6 shadow-[0_18px_34px_rgba(15,61,59,0.07)] lg:sticky lg:top-24">
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#405b65]">
                Resumen
              </h2>
              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between text-[0.95rem] text-[#5b717c]">
                  <span>Compra</span>
                  <strong className="text-[#193844]">
                    {formatCurrencyMx(cart.summary.saleSubtotal ?? 0, {
                      fractionDigits: 0,
                    })}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[0.95rem] text-[#5b717c]">
                  <span>Renta estimada</span>
                  <strong className="text-[#193844]">
                    {cart.summary.hasUnconfiguredRentalItems
                      ? "Pendiente de configurar"
                      : formatCurrencyMx(cart.summary.rentalSubtotal ?? 0, {
                          fractionDigits: 0,
                        })}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[0.95rem] text-[#5b717c]">
                  <span>Depósitos estimados</span>
                  <strong className="text-[#193844]">
                    {cart.summary.hasUnconfiguredRentalItems
                      ? "Pendiente de configurar"
                      : formatCurrencyMx(
                          cart.summary.rentalDepositTotal ?? 0,
                          { fractionDigits: 0 },
                        )}
                  </strong>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-[#e8eff1] pt-5">
                <div className="flex items-center justify-between text-[0.95rem] text-[#5b717c]">
                  <span>Subtotal</span>
                  <strong className="font-semibold text-[#193844]">
                    {formatCurrencyMx(cart.summary.subtotal, {
                      fractionDigits: 0,
                    })}
                  </strong>
                </div>
                {cartDiscount > 0 ? (
                  <div className="flex items-center justify-between rounded-xl bg-[#fff6f5] px-3 py-2 text-[0.95rem] text-[#b42318]">
                    <span>Descuento</span>
                    <strong className="font-bold">
                      -{formatCurrencyMx(cartDiscount, { fractionDigits: 0 })}
                    </strong>
                  </div>
                ) : null}
                <div className="flex items-end justify-between border-t border-[#e8eff1] pt-4">
                  <span className="text-[1rem] font-semibold text-[#193844]">
                    {cart.summary.hasUnconfiguredRentalItems
                      ? hasSaleItems
                        ? "Total de compra configurado"
                        : "Total de renta"
                      : hasRentalItems
                        ? "Total estimado"
                        : "Total"}
                  </span>
                  <strong className="text-[2rem] leading-none text-[#1f6a67]">
                    {cart.summary.hasUnconfiguredRentalItems && !hasSaleItems
                      ? "Pendiente"
                      : formatCurrencyMx(cartTotal, { fractionDigits: 0 })}
                  </strong>
                </div>
              </div>

              {hasRentalItems ? (
                <>
                  {rentalItemsMissingPrescription.length > 0 ? (
                    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-3 text-sm leading-6 text-[#845b12]">
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#c47b13]" />
                      <p>
                        Falta receta en {rentalItemsMissingPrescription.length}{" "}
                        producto
                        {rentalItemsMissingPrescription.length === 1
                          ? ""
                          : "s"}{" "}
                        de renta.
                      </p>
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 rounded-2xl border border-[#cfe0e3] bg-[#f8fbfb] px-4 py-3 text-sm leading-6 text-[#405b65]">
                    <p>
                      Los productos en renta están sujetos a revisión de
                      disponibilidad, receta médica y condiciones de entrega por
                      parte de CEMYDI.
                    </p>
                    {hasSaleItems ? (
                      <p>
                        Tu carrito incluye productos de compra y renta. La
                        compra puede confirmarse, pero la renta será revisada
                        antes de aprobarse.
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null}

              <button
                type="button"
                onClick={handlePrimaryCartAction}
                disabled={getPrimaryCartActionDisabled()}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1f6a67] px-5 py-3.5 text-base font-bold text-white shadow-[0_16px_28px_rgba(31,106,103,0.22)] transition hover:bg-[#185856] disabled:cursor-not-allowed disabled:bg-[#9ab8b6] disabled:shadow-none"
              >
                {submittingRental ? "Enviando..." : getPrimaryCartActionLabel()}
              </button>

              <Link
                href="/catalogo"
                className="mt-3 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-[#31505c] no-underline transition hover:text-[#1f6a67]"
              >
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}

        {hasItems ? (
          <DemoRecommendations
            context="cart"
            sourceProducts={cart.items.map((item) => item.product)}
          />
        ) : null}
      </div>
      {requirementsOpen ? (
        <RentalRequirementsDialog
          open
          onOpenChange={setRequirementsOpen}
          user={user}
          items={rentalItems}
          submitting={submittingRental}
          prescriptionPendingItemId={prescriptionPendingItemId}
          prescriptionProgress={prescriptionProgress}
          onUploadPrescription={handlePrescriptionChange}
          onDeletePrescription={removePrescriptionFile}
          onSubmit={handleSubmitRental}
        />
      ) : null}
      <Dialog
        open={Boolean(editingRentalItem && editingRental)}
        onOpenChange={(open) => {
          if (!open && prescriptionPendingItemId === null) {
            setEditingRentalItemId(null);
          }
        }}
      >
        {editingRentalItem && editingRental ? (
          <DialogContent className="w-[min(560px,calc(100vw-2rem))] border-[#dbe5e7] bg-white text-[#17333f]">
            <DialogHeader className="border-b border-[#edf2f3] pb-4">
              <DialogTitle className="text-[#132633]">
                Configurar renta
              </DialogTitle>
              <DialogDescription className="text-[#60727a]">
                {editingRentalItem.product.nombre}. Puedes guardar las fechas
                aunque la receta siga pendiente.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                Cantidad
                <input
                  type="number"
                  min={1}
                  max={editingRentalItem.availability.maxQuantity}
                  value={editingRental.quantity}
                  disabled={pendingItemId === editingRentalItem.id}
                  onChange={(event) =>
                    updateRentalEdit(editingRentalItem.id, {
                      quantity: Math.max(
                        1,
                        Math.trunc(Number(event.target.value) || 1),
                      ),
                    })
                  }
                  className="h-11 rounded-xl border border-[#d4dfe2] bg-white px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67] focus:ring-2 focus:ring-[#d6eeee]"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                  Inicio
                  <input
                    type="date"
                    value={editingRental.rentalStartDate}
                    min={todayDateInputValue}
                    disabled={pendingItemId === editingRentalItem.id}
                    onChange={(event) =>
                      updateRentalEdit(editingRentalItem.id, {
                        rentalStartDate: event.target.value,
                      })
                    }
                    className="h-11 rounded-xl border border-[#d4dfe2] bg-white px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67] focus:ring-2 focus:ring-[#d6eeee]"
                  />
                </label>
                <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                  Fin
                  <input
                    type="date"
                    value={editingRental.rentalEndDate}
                    min={editingRental.rentalStartDate || todayDateInputValue}
                    disabled={pendingItemId === editingRentalItem.id}
                    onChange={(event) =>
                      updateRentalEdit(editingRentalItem.id, {
                        rentalEndDate: event.target.value,
                      })
                    }
                    className="h-11 rounded-xl border border-[#d4dfe2] bg-white px-3 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67] focus:ring-2 focus:ring-[#d6eeee]"
                  />
                </label>
              </div>

              <label className="grid gap-1 text-xs font-bold uppercase tracking-[0.06em] text-[#60727a]">
                Notas para CEMYDI
                <textarea
                  value={editingRental.rentalNotes}
                  disabled={pendingItemId === editingRentalItem.id}
                  maxLength={500}
                  rows={4}
                  onChange={(event) =>
                    updateRentalEdit(editingRentalItem.id, {
                      rentalNotes: event.target.value,
                    })
                  }
                  className="min-h-24 rounded-xl border border-[#d4dfe2] bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-[#193844] outline-none focus:border-[#1f6a67] focus:ring-2 focus:ring-[#d6eeee]"
                  placeholder="Ej. Necesito entrega a domicilio o medidas del paciente."
                />
              </label>

              {editingRentalDays && editingRentalSubtotal !== null ? (
                <div className="grid gap-2 border-y border-[#e8eff1] py-3 text-sm text-[#405b65]">
                  <div className="flex justify-between gap-3">
                    <span>
                      {editingRentalDays} día(s) inclusivos ×{" "}
                      {editingRental.quantity}
                    </span>
                    <strong>{formatCurrencyMx(editingRentalSubtotal)}</strong>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Depósito</span>
                    <strong>
                      {formatCurrencyMx(editingRentalDeposit ?? 0)}
                    </strong>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-[#edf2f3] pt-2 text-[#17333f]">
                    <span>Total estimado</span>
                    <strong>
                      {formatCurrencyMx(
                        editingRentalSubtotal + (editingRentalDeposit ?? 0),
                      )}
                    </strong>
                  </div>
                </div>
              ) : null}

              {editingRentalItem.product.requiereReceta ? (
                <div className="border-t border-[#e8eff1] pt-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf9fb] text-[#176c83]">
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-sm text-[#17333f]">
                        Receta de este producto
                      </strong>
                      <p className="mt-1 text-sm leading-6 text-[#60727a]">
                        Es obligatoria para enviar la solicitud, no para guardar
                        las fechas.
                      </p>
                      <p className="text-sm leading-6 text-[#60727a]">
                        Adjunta PDF, JPG, JPEG, PNG o WEBP. Máximo 8 MB.
                      </p>
                    </div>
                  </div>

                  {editingRentalItem.document ? (
                    <div className="mt-3 grid gap-3 border-t border-[#edf2f3] pt-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#17333f]">
                            {editingRentalItem.document.originalFilename}
                          </p>
                          <p className="text-xs text-[#6a7f88]">
                            {formatFileSize(editingRentalItem.document.bytes)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            void removePrescriptionFile(editingRentalItem.id)
                          }
                          disabled={
                            prescriptionPendingItemId === editingRentalItem.id
                          }
                          className="grid size-9 shrink-0 place-items-center rounded-full text-[#b42318] transition hover:bg-[#fff1f1] hover:text-[#8f1d18]"
                          aria-label="Quitar receta"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="flex items-center gap-2 text-xs font-bold text-[#1e7c55]">
                        <CheckCircle2 className="size-4" />
                        Archivo adjuntado correctamente.
                      </p>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#9abdc0] bg-[#f8fbfb] px-4 py-2.5 text-sm font-bold text-[#176c83] transition hover:bg-[#edf9fb]">
                        <Upload className="size-4" />
                        Cambiar receta
                        <input
                          type="file"
                          accept={PRESCRIPTION_ACCEPT}
                          className="sr-only"
                          onChange={(event) => {
                            void handlePrescriptionChange(
                              editingRentalItem.id,
                              event.target.files,
                            );
                            event.currentTarget.value = "";
                          }}
                          disabled={
                            prescriptionPendingItemId === editingRentalItem.id
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#9abdc0] bg-white px-4 py-3 text-sm font-bold text-[#176c83] transition hover:bg-[#edf9fb]">
                      <Upload className="size-4" />
                      Adjuntar receta
                      <input
                        type="file"
                        accept={PRESCRIPTION_ACCEPT}
                        className="sr-only"
                        onChange={(event) => {
                          void handlePrescriptionChange(
                            editingRentalItem.id,
                            event.target.files,
                          );
                          event.currentTarget.value = "";
                        }}
                        disabled={
                          prescriptionPendingItemId === editingRentalItem.id
                        }
                      />
                    </label>
                  )}
                  {prescriptionPendingItemId === editingRentalItem.id ? (
                    <div className="mt-3" aria-live="polite">
                      <div className="h-2 overflow-hidden rounded-full bg-[#dcebec]">
                        <div
                          className="h-full bg-[#1f6a67] transition-[width]"
                          style={{
                            width: `${prescriptionProgress[editingRentalItem.id] ?? 0}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[#60727a]">
                        Subiendo receta…{" "}
                        {prescriptionProgress[editingRentalItem.id] ?? 0}%
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {rentalEditError ? (
                <div className="rounded-xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-3 text-sm font-semibold leading-6 text-[#845b12]">
                  {rentalEditError}
                </div>
              ) : null}
            </div>

            <DialogFooter className="border-t border-[#edf2f3] pt-4">
              <button
                type="button"
                onClick={() => setEditingRentalItemId(null)}
                className="rounded-xl border border-[#d6e2e4] bg-white px-5 py-3 text-sm font-bold text-[#405b65] transition hover:bg-[#f4f8f8]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  pendingItemId === editingRentalItem.id ||
                  prescriptionPendingItemId === editingRentalItem.id
                }
                onClick={() =>
                  void handleRentalDetailsSave(editingRentalItem.id)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1f6a67] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#185856] disabled:cursor-not-allowed disabled:bg-[#9ab8b6]"
              >
                <Edit3 className="size-4" />
                {pendingItemId === editingRentalItem.id
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
