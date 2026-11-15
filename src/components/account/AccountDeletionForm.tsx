"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleAlert } from "lucide-react";
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
  const emailInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const receiptHeading = useRef<HTMLHeadingElement>(null);
  const changingEmail = useRef(false);
  const confirming = resendAt !== null;

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
    else if (changingEmail.current) {
      emailInput.current?.focus();
      changingEmail.current = false;
    }
  }, [resendAt]);
  useEffect(() => {
    if (receipt) receiptHeading.current?.focus();
  }, [receipt]);
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
      <section className="space-y-4" aria-labelledby="deletion-receipt-title">
        <Check aria-hidden="true" className="size-7 text-(--brand-800)" />
        <h2
          id="deletion-receipt-title"
          ref={receiptHeading}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight"
        >
          Solicitud registrada
        </h2>
        <p className="leading-7 text-muted-foreground">{receipt.message}</p>
        <dl className="space-y-1 border-t border-border pt-4 text-sm">
          <dt className="font-semibold">Referencia</dt>
          <dd className="break-all text-muted-foreground">{receipt.id}</dd>
        </dl>
        <Button asChild variant="outline" className="min-h-11">
          <Link href={receipt.status === "WAITING_OBLIGATIONS" ? "/mis-rentas" : "/"}>
            {receipt.status === "WAITING_OBLIGATIONS"
              ? "Consultar mis rentas"
              : "Volver al inicio"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </section>
    );
  return (
    <form
      onSubmit={submit}
      className="space-y-6"
      aria-labelledby="deletion-form-title"
      aria-busy={busy}
    >
      <div className="space-y-2">
        <h2 id="deletion-form-title" className="text-2xl font-semibold tracking-tight">
          {confirming ? "Confirma la eliminación" : "Solicita la eliminación"}
        </h2>
        <p id="deletion-step-help" className="text-sm leading-6 text-muted-foreground">
          {confirming ? (
            <>
              Si hay una cuenta de cliente verificada asociada a{" "}
              <strong className="wrap-anywhere font-semibold text-foreground">{correo}</strong>,
              recibirás un código. Revisa también el correo no deseado.
            </>
          ) : (
            "Te enviaremos un código al correo verificado de tu cuenta. Si usas Google para iniciar sesión, escribe ese mismo correo."
          )}
        </p>
      </div>

      <ol aria-label="Pasos de la solicitud" className="grid grid-cols-2 gap-3 text-sm font-medium">
        <li
          aria-current={confirming ? undefined : "step"}
          className="border-t-2 border-(--brand-800) pt-2 text-(--brand-900)"
        >
          1. Correo
        </li>
        <li
          aria-current={confirming ? "step" : undefined}
          className="border-t-2 border-border pt-2 text-muted-foreground aria-[current=step]:border-(--brand-800) aria-[current=step]:text-(--brand-900)"
        >
          2. Confirmación
        </li>
      </ol>

      <div className="space-y-2">
        {confirming ? (
          <>
            <label htmlFor="deletion-code" className="block text-sm font-semibold">
              Código de ocho dígitos
            </label>
            <Input
              ref={codeInput}
              id="deletion-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-describedby="deletion-step-help"
              pattern="[0-9]{8}"
              required
              maxLength={8}
              value={codigo}
              onChange={(event) =>
                setCodigo(event.target.value.replace(/\D/g, "").slice(0, 8))
              }
              disabled={busy}
              className="border-muted-foreground/55 bg-card text-base tracking-widest tabular-nums"
            />
          </>
        ) : (
          <>
            <label htmlFor="deletion-email" className="block text-sm font-semibold">
              Correo de la cuenta
            </label>
            <Input
              ref={emailInput}
              id="deletion-email"
              type="email"
              autoComplete="email"
              aria-describedby="deletion-step-help"
              required
              maxLength={120}
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              disabled={busy}
              className="border-muted-foreground/55 bg-card text-base"
            />
          </>
        )}
      </div>

      <div className="space-y-3">
        {confirming && (
          <p className="flex items-start gap-2 text-sm leading-6 text-foreground">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
            Al confirmar solicitas la eliminación definitiva de tu cuenta y tus datos.
          </p>
        )}
        {!online && (
          <p role="status" className="text-sm leading-6 text-muted-foreground">
            Conéctate a internet para continuar.
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm font-medium leading-6 text-destructive">
            {error}
          </p>
        )}
        <Button
          type="submit"
          variant={confirming ? "destructive" : "default"}
          className={confirming
            ? "h-auto min-h-11 w-full whitespace-normal"
            : "h-auto min-h-11 w-full whitespace-normal bg-(--brand-900) hover:bg-(--brand-800)"}
          disabled={busy || !online || (confirming && codigo.length !== 8)}
        >
          {busy
            ? "Procesando…"
            : confirming
              ? "Confirmar eliminación definitiva"
              : "Enviar código de confirmación"}
          {!confirming && !busy && <ArrowRight aria-hidden="true" className="size-4" />}
        </Button>
        {confirming && (
          <div className="flex flex-wrap justify-between gap-x-3">
            <Button
              type="button"
              variant="link"
              className="min-h-11 px-0 text-(--brand-900)"
              disabled={busy}
              onClick={() => {
                changingEmail.current = true;
                setResendAt(null);
                setCodigo("");
                setError("");
              }}
            >
              Cambiar correo
            </Button>
            <Button
              type="button"
              variant="link"
              className="min-h-11 px-0 text-(--brand-900) tabular-nums"
              disabled={busy || !online || wait > 0}
              onClick={() => void resend()}
            >
              {wait ? `Reenviar en ${wait} s` : "Reenviar código"}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
