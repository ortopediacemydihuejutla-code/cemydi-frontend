"use client";

import {
  CalendarRange,
  ImageIcon,
  LoaderCircle,
  Percent,
  Sparkles,
  TrendingDown,
  Upload,
} from "lucide-react";

import { AdminImageUpload } from "@/features/admin/components/admin-image-upload";
import { Button } from "@/features/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import { cn } from "@/features/admin/lib/utils";
import { formatCurrencyMx } from "@/lib/formatters";
import { calculateDiscountedPrice } from "@/lib/promotion-pricing";
import type {
  AdminProduct,
  PromotionImageStrategy,
} from "@/services/admin";

import type { PromotionFormState } from "../utils/promotion-mappers";
import {
  dateInputInnerClass,
  promotionFieldClassName,
  promotionTextareaClassName,
} from "../utils/promotion-form-styles";
import { PromotionProductPicker } from "./PromotionProductPicker";

type PromotionFormDialogProps = {
  open: boolean;
  editingId: number | null;
  form: PromotionFormState;
  saving: boolean;
  todayStr: string;
  endDateMin: string;
  sortedProducts: AdminProduct[];
  classificationOptions: string[];
  formImagePreviewSrc: string | null;
  previewIsLocalFile: boolean;
  startDateRef: React.RefObject<HTMLInputElement | null>;
  endDateRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (event: React.FormEvent) => void;
  onFieldChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onProductIdsChange: (productIds: number[]) => void;
  onImageStrategyChange: (strategy: PromotionImageStrategy) => void;
  onReset: () => void;
  onOpenDatePicker: (
    ref: React.RefObject<HTMLInputElement | null>,
  ) => void;
  onApplyImageFile: (file: File) => void;
  onClearLocalImage: () => void;
};

