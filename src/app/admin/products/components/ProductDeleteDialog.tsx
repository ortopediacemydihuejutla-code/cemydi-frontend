"use client";

import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";

import type { ProductsAdminState } from "../hooks/useProducts";

type ProductDeleteDialogProps = {
  state: Pick<
    ProductsAdminState,
    | "confirmOpen"
    | "productToDelete"
    | "saving"
    | "handleDelete"
    | "cancelDeleteProduct"
  >;
};

export function ProductDeleteDialog({ state }: ProductDeleteDialogProps) {
  const { confirmOpen, productToDelete, saving, handleDelete, cancelDeleteProduct } = state;

  return (
    <ConfirmDialog
      open={confirmOpen}
      title="Eliminar producto"
      description={
        productToDelete
          ? `Se eliminara ${productToDelete.nombre} de forma permanente.`
          : "Esta accion no se puede deshacer."
      }
      tone="danger"
      busy={saving}
      onConfirm={handleDelete}
      onCancel={cancelDeleteProduct}
    />
  );
}
