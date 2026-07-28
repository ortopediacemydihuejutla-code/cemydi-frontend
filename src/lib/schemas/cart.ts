import { z } from "@/lib/zod";

const cartProductSchema = z.object({
  id: z.number(),
  slug: z.string().optional(),
  nombre: z.string(),
  marca: z.string(),
  modelo: z.string(),
  descripcion: z.string(),
  precio: z.number(),
  clasificacion: z.string(),
  stock: z.number(),
  proveedor: z.string(),
  tipoAdquisicion: z.enum(["VENTA", "RENTA", "MIXTO"]),
  requiereReceta: z.boolean(),
  rentalDailyPrice: z.number().nullable().optional(),
  rentalMinDays: z.number().optional(),
  rentalDeposit: z.number().optional(),
  rentalTerms: z.string().nullable().optional(),
  activo: z.boolean(),
  imageUrl: z.string().nullable(),
});

const cartAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  maxQuantity: z.number(),
  reason: z.string().nullable(),
});

const rentalDocumentSchema = z.object({
  id: z.string(),
  originalFilename: z.string(),
  mimeType: z.string(),
  bytes: z.number(),
  status: z.enum(["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO"]),
  uploadedAt: z.string(),
  associatedAt: z.string().nullable(),
});

const cartItemSchema = z.object({
  id: z.number(),
  mode: z.enum(["VENTA", "RENTA"]).default("VENTA"),
  configurationStatus: z.enum(["PENDING", "COMPLETE"]).default("COMPLETE"),
  quantity: z.number(),
  rentalStartDate: z.string().nullable().optional(),
  rentalEndDate: z.string().nullable().optional(),
  rentalDays: z.number().nullable().optional(),
  rentalNotes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lineTotal: z.number().nullable(),
  rentalSummary: z
    .object({
      dailyPrice: z.number(),
      minDays: z.number(),
      deposit: z.number(),
      subtotal: z.number().nullable(),
      depositTotal: z.number(),
      total: z.number().nullable(),
    })
    .nullable()
    .optional(),
  document: rentalDocumentSchema.nullable().optional(),
  originalLineTotal: z.number().optional(),
  discountAmount: z.number().optional(),
  finalLineTotal: z.number().optional(),
  promotion: z
    .object({
      id: z.number().optional(),
      label: z.string().optional(),
      percent: z.number().optional(),
    })
    .nullable()
    .optional(),
  availability: cartAvailabilitySchema,
  product: cartProductSchema,
});

const shoppingCartSchema = z.object({
  id: z.string().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
  appliedCoupon: z
    .object({
      id: z.number(),
      code: z.string(),
      description: z.string(),
      discountType: z.enum(["PERCENT", "FIXED"]),
      discountValue: z.number(),
      minimumPurchase: z.number(),
      maximumDiscount: z.number().nullable(),
      discountAmount: z.number(),
      isValid: z.boolean(),
      reason: z.string().nullable(),
    })
    .nullable()
    .optional(),
  items: z.array(cartItemSchema),
  summary: z.object({
    distinctItems: z.number(),
    totalQuantity: z.number(),
    subtotal: z.number(),
    saleSubtotal: z.number().optional(),
    rentalSubtotal: z.number().optional(),
    rentalDepositTotal: z.number().optional(),
    total: z.number().optional(),
    saleItems: z.number().optional(),
    rentalItems: z.number().optional(),
    promotionDiscountTotal: z.number().optional(),
    couponDiscountTotal: z.number().optional(),
    discountTotal: z.number().optional(),
    hasUnavailableItems: z.boolean(),
    hasUnconfiguredRentalItems: z.boolean().default(false),
  }),
});

export const cartResponseSchema = z.object({
  cart: shoppingCartSchema,
});

export const cartMutationResponseSchema = z.object({
  message: z.string(),
  cart: shoppingCartSchema,
});

export type ShoppingCart = z.infer<typeof shoppingCartSchema>;
export type ShoppingCartItem = z.infer<typeof cartItemSchema>;
