// src/app/login/page.tsx

// src/app/login/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Mail } from "lucide-react";
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
  "font-semibold text-[#1e6260] underline decoration-[#1e6260]/35 underline-offset-4 transition-colors hover:text-[#144d4b] hover:decoration-[#144d4b]";
const primaryButtonClassName =
  "mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border-0 bg-[#1e6260] px-4 text-[14px] font-bold text-white shadow-[0_10px_22px_-12px_rgba(30,98,96,0.75)] transition-[background-color,transform,box-shadow] hover:bg-[#185452] hover:shadow-[0_14px_26px_-12px_rgba(30,98,96,0.75)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
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
      heroBadge="CEMYDI"
      heroTitle="Bienvenido de vuelta"
      heroDescription="Gestiona tus compras, rentas y perfil en un solo lugar, con el respaldo de nuestro equipo."
    >
      <header className="mb-7 text-center">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.19em] text-slate-500">
          Tu espacio personal
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ingresa tus datos para consultar tus pedidos, rentas y perfil.
        </p>
      </header>

      <div className="grid gap-4">
        {submitError ? (
          <p
            role="alert"
            className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {submitError}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4"
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
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            icon={Lock}
            disabled={loading}
          />

          <div className="-mt-1 flex justify-end">
            <Link href="/forgot-password" className={authBrandLinkClassName}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className={primaryButtonClassName}
          >
            {loading ? (
              "Iniciando sesión…"
            ) : (
              <>
                Iniciar sesión
                <LogIn className="size-4" aria-hidden />
              </>
            )}
          </button>
        </form>

        <AuthOrDivider />

        <GoogleAuthButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={loading}
        />

        <p className="m-0 px-2 text-center text-[11px] leading-5 text-slate-500">
          Al continuar, confirmas que has leído y aceptas los{" "}
          <Link href="/terminos-y-condiciones" className={authBrandLinkClassName}>
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/politicas-de-privacidad" className={authBrandLinkClassName}>
            política de privacidad
          </Link>
          .
        </p>

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

        <p className="m-0 pt-1 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className={authBrandLinkClassName}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
