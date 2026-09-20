"use client";

import type { AdminPromotion } from "@/services/admin";

import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";

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
          ? `Se eliminará «${deleteTarget.descripcion}» y dejará de aplicarse a ${deleteTarget.productCount} producto${deleteTarget.productCount === 1 ? "" : "s"}.`
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
