import { z } from "@/lib/zod";
export const aboutPageContentSchema = z.object({
  id: z.number(), heroTitle: z.string(), heroSubtitle: z.string(),
  missionTitle: z.string(), missionText: z.string(), visionTitle: z.string(), visionText: z.string(),
  valuesTitle: z.string(), values: z.array(z.string()), storyTitle: z.string(), storyText: z.string(),
  heroImageUrl: z.string().nullable(), secondaryImageUrl: z.string().nullable(),
  updatedAt: z.string().optional(), createdAt: z.string().optional(),
});
export const aboutPageResponseSchema = z.object({ aboutPage: aboutPageContentSchema.nullable() });
