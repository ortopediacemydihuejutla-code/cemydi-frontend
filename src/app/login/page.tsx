// src/app/login/page.tsx

// src/app/login/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { loginUser, resendVerificationEmail } from "@/services/auth";
import { getMyProfile } from "@/services/users";
import { isProfileComplete } from "@/lib/profile-completion";
import { useAuth, type AuthUserProfile } from "@/providers/AuthContext";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  AuthOrDivider,
  AuthPasswordField,
  AuthTextField,
  GoogleAuthButton,
} from "@/components/auth/auth-form-controls";
import { resolveApiUrl } from "@/lib/api-config";

const authBrandLinkClassName =
  "font-semibold text-[#258e8b] underline decoration-[#258e8b]/35 underline-offset-4 transition-colors hover:text-[#134e4c] hover:decoration-[#134e4c]";
const primaryButtonClassName =
  "mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-0 bg-[#258e8b] px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_22px_-12px_rgba(37,142,139,0.35)] transition-[background-color,transform,box-shadow] hover:bg-[#1d7370] hover:shadow-[0_14px_26px_-12px_rgba(37,142,139,0.4)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClassName =
  "inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-3.5 text-[13px] font-bold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

type LoginField = "correo" | "password";

function validateLoginCorreo(value: string) {
  const t = value.trim();
  if (!t) return "Ingresa tu correo electrónico";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "El formato del correo no es válido";
  return "";
}

