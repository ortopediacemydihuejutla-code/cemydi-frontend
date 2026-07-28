"use client";

import { Plus } from "lucide-react";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { PageHeader } from "@/features/admin/components/page-header";
import { Card, CardHeader } from "@/features/admin/components/ui/card";
import { Button } from "@/features/admin/components/ui/button";
import { PromotionDeleteDialog } from "./components/PromotionDeleteDialog";
import { PromotionFilters } from "./components/PromotionFilters";
import { PromotionFormDialog } from "./components/PromotionFormDialog";
import { PromotionsTable } from "./components/PromotionsTable";
import { usePromotionMutations } from "./hooks/usePromotionMutations";
import { usePromotions } from "./hooks/usePromotions";

export default function AdminPromotionsPage() {
  const state = usePromotions();
  const { handleSubmit, handleDelete } = usePromotionMutations(state);

  const {
    initialLoading,
    stats,
    saving,
    editingId,
    formOpen,
    form,
    todayStr,
    endDateMin,
    sortedProducts,
    classificationOptions,
    startDateRef,
    endDateRef,
    statusFilter,
    setStatusFilter,
    filterCounts,
    search,
    setSearch,
    filteredPromotions,
    paginatedPromotions,
    page,
    setPage,
    totalPages,
    resultStart,
    resultEnd,
    deleteTarget,
    setDeleteTarget,
    resetForm,
    startCreate,
    setProductIds,
    setImageStrategy,
    formImagePreviewSrc,
    previewIsLocalFile,
    applyPromotionImageFile,
    clearLocalPromotionImage,
    onFieldChange,
    startEdit,
    openDatePicker,
  } = state;

  return (
    <>
      <PageHeader
        title="Promociones"
        subtitle="Crea campañas con productos específicos de una o varias categorías."
      >
        <Button type="button" onClick={startCreate} disabled={saving}>
          <Plus className="mr-2 size-4" aria-hidden />
          Nueva campaña
        </Button>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-3" aria-busy={initialLoading}>
        <AdminMetricCard
          context="promotions-total"
          label="Total promociones"
          value={initialLoading ? "—" : formatNumberEsMx(stats.total)}
        />
        <AdminMetricCard
          context="promotions-active"
          label="Activas"
          value={initialLoading ? "—" : formatNumberEsMx(stats.activas)}
        />
        <AdminMetricCard
          context="promotions-scheduled"
          label="Programadas"
          value={initialLoading ? "—" : formatNumberEsMx(stats.programadas)}
        />
      </section>

      <Card className="mt-4 w-full min-w-0 max-w-full rounded-xl border-[var(--border-soft)] shadow-sm">
        <CardHeader className="min-w-0 border-b border-[var(--border-soft)] bg-[var(--card)]">
          <PromotionFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            filterCounts={filterCounts}
            search={search}
            onSearchChange={setSearch}
          />
        </CardHeader>

        <PromotionsTable
          loading={initialLoading}
          filteredPromotions={filteredPromotions}
          paginatedPromotions={paginatedPromotions}
          search={search}
          statusFilter={statusFilter}
          saving={saving}
          page={page}
          totalPages={totalPages}
          resultStart={resultStart}
          resultEnd={resultEnd}
          onEdit={startEdit}
          onDelete={setDeleteTarget}
          onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </Card>

      <PromotionFormDialog
        open={formOpen}
        editingId={editingId}
        form={form}
        saving={saving}
        todayStr={todayStr}
        endDateMin={endDateMin}
        sortedProducts={sortedProducts}
        classificationOptions={classificationOptions}
        formImagePreviewSrc={formImagePreviewSrc}
        previewIsLocalFile={previewIsLocalFile}
        startDateRef={startDateRef}
        endDateRef={endDateRef}
        onSubmit={handleSubmit}
        onFieldChange={onFieldChange}
        onProductIdsChange={setProductIds}
        onImageStrategyChange={setImageStrategy}
        onReset={resetForm}
        onOpenDatePicker={openDatePicker}
        onApplyImageFile={applyPromotionImageFile}
        onClearLocalImage={clearLocalPromotionImage}
      />

      <PromotionDeleteDialog
        deleteTarget={deleteTarget}
        saving={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
