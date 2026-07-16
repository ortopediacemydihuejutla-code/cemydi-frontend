"use client";

import { formatNumberEsMx } from "@/features/admin/lib/admin-list-utils";
import { AdminMetricCard } from "@/features/admin/components/admin-metric-card";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { PageHeader } from "@/features/admin/components/page-header";
import { Card, CardHeader } from "@/features/admin/components/ui/card";
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
    blockingFullPage,
    stats,
    saving,
    editingId,
    form,
    todayStr,
    endDateMin,
    sortedProducts,
    classificationOptions,
    formImagePreviewSrc,
    previewIsLocalFile,
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
    setMode,
    onFieldChange,
    startEdit,
    openDatePicker,
    applyPromotionImageFile,
    clearLocalPromotionImage,
  } = state;

  if (blockingFullPage) {
    return <AdminPageLoading />;
  }

  return (
    <>
      <PageHeader
        title="Promociones"
        subtitle="Campañas por producto o por categoría. Las fechas deben ser hoy o posteriores."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard
          context="promotions-total"
          label="Total promociones"
          value={formatNumberEsMx(stats.total)}
        />
        <AdminMetricCard
          context="promotions-active"
          label="Activas"
          value={formatNumberEsMx(stats.activas)}
        />
        <AdminMetricCard
          context="promotions-scheduled"
          label="Programadas"
          value={formatNumberEsMx(stats.programadas)}
        />
      </section>

      <Card className="mt-4 w-full min-w-0 max-w-full rounded-xl border-[var(--border-soft)] shadow-sm">
        <CardHeader className="min-w-0 gap-5 border-b border-[var(--border-soft)] bg-[var(--card)]">
          <PromotionFormDialog
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
            onModeChange={setMode}
            onReset={resetForm}
            onOpenDatePicker={openDatePicker}
            onApplyImageFile={applyPromotionImageFile}
            onClearLocalImage={clearLocalPromotionImage}
          />

          <PromotionFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            filterCounts={filterCounts}
            search={search}
            onSearchChange={setSearch}
          />
        </CardHeader>

        <PromotionsTable
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

      <PromotionDeleteDialog
        deleteTarget={deleteTarget}
        saving={saving}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
