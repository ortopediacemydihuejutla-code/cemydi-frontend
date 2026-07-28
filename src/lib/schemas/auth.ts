import { z } from "@/lib/zod";

export const authUserSchema = z.object({
  id: z.number(),
  nombre: z.string(),
  correo: z.string(),
  activo: z.boolean(),
  rol: z.enum(["ADMIN", "CLIENT"]),
  emailVerified: z.boolean(),
  emailVerifiedAt: z.string().nullable(),
  telefono: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
});

export const authProfileResponseSchema = z.object({
  user: authUserSchema.nullable(),
});

export const authProfileUpdateResponseSchema = z.object({
  message: z.string(),
  user: authUserSchema,
});
