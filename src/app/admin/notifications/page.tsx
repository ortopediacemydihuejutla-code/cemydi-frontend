"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Send } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/features/admin/components/page-header";
import { ConfirmDialog } from "@/features/admin/components/confirm-dialog";
import { Button } from "@/features/admin/components/ui/button";
import { Input } from "@/features/admin/components/ui/input";
import {
  campaignPayloadSchema,
  type CampaignPayload,
} from "@/lib/schemas/notifications";
import {
  findNotificationDestinations,
  findNotificationRecipients,
  getCampaignHistory,
  getNotificationAutomation,
  saveNotificationAutomation,
  sendCampaign,
} from "@/services/admin/notification-campaigns";

type Tab = "create" | "history" | "automatic";
const tabs: { id: Tab; label: string }[] = [
  { id: "create", label: "Crear envío" },
  { id: "history", label: "Historial" },
  { id: "automatic", label: "Automáticas" },
];
const categoryLabels = {
  SYSTEM: "Sistema",
  OFFER: "Ofertas",
  RENTAL: "Rentas",
};
const field =
  "w-full rounded-lg border border-[var(--border-soft)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text-main)]";
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo completar la operación.";

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<Tab>("create");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        subtitle="Envía avisos a tus clientes y controla las notificaciones automáticas."
      />
      <div
        role="tablist"
        aria-label="Gestión de notificaciones"
        className="flex gap-1 overflow-x-auto border-b border-[var(--border-soft)]"
      >
        {tabs.map((item, index) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={tab === item.id ? 0 : -1}
            className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold ${tab === item.id ? "border-[var(--brand-600)] text-[var(--brand-800)]" : "border-transparent text-[var(--text-muted)]"}`}
            onClick={() => setTab(item.id)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % tabs.length
                  : event.key === "ArrowLeft"
                    ? (index + tabs.length - 1) % tabs.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : null;
              if (next !== null) {
                event.preventDefault();
                setTab(tabs[next].id);
                document.getElementById(`tab-${tabs[next].id}`)?.focus();
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <section
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        {tab === "create" ? (
          <CreateNotification />
        ) : tab === "history" ? (
          <CampaignHistory />
        ) : (
          <AutomaticNotifications />
        )}
      </section>
    </div>
  );
}

function CreateNotification() {
  const client = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] =
    useState<CampaignPayload["category"]>("SYSTEM");
  const [audience, setAudience] = useState<CampaignPayload["audience"]>("ALL");
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [destinationType, setDestinationType] =
    useState<CampaignPayload["destinationType"]>("NONE");
  const [destinationId, setDestinationId] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [confirmation, setConfirmation] = useState<CampaignPayload | null>(
    null,
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<{ content: string; id: string } | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    const timer = setTimeout(() => setDestinationQuery(destinationSearch), 300);
    return () => clearTimeout(timer);
  }, [destinationSearch]);
  const recipients = useQuery({
    queryKey: ["admin", "notification-recipients", debounced],
    queryFn: () => findNotificationRecipients(debounced),
    enabled: audience === "SELECTED",
  });
  const userIds = Object.keys(selected).map(Number);
  const rentalUser =
    audience === "SELECTED" && userIds.length === 1 ? userIds[0] : undefined;
  const destinations = useQuery({
    queryKey: [
      "admin",
      "notification-destinations",
      destinationType,
      destinationQuery,
      rentalUser,
    ],
    queryFn: () =>
      findNotificationDestinations(
        destinationType,
        destinationQuery,
        rentalUser,
      ),
    enabled:
      ["PRODUCT", "PROMOTION", "RENTAL"].includes(destinationType) &&
      (destinationType !== "RENTAL" || !!rentalUser),
  });
  const preview = (event: React.FormEvent) => {
    event.preventDefault();
    const value = {
      title,
      body,
      category,
      audience,
      destinationType,
      ...(audience === "SELECTED" ? { userIds } : {}),
      ...(["PRODUCT", "PROMOTION", "RENTAL"].includes(destinationType)
        ? { destinationId }
        : {}),
    };
    const content = JSON.stringify(value);
    if (request.current?.content !== content)
      request.current = { content, id: crypto.randomUUID() };
    const parsed = campaignPayloadSchema.safeParse({
      ...value,
      requestId: request.current.id,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError("");
    setConfirmation(parsed.data);
  };
  const send = async () => {
    if (!confirmation || lock.current) return;
    lock.current = true;
    setSending(true);
    try {
      const result = await sendCampaign(confirmation);
      setConfirmation(null);
      setTitle("");
      setBody("");
      request.current = null;
      await client.invalidateQueries({
        queryKey: ["admin", "notification-campaigns"],
      });
      toast.success(result.message);
    } catch (failure) {
      toast.error(errorMessage(failure));
    } finally {
      lock.current = false;
      setSending(false);
    }
  };
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={preview} className="space-y-5" aria-busy={sending}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Categoría
            <select
              className={field}
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as CampaignPayload["category"])
              }
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Destinatarios
            <select
              className={field}
              value={audience}
              onChange={(e) => {
                setAudience(e.target.value as CampaignPayload["audience"]);
                if (destinationType === "RENTAL") {
                  setDestinationType("NONE");
                  setDestinationId("");
                }
              }}
            >
              <option value="ALL">Todos los clientes registrados</option>
              <option value="SELECTED">Seleccionar clientes</option>
            </select>
          </label>
        </div>
        {audience === "SELECTED" && (
          <fieldset className="space-y-3 rounded-xl border border-[var(--border-soft)] p-4">
            <legend className="px-1 text-sm font-semibold">
              Clientes destinatarios ({userIds.length})
            </legend>
            <Input
              aria-label="Buscar clientes por nombre o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo"
            />
            {userIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {userIds.map((id) => (
                  <Button
                    key={id}
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Quitar a ${selected[id]}`}
                    onClick={() => {
                      setSelected((current) => {
                        const next = { ...current };
                        delete next[id];
                        return next;
                      });
                      setDestinationId("");
                    }}
                  >
                    {selected[id]} ×
                  </Button>
                ))}
              </div>
            )}
            {recipients.isPending ? (
              <p role="status">Buscando clientes…</p>
            ) : recipients.isError ? (
              <div role="alert">
                <p>No pudimos cargar los clientes.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void recipients.refetch()}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className="max-h-52 overflow-y-auto">
                {recipients.data?.users.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)]">
                    No hay clientes que coincidan.
                  </p>
                )}
                {recipients.data?.users.map((user) => (
                  <label
                    key={user.id}
                    className="flex min-h-11 items-center gap-3 border-b border-[var(--border-soft)] py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={user.id in selected}
                      disabled={!(user.id in selected) && userIds.length >= 500}
                      onChange={(event) => {
                        setSelected((current) => {
                          const next = { ...current };
                          if (event.target.checked) next[user.id] = user.nombre;
                          else delete next[user.id];
                          return next;
                        });
                        setDestinationId("");
                      }}
                    />
                    <span>
                      {user.nombre}
                      <span className="block text-xs text-[var(--text-muted)]">
                        {user.correo}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              Se muestran hasta 50 coincidencias. Puedes seleccionar hasta 500
              clientes.
            </p>
          </fieldset>
        )}
        <label className="block space-y-2 text-sm font-medium">
          Título
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={3}
            maxLength={100}
            required
            placeholder="Ej. Novedades para tu bienestar"
          />
        </label>
        <label className="block space-y-2 text-sm font-medium">
          Mensaje
          <textarea
            className={`${field} min-h-32 resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            minLength={3}
            maxLength={500}
            required
            placeholder="Escribe el aviso que recibirán tus clientes"
          />
          <span className="block text-right text-xs text-[var(--text-muted)]">
            {body.length}/500
          </span>
        </label>
        <label className="block space-y-2 text-sm font-medium">
          Al tocar la notificación
          <select
            className={field}
            value={destinationType}
            onChange={(e) => {
              setDestinationType(
                e.target.value as CampaignPayload["destinationType"],
              );
              setDestinationId("");
              setDestinationSearch("");
            }}
          >
            <option value="NONE">Ver el mensaje</option>
            <option value="PRODUCT">Abrir un producto</option>
            <option value="PROMOTION">Ver una promoción</option>
            <option value="ACCOUNT">Abrir configuración de la cuenta</option>
            <option value="RENTAL" disabled={!rentalUser}>
              Abrir una renta (selecciona un solo cliente)
            </option>
          </select>
        </label>
        {["PRODUCT", "PROMOTION", "RENTAL"].includes(destinationType) && (
          <div className="space-y-2">
            <Input
              aria-label="Buscar destino"
              placeholder="Buscar destino"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
            />
            <label className="block space-y-2 text-sm font-medium">
              Destino
              <select
                className={field}
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                required
              >
                <option value="">
                  {destinations.isFetching
                    ? "Buscando…"
                    : "Seleccionar destino"}
                </option>
                {destinations.data?.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            {destinations.isError && (
              <div role="alert">
                <p>No se pudieron cargar los destinos.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void destinations.refetch()}
                >
                  Reintentar
                </Button>
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-[var(--text-muted)]">
          El aviso quedará en la bandeja de cada destinatario. El push se
          enviará a sus dispositivos habilitados según sus preferencias.
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" disabled={sending}>
          <Send className="size-4" aria-hidden />
          Revisar y enviar
        </Button>
      </form>
      <aside className="space-y-3 xl:pt-1">
        <h2 className="text-sm font-semibold">Vista previa</h2>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Bell className="size-4" aria-hidden />
            CEMYDI · {categoryLabels[category]}
          </div>
          <h3 className="break-words font-semibold">
            {title || "Título de la notificación"}
          </h3>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--text-muted)]">
            {body || "Tu mensaje aparecerá aquí."}
          </p>
        </div>
      </aside>
      <ConfirmDialog
        open={confirmation !== null}
        title="¿Enviar esta notificación ahora?"
        description={
          confirmation
            ? `${confirmation.title}. Destinatarios: ${confirmation.audience === "ALL" ? "todos los clientes registrados y activos" : `${confirmation.userIds?.length} ${confirmation.userIds?.length === 1 ? "cliente seleccionado" : "clientes seleccionados"}`}. El envío no se puede retirar.`
            : ""
        }
        confirmLabel="Enviar ahora"
        busy={sending}
        onConfirm={send}
        onCancel={() => setConfirmation(null)}
      />
    </div>
  );
}

function CampaignHistory() {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin", "notification-campaigns", page],
    queryFn: () => getCampaignHistory(page),
    refetchInterval: 15000,
  });
  if (query.isPending) return <p role="status">Cargando historial…</p>;
  if (query.isError)
    return (
      <div role="alert">
        <p>No pudimos cargar el historial.</p>
        <Button onClick={() => void query.refetch()}>Reintentar</Button>
      </div>
    );
  const sources = {
    MANUAL: "Envío manual",
    RENTAL_STATUS: "Estado de renta",
    REVIEW_STATUS: "Moderación de reseña",
    PRESCRIPTION: "Revisión de receta",
    SECURITY: "Seguridad de la cuenta",
  };
  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--text-muted)]">
        Los resultados push cuentan dispositivos. «Aceptados» confirma la
        recepción del proveedor; «Confirmados» indica que el servicio móvil
        confirmó el envío al dispositivo. La lectura del aviso se registra por
        separado.
      </p>
      {query.data.items.length === 0 ? (
        <p className="py-10 text-center text-[var(--text-muted)]">
          Aún no hay notificaciones enviadas.
        </p>
      ) : (
        <div className="divide-y divide-[var(--border-soft)]">
          {query.data.items.map((item) => (
            <article key={item.id} className="space-y-2 py-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {categoryLabels[item.category]} · {sources[item.source]}
                  </p>
                  <h2 className="mt-1 break-words font-semibold">
                    {item.title}
                  </h2>
                </div>
                <time
                  className="text-xs text-[var(--text-muted)]"
                  dateTime={item.createdAt}
                >
                  {new Date(item.createdAt).toLocaleString("es-MX", {
                    timeZone: "America/Mexico_City",
                  })}
                </time>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm text-[var(--text-muted)]">
                {item.body}
              </p>
              <dl className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
                {[
                  ["En bandeja", item.recipientCount],
                  ["Pendientes", item.pushes.PENDING],
                  ["Aceptados", item.pushes.ACCEPTED],
                  ["Confirmados", item.pushes.DELIVERED],
                  ["Fallidos", item.pushes.FAILED],
                  ["Omitidos", item.pushes.SKIPPED],
                ].map(([label, count]) => (
                  <div key={label}>
                    <dt className="text-[var(--text-muted)]">{label}</dt>
                    <dd className="mt-1 font-semibold">{count}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((value) => value - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm">Página {page}</span>
        <Button
          variant="outline"
          disabled={page * query.data.pageSize >= query.data.total}
          onClick={() => setPage((value) => value + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

function AutomaticNotifications() {
  const query = useQuery({
    queryKey: ["admin", "notification-automation"],
    queryFn: getNotificationAutomation,
  });
  const client = useQueryClient();
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const rows = [
    [
      "rentalStatus",
      "Estados de renta",
      "Solicitud recibida, aprobación, rechazo, cancelación, entrega y devolución.",
    ],
    [
      "prescriptions",
      "Revisión de recetas",
      "Avisa cuando cambia el resultado de revisión de una receta.",
    ],
    [
      "security",
      "Seguridad de la cuenta",
      "Avisa sobre cambios de correo y contraseña.",
    ],
  ] as const;
  if (query.isPending) return <p role="status">Cargando configuración…</p>;
  if (query.isError)
    return (
      <div role="alert">
        <p>No pudimos cargar la configuración.</p>
        <Button onClick={() => void query.refetch()}>Reintentar</Button>
      </div>
    );
  return (
    <div className="max-w-3xl space-y-5">
      <p className="text-sm text-[var(--text-muted)]">
        Estos avisos se generan al confirmar cada cambio. Los clientes controlan
        qué categorías reciben por push.
      </p>
      {rows.map(([key, title, description]) => (
        <label
          key={key}
          className="flex min-h-20 items-center justify-between gap-5 border-b border-[var(--border-soft)] py-4"
        >
          <span>
            <span className="block font-semibold">{title}</span>
            <span className="mt-1 block text-sm text-[var(--text-muted)]">
              {description}
            </span>
          </span>
          <input
            type="checkbox"
            checked={query.data.settings[key]}
            disabled={saving}
            onChange={async (event) => {
              if (lock.current) return;
              lock.current = true;
              setSaving(true);
              try {
                const result = await saveNotificationAutomation({
                  ...query.data.settings,
                  [key]: event.target.checked,
                });
                client.setQueryData(
                  ["admin", "notification-automation"],
                  result,
                );
                toast.success("Configuración guardada.");
              } catch (error) {
                toast.error(errorMessage(error));
              } finally {
                lock.current = false;
                setSaving(false);
              }
            }}
          />
        </label>
      ))}
      <p className="text-xs text-[var(--text-muted)]">
        Los correos de seguridad existentes mantienen su funcionamiento.
      </p>
    </div>
  );
}
