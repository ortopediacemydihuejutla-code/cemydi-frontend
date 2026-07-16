// src/app/register/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, UserPlus } from "lucide-react";
import { registerUser } from "@/services/auth";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthContext";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import {
  AuthAlertBanner,
  AuthOrDivider,
  AuthPasswordField,
  AuthPasswordRulesChecklist,
  AuthTextField,
  GoogleAuthButton,
} from "@/components/auth/auth-form-controls";
import { validatePasswordPolicy } from "@/lib/password-validation";
import { resolveApiUrl } from "@/lib/api-config";

const authBrandLinkClassName =
  "font-semibold text-[#1e6260] underline decoration-[#1e6260] underline-offset-2 hover:text-[#145150]";
const primaryButtonClassName =
  "h-11 w-full rounded-xl border-0 bg-[#1e6260] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(30,98,96,0.35)] transition-all hover:bg-[#175452] hover:shadow-[0_6px_18px_rgba(30,98,96,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";
const checkboxRowClassName =
  "flex cursor-pointer items-start gap-3 text-sm leading-snug text-slate-600 select-none";

type FormState = {
  nombre: string;
  correo: string;
  password: string;
  confirmPassword: string;
};

type ErrorsState = {
  nombre: string;
  correo: string;
  password: string;
  confirmPassword: string;
  terms: string;
};

function validateNombre(value: string) {
  const t = value.trim();
  if (!t) return "Ingresa tu nombre completo";
  if (t.length < 3) return "El nombre debe tener al menos 3 caracteres";
  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(t)) {
    return "Solo se permiten letras y espacios";
  }
  return "";
}

function validateCorreo(value: string) {
  const t = value.trim();
  if (!t) return "Ingresa tu correo electrónico";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "El formato del correo no es válido";
  return "";
}

function validateConfirmPassword(password: string, confirm: string) {
  if (!confirm) return "Confirma tu contraseña";
  if (confirm !== password) return "Las contraseñas no coinciden";
  return "";
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState<FormState>({
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ErrorsState>({
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [redirectRole, setRedirectRole] = useState<"ADMIN" | "USER" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    setRedirectRole(user.rol === "ADMIN" ? "ADMIN" : "USER");
    setRedirecting(true);
    router.replace(user.rol === "ADMIN" ? "/admin" : "/perfil");
  }, [authLoading, router, user]);

  const validateField = (name: keyof FormState, value: string, current: FormState): string => {
    switch (name) {
      case "nombre":
        return validateNombre(value);
      case "correo":
        return validateCorreo(value);
      case "password":
        return validatePasswordPolicy(value);
      case "confirmPassword":
        return validateConfirmPassword(current.password, value);
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubmitError(null);

    setForm((prev) => {
      const next = { ...prev, [name]: value } as FormState;

      setErrors((er) => {
        const patch: Partial<ErrorsState> = {
          [name]: validateField(name as keyof FormState, value, next),
        };
        if (name === "password" && next.confirmPassword) {
          patch.confirmPassword = validateConfirmPassword(value, next.confirmPassword);
        }
        return { ...er, ...patch };
      });

      return next;
    });
  };

  const validateAll = (f: FormState, termsOk: boolean): ErrorsState => {
    const next: ErrorsState = {
      nombre: validateNombre(f.nombre),
      correo: validateCorreo(f.correo),
      password: validatePasswordPolicy(f.password),
      confirmPassword: validateConfirmPassword(f.password, f.confirmPassword),
      terms: termsOk ? "" : "Debes aceptar los términos y condiciones para continuar",
    };
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validateAll(form, acceptedTerms);
    setErrors(nextErrors);

    const hasFieldErrors =
      nextErrors.nombre ||
      nextErrors.correo ||
      nextErrors.password ||
      nextErrors.confirmPassword ||
      nextErrors.terms;

    if (hasFieldErrors) {
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        password: form.password,
      });
      toast.success(result.message);
      await new Promise((resolve) => setTimeout(resolve, 900));
      router.push(`/verify-email?correo=${encodeURIComponent(form.correo.trim())}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo registrar la cuenta.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setSubmitError(null);
    setGoogleLoading(true);
    window.location.href = resolveApiUrl("/auth/google");
  };

  const termsErrorId = "register-terms-error";

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
      heroBadge="Crea tu cuenta"
      heroTitle="Comienza hoy con CEMYDI"
      heroDescription="Productos ortopédicos con seguimiento y asesoría."
    >
      <header className="mb-6 text-center">
        {/* Ícono decorativo */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#1e6260]/10 text-[#1e6260]">
            <UserPlus className="size-6" strokeWidth={2} />
          </div>
        </div>
        <h1 className="m-0 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.6rem]">
          Crear cuenta
        </h1>
        <p className="mt-1.5 text-center text-sm leading-snug text-slate-500">
          Completa los datos para registrarte
        </p>
      </header>

      <div className="grid gap-3.5">
        <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
          {submitError ? <AuthAlertBanner message={submitError} /> : null}

          <AuthTextField
            label="Nombre completo"
            name="nombre"
            type="text"
            autoComplete="name"
            value={form.nombre}
            onChange={handleChange}
            error={errors.nombre}
            placeholder="Ej. María García"
            icon={User}
            disabled={loading}
          />

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

          <div className="grid gap-1.5">
            <AuthPasswordField
              label="Contraseña"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              error={errors.password}
              icon={Lock}
              disabled={loading}
              auxiliaryDescribedBy="register-password-rules"
            />
            {/* Checklist: visible al enfocar o si hay contenido/error */}
            <div
              className={`grid transition-all duration-200 ${
                passwordFocused || form.password || errors.password
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <AuthPasswordRulesChecklist id="register-password-rules" password={form.password} />
              </div>
            </div>
          </div>

          <AuthPasswordField
            label="Confirmar contraseña"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={Lock}
            disabled={loading}
          />

          <div className="grid gap-1.5">
            <label className={`${checkboxRowClassName} text-[13px] leading-snug sm:text-sm`}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  setSubmitError(null);
                  if (e.target.checked) {
                    setErrors((prev) => ({ ...prev, terms: "" }));
                  }
                }}
                className="mt-0.5 size-4 shrink-0 cursor-pointer rounded-[4px] border-slate-300 accent-[#1e6260]"
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? termsErrorId : undefined}
              />
              <span>
                He leído y acepto los{" "}
                <Link href="/terminos-y-condiciones" className={authBrandLinkClassName}>
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/politicas-de-privacidad" className={authBrandLinkClassName}>
                  política de privacidad
                </Link>{" "}
                del servicio.
              </span>
            </label>
            {errors.terms ? (
              <p id={termsErrorId} role="alert" className="text-xs font-medium text-red-600">
                {errors.terms}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className={primaryButtonClassName}
          >
            {loading ? "Registrando…" : "Registrarme"}
          </button>
        </form>

        <AuthOrDivider />

        <GoogleAuthButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={loading}
        />

        <p className="m-0 pt-0.5 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={authBrandLinkClassName}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
