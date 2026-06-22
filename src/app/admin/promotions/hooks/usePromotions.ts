"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { adminQueryKeys } from "@/features/admin/lib/query-keys";

import {
  listCatalogs,
  listProducts,
  listPromotions,
  type AdminPromotion,
  type CreatePromotionPayload,
} from "@/services/admin";

import { getPaginationWindow } from "@/features/admin/lib/admin-list-utils";
import { useClampPage, useResetPageOnChange } from "@/features/admin/hooks/use-admin-pagination";
import { sortByName } from "../utils/promotion-formatters";
import { mapPromotionToForm } from "../utils/promotion-mappers";
import {
  defaultPromotionForm,
  localISODate,
  promotionStatus,
  type StatusFilter,
} from "../utils/promotion-validators";

export const PROMOTION_PAGE_SIZE = 9;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function usePromotions() {
  const todayStr = useMemo(() => localISODate(new Date()), []);

  const [saving, setSaving] = useState(false);

  const promotionsQuery = useQuery({
    queryKey: adminQueryKeys.promotions,
    queryFn: async () => {
      const result = await listPromotions();
      return result.promotions;
    },
  });

  const productsQuery = useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: async () => {
      const result = await listProducts();
      return result.products;
    },
  });

  const catalogsQuery = useQuery({
    queryKey: adminQueryKeys.promotionCatalogs,
    queryFn: async () => {
      const result = await listCatalogs();
      return sortByName(result.classifications);
    },
  });

  const promotions = useMemo(() => promotionsQuery.data ?? [], [promotionsQuery.data]);
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const classifications = useMemo(
    () => catalogsQuery.data ?? [],
    [catalogsQuery.data],
  );
  const blockingFullPage =
    promotionsQuery.isLoading || productsQuery.isLoading || catalogsQuery.isLoading;

  const [form, setForm] = useState(defaultPromotionForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminPromotion | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [localImageObjectUrl, setLocalImageObjectUrl] = useState<string | null>(null);
  const [imageDropActive, setImageDropActive] = useState(false);
  const localImageUrlRef = useRef<string | null>(null);

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const replaceLocalImagePreview = useCallback((file: File | null) => {
    if (localImageUrlRef.current) {
      URL.revokeObjectURL(localImageUrlRef.current);
      localImageUrlRef.current = null;
    }
    const next = file ? URL.createObjectURL(file) : null;
    localImageUrlRef.current = next;
    setLocalImageObjectUrl(next);
  }, []);

  useEffect(() => {
    return () => {
      if (localImageUrlRef.current) {
        URL.revokeObjectURL(localImageUrlRef.current);
        localImageUrlRef.current = null;
      }
    };
  }, []);

  const applyPromotionImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Usa un archivo de imagen (JPEG, PNG, WebP…).");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("La imagen no debe superar 8 MB.");
        return;
      }
      replaceLocalImagePreview(file);
    },
    [replaceLocalImagePreview],
  );

  const clearLocalPromotionImage = useCallback(() => {
    setImageDropActive(false);
    replaceLocalImagePreview(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = "";
  }, [replaceLocalImagePreview]);

  useEffect(() => {
    if (promotionsQuery.isError) {
      toast.error("No se pudieron cargar las promociones.");
    }
  }, [promotionsQuery.isError]);

  const classificationOptions = useMemo(() => {
    return Array.from(
      new Set(
        [
          ...classifications.map((c) => c.nombre),
          ...products.map((p) => p.clasificacion),
        ]
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [classifications, products]);

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }),
      ),
    [products],
  );

  const sortedPromotions = useMemo(() => {
    return [...promotions].sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
  }, [promotions]);

  const stats = useMemo(() => {
    let activas = 0;
    let programadas = 0;
    for (const p of promotions) {
      const { label } = promotionStatus(p);
      if (label === "Activa") activas += 1;
      else if (label === "Programada") programadas += 1;
    }
    return {
      total: promotions.length,
      activas,
      programadas,
    };
  }, [promotions]);

  const filterCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      ALL: promotions.length,
      Activa: 0,
      Programada: 0,
      Finalizada: 0,
      "Producto sin disponibilidad": 0,
    };
    for (const p of promotions) {
      counts[promotionStatus(p).label] += 1;
    }
    return counts;
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sortedPromotions.filter((item) => {
      const { label } = promotionStatus(item);
      if (statusFilter !== "ALL" && label !== statusFilter) return false;
      if (!q) return true;
      return (
        item.product.nombre.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        item.product.clasificacion.toLowerCase().includes(q)
      );
    });
  }, [sortedPromotions, search, statusFilter]);

  const { totalPages, resultStart, resultEnd } = getPaginationWindow(
    page,
    PROMOTION_PAGE_SIZE,
    filteredPromotions.length,
  );

  const paginatedPromotions = useMemo(() => {
    const start = (page - 1) * PROMOTION_PAGE_SIZE;
    return filteredPromotions.slice(start, start + PROMOTION_PAGE_SIZE);
  }, [page, filteredPromotions]);

  useClampPage(page, setPage, totalPages);
  useResetPageOnChange(setPage, [search, statusFilter]);

  const endDateMin = useMemo(() => {
    if (!form.startAt || form.startAt < todayStr) return todayStr;
    return form.startAt;
  }, [form.startAt, todayStr]);

  const resetForm = useCallback(() => {
    clearLocalPromotionImage();
    setForm(defaultPromotionForm);
    setEditingId(null);
  }, [clearLocalPromotionImage]);

  const setMode = useCallback(
    (mode: CreatePromotionPayload["mode"]) => {
      if (editingId !== null) return;
      setForm((prev) => ({
        ...prev,
        mode,
        productId: "",
        clasificacion: "",
      }));
    },
    [editingId],
  );

  const onFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setForm((prev) => {
        let next = { ...prev, [name]: value };
        if (name === "startAt") {
          const minEnd = value >= todayStr ? value : todayStr;
          if (next.endAt && next.endAt < minEnd) {
            next = { ...next, endAt: minEnd };
          }
        }
        return next;
      });
    },
    [todayStr],
  );

  const startEdit = useCallback(
    (item: AdminPromotion) => {
      clearLocalPromotionImage();
      setEditingId(item.id);
      setForm(mapPromotionToForm(item, todayStr));
    },
    [clearLocalPromotionImage, todayStr],
  );

  const editingPromotion = useMemo(
    () => (editingId !== null ? promotions.find((p) => p.id === editingId) ?? null : null),
    [editingId, promotions],
  );

  const formImagePreviewSrc = localImageObjectUrl ?? editingPromotion?.imageUrl ?? null;
  const previewIsLocalFile = Boolean(localImageObjectUrl);

  const openDatePicker = useCallback((ref: React.RefObject<HTMLInputElement | null>) => {
    const el = ref.current;
    if (!el || el.disabled) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  }, []);

  return {
    todayStr,
    saving,
    setSaving,
    promotions,
    form,
    editingId,
    page,
    setPage,
    deleteTarget,
    setDeleteTarget,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    imageDropActive,
    setImageDropActive,
    startDateRef,
    endDateRef,
    imageFileInputRef,
    blockingFullPage,
    classificationOptions,
    sortedProducts,
    stats,
    filterCounts,
    filteredPromotions,
    paginatedPromotions,
    totalPages,
    resultStart,
    resultEnd,
    endDateMin,
    resetForm,
    setMode,
    onFieldChange,
    startEdit,
    editingPromotion,
    formImagePreviewSrc,
    previewIsLocalFile,
    applyPromotionImageFile,
    clearLocalPromotionImage,
    openDatePicker,
  };
}

export type UsePromotionsReturn = ReturnType<typeof usePromotions>;
