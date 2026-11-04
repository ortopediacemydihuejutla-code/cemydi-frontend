import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import { NotificationPreferencesForm } from "../NotificationPreferencesForm";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from "@/services/notifications";
import { useAuth } from "@/providers/AuthContext";
vi.mock("@/providers/AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/services/notifications", () => ({
  getNotificationPreferences: vi.fn(),
  saveNotificationPreferences: vi.fn(),
}));
vi.mock("@/lib/pwa/push", () => ({
  supportsWebPush: () => false,
  enableWebPush: vi.fn(),
  refreshWebPush: vi.fn(),
}));
const initial = {
  pushEnabled: true,
  system: true,
  offers: true,
  rentals: true,
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({
    user: { id: 7, rol: "CLIENT" },
  } as ReturnType<typeof useAuth>);
  vi.mocked(getNotificationPreferences).mockResolvedValue({
    preferences: { ...initial },
  });
  vi.mocked(saveNotificationPreferences).mockImplementation(
    async (preferences) => ({ preferences }),
  );
});
describe("automatic notification preferences", () => {
  it("saves on toggle without a submit button or permanent saving message", async () => {
    render(<NotificationPreferencesForm />);
    const offers = await screen.findByRole("switch", { name: /^Ofertas/ });
    fireEvent.click(offers);
    await waitFor(() =>
      expect(saveNotificationPreferences).toHaveBeenCalledWith({
        ...initial,
        offers: false,
      }),
    );
    expect(offers).not.toBeChecked();
    expect(
      screen.queryByRole("button", { name: "Guardar preferencias" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Preferencias sincronizadas|sin guardar/),
    ).not.toBeInTheDocument();
  });
  it("rolls back a failed toggle and shows a brief error", async () => {
    vi.mocked(saveNotificationPreferences).mockRejectedValueOnce(
      new Error("Offline"),
    );
    render(<NotificationPreferencesForm />);
    const offers = await screen.findByRole("switch", { name: /^Ofertas/ });
    fireEvent.click(offers);
    expect(offers).not.toBeChecked();
    await waitFor(() => expect(offers).toBeChecked());
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("No pudimos guardar"),
    );
  });
  it("ignores a delayed read from before the last automatic save", async () => {
    render(<NotificationPreferencesForm />);
    const offers = await screen.findByRole("switch", { name: /^Ofertas/ });
    let finish!: (value: { preferences: typeof initial }) => void;
    vi.mocked(getNotificationPreferences).mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    await act(async () => window.dispatchEvent(new Event("focus")));
    fireEvent.click(offers);
    await waitFor(() =>
      expect(saveNotificationPreferences).toHaveBeenCalledTimes(1),
    );
    await act(async () => finish({ preferences: initial }));
    expect(offers).not.toBeChecked();
  });
  it("disables push across devices without losing category choices", async () => {
    render(<NotificationPreferencesForm />);
    fireEvent.click(
      await screen.findByRole("switch", {
        name: /Recibir notificaciones push/,
      }),
    );
    await waitFor(() =>
      expect(saveNotificationPreferences).toHaveBeenCalledWith({
        ...initial,
        pushEnabled: false,
      }),
    );
    expect(screen.getByRole("switch", { name: /^Ofertas/ })).toBeDisabled();
  });
});
