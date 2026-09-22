"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AccountActionLayout,
  accountInputClassName,
  accountLabelClassName,
  accountPrimaryButtonClassName,
  accountTextLinkClassName,
} from "@/components/auth/account-action-layout";
import {
  getPasswordRulesStatus,
  validatePasswordPolicy,
} from "@/lib/password-validation";
import {
  confirmPasswordReset,
  confirmPasswordResetToken,
  requestPasswordReset,
  verifyPasswordResetCode,
  verifyPasswordResetToken,
} from "@/services/auth";

const OTP_LENGTH = 8;
const RESEND_COOLDOWN_SECONDS = 60;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("correo")?.trim() ?? "";
  const tokenFromUrl = searchParams.get("token")?.trim() ?? "";

  const [correo, setCorreo] = useState(emailFromUrl);
  const [otpValues, setOtpValues] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifiedByLink, setVerifiedByLink] = useState(false);
  const [linkChecking, setLinkChecking] = useState(Boolean(tokenFromUrl));
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirm: false,
  });
  const [cooldown, setCooldown] = useState(0);
  const [verifyAttempted, setVerifyAttempted] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const codigo = otpValues.join("");
  const passwordRules = getPasswordRulesStatus(newPassword);

  useEffect(() => {
    if (emailFromUrl) return;
    const storedEmail = sessionStorage.getItem("recovery_email");
    if (storedEmail) setCorreo(storedEmail);
  }, [emailFromUrl]);

  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;

    const verifyLink = async () => {
      try {
        await verifyPasswordResetToken(tokenFromUrl);
        if (!cancelled) {
          setVerifiedByLink(true);
          setCodeVerified(true);
          setFormError(null);
        }
      } catch {
        if (!cancelled) {
          setVerifiedByLink(false);
          setCodeVerified(false);
          setFormError(
            "El enlace venció o ya fue utilizado. Ingresa el código recibido o solicita uno nuevo.",
          );
        }
      } finally {
        if (!cancelled) setLinkChecking(false);
      }
    };

    void verifyLink();
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(
      () => setCooldown((current) => Math.max(0, current - 1)),
      1_000,
    );
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const emailError = useMemo(() => {
    if (!correo.trim()) return "Ingresa tu correo electrónico";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      return "Revisa el formato del correo";
    }
    return "";
  }, [correo]);

  const codeError = useMemo(() => {
    if (codigo.length !== OTP_LENGTH)
      return "Completa los 8 dígitos del código";
    return "";
  }, [codigo]);

  const passwordError = useMemo(() => {
    if (!newPassword) return "Ingresa una contraseña nueva";
    const policyError = validatePasswordPolicy(newPassword);
    if (policyError) return policyError;
    if (!confirmPassword) return "Confirma la contraseña nueva";
    if (newPassword !== confirmPassword) return "Las contraseñas no coinciden";
    return "";
  }, [newPassword, confirmPassword]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextValues = [...otpValues];
    nextValues[index] = digit;
    setOtpValues(nextValues);
    setCodeVerified(false);
    setFormError(null);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!digits) return;
    event.preventDefault();
    const nextValues = Array.from(
      { length: OTP_LENGTH },
      (_, index) => digits[index] ?? "",
    );
    setOtpValues(nextValues);
    setCodeVerified(false);
    setFormError(null);
    inputRefs.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerifyAttempted(true);
    setFormError(null);
    if (emailError || codeError) return;

    try {
      setVerifying(true);
      await verifyPasswordResetCode({
        correo: correo.trim().toLowerCase(),
        codigo,
      });
      setVerifiedByLink(false);
      setCodeVerified(true);
    } catch {
      setCodeVerified(false);
      setFormError("El código es incorrecto, venció o ya fue utilizado.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSavePassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSaveAttempted(true);
    setFormError(null);
    if (!codeVerified) {
      setFormError("Primero confirma el código o abre el enlace recibido.");
      return;
    }
    if (passwordError) return;

    try {
      setSaving(true);
      const result = verifiedByLink
        ? await confirmPasswordResetToken({
            token: tokenFromUrl,
            newPassword,
          })
        : await confirmPasswordReset({
            correo: correo.trim().toLowerCase(),
            codigo,
            newPassword,
          });
      sessionStorage.removeItem("recovery_email");
      toast.success(result.message);
      router.push("/login");
    } catch {
      setFormError(
        "No pudimos actualizar la contraseña. Solicita un código nuevo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResendCode = async () => {
    setVerifyAttempted(true);
    setFormError(null);
    if (emailError || cooldown > 0) return;

    try {
      setResending(true);
      const result = await requestPasswordReset(correo.trim().toLowerCase());
      setOtpValues(Array.from({ length: OTP_LENGTH }, () => ""));
      setVerifiedByLink(false);
      setCodeVerified(false);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      inputRefs.current[0]?.focus();
      toast.success(result.message);
    } catch {
      setFormError("No pudimos procesar el reenvío. Intenta más tarde.");
    } finally {
      setResending(false);
    }
  };

  const rules = [
    {
      met: passwordRules.minLength && passwordRules.maxLength,
      label: "10 a 72 caracteres",
    },
    { met: passwordRules.hasUpper, label: "Una mayúscula" },
    { met: passwordRules.hasDigit, label: "Un número" },
    { met: passwordRules.hasSymbol, label: "Un símbolo" },
  ];

  return (
    <AccountActionLayout
      eyebrow="Recuperación de acceso"
      asideTitle="Crea una contraseña nueva y segura."
      asideDescription="El código o enlace temporal confirma que tienes acceso al correo de la cuenta antes de permitir el cambio."
      asideItems={[
        "Código y enlace por tiempo limitado",
        "Máximo de intentos controlado",
        "Sesiones anteriores revocadas",
      ]}
    >
      {linkChecking ? (
        <div
          className="grid min-h-[360px] place-items-center text-center"
          aria-live="polite"
        >
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#258e8b]/10 text-[#258e8b]">
              <LoaderCircle className="size-5 animate-spin" aria-hidden />
            </span>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#258e8b]">
              Validando enlace
            </p>
            <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-slate-950">
              Preparamos el cambio de contraseña
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              Esto sólo tomará unos segundos.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-[#258e8b]">
                Paso 2 de 2
              </p>
              <p className="m-0 text-xs font-medium text-slate-400">
                {codeVerified ? "Nueva contraseña" : "Confirmar código"}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden>
              <span className="h-1 rounded-full bg-[#258e8b]" />
              <span
                className={`h-1 rounded-full ${codeVerified ? "bg-[#258e8b]" : "bg-slate-200"}`}
              />
            </div>

            <h1 className="mt-6 text-[2rem] font-semibold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[2.25rem]">
              {codeVerified
                ? "Define tu nueva contraseña"
                : "Ingresa el código recibido"}
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-600">
              {codeVerified
                ? verifiedByLink
                  ? "El enlace fue confirmado. Elige una contraseña que no uses en otros servicios."
                  : "El código fue confirmado. Elige una contraseña que no uses en otros servicios."
                : "Escribe los 8 dígitos que enviamos a tu correo o abre el enlace incluido en el mensaje."}
            </p>
          </div>

          {!codeVerified ? (
            <form onSubmit={handleVerifyCode} noValidate className="mt-7">
              {formError ? <FormError message={formError} /> : null}

              <div>
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
                    value={correo}
                    onChange={(event) => {
                      setCorreo(event.target.value);
                      setCodeVerified(false);
                      setFormError(null);
                    }}
                    autoComplete="email"
                    disabled={verifying}
                    aria-invalid={Boolean(verifyAttempted && emailError)}
                    className={`${accountInputClassName} pl-10 ${
                      verifyAttempted && emailError
                        ? "border-red-400 bg-red-50/40"
                        : ""
                    }`}
                  />
                </div>
                {verifyAttempted && emailError ? (
                  <p
                    role="alert"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {emailError}
                  </p>
                ) : null}
              </div>

              <fieldset className="mt-5 border-0 p-0">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <legend className="text-[13px] font-semibold text-slate-700">
                    Código de 8 dígitos
                  </legend>
                  <span className="text-xs text-slate-400">Sólo números</span>
                </div>
                <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        inputRefs.current[index] = node;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={value}
                      onChange={(event) =>
                        handleOtpChange(index, event.target.value)
                      }
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      onPaste={handleOtpPaste}
                      disabled={verifying}
                      aria-label={`Dígito ${index + 1} del código`}
                      className={`h-12 min-w-0 rounded-lg border bg-slate-50 text-center text-lg font-bold text-slate-900 outline-none transition focus:border-[#258e8b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,142,139,0.15)] sm:h-13 sm:text-xl ${
                        verifyAttempted && codeError
                          ? "border-red-300"
                          : "border-slate-200"
                      }`}
                    />
                  ))}
                </div>
                {verifyAttempted && codeError ? (
                  <p
                    role="alert"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {codeError}
                  </p>
                ) : null}
              </fieldset>

              <button
                type="submit"
                disabled={verifying}
                className={`${accountPrimaryButtonClassName} mt-6`}
              >
                {verifying ? "Comprobando código..." : "Confirmar código"}
                {!verifying ? (
                  <ArrowRight className="size-4" aria-hidden />
                ) : null}
              </button>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
                <span>¿No lo recibiste?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending || cooldown > 0}
                  className="inline-flex min-h-0 min-w-0 items-center gap-1.5 border-0 bg-transparent p-0 font-semibold text-[#258e8b] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  {resending
                    ? "Reenviando..."
                    : cooldown > 0
                      ? `Reenviar en ${cooldown}s`
                      : "Reenviar código y enlace"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSavePassword} noValidate className="mt-7">
              {formError ? <FormError message={formError} /> : null}

              <PasswordInput
                id="newPassword"
                label="Nueva contraseña"
                value={newPassword}
                visible={showPasswords.password}
                autoComplete="new-password"
                onChange={(value) => {
                  setNewPassword(value);
                  setFormError(null);
                }}
                onToggle={() =>
                  setShowPasswords((current) => ({
                    ...current,
                    password: !current.password,
                  }))
                }
                invalid={Boolean(saveAttempted && passwordError)}
              />

              <ul
                className="mt-3 grid list-none grid-cols-2 gap-x-4 gap-y-2 p-0"
                aria-label="Requisitos de contraseña"
              >
                {rules.map((rule) => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 text-xs ${
                      rule.met ? "font-medium text-slate-700" : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`grid size-4 shrink-0 place-items-center rounded-full ${
                        rule.met
                          ? "bg-[#258e8b] text-white"
                          : "border border-slate-300"
                      }`}
                      aria-hidden
                    >
                      {rule.met ? (
                        <Check className="size-2.5" strokeWidth={3} />
                      ) : null}
                    </span>
                    {rule.label}
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <PasswordInput
                  id="confirmPassword"
                  label="Confirma la contraseña"
                  value={confirmPassword}
                  visible={showPasswords.confirm}
                  autoComplete="new-password"
                  onChange={(value) => {
                    setConfirmPassword(value);
                    setFormError(null);
                  }}
                  onToggle={() =>
                    setShowPasswords((current) => ({
                      ...current,
                      confirm: !current.confirm,
                    }))
                  }
                  invalid={Boolean(saveAttempted && passwordError)}
                />
              </div>

              {saveAttempted && passwordError ? (
                <p
                  role="alert"
                  className="mt-2 text-xs font-medium text-red-600"
                >
                  {passwordError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className={`${accountPrimaryButtonClassName} mt-6`}
              >
                <KeyRound className="size-4" aria-hidden />
                {saving ? "Guardando contraseña..." : "Guardar contraseña"}
              </button>
            </form>
          )}

          <div className="mt-7 border-t border-slate-200 pt-5">
            <Link href="/forgot-password" className={accountTextLinkClassName}>
              <ArrowLeft className="size-4" aria-hidden />
              Volver al paso anterior
            </Link>
          </div>
        </>
      )}
    </AccountActionLayout>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 border-l-2 border-red-400 bg-red-50 px-3.5 py-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="m-0 leading-6">{message}</p>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  visible,
  autoComplete,
  onChange,
  onToggle,
  invalid,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  autoComplete: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  invalid: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className={accountLabelClassName}>
        {label}
      </label>
      <div className="relative">
        <LockKeyhole
          className="pointer-events-none absolute top-1/2 left-3.5 size-[17px] -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={invalid}
          className={`${accountInputClassName} pr-12 pl-10 ${
            invalid ? "border-red-400 bg-red-50/40" : ""
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-2.5 grid size-8 -translate-y-1/2 place-items-center rounded-lg border-0 bg-transparent text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<section className="min-h-[calc(100dvh-80px)] bg-[#f4f1eb]" />}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
