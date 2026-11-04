"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Smartphone } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from "@/services/notifications";
import { enableWebPush, refreshWebPush, supportsWebPush } from "@/lib/pwa/push";
import type { NotificationPreferences } from "@/lib/schemas/notifications";

const rows: {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}[] = [
  {
    key: "pushEnabled",
    label: "Recibir notificaciones push",
    description: "Activa o desactiva los avisos en todos tus dispositivos.",
  },
  {
    key: "system",
    label: "Sistema y seguridad",
    description:
      "Comunicados, revisión de reseñas y cambios de seguridad de tu cuenta.",
  },
  {
    key: "offers",
    label: "Ofertas",
    description: "Promociones y novedades de CEMYDI.",
  },
  {
    key: "rentals",
    label: "Rentas",
    description: "Estados de solicitudes y revisión de recetas.",
  },
];
export function NotificationPreferencesForm() {
  const { user } = useAuth();
  return user?.rol === "CLIENT" ? <PreferencesForm key={user.id} /> : null;
}
function PreferencesForm() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [browserStatus, setBrowserStatus] = useState("");
  const busy = useRef(false),
    mounted = useRef(true),
    revision = useRef(0);
  const load = useCallback(async () => {
    if (busy.current) return;
    const expected = revision.current;
    try {
      const result = await getNotificationPreferences();
      if (mounted.current && !busy.current && expected === revision.current) {
        setPreferences(result.preferences);
        setError("");
      }
    } catch {
      if (mounted.current && !busy.current && expected === revision.current)
        setError("No pudimos cargar tus preferencias.");
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    const update = () => {
      setBrowserStatus(
        !supportsWebPush()
          ? "Este navegador no admite push. En iPhone, instala CEMYDI en la pantalla de inicio."
          : Notification.permission === "denied"
            ? "Los permisos están bloqueados. Puedes cambiarlos en los ajustes del navegador."
            : Notification.permission === "granted"
              ? "Este navegador tiene permiso para recibir notificaciones."
              : "Activa este navegador para recibir avisos fuera de CEMYDI.",
      );
      void load();
    };
    const visible = () => {
      if (document.visibilityState === "visible") update();
    };
    update();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine)
        void load();
    }, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", visible);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load]);
  const change = async (
    key: keyof NotificationPreferences,
    checked: boolean,
  ) => {
    if (!preferences || busy.current) return;
    const previous = preferences,
      next = { ...previous, [key]: checked };
    busy.current = true;
    revision.current += 1;
    setSaving(true);
    setPreferences(next);
    try {
      const result = await saveNotificationPreferences(next);
      if (mounted.current) setPreferences(result.preferences);
    } catch {
      if (mounted.current) {
        setPreferences(previous);
        toast.error("No pudimos guardar el cambio. Intenta de nuevo.");
      }
    } finally {
      busy.current = false;
      if (mounted.current) setSaving(false);
    }
  };
  return (
    <section
      className="max-w-3xl py-8"
      aria-labelledby="notification-preferences-heading"
    >
      <div className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-[#e9f5f3] text-[#207a77]">
        <Bell className="size-6" aria-hidden />
      </div>
      <h2
        id="notification-preferences-heading"
        className="text-2xl font-semibold tracking-tight text-[#17333f]"
      >
        Tú eliges qué recibir
      </h2>
      {error && (
        <div role="alert" className="mt-4 text-sm text-red-700">
          {error}
          <Button variant="outline" onClick={() => void load()}>
            Reintentar
          </Button>
        </div>
      )}
      {!preferences && !error && (
        <p role="status" className="py-5">
          Cargando preferencias…
        </p>
      )}
      {preferences && (
        <fieldset
          disabled={saving || enabling}
          aria-busy={saving}
          className="mt-5 rounded-2xl bg-[#f8fafb] px-5 sm:px-6"
        >
          <legend className="sr-only">Preferencias de notificaciones</legend>
          {rows.map((row) => (
            <label
              key={row.key}
              className="flex min-h-20 cursor-pointer items-center justify-between gap-5 py-4"
            >
              <span>
                <span className="block text-sm font-semibold text-[#17333f]">
                  {row.label}
                </span>
                <span className="mt-1 block max-w-md text-sm leading-5 text-[#607173]">
                  {row.description}
                </span>
              </span>
              <Switch
                label={row.label}
                checked={preferences[row.key]}
                disabled={
                  saving ||
                  enabling ||
                  (row.key !== "pushEnabled" && !preferences.pushEnabled)
                }
                onCheckedChange={(value) => void change(row.key, value)}
              />
            </label>
          ))}
        </fieldset>
      )}
      <div className="mt-6 space-y-3 border-t border-[#deebeb] pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#17333f]">
          <Smartphone className="size-5 text-[#207a77]" aria-hidden />
          En este navegador
        </h3>
        <p className="text-sm text-[#607173]">{browserStatus}</p>
        <Button
          type="button"
          variant="outline"
          disabled={enabling || saving || !preferences?.pushEnabled}
          onClick={async () => {
            setEnabling(true);
            try {
              await enableWebPush();
              if (mounted.current)
                toast.success(
                  "Este navegador está activado para recibir push.",
                );
            } catch (failure) {
              if (mounted.current)
                toast.error(
                  failure instanceof Error
                    ? failure.message
                    : "No se pudo activar este navegador.",
                );
            } finally {
              if (mounted.current) setEnabling(false);
            }
          }}
        >
          {enabling ? "Activando…" : "Activar en este navegador"}
        </Button>
      </div>
    </section>
  );
}
export function WebPushSessionSync() {
  const { user } = useAuth();
  useEffect(() => {
    if (user?.rol !== "CLIENT") return;
    const refresh = () => {
      if (document.visibilityState === "visible")
        void refreshWebPush().catch(() => undefined);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [user?.id, user?.rol]);
  return null;
}
