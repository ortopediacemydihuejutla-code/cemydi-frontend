import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enableWebPush, refreshWebPush, requestWebPushOnAccess } from "../push";
import { getWebPushConfig, registerWebPush } from "@/services/notifications";

vi.mock("@/services/notifications", () => ({
  getWebPushConfig: vi.fn(),
  registerWebPush: vi.fn(),
}));
const initialWorker = Object.getOwnPropertyDescriptor(
  navigator,
  "serviceWorker",
);
const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/fixture",
};
const registration = {
  pushManager: { getSubscription: vi.fn(), subscribe: vi.fn() },
};
const permission = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("PushManager", class {});
  vi.stubGlobal("Notification", {
    permission: "granted",
    requestPermission: permission,
  });
  permission.mockResolvedValue("granted");
  registration.pushManager.getSubscription.mockResolvedValue(subscription);
  registration.pushManager.subscribe.mockResolvedValue(subscription);
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      ready: Promise.resolve(registration),
      getRegistration: vi.fn().mockResolvedValue(registration),
    },
  });
  vi.mocked(getWebPushConfig).mockResolvedValue({
    publicKey: btoa("x".repeat(65)),
  });
  vi.mocked(registerWebPush).mockResolvedValue({ id: "subscription" });
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  if (initialWorker)
    Object.defineProperty(navigator, "serviceWorker", initialWorker);
  else Reflect.deleteProperty(navigator, "serviceWorker");
});
describe("PWA push registration", () => {
  it("requests permission synchronously with the click before asynchronous network calls", async () => {
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: permission,
    });
    const result = enableWebPush();
    expect(permission).toHaveBeenCalledTimes(1);
    expect(getWebPushConfig).not.toHaveBeenCalled();
    await result;
    expect(registerWebPush).toHaveBeenCalledWith(subscription);
    expect(registration.pushManager.subscribe).not.toHaveBeenCalled();
  });
  it("does not register a browser when permission is denied or the server is not configured", async () => {
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: permission,
    });
    permission.mockResolvedValueOnce("denied");
    await expect(enableWebPush()).rejects.toThrow("ajustes");
    expect(registerWebPush).not.toHaveBeenCalled();
    vi.mocked(getWebPushConfig).mockResolvedValueOnce({ publicKey: null });
    await expect(enableWebPush()).rejects.toThrow(
      "todavía no están disponibles",
    );
    expect(registerWebPush).not.toHaveBeenCalled();
  });
  it("rebinds an existing authorized browser without prompting again", async () => {
    await refreshWebPush();
    expect(permission).not.toHaveBeenCalled();
    expect(registerWebPush).toHaveBeenCalledWith(subscription);
  });
  it("shares one prompt between Home and inbox and remembers an undecided dismissal", async () => {
    localStorage.clear();
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: permission,
    });
    let finish!: (permission: string) => void;
    permission.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const first = requestWebPushOnAccess(),
      second = requestWebPushOnAccess();
    expect(first).toBe(second);
    expect(permission).toHaveBeenCalledTimes(1);
    finish("default");
    await first;
    await requestWebPushOnAccess();
    vi.resetModules();
    const reloaded = await import("../push");
    await reloaded.requestWebPushOnAccess();
    expect(permission).toHaveBeenCalledTimes(1);
  });
  it("does not ask again after permission was denied", async () => {
    vi.stubGlobal("Notification", {
      permission: "denied",
      requestPermission: permission,
    });
    await requestWebPushOnAccess();
    await expect(enableWebPush()).rejects.toThrow("ajustes");
    expect(permission).not.toHaveBeenCalled();
  });
});
