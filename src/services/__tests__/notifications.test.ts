import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-fetch";
import {
  getNotifications,
  getNotificationPreferences,
  saveNotificationPreferences,
  readNotifications,
  readAllNotifications,
  notificationHref,
  getNotificationDetail,
} from "../notifications";
import {
  campaignHistorySchema,
  campaignPayloadSchema,
} from "@/lib/schemas/notifications";

vi.mock("@/lib/api-fetch", () => ({ apiFetch: vi.fn() }));
const preferences = {
  pushEnabled: true,
  system: true,
  offers: false,
  rentals: true,
};
const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
beforeEach(() => vi.resetAllMocks());
describe("notification contracts", () => {
  it("marks the entire account as read without a page, category or ids payload", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(json({ message: "Leídas" }));
    await readAllNotifications();
    expect(apiFetch).toHaveBeenCalledWith("/notifications/read-all", {
      method: "PATCH",
    });
  });
  it("loads preferences from the API and persists them without localStorage", async () => {
    vi.mocked(apiFetch).mockImplementation(async () => json({ preferences }));
    expect(await getNotificationPreferences()).toEqual({ preferences });
    await saveNotificationPreferences(preferences);
    expect(apiFetch).toHaveBeenLastCalledWith(
      "/notifications/preferences",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(preferences),
      }),
    );
  });
  it("validates inbox responses, category pagination, detail and read state", async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(
      json({ items: [], total: 0, unreadCount: 0, page: 2, pageSize: 20 }),
    );
    await getNotifications(2, "OFFER");
    expect(apiFetch).toHaveBeenCalledWith(
      "/notifications?page=2&category=OFFER",
      { cache: "no-store" },
    );
    vi.mocked(apiFetch).mockResolvedValueOnce(json({ message: "Marcadas" }));
    await readNotifications(["inbox"]);
    expect(apiFetch).toHaveBeenLastCalledWith(
      "/notifications/read",
      expect.objectContaining({ body: JSON.stringify({ ids: ["inbox"] }) }),
    );
    vi.mocked(apiFetch).mockResolvedValueOnce(
      json({ item: { id: "invalid" } }),
    );
    await expect(getNotificationDetail("other/id")).rejects.toThrow(
      "formato esperado",
    );
    expect(apiFetch).toHaveBeenLastCalledWith("/notifications/other%2Fid", {
      cache: "no-store",
    });
  });
  it("never accepts an arbitrary URL as a notification destination", () => {
    expect(
      notificationHref({
        destinationType: "PRODUCT",
        destinationId: "https://evil.test",
      }),
    ).toBe("/producto/https%3A%2F%2Fevil.test");
    expect(
      notificationHref({ destinationType: "RENTAL", destinationId: "rental" }),
    ).toBe("/mis-rentas/rental");
    expect(
      notificationHref({ destinationType: "PROMOTION", destinationId: "7" }),
    ).toBe("/ofertas/7");
    expect(
      notificationHref({ destinationType: "NONE", destinationId: null }),
    ).toBeNull();
  });
  it("requires a selected audience and a destination before previewing", () => {
    const input = {
      requestId: "17cb19b6-d0f8-41fc-a47e-fbd1ecfbfd90",
      category: "OFFER",
      title: "Oferta",
      body: "Mensaje",
      audience: "SELECTED",
      destinationType: "PRODUCT",
    };
    expect(campaignPayloadSchema.safeParse(input).success).toBe(false);
    expect(
      campaignPayloadSchema.safeParse({
        ...input,
        userIds: [7],
        destinationId: "1",
      }).success,
    ).toBe(true);
  });
});

it("admite los avisos de moderación en el historial administrativo", () => {
  expect(
    campaignHistorySchema.safeParse({
      items: [
        {
          id: "campaign-review",
          title: "Reseña aprobada",
          body: "Tu opinión fue publicada.",
          category: "SYSTEM",
          source: "REVIEW_STATUS",
          createdAt: "2026-11-01T12:00:00.000Z",
          recipientCount: 1,
          pushes: {
            PENDING: 1,
            ACCEPTED: 0,
            DELIVERED: 0,
            FAILED: 0,
            SKIPPED: 0,
          },
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    }).success,
  ).toBe(true);
});
