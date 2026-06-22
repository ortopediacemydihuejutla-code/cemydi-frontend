import { z } from "zod";

const cartProductSchema = z.object({
  id: z.number(),
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
  activo: z.boolean(),
  imageUrl: z.string().nullable(),
});

const cartAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  maxQuantity: z.number(),
  reason: z.string().nullable(),
});

const cartItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lineTotal: z.number(),
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
  items: z.array(cartItemSchema),
  summary: z.object({
    distinctItems: z.number(),
    totalQuantity: z.number(),
    subtotal: z.number(),
    discountTotal: z.number().optional(),
    total: z.number().optional(),
    hasUnavailableItems: z.boolean(),
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
