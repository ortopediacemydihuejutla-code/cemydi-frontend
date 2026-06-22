"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

import { adminQueryKeys } from "@/features/admin/lib/query-keys";
import type { AdminPromotion } from "@/services/admin";

import {
  createPromotion,
  deletePromotion,
  updatePromotion,
} from "@/services/admin";

import {
  mapFormToCreatePayload,
  mapFormToIsoDates,
} from "../utils/promotion-mappers";
import { validatePromotionForm } from "../utils/promotion-validators";
import type { UsePromotionsReturn } from "./usePromotions";

export function usePromotionMutations(state: UsePromotionsReturn) {
  const queryClient = useQueryClient();

  const updatePromotionsCache = useCallback(
    (updater: (current: AdminPromotion[]) => AdminPromotion[]) => {
      queryClient.setQueryData<AdminPromotion[]>(adminQueryKeys.promotions, (current) =>
        updater(current ?? []),
      );
    },
    [queryClient],
  );

  const {
    form,
    editingId,
    todayStr,
    deleteTarget,
    setDeleteTarget,
    setPage,
    resetForm,
    setSaving,
  } = state;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const err = validatePromotionForm(form, todayStr);
      if (err) {
        toast.error(err);
        return;
      }

      const { productId, startIso, endIso, descripcion } = mapFormToIsoDates(form);

      setSaving(true);
      try {
        if (editingId !== null) {
          const result = await updatePromotion(editingId, {
            productId,
            startAt: startIso,
            endAt: endIso,
            descripcion,
          });
          updatePromotionsCache((prev) =>
            prev.map((p) => (p.id === editingId ? result.promotion : p)),
          );
          toast.success(result.message);
        } else {
          const payload = mapFormToCreatePayload(form, startIso, endIso, descripcion, productId);
          const result = await createPromotion(payload);
          updatePromotionsCache((prev) => [...result.promotions, ...prev]);
          setPage(1);
          toast.success(result.message);
        }
        resetForm();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo guardar la promoción.");
      } finally {
        setSaving(false);
      }
    },
    [form, editingId, todayStr, setPage, resetForm, setSaving, updatePromotionsCache],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deletePromotion(deleteTarget.id);
      updatePromotionsCache((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      if (editingId === deleteTarget.id) resetForm();
      toast.success("Promoción eliminada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo eliminar la promoción.");
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, editingId, resetForm, setSaving, setDeleteTarget, updatePromotionsCache]);

  return { handleSubmit, handleDelete };
}
