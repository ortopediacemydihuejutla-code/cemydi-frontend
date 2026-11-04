import { z } from "@/lib/zod";

export const notificationCategorySchema = z.enum(["SYSTEM", "OFFER", "RENTAL"]);
export const notificationDestinationSchema = z.enum([
  "NONE",
  "PRODUCT",
  "PROMOTION",
  "RENTAL",
  "ACCOUNT",
]);
export const notificationPreferencesSchema = z.object({
  pushEnabled: z.boolean(),
  system: z.boolean(),
  offers: z.boolean(),
  rentals: z.boolean(),
});
export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
export const preferencesResponseSchema = z.object({
  preferences: notificationPreferencesSchema,
});
export const notificationSchema = z.object({
  id: z.string(),
  category: notificationCategorySchema,
  title: z.string(),
  body: z.string(),
  destinationType: notificationDestinationSchema,
  destinationId: z.string().nullable(),
  createdAt: z.string(),
  readAt: z.string().nullable(),
  preview: z
    .object({
      imageUrl: z.string().url().nullable(),
      discountPercent: z.number().min(0).max(100).nullable(),
    })
    .nullish(),
});
export type CustomerNotification = z.infer<typeof notificationSchema>;
export const notificationDetailSchema = z.object({ item: notificationSchema });
export const notificationPromotionSchema = z.object({
  promotion: z.object({
    id: z.number().int(),
    description: z.string(),
    discountPercent: z.number(),
    endAt: z.string(),
    products: z.array(z.object({ id: z.number().int(), nombre: z.string() })),
  }),
});
export const inboxSchema = z.object({
  items: z.array(notificationSchema),
  unreadCount: z.number().int(),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});
export const automationSchema = z.object({
  rentalStatus: z.boolean(),
  prescriptions: z.boolean(),
  security: z.boolean(),
});
export const automationResponseSchema = z.object({
  settings: automationSchema,
});
export const campaignPayloadSchema = z
  .object({
    requestId: z.uuid(),
    category: notificationCategorySchema,
    title: z
      .string()
      .trim()
      .min(3, "Escribe al menos tres caracteres para el título.")
      .max(100),
    body: z
      .string()
      .trim()
      .min(3, "Escribe al menos tres caracteres para el mensaje.")
      .max(500),
    audience: z.enum(["ALL", "SELECTED"]),
    userIds: z.array(z.number().int().positive()).max(500).optional(),
    destinationType: notificationDestinationSchema,
    destinationId: z.string().max(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.audience === "SELECTED" && !value.userIds?.length)
      ctx.addIssue({
        code: "custom",
        path: ["userIds"],
        message: "Selecciona al menos un cliente.",
      });
    if (
      ["PRODUCT", "PROMOTION", "RENTAL"].includes(value.destinationType) &&
      !value.destinationId?.trim()
    )
      ctx.addIssue({
        code: "custom",
        path: ["destinationId"],
        message: "Selecciona un destino.",
      });
  });
export type CampaignPayload = z.infer<typeof campaignPayloadSchema>;
export const campaignHistorySchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      body: z.string(),
      category: notificationCategorySchema,
      source: z.enum([
        "MANUAL",
        "RENTAL_STATUS",
        "PRESCRIPTION",
        "SECURITY",
        "REVIEW_STATUS",
      ]),
      createdAt: z.string(),
      recipientCount: z.number().int(),
      pushes: z.object({
        PENDING: z.number(),
        ACCEPTED: z.number(),
        DELIVERED: z.number(),
        FAILED: z.number(),
        SKIPPED: z.number(),
      }),
    }),
  ),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});
