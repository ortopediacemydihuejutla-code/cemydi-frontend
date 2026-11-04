import { z } from "@/lib/zod";

const personSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  correo: z.string(),
});

export const reviewModerationResponseSchema = z.object({
  message: z.string(),
  review: z.object({
    id: z.number().int().positive(),
    productId: z.number().int().positive(),
    userId: z.number().int().positive(),
    rating: z.number().int().min(1).max(5),
    comment: z.string(),
    status: z.literal("REJECTED"),
    showOnHome: z.literal(false),
    approvedAt: z.null(),
    createdAt: z.iso.datetime(),
    product: z.object({ id: z.number().int().positive(), nombre: z.string() }),
    user: personSchema,
    approvedBy: z.null(),
  }),
});
