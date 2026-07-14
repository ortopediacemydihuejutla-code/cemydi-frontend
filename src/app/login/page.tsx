// src/app/login/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Mail } from "lucide-react";
import { loginUser, resendVerificationEmail } from "@/services/auth";
import { useAuth } from "@/providers/AuthContext";
import toast from "react-hot-toast";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import {
  AuthAlertBanner,
  AuthOrDivider,
  AuthPasswordField,
  AuthTextField,
  GoogleAuthButton,
} from "@/components/auth/auth-form-controls";
import { resolveApiUrl } from "@/lib/api-config";

const authBrandLinkClassName =
  "font-semibold text-[#1e6260] underline decoration-[#1e6260] underline-offset-2 hover:text-[#145150]";
const primaryButtonClassName =
  "mt-1 h-11 w-full rounded-xl border-0 bg-[#1e6260] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(30,98,96,0.35)] transition-all hover:bg-[#175452] hover:shadow-[0_6px_18px_rgba(30,98,96,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClassName =
  "inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#1e6260] bg-white px-3.5 text-[13px] font-bold text-[#1e6260] transition hover:bg-[#f0fafa] disabled:cursor-not-allowed disabled:opacity-60";

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

  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectRole, setRedirectRole] = useState<"ADMIN" | "USER" | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const verificationStatus = currentUrl.searchParams.get("verified");

    if (verificationStatus === "success") {
      toast.success("Tu correo ha sido verificado correctamente.");
    } else if (verificationStatus === "error") {
      toast.error("No se pudo verificar el correo o el enlace ya expiró.");
    }

    const googleError = currentUrl.searchParams.get("googleError");
    if (googleError) {
      const message =
        googleError === "inactive"
          ? "Tu cuenta esta inactiva. Contacta a CEMYDI para revisarla."
          : "No se pudo iniciar sesion con Google. Intenta de nuevo.";
      setSubmitError(message);
      toast.error(message);
      currentUrl.searchParams.delete("googleError");
    }

    currentUrl.searchParams.delete("verified");
    window.history.replaceState({}, "", currentUrl.pathname + currentUrl.search);
  }, []);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    setRedirectRole(user.rol === "ADMIN" ? "ADMIN" : "USER");
    setRedirecting(true);
    router.replace(user.rol === "ADMIN" ? "/admin" : "/perfil");
  }, [authLoading, router, user]);

  const runFieldValidation = (name: keyof typeof form, value: string) => {
    if (name === "correo") return validateLoginCorreo(value);
    return validateLoginPassword(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubmitError(null);
    setForm((prev) => ({ ...prev, [name]: value }));
    const key = name as keyof typeof form;
    setErrors((prev) => ({ ...prev, [key]: runFieldValidation(key, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = {
      correo: validateLoginCorreo(form.correo),
      password: validateLoginPassword(form.password),
    };
    setErrors(nextErrors);
    if (nextErrors.correo || nextErrors.password) {
      return;
    }

    let shouldKeepRedirectLoader = false;

    try {
      setLoading(true);
      setShowResendVerification(false);

      const result = await loginUser(form);
      const nextRole = result.user?.rol === "ADMIN" ? "ADMIN" : "USER";

      shouldKeepRedirectLoader = true;
      setRedirectRole(nextRole);
      setRedirecting(true);
      login({ user: result.user });

      toast.success("Bienvenido");
      router.replace(nextRole === "ADMIN" ? "/admin" : "/perfil");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo iniciar sesión. Verifica tus datos.";
      setSubmitError(message);
      setShowResendVerification(message.toLowerCase().includes("verificar tu correo"));
    } finally {
      if (!shouldKeepRedirectLoader) {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    setSubmitError(null);
    setGoogleLoading(true);
    window.location.href = resolveApiUrl("/auth/google");
  };

  const handleResendVerification = async () => {
    if (!form.correo.trim()) {
      toast.error("Ingresa tu correo para reenviar el enlace.");
      return;
    }

    try {
      setResendingVerification(true);
      const result = await resendVerificationEmail(form.correo);
      toast.success(result.message);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "No se pudo reenviar el enlace de verificación.";
      toast.error(message);
    } finally {
      setResendingVerification(false);
    }
  };

  if (authLoading || user || redirecting) {
    return (
      <AuthRouteLoading
        title={redirectRole === "ADMIN" ? "Cargando panel" : "Cargando cuenta"}
        description={
          redirectRole === "ADMIN"
            ? "Preparando el panel de administracion..."
            : "Preparando tu perfil..."
        }
      />
    );
  }

  return (
    <AuthSplitLayout
      heroBadge="CEMYDI"
      heroTitle="Bienvenido de vuelta"
      heroDescription="Gestiona tus compras, rentas y perfil en un solo lugar, con el respaldo de nuestro equipo."
    >
      <header className="mb-6 text-center">
        {/* Ícono decorativo */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#1e6260]/10 text-[#1e6260]">
            <LogIn className="size-6" strokeWidth={2} />
          </div>
        </div>
        <h1 className="m-0 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.6rem]">
          Iniciar sesión
        </h1>
        <p className="mt-1.5 text-center text-sm leading-snug text-slate-500">
          Introduce tus datos para continuar
        </p>
      </header>

      <div className="grid gap-3.5">
        <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
          {submitError ? <AuthAlertBanner message={submitError} /> : null}

          <AuthTextField
            label="Correo electrónico"
            name="correo"
            type="email"
            autoComplete="email"
            value={form.correo}
            onChange={handleChange}
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
            error={errors.password}
            icon={Lock}
            disabled={loading}
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className={authBrandLinkClassName}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className={primaryButtonClassName}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <AuthOrDivider />

        <GoogleAuthButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={loading}
        />

        {showResendVerification ? (
          <div className="grid gap-2.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3.5">
            <p className="m-0 text-sm text-slate-700">
              Tu cuenta aún no está verificada. ¿Necesitas un nuevo enlace?
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className={secondaryButtonClassName}
            >
              {resendingVerification ? "Reenviando…" : "Reenviar enlace de verificación"}
            </button>
          </div>
        ) : null}

        <p className="m-0 pt-0.5 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className={authBrandLinkClassName}>
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
