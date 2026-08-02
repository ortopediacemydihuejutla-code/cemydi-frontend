"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BadgeAlert,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Layers3,
  ListChecks,
  MessageSquareText,
  PenLine,
  Ruler,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Weight,
  X,
} from "lucide-react";
import { FavoriteButton } from "@/components/account/FavoriteButton";
import ProductShareMenu from "@/components/product/ProductShareMenu";
import { PromotionBadge } from "@/components/product/PromotionBadge";
import {
  getCatalogProducts,
  type ActivePromotion,
  type CatalogProduct,
} from "@/services/catalog";
import { isOptimizableImageUrl } from "@/lib/cloudinary-image";
import {
  MyProductReview,
  ProductReview,
  ProductReviewSummary,
  createProductReview,
  getApprovedProductReviews,
  getMyProductReview,
} from "@/services/reviews";
import { useAuth } from "@/providers/AuthContext";
import { useCart } from "@/providers/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ProductCard } from "@/app/catalogo/components/ProductGrid";
import DemoRecommendations from "@/components/recommendations/DemoRecommendations";

import { formatCurrencyMx } from "@/lib/formatters";
import {
  calculateDiscountedPrice,
  getSavingsAmount,
} from "@/lib/promotion-pricing";
import { getClientSiteUrl } from "@/lib/site-config";
import { buildProductShareData } from "@/lib/product-share";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/features/admin/components/ui/breadcrumb";

function formatMoney(value: number) {
  return formatCurrencyMx(value, { fractionDigits: 0 });
}

function formatRentalMoney(value: number) {
  return formatCurrencyMx(value, { fractionDigits: 2 });
}

function formatOfferEnd(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function getProductMonogram(nombre: string) {
  const clean = nombre.trim().toUpperCase();
  if (!clean) return "PR";
  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2);
  }

  return `${parts[0][0]}${parts[1][0]}`;
}

function getDisponibilidad(
  tipo: CatalogProduct["tipoAdquisicion"],
  stock: number,
) {
  if (stock <= 0) return "No disponible por falta de stock";
  if (tipo === "VENTA") return "Disponible para compra";
  if (tipo === "RENTA") return "Disponible para renta";
  return "Disponible para compra y renta";
}

function getTipoLabel(tipo: CatalogProduct["tipoAdquisicion"]) {
  if (tipo === "VENTA") return "Venta";
  if (tipo === "RENTA") return "Renta";
  return "Ambos";
}

function renderStars(value: number) {
  const safeValue = Math.max(0, Math.min(5, value));
  return `${"\u2605".repeat(safeValue)}${"\u2606".repeat(5 - safeValue)}`;
}

const REVIEWS_PER_PAGE = 4;
const REVIEW_MIN_LENGTH = 5;
const REVIEW_MAX_LENGTH = 500;

function getReviewerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "CL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

type GalleryImage = {
  key: string;
  url: string | null;
  alt: string;
};

