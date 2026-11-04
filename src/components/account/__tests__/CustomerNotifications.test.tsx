import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CustomerNotifications,
  CustomerNotificationRedirect,
  CustomerNotificationBell,
} from "../CustomerNotifications";
import {
  getNotifications,
  getNotificationDetail,
  readNotifications,
  readAllNotifications,
} from "@/services/notifications";
import { useAuth } from "@/providers/AuthContext";
vi.mock("@/lib/pwa/push", () => ({
  requestWebPushOnAccess: vi.fn().mockResolvedValue(undefined),
}));

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("@/providers/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/services/notifications", async (original) => ({
  ...(await original<typeof import("@/services/notifications")>()),
  getNotifications: vi.fn(),
  getNotificationDetail: vi.fn(),
  readNotifications: vi.fn(),
  readAllNotifications: vi.fn(),
}));
const item = {
  id: "notice",
  category: "OFFER" as const,
  title: "Equipo en oferta",
  body: "Consulta los equipos disponibles.",
  destinationType: "PRODUCT" as const,
  destinationId: "12",
  createdAt: new Date().toISOString(),
  readAt: null,
};
const inbox = {
  items: [item],
  total: 45,
  unreadCount: 45,
  page: 1,
  pageSize: 20,
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 7, rol: "CLIENT" },
  } as ReturnType<typeof useAuth>);
  vi.mocked(getNotifications).mockResolvedValue(inbox);
  vi.mocked(getNotificationDetail).mockResolvedValue({ item });
  vi.mocked(readNotifications).mockResolvedValue({ message: "Leídas" });
  vi.mocked(readAllNotifications).mockResolvedValue({ message: "Leídas" });
});
describe("notification navigation and global reading", () => {
  it("updates the Home bell and heading immediately and restores both after a failed read", async () => {
    let fail!: (error: Error) => void;
    vi.mocked(readNotifications).mockReturnValueOnce(
      new Promise((_, reject) => {
        fail = reject;
      }),
    );
    render(
      <>
        <CustomerNotificationBell variant="header" />
        <CustomerNotifications />
      </>,
    );
    await screen.findByRole("link", { name: "Notificaciones, 45 sin leer" });
    fireEvent.click(
      screen.getByRole("button", { name: `Marcar como leída: ${item.title}` }),
    );
    expect(
      screen.getByRole("link", { name: "Notificaciones, 44 sin leer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("44 notificaciones sin leer"),
    ).toBeInTheDocument();
    await act(async () => fail(new Error("Offline")));
    await screen.findByRole("link", { name: "Notificaciones, 45 sin leer" });
    expect(
      screen.getByLabelText("45 notificaciones sin leer"),
    ).toBeInTheDocument();
  });
  it("loads the next page only after scrolling, retains earlier notices and deduplicates overlaps", async () => {
    vi.mocked(getNotifications).mockImplementation(async (page) =>
      page === 1
        ? inbox
        : {
            ...inbox,
            page: 2,
            total: 40,
            items: [item, { ...item, id: "second", title: "Siguiente aviso" }],
          },
    );
    render(<CustomerNotifications />);
    await screen.findByText(item.title);
    expect(getNotifications).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("navigation", { name: /paginación/i }),
    ).not.toBeInTheDocument();
    fireEvent.scroll(window);
    await screen.findByText("Siguiente aviso");
    expect(screen.getAllByText(item.title)).toHaveLength(1);
    expect(getNotifications).toHaveBeenLastCalledWith(2, undefined);
    fireEvent.scroll(window);
    expect(getNotifications).toHaveBeenCalledTimes(2);
  });
  it("keeps loaded notices after an append failure and retries the missing page", async () => {
    vi.mocked(getNotifications)
      .mockResolvedValueOnce(inbox)
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({
        ...inbox,
        page: 2,
        total: 40,
        items: [{ ...item, id: "next", title: "Aviso recuperado" }],
      });
    render(<CustomerNotifications />);
    await screen.findByText(item.title);
    fireEvent.scroll(window);
    await screen.findByText("No pudimos cargar más notificaciones.");
    expect(screen.getByText(item.title)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar carga" }));
    await screen.findByText("Aviso recuperado");
    expect(getNotifications).toHaveBeenLastCalledWith(2, undefined);
  });
  it("ignores an old page response after switching categories", async () => {
    let finish!: (value: typeof inbox) => void;
    vi.mocked(getNotifications).mockImplementation((page, category) =>
      category === "SYSTEM"
        ? Promise.resolve({ ...inbox, total: 0, items: [] })
        : page === 1
          ? Promise.resolve(inbox)
          : new Promise((resolve) => {
              finish = resolve;
            }),
    );
    render(<CustomerNotifications />);
    await screen.findByText(item.title);
    fireEvent.scroll(window);
    await waitFor(() =>
      expect(getNotifications).toHaveBeenCalledWith(2, undefined),
    );
    fireEvent.click(screen.getByRole("button", { name: "Sistema" }));
    await act(async () =>
      finish({
        ...inbox,
        page: 2,
        items: [{ ...item, id: "stale", title: "No debe aparecer" }],
      }),
    );
    await screen.findByText("No tienes notificaciones en esta sección");
    expect(screen.queryByText("No debe aparecer")).not.toBeInTheDocument();
  });
  it("uses an accessible arrow to expand and collapse the full message", async () => {
    render(<CustomerNotifications />);
    const arrow = await screen.findByRole("button", {
      name: `Leer mensaje completo: ${item.title}`,
    });
    expect(arrow).toHaveAttribute("aria-expanded", "false");
    expect(arrow).toHaveTextContent("");
    fireEvent.click(arrow);
    expect(
      screen.getByRole("button", { name: `Contraer: ${item.title}` }),
    ).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(
      screen.getByRole("button", { name: `Contraer: ${item.title}` }),
    );
    expect(
      screen.getByRole("button", {
        name: `Leer mensaje completo: ${item.title}`,
      }),
    ).toHaveAttribute("aria-expanded", "false");
  });
  it("keeps the previous list while a new tab is loading", async () => {
    render(<CustomerNotifications />);
    await screen.findByRole("link", { name: /^Equipo en oferta/ });
    let finish!: (value: typeof inbox) => void;
    vi.mocked(getNotifications).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Sistema" }));
    expect(
      screen.getByRole("link", { name: /^Equipo en oferta/ }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.queryByText("Cargando notificaciones…"),
    ).not.toBeInTheDocument();
    await act(async () => finish({ ...inbox, items: [], total: 0 }));
    expect(
      await screen.findByText("No tienes notificaciones en esta sección"),
    ).toBeInTheDocument();
  });
  it("updates read state before the API completes and rolls back on failure", async () => {
    render(<CustomerNotifications />);
    await screen.findByLabelText("45 notificaciones sin leer");
    let reject!: (reason: Error) => void;
    vi.mocked(readNotifications).mockReturnValueOnce(
      new Promise((_, fail) => {
        reject = fail;
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Marcar como leída: Equipo en oferta",
      }),
    );
    expect(
      screen.getByLabelText("44 notificaciones sin leer"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nueva")).not.toBeInTheDocument();
    await act(async () => reject(new Error("Offline")));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron marcar",
    );
    expect(
      screen.getByLabelText("45 notificaciones sin leer"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^Equipo en oferta/ }),
    ).toHaveAccessibleName(/sin leer/);
  });
  it("shows a real promotion percentage and its commercial action", async () => {
    vi.mocked(getNotifications).mockResolvedValue({
      ...inbox,
      items: [
        {
          ...item,
          destinationType: "PROMOTION",
          destinationId: "2",
          preview: { imageUrl: null, discountPercent: 20 },
        },
      ],
    });
    render(<CustomerNotifications />);
    expect(await screen.findByText("-20%")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver oferta: Equipo en oferta" }),
    ).toHaveAttribute("href", "/ofertas/2");
  });
  it("links directly to the destination and removes the manual refresh and introduction", async () => {
    render(<CustomerNotifications />);
    expect(
      await screen.findByRole("link", { name: /^Equipo en oferta/ }),
    ).toHaveAttribute("href", "/producto/12");
    expect(
      screen.queryByRole("button", { name: /Actualizar/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Lo nuevo en tu cuenta, en un solo lugar."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Nueva")).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Lista de notificaciones").children,
    ).toHaveLength(1);
  });
  it("marks all pages and categories, including when viewing one category", async () => {
    render(<CustomerNotifications />);
    await screen.findByLabelText("45 notificaciones sin leer");
    fireEvent.click(screen.getByRole("button", { name: "Ofertas" }));
    await waitFor(() =>
      expect(getNotifications).toHaveBeenLastCalledWith(1, "OFFER"),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Marcar todas como leídas" }),
    );
    await waitFor(() => expect(readAllNotifications).toHaveBeenCalledTimes(1));
    expect(readNotifications).not.toHaveBeenCalled();
  });
  it("resolves old push links without rendering a notification detail", async () => {
    render(<CustomerNotificationRedirect id="notice" />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/producto/12"));
    expect(readNotifications).toHaveBeenCalledWith(["notice"]);
    expect(screen.queryByText(item.body)).not.toBeInTheDocument();
  });
  it("keeps a failed mark-all action visible for retry", async () => {
    vi.mocked(readAllNotifications).mockRejectedValueOnce(new Error("Offline"));
    render(<CustomerNotifications />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Marcar todas como leídas" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron marcar",
    );
    expect(
      screen.getByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
  });
  it("keeps announcements without a destination in the inbox and marks them read", async () => {
    vi.mocked(getNotifications).mockResolvedValue({
      ...inbox,
      items: [{ ...item, destinationType: "NONE", destinationId: null }],
    });
    render(<CustomerNotifications />);
    fireEvent.click(
      await screen.findByRole("button", { name: /^Equipo en oferta/ }),
    );
    await waitFor(() =>
      expect(readNotifications).toHaveBeenCalledWith(["notice"]),
    );
    expect(replace).not.toHaveBeenCalled();
  });
});
