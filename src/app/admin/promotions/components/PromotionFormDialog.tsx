"use client";

import {
  CalendarRange,
  Layers2,
  LoaderCircle,
  Package,
} from "lucide-react";

import type { AdminProduct, CreatePromotionPayload } from "@/services/admin";

import { AdminImageUpload } from "@/features/admin/components/admin-image-upload";
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
  startDateRef: React.RefObject<HTMLInputElement | null>;
  endDateRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (e: React.FormEvent) => void;
  onFieldChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void;
  onModeChange: (mode: CreatePromotionPayload["mode"]) => void;
  onReset: () => void;
  onOpenDatePicker: (ref: React.RefObject<HTMLInputElement | null>) => void;
  onApplyImageFile: (file: File) => void;
  onClearLocalImage: () => void;
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
  startDateRef,
  endDateRef,
  onSubmit,
  onFieldChange,
  onModeChange,
  onReset,
  onOpenDatePicker,
  onApplyImageFile,
  onClearLocalImage,
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

          <div className="sm:col-span-2">
            <AdminImageUpload
              id="promotion-image"
              label="Imagen de la promoción"
              description="JPG, PNG o WebP · máximo 8 MB. Usa la misma proporción que verá el cliente en el banner."
              previewSrc={formImagePreviewSrc}
              hasLocalFile={previewIsLocalFile}
              disabled={saving}
              aspectClassName="aspect-[16/10]"
              sourceLabel={
                formImagePreviewSrc
                  ? previewIsLocalFile
                    ? "Vista previa local"
                    : "Del servidor"
                  : undefined
              }
              previewLabel="Así se verá en la tienda"
              clearLabel="Quitar imagen"
              onFileChange={(file) => {
                if (file) onApplyImageFile(file);
              }}
              onClearLocal={onClearLocalImage}
            />
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
