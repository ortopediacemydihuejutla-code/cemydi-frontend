"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Mail } from "lucide-react";
import toast from "react-hot-toast";
import {
  AccountActionLayout,
  accountInputClassName,
  accountLabelClassName,
  accountPrimaryButtonClassName,
  accountTextLinkClassName,
} from "@/components/auth/account-action-layout";
import { requestPasswordReset } from "@/services/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!correo.trim()) return "Ingresa tu correo electrónico";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      return "Revisa el formato del correo";
    }
    return "";
  }, [correo]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setSubmitError(null);

    if (emailError) return;

    try {
      setLoading(true);
      const normalizedEmail = correo.trim().toLowerCase();
      const result = await requestPasswordReset(normalizedEmail);
      sessionStorage.setItem("recovery_email", normalizedEmail);
      toast.success(result.message);
      router.push(
        `/reset-password?correo=${encodeURIComponent(normalizedEmail)}`,
      );
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No pudimos procesar la solicitud. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountActionLayout
      eyebrow="Recuperación de acceso"
      asideTitle="Vuelve a tu cuenta con tranquilidad."
      asideDescription="Te guiaremos en dos pasos breves para confirmar tu identidad y crear una contraseña nueva."
      asideItems={[
        "Código temporal enviado por correo",
        "Respuesta privada para proteger tu cuenta",
        "Cierre automático de sesiones anteriores",
      ]}
    >
      <div>
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[#20636d]">
          Paso 1 de 2
        </p>
        <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[2.25rem]">
          Recupera tu contraseña
        </h1>
        <p className="mt-3 max-w-[430px] text-[15px] leading-7 text-slate-600">
          Escribe el correo asociado a tu cuenta. Si está registrado, recibirás
          un código para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
        {submitError ? (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 border-l-2 border-red-400 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="m-0 leading-6">{submitError}</p>
          </div>
        ) : null}

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
            name="correo"
            type="email"
            autoComplete="email"
            value={correo}
            onChange={(event) => {
              setCorreo(event.target.value);
              setSubmitError(null);
            }}
            placeholder="nombre@correo.com"
            disabled={loading}
            aria-invalid={Boolean(submitAttempted && emailError)}
            aria-describedby={
              submitAttempted && emailError ? "correo-error" : undefined
            }
            className={`${accountInputClassName} pl-10 ${
              submitAttempted && emailError
                ? "border-red-400 bg-red-50/40 focus:border-red-500"
                : ""
            }`}
          />
        </div>
        {submitAttempted && emailError ? (
          <p
            id="correo-error"
            role="alert"
            className="mt-2 text-xs font-medium text-red-600"
          >
            {emailError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={`${accountPrimaryButtonClassName} mt-6`}
        >
          {loading ? "Enviando instrucciones..." : "Enviar código"}
          {!loading ? <ArrowRight className="size-4" aria-hidden /> : null}
        </button>
      </form>

      <p className="mt-5 text-[13px] leading-6 text-slate-500">
        Mostramos la misma respuesta para todos los correos, así nadie puede
        saber qué cuentas existen.
      </p>

      <div className="mt-7 border-t border-slate-200 pt-5">
        <Link href="/login" className={accountTextLinkClassName}>
          <ArrowLeft className="size-4" aria-hidden />
          Volver a iniciar sesión
        </Link>
      </div>
    </AccountActionLayout>
  );
}
