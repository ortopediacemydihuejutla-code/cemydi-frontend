"use client";

import {
  CalendarRange,
  ImageIcon,
  Layers2,
  LoaderCircle,
  Package,
  Upload,
  X,
} from "lucide-react";

import type { AdminProduct, CreatePromotionPayload } from "@/services/admin";

import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import { CardTitle } from "@/features/admin/components/ui/card";
import { cn } from "@/features/admin/lib/utils";
import type { PromotionFormState } from "../utils/promotion-mappers";
import {
  dateInputInnerClass,
  promotionFieldClassName,
  promotionTextareaClassName,
} from "../utils/promotion-form-styles";

type PromotionFormDialogProps = {
  editingId: number | null;
  form: PromotionFormState;
  saving: boolean;
  todayStr: string;
  endDateMin: string;
  sortedProducts: AdminProduct[];
  classificationOptions: string[];
  formImagePreviewSrc: string | null;
  previewIsLocalFile: boolean;
  imageDropActive: boolean;
  startDateRef: React.RefObject<HTMLInputElement | null>;
  endDateRef: React.RefObject<HTMLInputElement | null>;
  imageFileInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onModeChange: (mode: CreatePromotionPayload["mode"]) => void;
  onReset: () => void;
  onOpenDatePicker: (ref: React.RefObject<HTMLInputElement | null>) => void;
  onApplyImageFile: (file: File) => void;
  onClearLocalImage: () => void;
  onImageDropActiveChange: (active: boolean) => void;
};

