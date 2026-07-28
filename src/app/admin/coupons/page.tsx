"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Copy,
  PencilLine,
  Plus,
  ShoppingCart,
  TicketPercent,
  Trash2,
  UsersRound,
} from "lucide-react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/feedback";
import { AdminFilterTabs } from "@/features/admin/components/admin-filter-tabs";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { AdminSearchField } from "@/features/admin/components/admin-search-field";
import { AdminCardListSkeleton } from "@/features/admin/components/admin-content-skeletons";
import { PageHeader } from "@/features/admin/components/page-header";
import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/features/admin/components/ui/card";
import { adminQueryKeys } from "@/features/admin/lib/query-keys";
import { formatCurrencyMx } from "@/lib/formatters";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  type AdminCoupon,
} from "@/services/admin";

import { CouponFormDialog } from "./CouponFormDialog";
import {
  couponFormToPayload,
  couponToForm,
  emptyCouponForm,
  formatCouponBenefit,
  getCouponStatus,
  type CouponFormState,
  type CouponStatus,
  type CouponStatusFilter,
  validateCouponForm,
} from "./coupon-utils";

const FILTERS: Array<{ id: CouponStatusFilter; label: string }> = [
  { id: "ALL", label: "Todos" },
  { id: "Activo", label: "Activos" },
  { id: "Programado", label: "Programados" },
  { id: "Agotado", label: "Agotados" },
  { id: "Vencido", label: "Vencidos" },
  { id: "Inactivo", label: "Inactivos" },
];

const BADGE_VARIANTS: Record<
  CouponStatus,
  "emerald" | "amber" | "red" | "slate" | "violet"
