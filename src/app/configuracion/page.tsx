"use client";

import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  AccountPageHeader,
  accountInputClassName,
} from "@/components/account/AccountPageHeader";
import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import {
  getPasswordRulesStatus,
  validatePasswordPolicy,
} from "@/lib/password-validation";
import { useAuth } from "@/providers/AuthContext";
import { confirmPasswordChange, requestPasswordChange, resendPasswordChange } from "@/services/users";
import { ApiError } from "@/lib/api-error";
import { logoutUser } from "@/services/auth";
import { NotificationPreferencesForm } from "@/components/account/NotificationPreferencesForm";
import Link from 'next/link';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [passwordChallenge, setPasswordChallenge] = useState<{ resendAt: string } | null>(null);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!passwordChallenge) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [passwordChallenge]);


  const passwordRules = useMemo(
    () => getPasswordRulesStatus(password),
    [password],
  );


  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    try {
      setSavingPassword(true);
      if (!passwordChallenge) {
        if (!currentPassword) {
          toast.error("Ingresa tu contraseña actual.");
          return;
        }
        setPasswordChallenge(await requestPasswordChange(currentPassword));
        setCurrentPassword("");
        toast.success("Enviamos un código a tu correo.");
        return;
      }
      const passwordError = validatePasswordPolicy(password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden.");
        return;
      }
      if (!/^\d{8}$/.test(codigo)) {
        toast.error("Ingresa los ocho dígitos del código.");
        return;
      }
      await confirmPasswordChange(codigo, password);
      await logoutUser().catch(() => undefined);
      logout();
      setPassword("");
      setConfirmPassword("");
      setCodigo("");
      toast.success("Contraseña actualizada. Inicia sesión nuevamente.");
      router.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof ApiError && error.status === 429
          ? "Espera antes de solicitar o verificar otro código."
          : error instanceof ApiError && error.status === 401
            ? "No pudimos confirmar tu identidad."
            : error instanceof ApiError && error.status === 400
              ? "Los datos o el código son inválidos o expiraron."
              : "No se pudo cambiar la contraseña.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <CustomerAccountShell>
      <div>
        <AccountPageHeader
          title="Configuración"
          description="Administra las preferencias y la seguridad de tu cuenta."
        />

        <NotificationPreferencesForm />

        <section className="border-b border-[#deebeb] py-8">
          <div className="flex items-start gap-3">
            <KeyRound
              className="mt-0.5 size-5 shrink-0 text-[#1f6a67]"
              strokeWidth={1.8}
            />
            <div>
              <h3 className="text-lg font-semibold text-[#17333f]">
                Cambiar contraseña
              </h3>
              <p className="mt-1 text-sm text-[#607173]">
                Usa una contraseña única que no compartas con otros servicios.
              </p>
            </div>
          </div>

          <form
            onSubmit={changePassword}
            className="mt-6 grid max-w-[760px] gap-5 sm:grid-cols-2"
          >
            {!passwordChallenge ? (
              <label className="grid gap-2 text-sm font-medium text-[#405b65] sm:col-span-2">
                Contraseña actual
                <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={accountInputClassName} />
              </label>
            ) : (
              <div className="grid gap-4 sm:col-span-2">
                <p className="text-sm text-[#607173]">Enviamos un código a {user?.correo}.</p>
                <label className="grid gap-2 text-sm font-medium text-[#405b65]">
                  Código de ocho dígitos
                  <input inputMode="numeric" autoComplete="one-time-code" value={codigo} onChange={(event) => setCodigo(event.target.value.replace(/\D/g, "").slice(0, 8))} maxLength={8} className={accountInputClassName} />
                </label>
                <button type="button" disabled={savingPassword || now < Date.parse(passwordChallenge.resendAt)} onClick={() => void (async () => {
                  setSavingPassword(true);
                  try {
                    setPasswordChallenge(await resendPasswordChange());
                    setCodigo("");
                    toast.success("Enviamos un código nuevo.");
                  } catch {
                    toast.error("No pudimos reenviar el código. Intenta más tarde.");
                  } finally {
                    setSavingPassword(false);
                  }
                })()} className="w-fit text-sm font-semibold text-[#1f6a67] disabled:opacity-60">
                  {now < Date.parse(passwordChallenge.resendAt) ? `Reenviar en ${Math.ceil((Date.parse(passwordChallenge.resendAt) - now) / 1000)}s` : "Reenviar código"}
                </button>
              </div>
            )}
            <label className="grid gap-2 text-sm font-medium text-[#405b65]">
              Nueva contraseña
              <span className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#718184]" />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Nueva contraseña"
                  className={`${accountInputClassName} pl-10 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((value) => !value)}
                  className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center text-[#718184] hover:text-[#1f6a67]"
                  aria-label={
                    showPasswords
                      ? "Ocultar contraseñas"
                      : "Mostrar contraseñas"
                  }
                >
                  {showPasswords ? (
                    <EyeOff className="size-[18px]" />
                  ) : (
                    <Eye className="size-[18px]" />
                  )}
                </button>
              </span>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#405b65]">
              Confirmar contraseña
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                className={accountInputClassName}
              />
            </label>

            {password ? (
              <div className="grid grid-cols-2 gap-2 text-xs text-[#718184] sm:col-span-2">
                {[
                  {
                    met: passwordRules.minLength && passwordRules.maxLength,
                    label: "8 a 72 caracteres",
                  },
                  { met: passwordRules.hasUpper, label: "Una mayúscula" },
                  { met: passwordRules.hasDigit, label: "Un número" },
                  { met: passwordRules.hasSymbol, label: "Un símbolo" },
                ].map((rule) => (
                  <span
                    key={rule.label}
                    className={`flex items-center gap-1.5 ${
                      rule.met ? "text-[#1f6a67]" : ""
                    }`}
                  >
                    <Check className="size-3.5" />
                    {rule.label}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={
                  savingPassword ||
                  (passwordChallenge
                    ? !password || !confirmPassword || !passwordRules.isValid || codigo.length !== 8
                    : !currentPassword)
                }
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#154f4d] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save className="size-4" />
                {savingPassword
                  ? "Procesando..."
                  : passwordChallenge
                    ? "Confirmar contraseña"
                    : "Enviar código"}
              </button>
            </div>
          </form>
        </section>

        <section className="flex flex-col gap-4 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 size-5 text-[#1f6a67]"
              strokeWidth={1.8}
            />
            <div>
              <h3 className="text-sm font-semibold text-[#17333f]">
                Estado de seguridad
              </h3>
              <p className="mt-1 text-xs text-[#607173]">
                {user?.emailVerified
                  ? `El correo ${user.correo} está verificado.`
                  : `El correo ${user?.correo ?? ""} necesita verificación.`}
              </p>
            </div>
          </div>
          <span
            className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${
              user?.emailVerified
                ? "border-[#abd0ce] bg-[#eef8f7] text-[#1f6a67]"
                : "border-[#e2cfaa] bg-[#fff9ed] text-[#8a5f18]"
            }`}
          >
            {user?.emailVerified ? "Cuenta verificada" : "Verificación pendiente"}
          </span>
        </section>
      </div>
      <div className="mt-6 border-t border-border pt-6">
        <Link href="/eliminar-cuenta" className="inline-flex min-h-11 items-center font-semibold text-destructive underline">Eliminar mi cuenta y datos</Link>
      </div>
    </CustomerAccountShell>
  );
}
