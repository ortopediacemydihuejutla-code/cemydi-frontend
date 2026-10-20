import { z } from "@/lib/zod";

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  variant: z.literal("medical-alert").optional(),
});

export const legalDocumentSchema = z.object({
  id: z.number().optional(),
  slug: z.enum(["politicas-de-privacidad", "terminos-y-condiciones"]),
  title: z.string(),
  description: z.string(),
  fields: z.record(z.string(), z.union([z.string(), z.boolean()])),
  customSections: z.array(sectionSchema),
  sections: z.array(sectionSchema),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});
