"use client";

import { BadgePercent, LoaderCircle, TicketPercent } from "lucide-react";

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

import type { CouponFormState } from "./coupon-utils";

const fieldClassName =
  "h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

type Props = {
  open: boolean;
  editing: boolean;
  form: CouponFormState;
  saving: boolean;
  onChange: (patch: Partial<CouponFormState>) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
};

export function CouponFormDialog({
  open,
  editing,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose();
      }}
    >
      <DialogContent className="w-[min(720px,calc(100vw-1.5rem))] gap-0 p-0">
        <DialogHeader className="border-b border-[var(--border-soft)] px-6 py-5">
          <DialogTitle className="flex items-center gap-2">
            <TicketPercent className="size-5 text-[var(--brand-700)]" aria-hidden />
            {editing ? "Editar cupón" : "Nuevo cupón"}
          </DialogTitle>
          <DialogDescription>
            Define el beneficio, las condiciones y la vigencia del código.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="grid max-h-[calc(100vh-13rem)] gap-5 overflow-y-auto px-6 py-5">
            <section className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Código
                <input
                  value={form.code}
                  onChange={(event) =>
                    onChange({
                      code: event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9_-]/g, ""),
                    })
                  }
                  className={cn(fieldClassName, "font-bold tracking-[0.12em]")}
                  placeholder="BIENVENIDA15"
                  maxLength={24}
                  disabled={saving}
                />
                <span className="text-xs font-normal text-[var(--text-muted)]">
                  Fácil de escribir y recordar; entre 4 y 24 caracteres.
                </span>
              </label>

              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Tipo de descuento
                <select
                  value={form.discountType}
                  onChange={(event) =>
                    onChange({
                      discountType: event.target.value as CouponFormState["discountType"],
                    })
                  }
                  className={fieldClassName}
                  disabled={saving}
                >
                  <option value="PERCENT">Porcentaje</option>
                  <option value="FIXED">Monto fijo</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Beneficio
                <div className="relative">
                  <BadgePercent
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"
                    aria-hidden
                  />
                  <input
                    type="number"
                    min="0.01"
                    max={form.discountType === "PERCENT" ? 100 : undefined}
                    step="0.01"
                    value={form.discountValue}
                    onChange={(event) =>
                      onChange({ discountValue: event.target.value })
                    }
                    className={cn(fieldClassName, "pl-10")}
                    disabled={saving}
                  />
                </div>
              </label>

              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Compra mínima
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimumPurchase}
                  onChange={(event) =>
                    onChange({ minimumPurchase: event.target.value })
                  }
                  className={fieldClassName}
                  disabled={saving}
                />
              </label>

              {form.discountType === "PERCENT" ? (
                <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                  Tope de descuento
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.maximumDiscount}
                    onChange={(event) =>
                      onChange({ maximumDiscount: event.target.value })
                    }
                    className={fieldClassName}
                    placeholder="Sin tope"
                    disabled={saving}
                  />
                </label>
              ) : null}

              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Límite total de usos
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(event) =>
                    onChange({ usageLimit: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="Sin límite"
                  disabled={saving}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Fecha de inicio
                <input
                  type="date"
                  value={form.startAt}
                  onChange={(event) => onChange({ startAt: event.target.value })}
                  className={fieldClassName}
                  disabled={saving}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
                Fecha final
                <input
                  type="date"
                  min={form.startAt}
                  value={form.endAt}
                  onChange={(event) => onChange({ endAt: event.target.value })}
                  className={fieldClassName}
                  disabled={saving}
                />
              </label>
            </section>

            <label className="grid gap-2 text-sm font-medium text-[var(--text-main)]">
              Descripción para el cliente
              <textarea
                value={form.description}
                onChange={(event) =>
                  onChange({ description: event.target.value })
                }
                rows={3}
                maxLength={160}
                className={cn(fieldClassName, "h-auto min-h-24 py-3")}
                placeholder="Ej. 15% en tu primera compra, con un mínimo de $800."
                disabled={saving}
              />
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={form.active}
              onClick={() => onChange({ active: !form.active })}
              disabled={saving}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 text-left"
            >
              <span>
                <span className="block text-sm font-semibold text-[var(--text-main)]">
                  Cupón habilitado
                </span>
                <span className="mt-1 block text-xs text-[var(--text-muted)]">
                  Puedes apagarlo sin eliminarlo.
                </span>
              </span>
              <span
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition",
                  form.active ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 size-4 rounded-full bg-white shadow transition",
                    form.active ? "left-6" : "left-1",
                  )}
                />
              </span>
            </button>
          </div>

          <DialogFooter className="border-t border-[var(--border-soft)] bg-[var(--card)] px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
              {editing ? "Guardar cambios" : "Crear cupón"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
