"use client";

import type { AdminPromotion } from "@/services/admin";

import { ConfirmDialog } from "@/components/feedback";

type PromotionDeleteDialogProps = {
  deleteTarget: AdminPromotion | null;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PromotionDeleteDialog({
  deleteTarget,
  saving,
  onConfirm,
  onCancel,
}: PromotionDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={deleteTarget !== null}
      title="Eliminar promoción"
      description={
        deleteTarget
          ? `Se eliminará la campaña de «${deleteTarget.product.nombre}».`
          : undefined
      }
      tone="danger"
      busy={saving}
      confirmLabel="Eliminar"
      onConfirm={onConfirm}
      onCancel={() => {
        if (saving) return;
        onCancel();
      }}
    />
  );
}
