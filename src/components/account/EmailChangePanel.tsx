"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { logoutUser } from "@/services/auth";
import {
  confirmEmailChange,
  requestEmailChange,
  resendEmailChange,
} from "@/services/users";
import { useAuth } from "@/providers/AuthContext";
import { accountInputClassName } from "./AccountPageHeader";

function safeError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Espera antes de solicitar o verificar otro código.";
    if (error.status === 409) return "No se pudo usar ese correo. Prueba con otro.";
    if (error.status === 401) return "No pudimos confirmar tu identidad.";
    if (error.status === 400) return "Los datos o el código son inválidos o expiraron.";
  }
  return "No pudimos completar el cambio. Intenta de nuevo.";
}

export function EmailChangePanel({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (resendAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (cause) {
      setError(safeError(cause));
    } finally {
      setBusy(false);
    }
  }

  const request = () => void run(async () => {
    const correo = newEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo === currentEmail.toLowerCase()) {
      setError("Ingresa un correo válido y diferente al actual.");
      return;
    }
    if (!currentPassword) {
      setError("Ingresa tu contraseña actual.");
      return;
    }
    const challenge = await requestEmailChange(correo, currentPassword);
    setNewEmail(correo);
    setCurrentPassword("");
    setCodigo("");
    setResendAt(Date.parse(challenge.resendAt));
  });
  const resend = () => void run(async () => {
    const challenge = await resendEmailChange();
    setCodigo("");
    setResendAt(Date.parse(challenge.resendAt));
    toast.success("Enviamos un código nuevo.");
  });
  const confirm = () => void run(async () => {
    if (!/^\d{8}$/.test(codigo)) {
      setError("Ingresa los ocho dígitos del código.");
      return;
    }
    await confirmEmailChange(newEmail, codigo);
    await logoutUser().catch(() => undefined);
    logout();
    toast.success("Correo actualizado. Inicia sesión nuevamente.");
    router.replace("/login");
  });

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-[#0f3d3b]">Cambiar correo electrónico</p>
      <p className="text-sm text-[#5e7472]">
        Tu correo actual seguirá vigente hasta confirmar un código enviado al nuevo correo.
      </p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="rounded-xl border border-[#cfdedd] px-4 py-2 text-sm font-semibold text-[#1f6a67]">
          Cambiar correo con código
        </button>
      ) : resendAt === null ? (
        <div className="space-y-3">
          <label className="grid gap-2 text-sm font-semibold text-[#0f3d3b]">
            Nuevo correo
            <input type="email" autoComplete="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} maxLength={120} disabled={busy} className={accountInputClassName} />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#0f3d3b]">
            Contraseña actual
            <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={busy} className={accountInputClassName} />
          </label>
          <button type="button" disabled={busy} onClick={request} className="rounded-xl bg-[#1f6a67] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Enviando..." : "Enviar código"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#5e7472]">Código enviado a {newEmail}</p>
          <label className="grid gap-2 text-sm font-semibold text-[#0f3d3b]">
            Código de ocho dígitos
            <input inputMode="numeric" autoComplete="one-time-code" value={codigo} onChange={(event) => setCodigo(event.target.value.replace(/\D/g, "").slice(0, 8))} maxLength={8} disabled={busy} className={accountInputClassName} />
          </label>
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={busy || codigo.length !== 8} onClick={confirm} className="rounded-xl bg-[#1f6a67] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
              {busy ? "Confirmando..." : "Confirmar correo"}
            </button>
            <button type="button" disabled={busy || now < resendAt} onClick={resend} className="rounded-xl border border-[#cfdedd] px-4 py-2 text-sm font-semibold text-[#1f6a67] disabled:opacity-60">
              {now < resendAt ? `Reenviar en ${Math.ceil((resendAt - now) / 1000)}s` : "Reenviar código"}
            </button>
          </div>
        </div>
      )}
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