export function PromotionFormDialog({
  editingId,
  form,
  saving,
  todayStr,
  endDateMin,
  sortedProducts,
  classificationOptions,
  formImagePreviewSrc,
  previewIsLocalFile,
  imageDropActive,
  startDateRef,
  endDateRef,
  imageFileInputRef,
  onSubmit,
  onFieldChange,
  onModeChange,
  onReset,
  onOpenDatePicker,
  onApplyImageFile,
  onClearLocalImage,
  onImageDropActiveChange,
}: PromotionFormDialogProps) {
  return (
    <>
      <div className="min-w-0">
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="size-5 text-[var(--brand-700)]" aria-hidden />
          {editingId !== null ? "Editar promoción" : "Nueva promoción"}
        </CardTitle>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          La imagen que subas aquí es vista previa en el panel (arrastra o haz clic en la zona punteada).
          El envío al servidor se habilitará después; las promos ya publicadas siguen mostrando su imagen
          en la tienda.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            Alcance
          </p>
          <div className="flex rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-1">
            <button
              type="button"
              disabled={Boolean(editingId) || saving}
              onClick={() => onModeChange("PRODUCT")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition",
                form.mode === "PRODUCT"
                  ? "bg-[var(--card)] text-[var(--brand-900)] shadow-[0_1px_3px_rgba(15,61,59,0.14)] dark:text-[var(--text-main)]"
                  : "text-[var(--text-muted)] hover:text-[var(--brand-800)]",
              )}
            >
              <Package className="size-4 shrink-0 opacity-80" aria-hidden />
              Producto
            </button>
            <button
              type="button"
              disabled={Boolean(editingId) || saving}
              onClick={() => onModeChange("CATEGORY")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition",
                form.mode === "CATEGORY"
                  ? "bg-[var(--card)] text-[var(--brand-900)] shadow-[0_1px_3px_rgba(15,61,59,0.14)] dark:text-[var(--text-main)]"
                  : "text-[var(--text-muted)] hover:text-[var(--brand-800)]",
              )}
            >
              <Layers2 className="size-4 shrink-0 opacity-80" aria-hidden />
              Categoría
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {form.mode === "PRODUCT" ? (
            <label className="grid gap-2 text-sm font-medium text-[var(--text-main)] sm:col-span-2">
              Producto
              <select
                name="productId"
                className={promotionFieldClassName}
                value={form.productId}
                onChange={onFieldChange}
                disabled={saving}
              >
                <option value="">Selecciona…</option>
                {sortedProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nombre} · {item.clasificacion}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="grid gap-2 text-sm font-medium text-[var(--text-main)] sm:col-span-2">
              Clasificación
              <select
                name="clasificacion"
                className={promotionFieldClassName}
                value={form.clasificacion}
                onChange={onFieldChange}
                disabled={saving}
              >
                <option value="">Selecciona…</option>
                {classificationOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
            <span id="promo-start-label">Inicio</span>
            <div
              role="button"
              tabIndex={saving ? -1 : 0}
              className={cn(
                promotionFieldClassName,
                "flex cursor-pointer items-center",
                saving && "cursor-not-allowed opacity-50",
              )}
              onClick={() => !saving && onOpenDatePicker(startDateRef)}
              onKeyDown={(e) => {
                if (saving) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenDatePicker(startDateRef);
                }
              }}
            >
              <input
                ref={startDateRef}
                id="promo-start"
                aria-labelledby="promo-start-label"
                name="startAt"
                type="date"
                min={todayStr}
                className={dateInputInnerClass}
                value={form.startAt}
                onChange={onFieldChange}
                disabled={saving}
              />
            </div>
          </div>
          <div className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
            <span id="promo-end-label">Fin</span>
            <div
              role="button"
              tabIndex={saving ? -1 : 0}
              className={cn(
                promotionFieldClassName,
                "flex cursor-pointer items-center",
                saving && "cursor-not-allowed opacity-50",
              )}
              onClick={() => !saving && onOpenDatePicker(endDateRef)}
              onKeyDown={(e) => {
                if (saving) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenDatePicker(endDateRef);
                }
              }}
            >
              <input
                ref={endDateRef}
                id="promo-end"
                aria-labelledby="promo-end-label"
                name="endAt"
                type="date"
                min={endDateMin}
                className={dateInputInnerClass}
                value={form.endAt}
                onChange={onFieldChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[var(--text-main)]">
                  Imagen de la promoción
                </span>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-[var(--text-muted)]">
                  JPG, PNG o WebP · máximo 8 MB · arrastra al recuadro o usa el botón. Misma proporción
                  que verá el cliente en la portada (banner).
                </p>
              </div>
              {formImagePreviewSrc ? (
                <Badge variant={previewIsLocalFile ? "blue" : "slate"} className="shrink-0">
                  {previewIsLocalFile ? "Vista previa local" : "Del servidor"}
                </Badge>
              ) : null}
            </div>

            <input
              ref={imageFileInputRef}
              type="file"
              accept="image/*,.webp"
              className="sr-only"
              tabIndex={-1}
              disabled={saving}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onApplyImageFile(f);
                e.target.value = "";
              }}
            />

            {formImagePreviewSrc ? (
              <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm">
                <div className="relative aspect-[16/10] w-full bg-[color-mix(in_srgb,var(--brand-700)_8%,var(--surface))]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formImagePreviewSrc}
                    alt=""
                    className="size-full object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                    aria-hidden
                  />
                  <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-9 rounded-lg border border-white/30 bg-white/95 text-[var(--text-main)] shadow-sm hover:bg-white dark:bg-[var(--card)]"
                      disabled={saving}
                      onClick={() => imageFileInputRef.current?.click()}
                    >
                      <Upload className="mr-1.5 size-3.5" aria-hidden />
                      Cambiar
                    </Button>
                    {previewIsLocalFile ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-9 rounded-lg border border-red-500/25 bg-white/95 text-destructive shadow-sm hover:bg-red-50 dark:bg-[var(--card)]"
                        disabled={saving}
                        onClick={onClearLocalImage}
                      >
                        <X className="mr-1.5 size-3.5" aria-hidden />
                        Quitar local
                      </Button>
                    ) : null}
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white drop-shadow-sm">
                    <ImageIcon className="size-4 opacity-90" aria-hidden />
                    <span className="text-xs font-semibold tracking-wide uppercase">
                      Así se verá en la tienda
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={saving ? -1 : 0}
                aria-label="Zona para subir imagen de la promoción"
                className={cn(
                  "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
                  imageDropActive
                    ? "border-[color-mix(in_srgb,var(--brand-600)_55%,var(--border-soft))] bg-[color-mix(in_srgb,var(--brand-600)_10%,var(--surface))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--brand-600)_20%,transparent)]"
                    : "border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface)_88%,var(--card))] hover:border-[color-mix(in_srgb,var(--brand-600)_35%,var(--border-soft))] hover:bg-[color-mix(in_srgb,var(--brand-600)_6%,var(--surface))]",
                  saving && "pointer-events-none cursor-not-allowed opacity-50",
                )}
                onClick={() => !saving && imageFileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (saving) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    imageFileInputRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!saving) onImageDropActiveChange(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    onImageDropActiveChange(false);
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onImageDropActiveChange(false);
                  if (saving) return;
                  const f = e.dataTransfer.files?.[0];
                  if (f) onApplyImageFile(f);
                }}
              >
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] shadow-sm",
                    imageDropActive && "scale-105 border-[color-mix(in_srgb,var(--brand-600)_40%,var(--border-soft))] text-[var(--brand-800)]",
                  )}
                >
                  <Upload
                    className={cn(
                      "size-7 text-[var(--text-muted)]",
                      imageDropActive && "text-[var(--brand-700)]",
                    )}
                    aria-hidden
                  />
                </div>
                <div>
                  <p className="m-0 text-sm font-semibold text-[var(--text-main)]">
                    Arrastra una imagen aquí
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    o haz clic para elegir desde tu equipo
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  disabled={saving}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    imageFileInputRef.current?.click();
                  }}
                >
                  Examinar archivos
                </Button>
              </div>
            )}
          </div>

          <label className="grid gap-2 text-sm font-medium text-[var(--text-main)] sm:col-span-2">
            Descripción
            <textarea
              name="descripcion"
              className={promotionTextareaClassName}
              placeholder="Texto que verá el cliente"
              value={form.descripcion}
              onChange={onFieldChange}
              disabled={saving}
              rows={4}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border-soft)] pt-5">
          {editingId !== null ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-md"
              disabled={saving}
              onClick={onReset}
            >
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" className="h-11 rounded-md" disabled={saving}>
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : editingId !== null ? (
              "Guardar cambios"
            ) : (
              "Crear promoción"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
