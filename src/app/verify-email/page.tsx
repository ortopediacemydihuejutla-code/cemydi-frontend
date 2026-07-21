"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  RotateCcw,
} from "lucide-react";
import {
  AccountActionLayout,
  accountInputClassName,
  accountLabelClassName,
  accountPrimaryButtonClassName,
  accountSecondaryButtonClassName,
  accountTextLinkClassName,
} from "@/components/auth/account-action-layout";
import {
  confirmEmailVerification,
  resendVerificationEmail,
} from "@/services/auth";

const RESEND_COOLDOWN_SECONDS = 60;

type VerificationStatus = "idle" | "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const initialEmail = searchParams.get("correo")?.trim() ?? "";

  const [correo, setCorreo] = useState(initialEmail);
  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "idle",
  );
  const [loadingResend, setLoadingResend] = useState(false);
  const [resendAttempted, setResendAttempted] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const emailError = useMemo(() => {
    if (!correo.trim()) return "Ingresa el correo de tu cuenta";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      return "Revisa el formato del correo";
    }
    return "";
  }, [correo]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const confirm = async () => {
      try {
        await confirmEmailVerification(token);
        if (!cancelled) setStatus("success");
      } catch {
        if (!cancelled) setStatus("error");
      }
    };

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((current) => Math.max(0, current - 1)),
      1_000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResendAttempted(true);
    setResendFeedback(null);

    if (emailError || cooldown > 0) return;

    try {
      setLoadingResend(true);
      const result = await resendVerificationEmail(correo.trim().toLowerCase());
      setResendFeedback(result.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setResendFeedback(
        "No pudimos procesar el reenvío en este momento. Intenta más tarde.",
      );
    } finally {
      setLoadingResend(false);
    }
  };

  const stateCopy = {
    loading: {
      eyebrow: "Validando enlace",
      title: "Estamos confirmando tu correo",
      description:
        "Esto suele tomar sólo unos segundos. Mantén esta ventana abierta.",
    },
    success: {
      eyebrow: "Cuenta confirmada",
      title: "Tu correo quedó verificado",
      description:
        "Ya puedes iniciar sesión y utilizar las funciones privadas de CEMYDI.",
    },
    error: {
      eyebrow: "Enlace no disponible",
      title: "No pudimos verificar el correo",
      description:
        "El enlace puede haber vencido o ya fue utilizado. Solicita uno nuevo para continuar.",
    },
    idle: {
      eyebrow: "Revisa tu bandeja",
      title: "Confirma tu correo electrónico",
      description:
        "Enviamos un enlace a la dirección que usaste al registrarte. También revisa spam o correo no deseado.",
    },
  }[status];

  return (
    <AccountActionLayout
      eyebrow="Activación de cuenta"
      asideTitle="Un último paso para proteger tu cuenta."
      asideDescription="La confirmación de correo evita accesos no autorizados y mantiene tus datos asociados a la dirección correcta."
      asideItems={[
        "Enlace personal de un solo uso",
        "Vigencia limitada por seguridad",
        "Acceso habilitado al confirmar",
      ]}
    >
      <div aria-live="polite">
        <div className="mb-6 flex items-center gap-3">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${
              status === "success"
                ? "bg-emerald-50 text-emerald-700"
                : status === "error"
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-[#20636d]"
            }`}
          >
            {status === "loading" ? (
              <LoaderCircle className="size-5 animate-spin" aria-hidden />
            ) : status === "success" ? (
              <CheckCircle2 className="size-5" aria-hidden />
            ) : status === "error" ? (
              <AlertCircle className="size-5" aria-hidden />
            ) : (
              <Mail className="size-5" aria-hidden />
            )}
          </span>
          <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[#20636d]">
            {stateCopy.eyebrow}
          </p>
        </div>

        <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[2.25rem]">
          {stateCopy.title}
        </h1>
        <p className="mt-3 text-[15px] leading-7 text-slate-600">
          {stateCopy.description}
        </p>
      </div>

      {status === "loading" ? (
        <div
          className="mt-8 h-1.5 overflow-hidden rounded-full bg-slate-100"
          aria-hidden
        >
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#20636d]" />
        </div>
      ) : null}

      {status === "success" ? (
        <Link
          href="/login"
          className={`${accountPrimaryButtonClassName} mt-8 no-underline`}
        >
          Ir a iniciar sesión
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}

      {status === "idle" || status === "error" ? (
        <form
          onSubmit={handleResend}
          noValidate
          className="mt-8 border-t border-slate-200 pt-6"
        >
          <h2 className="text-base font-semibold text-slate-900">
            ¿Necesitas otro enlace?
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Escríbenos el correo de la cuenta y enviaremos nuevas instrucciones
            si corresponde.
          </p>

          <div className="mt-5">
            <label htmlFor="correo" className={accountLabelClassName}>
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="correo"
                type="email"
                autoComplete="email"
                value={correo}
                onChange={(event) => {
                  setCorreo(event.target.value);
                  setResendFeedback(null);
                }}
                placeholder="nombre@correo.com"
                disabled={loadingResend}
                aria-invalid={Boolean(resendAttempted && emailError)}
                aria-describedby={
                  resendAttempted && emailError
                    ? "resend-email-error"
                    : undefined
                }
                className={`${accountInputClassName} pl-10 ${
                  resendAttempted && emailError
                    ? "border-red-400 bg-red-50/40"
                    : ""
                }`}
              />
            </div>
            {resendAttempted && emailError ? (
              <p
                id="resend-email-error"
                role="alert"
                className="mt-2 text-xs font-medium text-red-600"
              >
                {emailError}
              </p>
            ) : null}
          </div>

          {resendFeedback ? (
            <p className="mt-4 flex items-start gap-2 text-[13px] leading-6 text-slate-600">
              <CheckCircle2
                className="mt-1 size-3.5 shrink-0 text-[#20636d]"
                aria-hidden
              />
              {resendFeedback}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loadingResend || cooldown > 0}
            className={`${accountSecondaryButtonClassName} mt-5 w-full`}
          >
            <RotateCcw className="size-4" aria-hidden />
            {loadingResend
              ? "Procesando..."
              : cooldown > 0
                ? `Podrás reenviar en ${cooldown}s`
                : "Reenviar enlace"}
          </button>
        </form>
      ) : null}

      <div className="mt-7 border-t border-slate-200 pt-5">
        <Link href="/login" className={accountTextLinkClassName}>
          <ArrowLeft className="size-4" aria-hidden />
          Volver a iniciar sesión
        </Link>
      </div>
    </AccountActionLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<section className="min-h-[calc(100dvh-80px)] bg-[#f4f1eb]" />}
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
