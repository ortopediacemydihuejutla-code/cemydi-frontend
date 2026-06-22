import { z } from "zod";

export const catalogProductSchema = z.object({
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
  images: z.array(
    z.object({
      id: z.number(),
      imageUrl: z.string(),
      sortOrder: z.number(),
      createdAt: z.string(),
    }),
  ),
  createdAt: z.string(),
});

export const catalogResponseSchema = z.object({
  products: z.array(catalogProductSchema),
  filters: z
    .object({
      clasificaciones: z.array(z.string()).optional(),
      marcas: z.array(z.string()).optional(),
    })
    .optional(),
  pagination: z
    .object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasPrevious: z.boolean(),
      hasNext: z.boolean(),
    })
    .optional(),
});

export const catalogProductDetailSchema = z.object({
  product: catalogProductSchema,
});

export type CatalogProductValidated = z.infer<typeof catalogProductSchema>;
