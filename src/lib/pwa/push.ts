import { getWebPushConfig, registerWebPush } from "@/services/notifications";

export function supportsWebPush() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function enableWebPush() {
  if (!supportsWebPush())
    throw new Error(
      "Este navegador no permite push. En iPhone, instala CEMYDI en la pantalla de inicio y ábrelo desde ahí.",
    );
  if (process.env.NODE_ENV !== "production")
    throw new Error(
      "Las notificaciones web se activan en la versión de producción de CEMYDI.",
    );
  // Keep the permission request directly inside the user's gesture for Safari.
  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  if (permission !== "granted")
    throw new Error(
      "Permite las notificaciones desde los ajustes de este navegador para activarlas.",
    );
  const { publicKey } = await getWebPushConfig();
  if (!publicKey)
    throw new Error(
      "Las notificaciones push todavía no están disponibles. Puedes consultar tu bandeja.",
    );
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => {
      timeout = setTimeout(
        () =>
          reject(
            new Error(
              "El navegador aún está preparando las notificaciones. Intenta de nuevo.",
            ),
          ),
        10000,
      );
    }),
  ]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
  const bytes = Uint8Array.from(
    atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")),
    (value) => value.charCodeAt(0),
  );
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: bytes,
    }));
  await registerWebPush(subscription);
}

let permissionRequest: Promise<void> | null = null;
let attempted = false;
const permissionKey = "cemydi-notification-permission-requested";

export function requestWebPushOnAccess(): Promise<void> {
  if (!supportsWebPush()) return Promise.resolve();
  if (permissionRequest) return permissionRequest;
  if (Notification.permission === "denied") return Promise.resolve();
  if (Notification.permission === "granted")
    return process.env.NODE_ENV === "production"
      ? enableWebPush().catch(() => undefined)
      : Promise.resolve();
  let stored = false;
  try {
    stored = localStorage.getItem(permissionKey) === "1";
  } catch {
    /* Session guard remains available. */
  }
  if (attempted || stored) return Promise.resolve();
  attempted = true;
  try {
    localStorage.setItem(permissionKey, "1");
  } catch {
    /* No repeated prompts in this session. */
  }
  // Call before any await so a Home click retains its user activation.
  permissionRequest = Notification.requestPermission()
    .then(async (permission) => {
      if (permission === "granted" && process.env.NODE_ENV === "production")
        await enableWebPush();
    })
    .catch(() => undefined)
    .finally(() => {
      permissionRequest = null;
    });
  return permissionRequest;
}

export async function refreshWebPush() {
  if (
    !supportsWebPush() ||
    Notification.permission !== "granted" ||
    process.env.NODE_ENV !== "production"
  )
    return;
  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) await registerWebPush(subscription);
}