function validateLoginPassword(value: string) {
  if (!value) return "Ingresa tu contraseña";
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  const [form, setForm] = useState({
    correo: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    correo: "",
    password: "",
  });
  const [touched, setTouched] = useState<Record<LoginField, boolean>>({
    correo: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const verificationStatus = currentUrl.searchParams.get("verified");

    if (verificationStatus === "success") {
      toast.success("Correo verificado. Ya puedes iniciar sesión.", {
        id: "auth-email-verified",
      });
    } else if (verificationStatus === "error") {
      setSubmitError("No se pudo verificar el correo o el enlace ya expiró.");
    }

    const googleError = currentUrl.searchParams.get("googleError");
    if (googleError) {
      const message =
        googleError === "inactive"
          ? "Tu cuenta está inactiva. Contacta a CEMYDI para revisarla."
          : "No se pudo iniciar sesión con Google. Intenta de nuevo.";
      setSubmitError(message);
      currentUrl.searchParams.delete("googleError");
    }

    currentUrl.searchParams.delete("verified");
    window.history.replaceState({}, "", currentUrl.pathname + currentUrl.search);
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const nextRole = user.rol === "ADMIN" ? "ADMIN" : "USER";
    if (nextRole === "ADMIN") {
      router.replace("/admin");
    } else {
      router.replace(isProfileComplete(user) ? "/catalogo" : "/mi-cuenta");
    }
  }, [authLoading, router, user]);

  const runFieldValidation = (name: LoginField, value: string) => {
    if (name === "correo") return validateLoginCorreo(value);
    return validateLoginPassword(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubmitError(null);
    setShowResendVerification(false);
    setForm((prev) => ({ ...prev, [name]: value }));
    const key = name as LoginField;
    if (touched[key] || errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: runFieldValidation(key, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const key = e.target.name as LoginField;
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({
      ...prev,
      [key]: runFieldValidation(key, e.target.value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || googleLoading) return;

    setSubmitError(null);
    setShowResendVerification(false);
    setTouched({ correo: true, password: true });

    const nextErrors = {
      correo: validateLoginCorreo(form.correo),
      password: validateLoginPassword(form.password),
    };
    setErrors(nextErrors);
    if (nextErrors.correo || nextErrors.password) {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>("input[aria-invalid='true']")?.focus();
      });
      return;
    }

    let shouldKeepSubmittingState = false;

    try {
      setLoading(true);
      setShowResendVerification(false);

      const result = await loginUser({
        correo: form.correo.trim(),
        password: form.password,
      });
      const nextRole = result.user?.rol === "ADMIN" ? "ADMIN" : "USER";

      shouldKeepSubmittingState = true;
      
      let nextPath = nextRole === "ADMIN" ? "/admin" : "/mi-cuenta";
      let loggedUser: AuthUserProfile = result.user;

      if (nextRole !== "ADMIN") {
        try {
          const profileResult = await getMyProfile();
          if (profileResult.user) {
            loggedUser = profileResult.user;
            if (isProfileComplete(profileResult.user)) {
              nextPath = "/catalogo";
            }
          }
        } catch {
          // Si falla, se queda con el path por defecto
        }
      }

      login({ user: loggedUser });

      toast.success("Sesión iniciada correctamente.", { id: "auth-login-success" });
      router.replace(nextPath);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar sesión. Verifica tus datos.";
      const isRateLimit =
        (err instanceof ApiError && err.status === 429) ||
        /intentos|solicitudes|throttler|too many requests/i.test(message);

      if (isRateLimit) {
        toast.error(message, { id: "auth-rate-limit" });
      } else {
        toast.error(message, { id: "auth-login-error" });
      }
      setSubmitError(null);
      setShowResendVerification(message.toLowerCase().includes("verificar tu correo"));
    } finally {
      if (!shouldKeepSubmittingState) {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    if (loading || googleLoading) return;
    setSubmitError(null);
    setGoogleLoading(true);
    window.location.href = resolveApiUrl("/auth/google");
  };

  const handleResendVerification = async () => {
    if (resendingVerification) return;

    const correoError = validateLoginCorreo(form.correo);
    if (correoError) {
      setTouched((prev) => ({ ...prev, correo: true }));
      setErrors((prev) => ({ ...prev, correo: correoError }));
      document.querySelector<HTMLInputElement>("input[name='correo']")?.focus();
      return;
    }

    try {
      setResendingVerification(true);
      const result = await resendVerificationEmail(form.correo.trim());
      setSubmitError(null);
      toast.success(result.message, { id: "auth-verification-resent" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo reenviar el enlace de verificación.";
      toast.error(message, { id: "auth-resend-error" });
    } finally {
      setResendingVerification(false);
    }
  };

  if (authLoading || (user && !loading)) {
    return null;
  }

  return (
    <AuthSplitLayout
      heroTitle="El respaldo médico y humano que necesitas para tu bienestar y movilidad."
    >
      <div className="w-full space-y-4 sm:space-y-4.5">
        <header className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold uppercase tracking-[0.06em] text-slate-950 sm:text-[1.65rem]">
            Iniciar sesión
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed">
            Ingresa tus credenciales para acceder a tus pedidos, rentas y perfil médico.
          </p>
        </header>

        {/* Botón de Google One-Click al inicio */}
        <GoogleAuthButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={loading}
          text="Continuar con Google"
        />

        <AuthOrDivider label="O completa el formulario" />

        {submitError ? (
          <p
            role="alert"
            className="m-0 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
          >
            {submitError}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-3 sm:space-y-3.5"
          aria-busy={loading}
        >
          <AuthTextField
            label="Correo electrónico"
            name="correo"
            type="email"
            autoComplete="email"
            value={form.correo}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.correo}
            placeholder="tu@correo.com"
            icon={Mail}
            disabled={loading}
          />

          <AuthPasswordField
            label="Contraseña"
            cornerAction={
              <Link
                href="/forgot-password"
                className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            }
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            placeholder="••••••••••••"
            icon={Lock}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || googleLoading}
            className={primaryButtonClassName}
          >
            {loading ? (
              "Iniciando sesión…"
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight className="size-4" aria-hidden />
              </>
            )}
          </button>
        </form>

        {showResendVerification ? (
          <div className="grid gap-2.5 border-l-2 border-[#c7a76b] py-1 pl-4">
            <p className="m-0 text-sm text-slate-700">
              Tu cuenta aún no está verificada. ¿Necesitas nuevas instrucciones?
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className={secondaryButtonClassName}
            >
              {resendingVerification ? "Reenviando…" : "Reenviar código y enlace de verificación"}
            </button>
          </div>
        ) : null}

        <div className="border-t border-slate-200 pt-4 text-center space-y-2.5">
          <p className="text-xs sm:text-sm text-slate-500">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className={authBrandLinkClassName}>
              Crear una cuenta
            </Link>
          </p>
          <p className="text-[11px] text-slate-400 font-light leading-relaxed">
            Al acceder a la plataforma, confirmas tu conformidad con nuestros{" "}
            <Link href="/terminos-y-condiciones" className="underline hover:text-slate-700">
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link href="/politicas-de-privacidad" className="underline hover:text-slate-700">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