export function PromotionFormDialog({
  open,
  editingId,
  form,
  saving,
  todayStr,
  endDateMin,
  sortedProducts,
  classificationOptions,
  formImagePreviewSrc,
  previewIsLocalFile,
  startDateRef,
  endDateRef,
  onSubmit,
  onFieldChange,
  onProductIdsChange,
  onImageStrategyChange,
  onReset,
  onOpenDatePicker,
  onApplyImageFile,
  onClearLocalImage,
}: PromotionFormDialogProps) {
  const selectedProduct =
    sortedProducts.find((product) =>
      form.productIds.includes(product.id),
    ) ?? null;
  const discountPercent = Number(form.discountPercent);
  const validDiscount =
    Number.isInteger(discountPercent) &&
    discountPercent >= 1 &&
    discountPercent <= 90;
  const discountedPrice =
    selectedProduct && validDiscount
      ? calculateDiscountedPrice(
          selectedProduct.precio,
          discountPercent,
        )
      : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onReset();
      }}
    >
      <DialogContent className="w-[min(980px,calc(100vw-1.5rem))] gap-0 p-0">
        <DialogHeader className="border-b border-[var(--border-soft)] px-6 py-5">
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange
              className="size-5 text-[var(--brand-700)]"
              aria-hidden
            />
            {editingId !== null
              ? "Editar campaña"
              : "Nueva campaña promocional"}
          </DialogTitle>
          <DialogDescription>
            Selecciona productos de cualquier categoría, define el descuento y
            decide cómo se mostrará la imagen en la tienda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="grid gap-6 px-6 py-5">
            <section className="grid gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-700)] text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Elige los productos
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    La selección permanece aunque cambies filtros o categorías.
                  </p>
                </div>
              </div>
              <PromotionProductPicker
                products={sortedProducts}
                selectedIds={form.productIds}
                classifications={classificationOptions}
                disabled={saving}
                onChange={onProductIdsChange}
              />
            </section>

            <div className="h-px bg-[var(--border-soft)]" />

            <section className="grid gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-700)] text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Beneficio y vigencia
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    El precio final se calcula sobre cada producto.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                  Porcentaje de descuento
                  <div className="relative">
                    <Percent
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
                      aria-hidden
                    />
                    <input
                      name="discountPercent"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={90}
                      step={1}
                      className={cn(
                        promotionFieldClassName,
                        "pl-10 pr-12",
                      )}
                      value={form.discountPercent}
                      onChange={onFieldChange}
                      disabled={saving}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--brand-700)]">
                      %
                    </span>
                  </div>
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    Entre 1% y 90%.
                  </span>
                </label>

                <div className="flex min-h-24 items-center rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4">
                  <TrendingDown
                    className="mr-3 size-5 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                  {selectedProduct && discountedPrice !== null ? (
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[var(--text-muted)]">
                        Ejemplo: {selectedProduct.nombre}
                      </p>
                      <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="text-sm text-[var(--text-muted)] line-through">
                          {formatCurrencyMx(selectedProduct.precio)}
                        </span>
                        <strong className="text-lg text-emerald-700 dark:text-emerald-400">
                          {formatCurrencyMx(discountedPrice)}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)]">
                      Selecciona productos y un descuento válido.
                    </p>
                  )}
                </div>

                <DatePickerField
                  label="Inicio"
                  name="startAt"
                  value={form.startAt}
                  min={todayStr}
                  inputRef={startDateRef}
                  disabled={saving}
                  onChange={onFieldChange}
                  onOpen={() => onOpenDatePicker(startDateRef)}
                />
                <DatePickerField
                  label="Fin"
                  name="endAt"
                  value={form.endAt}
                  min={endDateMin}
                  inputRef={endDateRef}
                  disabled={saving}
                  onChange={onFieldChange}
                  onOpen={() => onOpenDatePicker(endDateRef)}
                />
              </div>
            </section>

            <div className="h-px bg-[var(--border-soft)]" />

            <section className="grid gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-[var(--brand-700)] text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Presentación de la oferta
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Usa imágenes de producto o sube una pieza editada.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    {
                      id: "AUTO",
                      title: "Automática",
                      description:
                        "Cada tarjeta usa la imagen principal de su producto.",
                      icon: Sparkles,
                    },
                    {
                      id: "CUSTOM",
                      title: "Personalizada",
                      description:
                        "Una misma imagen editada para toda la campaña.",
                      icon: Upload,
                    },
                  ] as const
                ).map((option) => {
                  const Icon = option.icon;
                  const selected = form.imageStrategy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={saving}
                      onClick={() => onImageStrategyChange(option.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-left transition",
                        selected
                          ? "border-[var(--brand-600)] bg-[color-mix(in_srgb,var(--brand-600)_8%,var(--card))] ring-2 ring-[color-mix(in_srgb,var(--brand-600)_15%,transparent)]"
                          : "border-[var(--border-soft)] bg-[var(--card)] hover:bg-[var(--surface)]",
                      )}
                    >
                      <Icon
                        className="mt-0.5 size-5 shrink-0 text-[var(--brand-700)]"
                        aria-hidden
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--text-main)]">
                          {option.title}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-[var(--text-muted)]">
                          {option.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {form.imageStrategy === "CUSTOM" ? (
                <AdminImageUpload
                  id="promotion-image"
                  label="Imagen personalizada"
                  description="JPG, PNG o WebP · máximo 8 MB · proporción recomendada 16:10."
                  previewSrc={formImagePreviewSrc}
                  hasLocalFile={previewIsLocalFile}
                  disabled={saving}
                  aspectClassName="aspect-[16/7]"
                  sourceLabel={
                    formImagePreviewSrc
                      ? previewIsLocalFile
                        ? "Nueva imagen"
                        : "Imagen actual"
                      : undefined
                  }
                  previewLabel="Vista de campaña"
                  clearLabel="Quitar selección"
                  emptyTitle="Sube tu diseño promocional"
                  emptyDescription="Arrastra una imagen editada o selecciónala desde tu equipo"
                  onFileChange={(file) => {
                    if (file) onApplyImageFile(file);
                  }}
                  onClearLocal={onClearLocalImage}
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
                  <ImageIcon
                    className="size-5 shrink-0 text-[var(--text-muted)]"
                    aria-hidden
                  />
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                    El sistema utilizará una imagen distinta y coherente para
                    cada producto seleccionado.
                  </p>
                </div>
              )}

              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Descripción pública
                <textarea
                  name="descripcion"
                  className={promotionTextareaClassName}
                  placeholder="Explica brevemente el beneficio de la campaña"
                  value={form.descripcion}
                  onChange={onFieldChange}
                  disabled={saving}
                  rows={3}
                />
              </label>
            </section>
          </div>

          <DialogFooter className="sticky bottom-0 border-t border-[var(--border-soft)] bg-[var(--card)] px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={onReset}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <LoaderCircle
                  className="mr-2 size-4 animate-spin"
                  aria-hidden
                />
              ) : null}
              {editingId !== null
                ? "Guardar campaña"
                : "Crear campaña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type DatePickerFieldProps = {
  label: string;
  name: "startAt" | "endAt";
  value: string;
  min: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onOpen: () => void;
};

function DatePickerField({
  label,
  name,
  value,
  min,
  inputRef,
  disabled,
  onChange,
  onOpen,
}: DatePickerFieldProps) {
  return (
    <div className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
      <span>{label}</span>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          promotionFieldClassName,
          "flex cursor-pointer items-center",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onClick={() => !disabled && onOpen()}
        onKeyDown={(event) => {
          if (
            !disabled &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            onOpen();
          }
        }}
      >
        <input
          ref={inputRef}
          name={name}
          type="date"
          min={min}
          className={dateInputInnerClass}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-label={label}
        />
      </div>
    </div>
  );
}
