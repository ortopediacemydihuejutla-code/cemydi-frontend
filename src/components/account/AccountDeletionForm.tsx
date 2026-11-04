"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthContext";
import { logoutUser } from "@/services/auth";
import {
  confirmAccountDeletion,
  requestAccountDeletion,
  type AccountDeletionReceipt,
} from "@/services/account-deletion";

export function AccountDeletionForm() {
  const { user, logout } = useAuth();
  const currentEmail = useRef(user?.correo);
  useEffect(() => {
    currentEmail.current = user?.correo;
  }, [user?.correo]);
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now);
  const [receipt, setReceipt] = useState<AccountDeletionReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(true);
  const lock = useRef(false);
  const codeInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (resendAt !== null) codeInput.current?.focus();
  }, [resendAt]);
  const wait =
    resendAt === null ? 0 : Math.max(0, Math.ceil((resendAt - now) / 1000));
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !online) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const email = correo.trim().toLowerCase();
      if (resendAt === null) {
        const result = await requestAccountDeletion(email);
        setCorreo(email);
        setCodigo("");
        setResendAt(Date.parse(result.resendAt));
      } else {
        const result = await confirmAccountDeletion(email, codigo);
        setCodigo("");
        setReceipt(result);
        if (
          result.status !== "WAITING_OBLIGATIONS" &&
          currentEmail.current?.toLowerCase() === email
        ) {
          await logoutUser().catch(() => undefined);
          logout();
        }
      }
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.status === 400
          ? "El código es inválido o expiró. Solicita uno nuevo."
          : cause instanceof ApiError && cause.status === 429
            ? "Demasiados intentos. Espera antes de continuar."
            : "No pudimos completar la solicitud. Revisa tu conexión e intenta de nuevo.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function resend() {
    if (wait || lock.current || !online) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await requestAccountDeletion(correo);
      setCodigo("");
      setResendAt(Date.parse(result.resendAt));
    } catch {
      setError("No pudimos reenviar el código. Intenta más tarde.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (receipt)
    return (
      <section className="space-y-4" aria-live="polite">
        <h2 className="text-xl font-semibold">Solicitud registrada</h2>
        <p>{receipt.message}</p>
        <p className="break-all text-sm text-muted-foreground">
          Referencia: {receipt.id}
        </p>
        <Link
          href={receipt.status === "WAITING_OBLIGATIONS" ? "/mis-rentas" : "/"}
          className="inline-flex min-h-11 items-center text-primary underline"
        >
          {receipt.status === "WAITING_OBLIGATIONS"
            ? "Consultar mis rentas"
            : "Volver al inicio"}
        </Link>
      </section>
    );
  return (
    <form onSubmit={submit} className="space-y-5" aria-busy={busy}>
      <div className="space-y-2">
        <label htmlFor="deletion-email" className="font-semibold">
          Correo de la cuenta
        </label>
        <Input
          id="deletion-email"
          type="email"
          autoComplete="email"
          required
          maxLength={120}
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          disabled={busy || resendAt !== null}
        />
      </div>
      {resendAt !== null ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Si existe una cuenta de cliente verificada, recibirás un código.
            También funciona para cuentas creadas con Google.
          </p>
          <label htmlFor="deletion-code" className="font-semibold">
            Código de ocho dígitos
          </label>
          <Input
            ref={codeInput}
            id="deletion-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{8}"
            required
            maxLength={8}
            value={codigo}
            onChange={(event) =>
              setCodigo(event.target.value.replace(/\D/g, "").slice(0, 8))
            }
            disabled={busy}
          />
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy || !online || wait > 0}
            onClick={() => void resend()}
          >
            {wait ? `Reenviar en ${wait} s` : "Reenviar código"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={busy}
            onClick={() => {
              setResendAt(null);
              setCodigo("");
            }}
          >
            Cambiar correo
          </Button>
        </div>
      ) : null}
      <p className="text-sm leading-6 text-muted-foreground">
        Al confirmar con el código solicitas la eliminación definitiva de tu
        cuenta y los datos descritos en esta página.
      </p>
      <Button
        type="submit"
        variant="destructive"
        className="min-h-11 whitespace-normal"
        disabled={busy || !online || (resendAt !== null && codigo.length !== 8)}
      >
        {busy
          ? "Procesando…"
          : resendAt === null
            ? "Enviar código de confirmación"
            : "Confirmar eliminación definitiva"}
      </Button>
      {!online ? (
        <p role="status">Conéctate para enviar la solicitud.</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}