> = {
  Activo: "emerald",
  Programado: "amber",
  Agotado: "red",
  Vencido: "slate",
  Inactivo: "violet",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const couponsQuery = useQuery({
    queryKey: adminQueryKeys.coupons,
    queryFn: async () => (await listCoupons()).coupons,
  });
  const coupons = useMemo(() => couponsQuery.data ?? [], [couponsQuery.data]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CouponStatusFilter>("ALL");
  const [form, setForm] = useState<CouponFormState>(() => emptyCouponForm());
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    let active = 0;
    let scheduled = 0;
    for (const coupon of coupons) {
      const status = getCouponStatus(coupon);
      if (status === "Activo") active += 1;
      if (status === "Programado") scheduled += 1;
    }
    return { total: coupons.length, active, scheduled };
  }, [coupons]);

  const counts = useMemo(() => {
    const result: Record<CouponStatusFilter, number> = {
      ALL: coupons.length,
      Activo: 0,
      Programado: 0,
      Agotado: 0,
      Vencido: 0,
      Inactivo: 0,
    };
    for (const coupon of coupons) result[getCouponStatus(coupon)] += 1;
    return result;
  }, [coupons]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return coupons.filter((coupon) => {
      const status = getCouponStatus(coupon);
      if (filter !== "ALL" && status !== filter) return false;
      return (
        !query ||
        coupon.code.toLocaleLowerCase("es").includes(query) ||
        coupon.description.toLocaleLowerCase("es").includes(query)
      );
    });
  }, [coupons, filter, search]);

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyCouponForm());
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyCouponForm());
    setFormOpen(true);
  }

  function startEdit(coupon: AdminCoupon) {
    setEditingId(coupon.id);
    setForm(couponToForm(coupon));
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const error = validateCouponForm(form);
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      const payload = couponFormToPayload(form);
      const response =
        editingId === null
          ? await createCoupon(payload)
          : await updateCoupon(editingId, payload);
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.coupons });
      toast.success(response.message);
      closeForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar el cupón.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const response = await deleteCoupon(deleteTarget.id);
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.coupons });
      toast.success(response.message);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar el cupón.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    toast.success(`Código ${code} copiado.`);
  }

  return (
    <>
      <PageHeader
        title="Cupones"
        subtitle="Administra códigos de descuento con vigencia, compra mínima y límites de uso."
      >
        <Button type="button" onClick={startCreate}>
          <Plus className="size-4" aria-hidden />
          Nuevo cupón
        </Button>
      </PageHeader>

      <section
        className="mt-5 grid gap-4 md:grid-cols-3"
        aria-busy={couponsQuery.isLoading}
      >
        <AdminMetricCard
          context="promotions-total"
          label="Total cupones"
          value={couponsQuery.isLoading ? "—" : stats.total}
        />
        <AdminMetricCard
          context="promotions-active"
          label="Activos"
          value={couponsQuery.isLoading ? "—" : stats.active}
        />
        <AdminMetricCard
          context="promotions-scheduled"
          label="Programados"
          value={couponsQuery.isLoading ? "—" : stats.scheduled}
        />
      </section>

      <Card className="mt-4 overflow-hidden rounded-xl">
        <CardHeader className="border-b border-[var(--border-soft)]">
          <AdminFilterTabs
            tabs={FILTERS.map((item) => ({ ...item, count: counts[item.id] }))}
            activeId={filter}
            onChange={setFilter}
          />
          <AdminSearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar por código o descripción…"
            wrapperClassName="max-w-md"
          />
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {couponsQuery.isLoading ? (
            <AdminCardListSkeleton count={6} />
          ) : couponsQuery.isError ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-700 dark:text-red-300">
              No se pudieron cargar los cupones.
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid min-h-52 place-items-center rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--surface)] p-8 text-center">
              <div>
                <TicketPercent
                  className="mx-auto size-10 text-[var(--text-muted)]"
                  aria-hidden
                />
                <p className="mt-3 font-semibold text-[var(--text-main)]">
                  {coupons.length === 0 ? "Aún no hay cupones" : "Sin resultados"}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {coupons.length === 0
                    ? "Crea un código para incentivar la primera compra o una campaña especial."
                    : "Prueba otra búsqueda o estado."}
                </p>
              </div>
            </div>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((coupon) => {
                const status = getCouponStatus(coupon);
                const remaining =
                  coupon.usageLimit === null
                    ? null
                    : Math.max(0, coupon.usageLimit - coupon.usedCount);
                return (
                  <li
                    key={coupon.id}
                    className="flex min-h-72 flex-col rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-mono text-lg font-extrabold tracking-[0.08em] text-[var(--brand-800)]">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => void copyCode(coupon.code)}
                            className="grid size-7 shrink-0 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-main)]"
                            aria-label={`Copiar ${coupon.code}`}
                          >
                            <Copy className="size-3.5" aria-hidden />
                          </button>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatCouponBenefit(coupon)}
                        </p>
                      </div>
                      <Badge variant={BADGE_VARIANTS[status]}>{status}</Badge>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
                      {coupon.description}
                    </p>

                    <div className="mt-4 grid gap-2 rounded-xl bg-[var(--surface)] p-3 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="size-3.5" aria-hidden />
                        Compra mínima: {formatCurrencyMx(coupon.minimumPurchase)}
                      </span>
                      <span className="flex items-center gap-2">
                        <CalendarDays className="size-3.5" aria-hidden />
                        {formatDate(coupon.startAt)} – {formatDate(coupon.endAt)}
                      </span>
                      <span className="flex items-center gap-2">
                        <UsersRound className="size-3.5" aria-hidden />
                        {coupon.usageLimit === null
                          ? `${coupon.usedCount} usos · sin límite`
                          : `${coupon.usedCount} usados · ${remaining} disponibles`}
                      </span>
                    </div>

                    <div className="mt-auto flex gap-2 border-t border-[var(--border-soft)] pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => startEdit(coupon)}
                        disabled={saving}
                      >
                        <PencilLine className="size-3.5" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(coupon)}
                        disabled={saving}
                        aria-label={`Eliminar cupón ${coupon.code}`}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <CouponFormDialog
        open={formOpen}
        editing={editingId !== null}
        form={form}
        saving={saving}
        onChange={(patch) => setForm((previous) => ({ ...previous, ...patch }))}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar cupón"
        description={
          deleteTarget
            ? `El código «${deleteTarget.code}» dejará de estar disponible para los clientes.`
            : undefined
        }
        tone="danger"
        busy={saving}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => {
          if (!saving) setDeleteTarget(null);
        }}
      />
    </>
  );
}