function buildGalleryImages(product: CatalogProduct): GalleryImage[] {
  const entries = new Map<string, GalleryImage>();

  for (const image of [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const url = image.imageUrl?.trim();
    if (!url || entries.has(url)) continue;

    entries.set(url, {
      key: String(image.id),
      url,
      alt: `${product.nombre} imagen ${entries.size + 1}`,
    });
  }

  const fallbackImageUrl = product.imageUrl?.trim();
  if (fallbackImageUrl && !entries.has(fallbackImageUrl)) {
    entries.set(fallbackImageUrl, {
      key: "primary",
      url: fallbackImageUrl,
      alt: product.nombre,
    });
  }

  if (entries.size === 0) {
    return [
      {
        key: "fallback",
        url: null,
        alt: product.nombre,
      },
    ];
  }

  return Array.from(entries.values());
}

type ProductDetailClientProps = {
  product: CatalogProduct;
  productId: number;
  promotion?: ActivePromotion | null;
};

export default function ProductDetailClient({
  product,
  productId,
  promotion = null,
}: ProductDetailClientProps) {
  const primaryButtonClassName =
    "cursor-pointer rounded-[14px] bg-[#1f6a67] px-[18px] py-[13px] text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-[#d6dde0] disabled:text-[#6e8088]";
  const secondaryButtonClassName =
    "cursor-pointer rounded-[14px] border-2 border-[#1f6a67] bg-white px-[18px] py-[13px] text-base font-bold text-[#1f6a67] disabled:cursor-not-allowed disabled:border-0 disabled:bg-[#d6dde0] disabled:text-[#6e8088]";
  const router = useRouter();
  const relatedTrackRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const { addItem } = useCart();
  const [notifyRequested, setNotifyRequested] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [rentalQuantity, setRentalQuantity] = useState(1);
  const [acquisitionMode, setAcquisitionMode] = useState<"VENTA" | "RENTA">(
    product.tipoAdquisicion === "RENTA" ? "RENTA" : "VENTA",
  );
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingRental, setAddingRental] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [canScrollRelatedPrev, setCanScrollRelatedPrev] = useState(false);
  const [canScrollRelatedNext, setCanScrollRelatedNext] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<ProductReviewSummary>({
    count: 0,
    averageRating: 0,
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(REVIEWS_PER_PAGE);
  const [selectedReviewRating, setSelectedReviewRating] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImageZoomModal, setShowImageZoomModal] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [myReview, setMyReview] = useState<MyProductReview | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  });
  const galleryImages = useMemo(() => buildGalleryImages(product), [product]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    galleryImages[0]?.url ?? null,
  );

  useEffect(() => {
    setSelectedImageUrl((current) => {
      if (current && galleryImages.some((image) => image.url === current)) {
        return current;
      }

      return galleryImages[0]?.url ?? null;
    });
  }, [galleryImages]);

  const selectedImageIndex = useMemo(() => {
    if (!selectedImageUrl) return -1;
    return galleryImages.findIndex((image) => image.url === selectedImageUrl);
  }, [galleryImages, selectedImageUrl]);

  const showGalleryArrows = galleryImages.length > 1;

  const moveGallery = (direction: -1 | 1) => {
    if (galleryImages.length <= 1) return;

    const currentIndex = selectedImageIndex >= 0 ? selectedImageIndex : 0;
    const nextIndex =
      (currentIndex + direction + galleryImages.length) % galleryImages.length;
    setZoomPosition(null);
    setSelectedImageUrl(galleryImages[nextIndex]?.url ?? null);
  };

  const loadReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const result = await getApprovedProductReviews(productId);
      setReviews(result.reviews);
      setReviewsSummary(result.summary);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las reseñas del producto.";
      toast.error(message);
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    let cancelled = false;

    const loadRelatedProducts = async () => {
      try {
        setRelatedLoading(true);
        const result = await getCatalogProducts({
          clasificaciones: [product.clasificacion],
          page: 1,
          pageSize: 8,
        });

        if (cancelled) return;

        setRelatedProducts(
          result.products.filter((item) => item.id !== productId).slice(0, 8),
        );
      } catch {
        if (!cancelled) {
          setRelatedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setRelatedLoading(false);
        }
      }
    };

    void loadRelatedProducts();

    return () => {
      cancelled = true;
    };
  }, [product.clasificacion, productId]);

  const updateRelatedArrows = useCallback(() => {
    const node = relatedTrackRef.current;
    if (!node) {
      setCanScrollRelatedPrev(false);
      setCanScrollRelatedNext(false);
      return;
    }

    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    setCanScrollRelatedPrev(node.scrollLeft > 8);
    setCanScrollRelatedNext(maxScrollLeft - node.scrollLeft > 8);
  }, []);

  useEffect(() => {
    updateRelatedArrows();
    const node = relatedTrackRef.current;
    if (!node) return;

    const handleScroll = () => updateRelatedArrows();
    node.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateRelatedArrows);

    return () => {
      node.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateRelatedArrows);
    };
  }, [relatedProducts, updateRelatedArrows]);

  const scrollRelated = (direction: -1 | 1) => {
    const node = relatedTrackRef.current;
    if (!node) return;

    const card = node.querySelector<HTMLElement>("[data-related-card='true']");
    const scrollAmount = card ? card.offsetWidth + 20 : Math.max(node.clientWidth * 0.8, 280);
    node.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  const loadMyReview = useCallback(async () => {
    if (!user) {
      setMyReview(null);
      return;
    }

    try {
      const result = await getMyProductReview(productId);
      setMyReview(result.review);
    } catch {
      setMyReview(null);
    }
  }, [productId, user]);

  useEffect(() => {
    void loadMyReview();
  }, [loadMyReview]);

  const disponibilidad = useMemo(() => {
    return getDisponibilidad(product.tipoAdquisicion, product.stock);
  }, [product]);
  const isOutOfStock = product.stock <= 0;
  const selectedGalleryImage =
    galleryImages.find((image) => image.url === selectedImageUrl) ?? galleryImages[0] ?? null;
  const orthopedicDetails = [
    { label: "Medidas", value: product.medidas, icon: Ruler },
    { label: "Peso soportado", value: product.pesoSoportado, icon: Weight },
    { label: "Material", value: product.material, icon: Layers3 },
    { label: "Contenido", value: product.contenidoCaja, icon: ClipboardList },
    { label: "Indicaciones", value: product.indicacionesUso, icon: ListChecks },
  ].filter((item) => item.value?.trim());

  const showBuyAction =
    product.tipoAdquisicion === "VENTA" ||
    (product.tipoAdquisicion === "MIXTO" && acquisitionMode === "VENTA");
  const showRentAction =
    product.tipoAdquisicion === "RENTA" ||
    (product.tipoAdquisicion === "MIXTO" && acquisitionMode === "RENTA");
  const maxCartQuantity = Math.max(1, Math.min(product.stock, 25));
  const rentalMinDays = Math.max(1, product.rentalMinDays ?? 1);
  const rentalDailyPrice = product.rentalDailyPrice ?? 0;
  const activeBasePrice = showBuyAction ? product.precio : rentalDailyPrice;
  const hasApplicablePromotion = Boolean(promotion && activeBasePrice > 0);
  const activePrice =
    promotion && hasApplicablePromotion
      ? calculateDiscountedPrice(activeBasePrice, promotion.discountPercent)
      : activeBasePrice;
  const activeSavings = getSavingsAmount(activeBasePrice, activePrice);
  const formatActivePrice = showRentAction ? formatRentalMoney : formatMoney;
  const promotionEndLabel = promotion
    ? formatOfferEnd(promotion.endAt)
    : null;
  const productShareData = useMemo(
    () => buildProductShareData(product, getClientSiteUrl()),
    [product],
  );
  const myApprovedReview = useMemo(() => {
    if (!user?.id) return null;

    const currentUserId = Number(user.id);
    if (!Number.isInteger(currentUserId)) return null;

    return reviews.find((item) => item.user.id === currentUserId) ?? null;
  }, [reviews, user?.id]);
  const existingReview = myReview ?? myApprovedReview;
  const canEditReview = Boolean(existingReview);
  const ratingBreakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => {
        const count = reviews.filter((item) => item.rating === rating).length;

        return {
          rating,
          count,
          percentage:
            reviewsSummary.count > 0
              ? Math.round((count / reviewsSummary.count) * 100)
              : 0,
        };
      }),
    [reviews, reviewsSummary.count],
  );
  const filteredReviews = useMemo(
    () =>
      selectedReviewRating === null
        ? reviews
        : reviews.filter((item) => item.rating === selectedReviewRating),
    [reviews, selectedReviewRating],
  );
  const visibleReviews = filteredReviews.slice(0, visibleReviewsCount);
  const remainingReviewsCount = Math.max(
    0,
    filteredReviews.length - visibleReviewsCount,
  );
  const trimmedReviewComment = reviewForm.comment.trim();
  const isReviewRatingValid = reviewForm.rating >= 1 && reviewForm.rating <= 5;
  const isReviewCommentValid =
    trimmedReviewComment.length >= REVIEW_MIN_LENGTH &&
    trimmedReviewComment.length <= REVIEW_MAX_LENGTH;
  const canSubmitReview =
    !savingReview && isReviewRatingValid && isReviewCommentValid;

  useEffect(() => {
    setVisibleReviewsCount(REVIEWS_PER_PAGE);
  }, [productId, selectedReviewRating]);

  useEffect(() => {
    setCartQuantity((current) => Math.max(1, Math.min(current, maxCartQuantity)));
    setRentalQuantity((current) => Math.max(1, Math.min(current, maxCartQuantity)));
  }, [maxCartQuantity]);

  const onOpenReviewModal = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para comentar y calificar este producto.");
      return;
    }

    if (existingReview) {
      setReviewForm({
        rating: existingReview.rating,
        comment: existingReview.comment,
      });
    } else {
      setReviewForm({ rating: 0, comment: "" });
    }

    setShowReviewModal(true);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para enviar una reseña.");
      return;
    }

    const comment = reviewForm.comment.trim();
    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }

    if (
      comment.length < REVIEW_MIN_LENGTH ||
      comment.length > REVIEW_MAX_LENGTH
    ) {
      toast.error(
        `El comentario debe tener entre ${REVIEW_MIN_LENGTH} y ${REVIEW_MAX_LENGTH} caracteres.`,
      );
      return;
    }

    try {
      setSavingReview(true);
      const result = await createProductReview({
        productId,
        rating: reviewForm.rating,
        comment,
      });
      toast.success(result.message);
      setMyReview(result.review);
      setShowReviewModal(false);
      setReviewForm({ rating: 0, comment: "" });
      await loadReviews();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo enviar la reseña.";
      toast.error(message);
    } finally {
      setSavingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para agregar productos al carrito.");
      router.push("/login");
      return;
    }

    if (user.rol !== "CLIENT") {
      toast.error("Solo las cuentas de cliente pueden usar el carrito.");
      return;
    }

    try {
      setAddingToCart(true);
      const result = await addItem({
        productId,
        quantity: cartQuantity,
      });
      toast.success(result.message);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo agregar el producto al carrito.";
      toast.error(message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddRentalToCart = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para solicitar una renta.");
      router.push("/login");
      return;
    }

    if (user.rol !== "CLIENT") {
      toast.error("Solo las cuentas de cliente pueden solicitar rentas.");
      return;
    }

    try {
      setAddingRental(true);
      const result = await addItem({
        productId,
        quantity: rentalQuantity,
        mode: "RENTA",
      });
      toast.custom((visibleToast) => (
        <div
          className={`${visibleToast.visible ? "animate-enter" : "animate-leave"} flex items-center gap-4 rounded-xl border border-[#cfe0e3] bg-white px-4 py-3 shadow-lg`}
        >
          <span className="text-sm font-semibold text-[#17333f]">{result.message}</span>
          <Link
            href="/carrito"
            className="shrink-0 text-sm font-bold text-[#1f6a67] no-underline hover:underline"
          >
            Ver carrito
          </Link>
        </div>
      ));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo agregar la renta al carrito.";
      toast.error(message);
    } finally {
      setAddingRental(false);
    }
  };

  const handleGalleryZoomMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedGalleryImage?.url) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <section className="mx-auto max-w-[1440px] px-4 pb-11 pt-6 lg:px-6">
      <div className="mb-5 border-b border-[#e3ebee] pb-4">
        <Breadcrumb>
          <BreadcrumbList className="gap-y-2 text-[0.92rem]">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="font-medium text-[#5e707a] hover:text-[#1f6a67]">
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#93a4ac]" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="font-medium text-[#5e707a] hover:text-[#1f6a67]">
                <Link href="/catalogo">Catálogo</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-[#93a4ac]" />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(70vw,620px)] truncate font-semibold text-[#142734]">
                {product.nombre}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.9fr)_360px]">
        <section className="grid gap-4 xl:sticky xl:top-24 xl:self-start">
          <div
            className={`grid gap-4 lg:items-start ${
              galleryImages.length > 1 ? "lg:grid-cols-[76px_minmax(0,1fr)]" : ""
            }`}
          >
            {galleryImages.length > 1 ? (
              <div className="order-2 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:order-1 lg:max-h-[560px] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 [&::-webkit-scrollbar]:hidden">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.key}
                    type="button"
                    className={`relative aspect-square size-[64px] shrink-0 overflow-hidden rounded-[8px] border bg-white transition sm:size-[72px] ${
                      selectedImageUrl === image.url
                        ? "border-[#1f6a67] shadow-[0_0_0_2px_rgba(31,106,103,0.18)]"
                        : "border-[#d7e3e6] hover:border-[#97b5b7]"
                    }`}
                    onClick={() => {
                      setZoomPosition(null);
                      setSelectedImageUrl(image.url);
                    }}
                    aria-label={`Ver imagen ${index + 1} de ${galleryImages.length}`}
                    aria-pressed={selectedImageUrl === image.url}
                  >
                    {isOptimizableImageUrl(image.url) ? (
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="72px"
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-sm font-semibold text-[#1f6a67]">
                        {index + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="order-1 grid gap-3 lg:order-2">
              <div className="relative overflow-hidden">
                {showGalleryArrows ? (
                  <>
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-[rgba(255,255,255,0.96)] text-[#1f6a67] shadow-[0_10px_18px_rgba(31,106,103,0.12)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        moveGallery(-1);
                      }}
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-[rgba(255,255,255,0.96)] text-[#1f6a67] shadow-[0_10px_18px_rgba(31,106,103,0.12)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        moveGallery(1);
                      }}
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                ) : null}

                <div
                  className="group relative min-h-[360px] w-full cursor-zoom-in overflow-hidden bg-white sm:min-h-[460px] lg:min-h-[560px]"
                  role="button"
                  tabIndex={0}
                  aria-label="Ampliar imagen del producto"
                  onMouseMove={handleGalleryZoomMove}
                  onMouseLeave={() => setZoomPosition(null)}
                  onClick={() => {
                    if (selectedGalleryImage?.url) {
                      setShowImageZoomModal(true);
                    }
                  }}
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === " ") && selectedGalleryImage?.url) {
                      event.preventDefault();
                      setShowImageZoomModal(true);
                    }
                  }}
                >
                  {product.requiereReceta ? (
                    <span className="absolute left-4 top-4 z-[3] inline-flex items-center gap-1 rounded-full bg-[#1c2a3f] px-3 py-1.5 text-[0.74rem] font-bold text-white">
                      <BadgeAlert className="size-3.5" />
                      Requiere receta
                    </span>
                  ) : null}
                  <div className="absolute inset-0 mx-auto w-full max-w-[760px]">
                    {isOptimizableImageUrl(selectedGalleryImage?.url) ? (
                      <Image
                        src={selectedGalleryImage.url}
                        alt={selectedGalleryImage.alt}
                        fill
                        priority
                        loading="eager"
                        sizes="(max-width: 1024px) 100vw, 52vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center p-8 text-[4rem] font-extrabold text-[#1f6a67] sm:text-[5.5rem]">
                      {getProductMonogram(product.nombre)}
                    </div>
                  )}
                  </div>
                  {zoomPosition && isOptimizableImageUrl(selectedGalleryImage?.url) ? (
                    <div
                      className="pointer-events-none absolute z-[4] hidden size-[190px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-[#d7e3e6] bg-white shadow-[0_18px_42px_rgba(15,61,59,0.18)] xl:block"
                      style={{
                        left: `${zoomPosition.x}%`,
                        top: `${zoomPosition.y}%`,
                      }}
                      aria-hidden
                    >
                      <div
                        className="h-full w-full bg-no-repeat"
                        style={{
                          backgroundImage: `url(${selectedGalleryImage.url})`,
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          backgroundSize: "260%",
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <ProductShareMenu
                  shareData={productShareData}
                  productName={product.nombre}
                  className="absolute right-4 top-4 sm:right-5 sm:top-5"
                  menuClassName="bottom-auto right-0 top-[calc(100%+10px)]"
                  triggerClassName="!bg-transparent !text-[#344850] shadow-none ring-0 hover:!bg-transparent hover:!text-[#0f6a67]"
                />
                <FavoriteButton
                  product={product}
                  className="absolute right-[4.5rem] top-4 z-[5] !border-transparent !bg-white/90 !shadow-none backdrop-blur-sm sm:right-20 sm:top-5"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#5b6f79]">
                <span>
                  {galleryImages.length > 1
                    ? `${selectedImageIndex >= 0 ? selectedImageIndex + 1 : 1} de ${galleryImages.length} imágenes`
                    : "Imagen del producto"}
                </span>
                <span className="truncate">Modelo: {product.modelo}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid content-start gap-5">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eaf4f3] px-3 py-1 text-xs font-semibold text-[#1f6a67]">
                {product.clasificacion}
              </span>
              <span className="rounded-full bg-[#eef3f4] px-3 py-1 text-xs font-semibold text-[#60727a]">
                {getTipoLabel(product.tipoAdquisicion)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isOutOfStock
                    ? "bg-[#fff0f0] text-[#b42318]"
                    : "bg-[#edf9f0] text-[#157347]"
                }`}
              >
                {isOutOfStock ? "Sin stock" : "Disponible"}
              </span>
            </div>

            <div>
              <h1 className="text-[2rem] leading-tight font-semibold text-[#111f36] sm:text-[2.35rem]">
                {product.nombre}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#536774]">
                <span>Marca: <strong className="text-[#1b3141]">{product.marca}</strong></span>
                <span className="hidden text-[#b6c3c8] sm:inline">|</span>
                <span>Proveedor: <strong className="text-[#1b3141]">{product.proveedor}</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#536774]">
              <span>{reviewsSummary.count > 0 ? `${reviewsSummary.averageRating.toFixed(1)} de 5` : "Sin reseñas aún"}</span>
              <span className="hidden text-[#b6c3c8] sm:inline">|</span>
              <span>{reviewsSummary.count} reseñas</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e2eaec] bg-[#f8fbfb] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 text-[#1f6a67]" />
                <div>
                  <p className="text-sm font-semibold text-[#172f3e]">Garantía CEMYDI</p>
                  <p className="mt-1 text-sm leading-6 text-[#5a707a]">Cobertura estándar de 3 meses sobre defectos de fabricación.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#e2eaec] bg-[#f8fbfb] p-4">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 size-5 text-[#1f6a67]" />
                <div>
                  <p className="text-sm font-semibold text-[#172f3e]">Disponibilidad</p>
                  <p className={`mt-1 text-sm leading-6 ${isOutOfStock ? "text-[#b42318]" : "text-[#157347]"}`}>
                    {disponibilidad}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-y border-[#e3ebee] py-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#80929b]">Modelo</p>
              <p className="mt-1 text-[0.98rem] font-medium text-[#1b3141]">{product.modelo}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#80929b]">Tipo de adquisición</p>
              <p className="mt-1 text-[0.98rem] font-medium text-[#1b3141]">{getTipoLabel(product.tipoAdquisicion)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#80929b]">Clasificación</p>
              <p className="mt-1 text-[0.98rem] font-medium text-[#1b3141]">{product.clasificacion}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#80929b]">Proveedor</p>
              <p className="mt-1 text-[0.98rem] font-medium text-[#1b3141]">{product.proveedor}</p>
            </div>
          </div>

          {product.requiereReceta ? (
            <details className="rounded-2xl border border-[#dce5e8] bg-[#f8fbfc] px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#203744]">
                Qué necesito para este producto
              </summary>
              <p className="mt-2.5 text-sm leading-6 text-[#4a606b]">
                Debes presentar receta médica vigente y una identificación oficial.
                El equipo de CEMYDI valida el documento antes de confirmar la compra
                o la renta.
              </p>
            </details>
          ) : null}
        </section>

        <aside className="grid content-start gap-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-[#dbe4e6] bg-white p-5 shadow-[0_18px_38px_rgba(15,61,59,0.08)]">
            <div className="grid gap-2">
              <div
                className={`rounded-xl border p-3.5 ${
                  hasApplicablePromotion
                    ? "border-[#f0d2cf] bg-[#fff8f7]"
                    : "border-[#e1e9eb] bg-[#f8fbfb]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#667b84]">
                    {hasApplicablePromotion
                      ? showRentAction
                        ? "Tarifa especial por día"
                        : "Precio especial"
                      : showRentAction
                        ? "Tarifa por día"
                        : "Precio de venta"}
                  </span>
                  {hasApplicablePromotion && promotion ? (
                    <PromotionBadge
                      percent={promotion.discountPercent}
                      compact
                    />
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <strong
                    className={`text-[2rem] leading-none ${
                      hasApplicablePromotion
                        ? "text-[#b42318]"
                        : "text-[#1d6a67]"
                    }`}
                  >
                    {formatActivePrice(activePrice)}
                  </strong>
                  <span className="pb-0.5 text-sm font-semibold text-[#6a7e87]">
                    {showRentAction ? "MXN / día" : "MXN"}
                  </span>
                </div>

                {hasApplicablePromotion && promotion ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="text-[#809097]">
                      Antes{" "}
                      <span className="line-through">
                        {formatActivePrice(activeBasePrice)}
                      </span>
                    </span>
                    <span className="font-semibold text-[#157347]">
                      Ahorras {formatActivePrice(activeSavings)}
                      {showRentAction ? " por día" : ""}
                    </span>
                    {promotionEndLabel ? (
                      <span className="text-xs font-semibold text-[#8f2922]">
                        · Hasta {promotionEndLabel}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p className={`text-sm font-medium ${isOutOfStock ? "text-[#b42318]" : "text-[#157347]"}`}>
                {disponibilidad}
              </p>
              <p className="text-sm leading-6 text-[#5a707a]">
                {showBuyAction && showRentAction
                  ? "Compra o renta según la necesidad del paciente."
                  : showBuyAction
                    ? "Compra disponible para entrega o recolección."
                    : "Renta disponible sujeta a validación operativa."}
              </p>
            </div>

            {product.tipoAdquisicion === "MIXTO" ? (
              <div
                className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-[#eef4f4] p-1"
                aria-label="Seleccionar compra o renta"
              >
                {(["VENTA", "RENTA"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAcquisitionMode(mode)}
                    className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                      acquisitionMode === mode
                        ? "bg-white text-[#1f6a67] shadow-sm"
                        : "text-[#5a707a] hover:text-[#17333f]"
                    }`}
                  >
                    {mode === "VENTA" ? "Comprar" : "Rentar"}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-5 grid gap-2.5">
              {showBuyAction ? (
                <>
                  <label className="grid gap-2 text-sm font-semibold text-[#36515e]">
                    Cantidad
                    <input
                      type="number"
                      min={1}
                      max={maxCartQuantity}
                      value={cartQuantity}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        if (!Number.isFinite(nextValue)) {
                          setCartQuantity(1);
                          return;
                        }

                        setCartQuantity(
                          Math.max(1, Math.min(Math.trunc(nextValue), maxCartQuantity)),
                        );
                      }}
                      disabled={isOutOfStock || addingToCart}
                      className="h-11 rounded-[14px] border border-[#d4dfe2] px-4 text-[#193844] outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    className={primaryButtonClassName}
                    disabled={isOutOfStock || addingToCart}
                    onClick={() => void handleAddToCart()}
                  >
                    {addingToCart ? "Agregando..." : "Añadir al carrito"}
                  </button>
                </>
              ) : null}
              {showRentAction ? (
                <div className="grid gap-3 border-t border-[#e8eef0] pt-4">
                  <div className="grid gap-1">
                    <strong className="text-[#17333f]">
                      Condiciones de renta
                    </strong>
                    <span className="text-sm text-[#5a707a]">
                      Mínimo {rentalMinDays} día{rentalMinDays === 1 ? "" : "s"}
                      {(product.rentalDeposit ?? 0) > 0
                        ? ` · Depósito ${formatMoney(product.rentalDeposit ?? 0)}`
                        : ""}
                    </span>
                  </div>
                  <label className="grid gap-2 text-sm font-semibold text-[#36515e]">
                    Cantidad para renta
                    <input
                      type="number"
                      min={1}
                      max={maxCartQuantity}
                      value={rentalQuantity}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        setRentalQuantity(
                          Number.isFinite(nextValue)
                            ? Math.max(1, Math.min(Math.trunc(nextValue), maxCartQuantity))
                            : 1,
                        );
                      }}
                      disabled={isOutOfStock || addingRental}
                      className="h-11 rounded-[14px] border border-[#d4dfe2] px-4 text-[#193844] outline-none"
                    />
                  </label>
                  {product.rentalTerms ? (
                    <p className="text-sm leading-6 text-[#5a707a]">{product.rentalTerms}</p>
                  ) : null}
                  {product.requiereReceta ? (
                    <p className="border-l-2 border-[#1f6a67] pl-3 text-sm leading-6 text-[#36515e]">
                      Requiere receta médica. Podrás adjuntarla al configurar este producto
                      en el carrito.
                    </p>
                  ) : null}
                  <p className="text-sm leading-6 text-[#5a707a]">
                    Agrega la renta ahora y define fechas, notas y receta desde el carrito.
                  </p>
                  {rentalDailyPrice <= 0 ? (
                    <p className="rounded-xl border border-[#f4d8a8] bg-[#fff7e8] px-4 py-3 text-sm text-[#845b12]">
                      Este producto aún no tiene tarifa de renta configurada.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className={secondaryButtonClassName}
                    disabled={isOutOfStock || addingRental || rentalDailyPrice <= 0}
                    onClick={() => void handleAddRentalToCart()}
                  >
                    {addingRental ? "Agregando..." : "Agregar renta al carrito"}
                  </button>
                </div>
              ) : null}
              {isOutOfStock ? (
                <button
                  type="button"
                  className="cursor-pointer rounded-[14px] border border-[#1f6a67] bg-white px-[18px] py-3 text-[0.96rem] font-bold text-[#1f6a67] disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => {
                    setNotifyRequested(true);
                    toast.success("Te notificaremos cuando el producto vuelva a tener stock.");
                  }}
                  disabled={notifyRequested}
                >
                  {notifyRequested
                    ? "Te notificaremos cuando haya stock"
                    : "Notificarme cuando esté disponible"}
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 border-t border-[#e8eef0] pt-4">
              <div className="flex items-start gap-3 text-sm text-[#455b67]">
                <Store className="mt-0.5 size-4 shrink-0 text-[#1f6a67]" />
                <span>Atención y seguimiento desde CEMYDI.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#455b67]">
                <Truck className="mt-0.5 size-4 shrink-0 text-[#1f6a67]" />
                <span>Coordinamos entrega o disponibilidad según existencias.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#455b67]">
                <Check className="mt-0.5 size-4 shrink-0 text-[#1f6a67]" />
                <span>Validación operativa previa para productos con requisitos especiales.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-9 border-t border-[#e3ebee] py-8 xl:mr-[388px]">
        <div className="grid gap-8">
          <h2 className="text-[1.65rem] font-semibold text-[#142734]">
            Descripción
          </h2>
          <p className="max-w-[1040px] whitespace-pre-line text-[1.04rem] leading-9 text-[#2d4d5b]">
            {product.descripcion}
          </p>
        </div>

        {orthopedicDetails.length > 0 ? (
          <div className="mt-9 grid max-w-[1040px] gap-4 border-t border-[#e6eef1] pt-7">
            <h2 className="text-[1.4rem] font-semibold text-[#142734]">
              Ficha ortopédica
            </h2>
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {orthopedicDetails.map(({ label, value, icon: Icon }) => (
                <div key={label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <Icon className="mt-1 size-5 text-[#1f6a67]" aria-hidden />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[#80929b]">
                      {label}
                    </dt>
                    <dd className="mt-1 whitespace-pre-line text-[0.98rem] leading-6 text-[#1b3141]">
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>

      <section
        id="resenas"
        aria-labelledby="reviews-heading"
        className="mt-8 border-y border-[#dce6e8] py-8"
      >
        <div className="border-b border-[#e2ebed] pb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-bold uppercase tracking-[0.09em] text-[#1f6a67]">
                Experiencias reales
              </p>
              <h2
                id="reviews-heading"
                className="m-0 text-[1.55rem] font-semibold text-[#152a37] sm:text-[1.75rem]"
              >
                Opiniones de clientes
              </h2>
              <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#58707a]">
                Consulta lo que otros clientes comparten sobre este producto.
                Todas las opiniones publicadas pasan por moderación.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] bg-[#1f6a67] px-5 py-3 font-bold text-white shadow-[0_8px_20px_rgba(31,106,103,0.2)] transition hover:bg-[#185b59] sm:w-auto"
              onClick={onOpenReviewModal}
            >
              <PenLine className="size-4" aria-hidden />
              {canEditReview ? "Editar mi opinión" : "Escribir una opinión"}
            </button>
          </div>
        </div>

        <div className="grid gap-7 pt-7 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-8">
          <aside className="border-b border-[#e2ebed] pb-7 lg:border-r lg:border-b-0 lg:pr-8 lg:pb-0">
            <div className="flex items-center gap-4">
              <strong className="text-[3.25rem] leading-none font-semibold tracking-[-0.05em] text-[#142b38]">
                {reviewsSummary.averageRating > 0
                  ? reviewsSummary.averageRating.toFixed(1)
                  : "0.0"}
              </strong>
              <div>
                <div
                  className="flex gap-0.5 text-[#e1a326]"
                  aria-label={`${reviewsSummary.averageRating.toFixed(1)} de 5 estrellas`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-[18px] ${
                        star <= Math.round(reviewsSummary.averageRating)
                          ? "fill-current"
                          : "fill-transparent text-[#c9d3d6]"
                      }`}
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-[#5d747e]">
                  {reviewsSummary.count}{" "}
                  {reviewsSummary.count === 1 ? "calificación" : "calificaciones"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-2" aria-label="Distribución de calificaciones">
              {ratingBreakdown.map(({ rating, count, percentage }) => {
                const isSelected = selectedReviewRating === rating;

                return (
                  <button
                    key={rating}
                    type="button"
                    className={`grid min-h-9 w-full cursor-pointer grid-cols-[30px_minmax(0,1fr)_38px] items-center gap-2 rounded-lg px-1.5 text-left text-xs font-semibold transition ${
                      isSelected
                        ? "bg-[#e7f2f1] text-[#155b58]"
                        : "text-[#506872] hover:bg-[#f0f6f6]"
                    } disabled:cursor-default disabled:opacity-55`}
                    onClick={() =>
                      setSelectedReviewRating((current) =>
                        current === rating ? null : rating,
                      )
                    }
                    disabled={count === 0}
                    aria-pressed={isSelected}
                    aria-label={`${rating} ${rating === 1 ? "estrella" : "estrellas"}: ${count} reseñas, ${percentage}%`}
                  >
                    <span>{rating} ★</span>
                    <span className="h-2 overflow-hidden rounded-full bg-[#e2e9eb]">
                      <span
                        className="block h-full rounded-full bg-[#e3a329] transition-[width]"
                        style={{ width: `${percentage}%` }}
                      />
                    </span>
                    <span className="text-right text-[#758891]">{percentage}%</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[#dce9e8] bg-[#f1f8f7] p-3 text-sm leading-5 text-[#45626a]">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#1f6a67]" aria-hidden />
              <p>
                Las reseñas se revisan antes de publicarse para mantener una
                comunidad útil y respetuosa.
              </p>
            </div>
          </aside>

          <div className="min-w-0">
            {reviews.length > 0 ? (
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="m-0 text-[1.25rem] font-semibold text-[#192f3c]">
                    {selectedReviewRating === null
                      ? "Opiniones más recientes"
                      : `Opiniones de ${selectedReviewRating} estrellas`}
                  </h3>
                  <p className="mt-1 text-sm text-[#687e87]" aria-live="polite">
                    Mostrando {Math.min(visibleReviews.length, filteredReviews.length)} de{" "}
                    {filteredReviews.length} reseña
                    {filteredReviews.length === 1 ? "" : "s"}
                  </p>
                </div>
                {selectedReviewRating !== null ? (
                  <button
                    type="button"
                    className="cursor-pointer rounded-full border border-[#cbdcde] bg-white px-3 py-2 text-sm font-semibold text-[#1f6a67] transition hover:bg-[#f1f7f7]"
                    onClick={() => setSelectedReviewRating(null)}
                  >
                    Ver todas
                  </button>
                ) : null}
              </div>
            ) : null}

            {reviewsLoading ? (
              <div className="grid gap-3" role="status" aria-label="Cargando reseñas">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-36 animate-pulse rounded-2xl border border-[#e4ebed] bg-[#f3f7f7]"
                  />
                ))}
              </div>
            ) : null}

            {!reviewsLoading && filteredReviews.length > 0 ? (
              <>
                <div className="grid gap-3">
                  {visibleReviews.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[#dfe8ea] bg-white p-4 transition hover:border-[#bcd2d5] hover:shadow-[0_10px_28px_rgba(32,79,88,0.08)] sm:p-5"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div
                          className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e4f1f0] text-sm font-bold text-[#1b625f] ring-4 ring-[#f4f9f8]"
                          aria-hidden
                        >
                          {getReviewerInitials(item.user.nombre)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <strong className="block truncate text-[0.98rem] text-[#18313d]">
                                {item.user.nombre}
                              </strong>
                              <div className="mt-1 flex items-center gap-2">
                                <span
                                  className="text-[0.95rem] tracking-[0.04em] text-[#dc9a1a]"
                                  aria-label={`${item.rating} de 5 estrellas`}
                                >
                                  {renderStars(item.rating)}
                                </span>
                                <span className="hidden text-xs font-semibold text-[#6a8089] sm:inline">
                                  {item.rating}.0 de 5
                                </span>
                              </div>
                            </div>
                            <time
                              dateTime={item.createdAt}
                              className="shrink-0 text-[0.82rem] text-[#71858d]"
                            >
                              {new Date(item.createdAt).toLocaleDateString("es-MX", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </time>
                          </div>
                          <p className="mt-3 whitespace-pre-line text-[0.96rem] leading-7 text-[#304d58]">
                            {item.comment}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {remainingReviewsCount > 0 ? (
                  <button
                    type="button"
                    className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-[#1f6a67] transition hover:bg-[#edf6f5]"
                    onClick={() =>
                      setVisibleReviewsCount((current) =>
                        Math.min(current + REVIEWS_PER_PAGE, filteredReviews.length),
                      )
                    }
                  >
                    Ver {Math.min(REVIEWS_PER_PAGE, remainingReviewsCount)} reseña
                    {Math.min(REVIEWS_PER_PAGE, remainingReviewsCount) === 1 ? "" : "s"} más
                    <ChevronDown className="size-5" aria-hidden />
                  </button>
                ) : filteredReviews.length > REVIEWS_PER_PAGE ? (
                  <button
                    type="button"
                    className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-[#1f6a67] transition hover:bg-[#f0f6f6]"
                    onClick={() => setVisibleReviewsCount(REVIEWS_PER_PAGE)}
                  >
                    Mostrar menos
                    <ChevronUp className="size-5" aria-hidden />
                  </button>
                ) : null}
              </>
            ) : !reviewsLoading ? (
              <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-[#c8dadd] bg-[#fbfdfd] px-5 py-8 text-center">
                <div>
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#e8f3f2] text-[#1f6a67]">
                    <MessageSquareText className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[1.2rem] font-semibold text-[#1a2a37]">
                    {selectedReviewRating === null
                      ? "Aún no hay reseñas"
                      : `No hay reseñas de ${selectedReviewRating} estrellas`}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[420px] text-sm leading-6 text-[#5f7780]">
                    {selectedReviewRating === null
                      ? "Sé la primera persona en compartir su experiencia con este producto."
                      : "Prueba con otra calificación o vuelve a ver todas las opiniones."}
                  </p>
                  {selectedReviewRating !== null ? (
                    <button
                      type="button"
                      className="mt-4 cursor-pointer rounded-xl border border-[#c8dadd] bg-white px-4 py-2.5 font-semibold text-[#1f6a67]"
                      onClick={() => setSelectedReviewRating(null)}
                    >
                      Ver todas las opiniones
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <DemoRecommendations context="product" sourceProducts={[product]} />

      <section className="mt-10">
        <div className="mb-5 border-b border-[#dbe6e8] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.09em] text-[#1f6a67]">
              Explora más
            </p>
            <h2 className="mt-1 text-[1.4rem] font-semibold tracking-[-0.01em] text-[#142734] sm:text-[1.65rem]">
              Encuentra el complemento ideal
            </h2>
            <p className="mt-1 max-w-[620px] text-sm leading-5 text-[#617780]">
              Alternativas de {product.clasificacion.toLowerCase()} para comparar
              y elegir con confianza.
            </p>
          </div>
        </div>

        {relatedLoading ? (
          <p className="mb-4 rounded-xl bg-[#edf4f5] px-3 py-[11px] font-bold text-[#3d5d66]">
            Cargando productos relacionados...
          </p>
        ) : null}

        {!relatedLoading && relatedProducts.length > 0 ? (
          <div className="relative">
            <button
              type="button"
              className="absolute left-0 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center text-[#1f6a67] drop-shadow-[0_0_3px_rgba(255,255,255,0.98)] transition hover:scale-110 hover:text-[#154f4d] disabled:pointer-events-none disabled:opacity-0"
              onClick={() => scrollRelated(-1)}
              aria-label="Ver productos relacionados anteriores"
              disabled={!canScrollRelatedPrev}
            >
              <ChevronLeft className="size-8 stroke-[2.4]" aria-hidden />
            </button>

            <div
              ref={relatedTrackRef}
              className="overflow-x-auto overflow-y-hidden scroll-smooth px-1 py-1 [scrollbar-width:none] [scroll-snap-type:x_mandatory] [&::-webkit-scrollbar]:hidden"
            >
              <div className="grid grid-flow-col auto-cols-[100%] gap-5 min-[681px]:auto-cols-[48%] min-[1081px]:auto-cols-[23.5%]">
                {relatedProducts.map((item) => (
                  <div
                    key={item.id}
                    data-related-card="true"
                    className="h-full [scroll-snap-align:start]"
                  >
                    <ProductCard
                      product={item}
                      searchQuery=""
                      isPromoted={false}
                      view="grid"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="absolute right-0 top-1/2 z-[2] grid size-11 -translate-y-1/2 place-items-center text-[#1f6a67] drop-shadow-[0_0_3px_rgba(255,255,255,0.98)] transition hover:scale-110 hover:text-[#154f4d] disabled:pointer-events-none disabled:opacity-0"
              onClick={() => scrollRelated(1)}
              aria-label="Ver más productos relacionados"
              disabled={!canScrollRelatedNext}
            >
              <ChevronRight className="size-8 stroke-[2.4]" aria-hidden />
            </button>
          </div>
        ) : null}
      </section>

      {showImageZoomModal && isOptimizableImageUrl(selectedGalleryImage?.url) ? (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(8,18,28,0.78)] p-4"
          onClick={() => setShowImageZoomModal(false)}
        >
          <div
            className="relative h-[min(86vh,780px)] w-full max-w-[1100px] overflow-hidden rounded-[14px] bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-[2] grid size-11 place-items-center rounded-full bg-white text-[#17333f] shadow-[0_12px_28px_rgba(7,19,29,0.18)]"
              onClick={() => setShowImageZoomModal(false)}
              aria-label="Cerrar imagen ampliada"
            >
              <X className="size-5" />
            </button>
            <Image
              src={selectedGalleryImage.url}
              alt={selectedGalleryImage.alt}
              fill
              sizes="100vw"
              className="object-contain p-4 sm:p-6"
            />
          </div>
        </div>
      ) : null}

      {showReviewModal ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(9,19,29,0.58)] p-4"
          onClick={() => {
            if (!savingReview) {
              setShowReviewModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            className="w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[#d5e2e5] bg-white shadow-[0_28px_80px_rgba(9,30,38,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#e2ebed] bg-[#f5faf9] px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.09em] text-[#1f6a67]">
                  Tu experiencia importa
                </p>
                <h3 id="review-dialog-title" className="mt-1 text-xl font-semibold text-[#192e39]">
                  {canEditReview ? "Editar mi opinión" : "Calificar producto"}
                </h3>
              </div>
              <button
                type="button"
                className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-[#526a74] transition hover:bg-[#e5f0ef] hover:text-[#183f43]"
                onClick={() => setShowReviewModal(false)}
                disabled={savingReview}
                aria-label="Cerrar formulario de reseña"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form onSubmit={submitReview} className="p-5 sm:p-6">
              <fieldset>
                <legend className="text-sm font-bold text-[#203944]">
                  ¿Cómo calificarías este producto?
                </legend>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex gap-1" aria-label="Seleccionar calificación">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`grid size-11 place-items-center rounded-lg border transition ${
                          reviewForm.rating >= star
                            ? "border-[#e5b24d] bg-[#fff7e7] text-[#d9971a]"
                            : "border-[#d3dde1] bg-white text-[#9aa9af] hover:border-[#e5b24d] hover:bg-[#fffbf2]"
                        } disabled:cursor-default`}
                        onClick={() => {
                          setReviewForm((prev) => ({ ...prev, rating: star }));
                        }}
                        aria-label={`Calificar con ${star} estrella${star === 1 ? "" : "s"}`}
                        aria-pressed={reviewForm.rating === star}
                      >
                        <Star className="size-6 fill-current" aria-hidden />
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#536b75]" aria-live="polite">
                    {reviewForm.rating > 0
                      ? `${reviewForm.rating} de 5`
                      : "Selecciona de 1 a 5"}
                  </span>
                </div>
              </fieldset>

              {canEditReview ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#d8e7e6] bg-[#eef7f6] px-3 py-3 text-sm leading-5 text-[#46636b]">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#1f6a67]" aria-hidden />
                  <p>
                    Puedes cambiar la calificación y el comentario. Al guardar,
                    la reseña volverá a revisión antes de publicarse.
                  </p>
                </div>
              ) : null}

              <div className="mt-5">
                <label htmlFor="review-comment" className="text-sm font-bold text-[#203944]">
                  Cuéntanos tu experiencia
                </label>
                <p id="review-comment-help" className="mt-1 text-xs leading-5 text-[#6b7f88]">
                  Comenta sobre uso, comodidad, calidad o cualquier detalle útil
                  para otros clientes.
                </p>
                <textarea
                  id="review-comment"
                  className={`mt-2 min-h-[132px] w-full resize-y rounded-xl border bg-white p-3 text-[#203944] outline-none transition placeholder:text-[#96a5ab] ${
                    reviewForm.comment.length > 0 && !isReviewCommentValid
                      ? "border-[#d86262] focus:border-[#bd3535]"
                      : "border-[#cbdadd] focus:border-[#1f6a67]"
                  }`}
                  placeholder="Ejemplo: Es cómodo, resistente y fácil de ajustar..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  aria-describedby="review-comment-help review-comment-status"
                  aria-invalid={reviewForm.comment.length > 0 && !isReviewCommentValid}
                  minLength={REVIEW_MIN_LENGTH}
                  maxLength={REVIEW_MAX_LENGTH}
                  required
                />
                <div
                  id="review-comment-status"
                  className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <span
                    className={
                      reviewForm.comment.length > 0 && !isReviewCommentValid
                        ? "font-semibold text-[#b42318]"
                        : "text-[#6d8088]"
                    }
                  >
                    {reviewForm.comment.length > 0 &&
                    trimmedReviewComment.length < REVIEW_MIN_LENGTH
                      ? `Escribe al menos ${REVIEW_MIN_LENGTH} caracteres.`
                      : "Entre 5 y 500 caracteres."}
                  </span>
                  <span
                    className={
                      reviewForm.comment.length >= REVIEW_MAX_LENGTH
                        ? "font-semibold text-[#b42318]"
                        : "text-[#6d8088]"
                    }
                  >
                    {reviewForm.comment.length}/{REVIEW_MAX_LENGTH}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className={`${secondaryButtonClassName} w-full sm:w-auto`}
                  onClick={() => setShowReviewModal(false)}
                  disabled={savingReview}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${primaryButtonClassName} w-full sm:w-auto`}
                  disabled={!canSubmitReview}
                >
                  {savingReview
                    ? canEditReview
                      ? "Guardando..."
                      : "Enviando..."
                    : canEditReview
                      ? "Guardar cambios"
                      : "Enviar reseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
