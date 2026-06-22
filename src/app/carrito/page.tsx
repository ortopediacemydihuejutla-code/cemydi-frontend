"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthContext";
import { useCart } from "@/providers/CartContext";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import { formatCurrencyMx, formatDateEsMx } from "@/lib/formatters";

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

export default function CarritoPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, updateItemQuantity, removeItem, clearCart } = useCart();
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const hasItems = cart.summary.totalQuantity > 0;
  const cartDiscount = Math.max(0, cart.summary.discountTotal ?? 0);
  const cartTotal = cart.summary.total ?? Math.max(0, cart.summary.subtotal - cartDiscount);
  const canProceedToPayment = hasItems && !cart.summary.hasUnavailableItems;
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
    if (targetItem && !guardQuantity(targetItem.availability.maxQuantity, quantity)) {
      return;
    }

    try {
      setPendingItemId(itemId);
      const result = await updateItemQuantity({ itemId, quantity });
      toast.success(result.message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar la cantidad.";
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
      const message = err instanceof Error ? err.message : "No se pudo vaciar el carrito.";
      toast.error(message);
    } finally {
      setClearing(false);
    }
  };

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
          <h1 className="mt-5 text-[2rem] font-semibold text-[#132633]">Tu carrito te espera</h1>
          <p className="mt-3 text-[1rem] leading-7 text-[#5b717c]">
            Inicia sesión para ver y conservar tus productos entre dispositivos y cambios
            de cuenta.
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
          <h1 className="text-[2rem] font-semibold text-[#132633]">Carrito no disponible</h1>
          <p className="mt-3 text-[1rem] leading-7 text-[#5b717c]">
            El carrito está habilitado solo para cuentas de cliente.
          </p>
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
            <p className="mt-2 text-[0.95rem] leading-6 text-[#5b717c]">{lastUpdatedLabel}</p>
          </div>
          {hasItems ? (
            <button
              type="button"
              onClick={handleClearCart}
              disabled={clearing}
              className="inline-flex items-center justify-center rounded-full border border-[#d0dddd] bg-white px-5 py-2.5 text-sm font-semibold text-[#31505c] shadow-[0_10px_22px_rgba(15,61,59,0.04)] transition hover:border-[#9bbfc0] hover:text-[#1f6a67] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clearing ? "Vaciando..." : "Vaciar carrito"}
            </button>
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
              Explora el catálogo y guarda aquí los productos que quieras conservar para
              después.
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
            <section className="overflow-hidden rounded-2xl border border-[#dbe5e7] bg-white shadow-[0_18px_34px_rgba(15,61,59,0.07)]">
              {cart.summary.hasUnavailableItems ? (
                <div className="m-4 flex items-start gap-3 rounded-2xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-4 text-[#845b12]">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm leading-6">
                    Algunos productos requieren tu atención porque su disponibilidad cambió.
                    Ajusta la cantidad o elimínalos antes de continuar.
                  </p>
                </div>
              ) : null}

              {cart.items.map((item) => {
                const quantityOptions = buildQuantityOptions(
                  item.quantity,
                  item.availability.maxQuantity,
                );
                const isPending = pendingItemId === item.id;
                const itemDiscount = Math.max(0, item.discountAmount ?? 0);
                const hasPromotion = itemDiscount > 0;
                const originalLineTotal =
                  item.originalLineTotal ?? item.lineTotal + itemDiscount;
                const finalLineTotal = item.finalLineTotal ?? item.lineTotal;
                const canDecrease = item.quantity > 1 && !isPending;
                const hasMoreStock =
                  item.quantity < item.availability.maxQuantity &&
                  item.availability.maxQuantity > 0;
                const acquisitionLabel = getAcquisitionLabel(item.product.tipoAdquisicion);

                return (
                  <article
                    key={item.id}
                    className="relative grid gap-5 border-b border-[#edf2f3] p-4 last:border-b-0 sm:grid-cols-[136px_minmax(0,1fr)] lg:grid-cols-[136px_minmax(0,1fr)_220px]"
                  >
                    <Link
                      href={`/producto/${item.product.id}`}
                      className="relative flex min-h-[136px] items-center justify-center overflow-hidden rounded-xl border border-[#e5edef] bg-[#f7fbfb] p-4"
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
                        href={`/producto/${item.product.id}`}
                        className="mt-1 block text-[1.2rem] font-semibold leading-snug text-[#132633] no-underline hover:text-[#1f6a67]"
                      >
                        {item.product.nombre}
                      </Link>
                      <span className="mt-2 inline-flex min-h-0 min-w-0 rounded-full bg-[#e4f6ee] px-3 py-1 text-xs font-bold text-[#1e7c55]">
                        {acquisitionLabel}
                      </span>
                      <p className="mt-3 text-sm leading-6 text-[#5b717c]">
                        Marca: <strong className="font-semibold text-[#344f5b]">{item.product.marca}</strong>{" "}
                        · SKU: <strong className="font-semibold text-[#344f5b]">{item.product.modelo || `CEMYDI-${item.product.id}`}</strong>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#6b7f87]">
                        Precio unitario {formatCurrencyMx(item.product.precio, { fractionDigits: 0 })}
                      </p>

                      {!item.availability.isAvailable && item.availability.reason ? (
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
                            onClick={() => void handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={!canDecrease}
                            aria-label="Disminuir cantidad"
                            className="grid size-11 place-items-center text-[#45646d] transition hover:bg-[#eef7f6] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus className="size-4" />
                          </button>
                          <select
                            value={String(item.quantity)}
                            onChange={(event) =>
                              void handleQuantityChange(item.id, Number(event.target.value))
                            }
                            disabled={isPending || item.availability.maxQuantity === 0}
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
                                toast.error("No hay más productos en stock.");
                                return;
                              }

                              void handleQuantityChange(item.id, item.quantity + 1);
                            }}
                            disabled={isPending || item.availability.maxQuantity === 0}
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
                          {hasPromotion ? "Precio con promoción" : "Subtotal"}
                        </span>
                        {hasPromotion ? (
                          <div className="flex items-center gap-2 lg:justify-end">
                            <span className="text-sm text-[#8a9aa1] line-through">
                              {formatCurrencyMx(originalLineTotal, { fractionDigits: 0 })}
                            </span>
                            <span className="rounded-full bg-[#ffe8e6] px-2 py-0.5 text-xs font-bold text-[#c33127]">
                              {getDiscountLabel(item.promotion?.percent)}
                            </span>
                          </div>
                        ) : null}
                        <strong className="text-[1.45rem] leading-tight text-[#132633]">
                          {formatCurrencyMx(finalLineTotal, { fractionDigits: 0 })}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isPending}
                      aria-label="Eliminar producto"
                      className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-[#7f9198] transition hover:bg-[#f1f5f5] hover:text-[#344f5b] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </article>
                );
              })}
            </section>

            <aside className="h-fit rounded-2xl border border-[#dbe5e7] bg-white p-6 shadow-[0_18px_34px_rgba(15,61,59,0.07)] lg:sticky lg:top-24">
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#405b65]">
                Resumen
              </h2>
              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between text-[0.95rem] text-[#5b717c]">
                  <span>Productos</span>
                  <strong className="text-[#193844]">{cart.summary.distinctItems}</strong>
                </div>
                <div className="flex items-center justify-between text-[0.95rem] text-[#5b717c]">
                  <span>Unidades</span>
                  <strong className="text-[#193844]">{cart.summary.totalQuantity}</strong>
                </div>
              </div>

              <div className="mt-6 grid gap-3 border-t border-[#e8eff1] pt-5">
                <div className="flex items-center justify-between text-[0.95rem] text-[#5b717c]">
                  <span>Subtotal</span>
                  <strong className="font-semibold text-[#193844]">
                    {formatCurrencyMx(cart.summary.subtotal, { fractionDigits: 0 })}
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
                  <span className="text-[1rem] font-semibold text-[#193844]">Total</span>
                  <strong className="text-[2rem] leading-none text-[#1f6a67]">
                    {formatCurrencyMx(cartTotal, { fractionDigits: 0 })}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={!canProceedToPayment}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#1f6a67] px-5 py-3.5 text-base font-bold text-white shadow-[0_16px_28px_rgba(31,106,103,0.22)] transition hover:bg-[#185856] disabled:cursor-not-allowed disabled:bg-[#9ab8b6] disabled:shadow-none"
              >
                Proceder al pago
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
      </div>
    </div>
  );
}
