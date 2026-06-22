"use client";

import { History, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/features/admin/components/ui/badge";
import { Button } from "@/features/admin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/admin/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import {
  formatAuditReason,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  getInitialsFromName,
} from "./database-formatters";
import { InfoStat } from "./database-ui-components";
import type { DatabaseAdminState } from "./use-database-admin-state";

type DatabaseSecurityTabProps = {
  state: DatabaseAdminState;
};

export function DatabaseSecurityTab({ state }: DatabaseSecurityTabProps) {
  const {
    securitySummary,
    activeSessions,
    loginAuditItems,
    visibleActiveSessions,
    visibleLoginAuditItems,
    loadingAuthSecurityOverview,
    setAllSessionsOpen,
    setAllAuditOpen,
    allSessionsOpen,
    allAuditOpen,
  } = state;

  return (
    <>
        <section className="grid gap-6">
          <Card className="rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="text-base">Seguridad de acceso</CardTitle>
                <CardDescription>
                  Sesiones activas y actividad reciente de inicio de sesion.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSessions.length > 3 ? (
                  <Button type="button" variant="outline" onClick={() => setAllSessionsOpen(true)}>
                    Ver sesiones
                  </Button>
                ) : null}
                {loginAuditItems.length > 3 ? (
                  <Button type="button" variant="outline" onClick={() => setAllAuditOpen(true)}>
                    Ver historial
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <InfoStat
                icon={<Users className="size-4" />}
                label="Sesiones activas"
                value={formatNumber(
                  securitySummary?.activeSessions ?? activeSessions.length,
                )}
              />
              <InfoStat
                icon={<History className="size-4" />}
                label="Intentos recientes"
                value={formatNumber(securitySummary?.recentAttempts ?? 0)}
              />
              <InfoStat
                icon={<ShieldCheck className="size-4" />}
                label="Intentos fallidos"
                value={formatNumber(securitySummary?.failedAttempts ?? 0)}
              />
            </CardContent>
          </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-[var(--border-soft)] shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4 text-[var(--brand-700)]" />
                  Sesiones activas
                </CardTitle>
                <CardDescription>Usuarios conectados actualmente.</CardDescription>
              </div>
              <Badge variant="blue">
                {formatNumber(
                  securitySummary?.activeSessions ?? activeSessions.length,
                )}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-3">
              {loadingAuthSecurityOverview && visibleActiveSessions.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  Consultando sesiones...
                </p>
              ) : visibleActiveSessions.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No hay sesiones activas en este momento.
                </p>
              ) : (
                visibleActiveSessions.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] p-3"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-800),var(--brand-600))] text-sm font-bold text-white">
                      {getInitialsFromName(session.nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-[var(--text-main)]">
                          {session.nombre}
                        </strong>
                        <Badge variant="slate">
                          {session.rol === "ADMIN" ? "Admin" : "Cliente"}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-[var(--text-muted)]">
                        {session.correo}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Activa desde {formatDateTime(session.createdAt)} ·{" "}
                        {formatRelativeTime(session.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {activeSessions.length > 3 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setAllSessionsOpen(true)}
                >
                  Ver todas las sesiones ({activeSessions.length})
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-[var(--border-soft)]">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-[var(--brand-700)]" />
                  Seguridad y auditoría
                </CardTitle>
                <CardDescription>Últimos intentos de acceso</CardDescription>
              </div>
              <Badge
                variant={
                  (securitySummary?.failedAttempts ?? 0) > 0 ? "red" : "emerald"
                }
              >
                {formatNumber(securitySummary?.failedAttempts ?? 0)} fallidos
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-3">
              {loadingAuthSecurityOverview && visibleLoginAuditItems.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  Cargando auditoría...
                </p>
              ) : visibleLoginAuditItems.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  Sin eventos de inicio de sesión por el momento.
                </p>
              ) : (
                visibleLoginAuditItems.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="rounded-xl border border-[var(--border-soft)] bg-[var(--card)] p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <strong className="text-[var(--text-main)]">
                          {attempt.nombre}
                        </strong>
                        <p className="text-sm text-[var(--text-muted)]">
                          {attempt.correo}
                        </p>
                      </div>
                      <Badge variant={attempt.success ? "emerald" : "red"}>
                        {attempt.success ? "Éxito" : "Fallido"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-[var(--text-muted)]">
                      <span>{formatDateTime(attempt.attemptedAt)}</span>
                      <span>{formatAuditReason(attempt.reason)}</span>
                    </div>
                  </div>
                ))
              )}
              {loginAuditItems.length > 3 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setAllAuditOpen(true)}
                >
                  Ver todo el historial ({loginAuditItems.length})
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
        </section>

      <Dialog open={allSessionsOpen} onOpenChange={setAllSessionsOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Todas las sesiones activas</DialogTitle>
            <DialogDescription>
              Lista completa reportada por el servidor ({activeSessions.length}).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {activeSessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-3"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-800),var(--brand-600))] text-sm font-bold text-white">
                  {getInitialsFromName(session.nombre)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{session.nombre}</strong>
                    <Badge variant="slate">
                      {session.rol === "ADMIN" ? "Admin" : "Cliente"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-[var(--text-muted)]">{session.correo}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Activa desde {formatDateTime(session.createdAt)} ·{" "}
                    {formatRelativeTime(session.lastSeenAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAllSessionsOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={allAuditOpen} onOpenChange={setAllAuditOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historial de auditoría</DialogTitle>
            <DialogDescription>
              Todos los intentos recientes registrados ({loginAuditItems.length}).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {loginAuditItems.map((attempt) => (
              <div
                key={attempt.id}
                className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <strong>{attempt.nombre}</strong>
                    <p className="text-sm text-[var(--text-muted)]">{attempt.correo}</p>
                  </div>
                  <Badge variant={attempt.success ? "emerald" : "red"}>
                    {attempt.success ? "Éxito" : "Fallido"}
                  </Badge>
                </div>
                <div className="mt-2 flex justify-between gap-2 text-xs text-[var(--text-muted)]">
                  <span>{formatDateTime(attempt.attemptedAt)}</span>
                  <span>{formatAuditReason(attempt.reason)}</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAllAuditOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
