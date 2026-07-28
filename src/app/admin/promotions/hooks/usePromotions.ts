"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useClampPage, useResetPageOnChange } from "@/features/admin/hooks/use-admin-pagination";
import { getPaginationWindow } from "@/features/admin/lib/admin-list-utils";
import { adminQueryKeys } from "@/features/admin/lib/query-keys";
import {
  listProducts,
  listPromotions,
  type AdminPromotion,
  type PromotionImageStrategy,
} from "@/services/admin";

import { mapPromotionToForm } from "../utils/promotion-mappers";
import {
  defaultPromotionForm,
  localISODate,
  promotionStatus,
  type StatusFilter,
} from "../utils/promotion-validators";

export const PROMOTION_PAGE_SIZE = 9;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function usePromotions() {
  const todayStr = useMemo(() => localISODate(new Date()), []);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const promotionsQuery = useQuery({
    queryKey: adminQueryKeys.promotions,
    queryFn: async () => (await listPromotions()).promotions,
  });
  const productsQuery = useQuery({
    queryKey: adminQueryKeys.products,
    queryFn: async () => (await listProducts()).products,
  });

  const promotions = useMemo(
    () => promotionsQuery.data ?? [],
    [promotionsQuery.data],
  );
  const products = useMemo(
    () => productsQuery.data ?? [],
    [productsQuery.data],
  );
  const initialLoading =
    promotionsQuery.isLoading || productsQuery.isLoading;

  const [form, setForm] = useState(defaultPromotionForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] =
    useState<AdminPromotion | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localImageObjectUrl, setLocalImageObjectUrl] =
    useState<string | null>(null);
  const localImageUrlRef = useRef<string | null>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const replaceLocalImagePreview = useCallback((file: File | null) => {
    if (localImageUrlRef.current) {
      URL.revokeObjectURL(localImageUrlRef.current);
    }
    const nextUrl = file ? URL.createObjectURL(file) : null;
    localImageUrlRef.current = nextUrl;
    setLocalImageObjectUrl(nextUrl);
    setImageFile(file);
  }, []);

  useEffect(
    () => () => {
      if (localImageUrlRef.current) {
        URL.revokeObjectURL(localImageUrlRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (promotionsQuery.isError) {
      toast.error("No se pudieron cargar las promociones.");
    }
  }, [promotionsQuery.isError]);

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", {
          sensitivity: "base",
        }),
      ),
    [products],
  );
  const classificationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.clasificacion.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" }),
      ),
    [products],
  );
  const sortedPromotions = useMemo(
    () =>
      [...promotions].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime(),
      ),
    [promotions],
  );

  const stats = useMemo(() => {
    let activas = 0;
    let programadas = 0;
    for (const promotion of promotions) {
      const { label } = promotionStatus(promotion);
      if (label === "Activa") activas += 1;
      if (label === "Programada") programadas += 1;
    }
    return { total: promotions.length, activas, programadas };
  }, [promotions]);

  const filterCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      ALL: promotions.length,
      Activa: 0,
      Programada: 0,
      Finalizada: 0,
      "Producto sin disponibilidad": 0,
    };
    for (const promotion of promotions) {
      counts[promotionStatus(promotion).label] += 1;
    }
    return counts;
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedPromotions.filter((promotion) => {
      const { label } = promotionStatus(promotion);
      if (statusFilter !== "ALL" && label !== statusFilter) return false;
      if (!query) return true;
      return (
        promotion.descripcion.toLowerCase().includes(query) ||
        promotion.products.some(
          (product) =>
            product.nombre.toLowerCase().includes(query) ||
            product.clasificacion.toLowerCase().includes(query),
        )
      );
    });
  }, [search, sortedPromotions, statusFilter]);

  const { totalPages, resultStart, resultEnd } =
    getPaginationWindow(
      page,
      PROMOTION_PAGE_SIZE,
      filteredPromotions.length,
    );
  const paginatedPromotions = useMemo(() => {
    const start = (page - 1) * PROMOTION_PAGE_SIZE;
    return filteredPromotions.slice(start, start + PROMOTION_PAGE_SIZE);
  }, [filteredPromotions, page]);

  useClampPage(page, setPage, totalPages);
  useResetPageOnChange(setPage, [search, statusFilter]);

  const endDateMin = useMemo(
    () =>
      !form.startAt || form.startAt < todayStr
        ? todayStr
        : form.startAt,
    [form.startAt, todayStr],
  );

  const clearLocalPromotionImage = useCallback(() => {
    replaceLocalImagePreview(null);
  }, [replaceLocalImagePreview]);

  const resetForm = useCallback(() => {
    clearLocalPromotionImage();
    setForm(defaultPromotionForm);
    setEditingId(null);
    setFormOpen(false);
  }, [clearLocalPromotionImage]);

  const startCreate = useCallback(() => {
    clearLocalPromotionImage();
    setEditingId(null);
    setForm({
      ...defaultPromotionForm,
      startAt: todayStr,
      endAt: todayStr,
    });
    setFormOpen(true);
  }, [clearLocalPromotionImage, todayStr]);

  const startEdit = useCallback(
    (item: AdminPromotion) => {
      clearLocalPromotionImage();
      setEditingId(item.id);
      setForm(mapPromotionToForm(item, todayStr));
      setFormOpen(true);
    },
    [clearLocalPromotionImage, todayStr],
  );

  const onFieldChange = useCallback(
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = event.target;
      setForm((previous) => {
        let next = { ...previous, [name]: value };
        if (name === "startAt") {
          const minimumEnd = value >= todayStr ? value : todayStr;
          if (next.endAt && next.endAt < minimumEnd) {
            next = { ...next, endAt: minimumEnd };
          }
        }
        return next;
      });
    },
    [todayStr],
  );

  const setProductIds = useCallback((productIds: number[]) => {
    setForm((previous) => ({ ...previous, productIds }));
  }, []);

  const setImageStrategy = useCallback(
    (imageStrategy: PromotionImageStrategy) => {
      if (imageStrategy === "AUTO") clearLocalPromotionImage();
      setForm((previous) => ({ ...previous, imageStrategy }));
    },
    [clearLocalPromotionImage],
  );

  const applyPromotionImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Selecciona una imagen JPG, PNG o WebP.");
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

  const editingPromotion = useMemo(
    () =>
      editingId !== null
        ? promotions.find((promotion) => promotion.id === editingId) ??
          null
        : null,
    [editingId, promotions],
  );
  const firstSelectedProduct = useMemo(
    () =>
      products.find((product) => form.productIds.includes(product.id)) ??
      null,
    [form.productIds, products],
  );
  const formImagePreviewSrc =
    form.imageStrategy === "CUSTOM"
      ? localImageObjectUrl ?? editingPromotion?.imageUrl ?? null
      : firstSelectedProduct?.imageUrl ?? null;

  const openDatePicker = useCallback(
    (ref: React.RefObject<HTMLInputElement | null>) => {
      const element = ref.current;
      if (!element || element.disabled) return;
      if (typeof element.showPicker === "function") {
        element.showPicker();
      } else {
        element.focus();
        element.click();
      }
    },
    [],
  );

  return {
    todayStr,
    saving,
    setSaving,
    formOpen,
    setFormOpen,
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
    startDateRef,
    endDateRef,
    initialLoading,
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
    startCreate,
    onFieldChange,
    setProductIds,
    setImageStrategy,
    startEdit,
    formImagePreviewSrc,
    previewIsLocalFile: Boolean(localImageObjectUrl),
    imageFile,
    applyPromotionImageFile,
    clearLocalPromotionImage,
    openDatePicker,
  };
}

export type UsePromotionsReturn = ReturnType<typeof usePromotions>;
