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
  "font-semibold text-[#1e6260] underline decoration-[#1e6260]/35 underline-offset-4 transition-colors hover:text-[#144d4b] hover:decoration-[#144d4b]";
const primaryButtonClassName =
  "flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border-0 bg-[#1e6260] px-4 text-[14px] font-bold text-white shadow-[0_10px_22px_-12px_rgba(30,98,96,0.75)] transition-[background-color,transform,box-shadow] hover:bg-[#185452] hover:shadow-[0_14px_26px_-12px_rgba(30,98,96,0.75)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
const checkboxRowClassName =
  "flex items-start gap-3 text-sm leading-snug text-slate-600";

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
  if (!/^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)*$/u.test(t)) {
    return "Revisa que tu nombre no contenga números ni símbolos especiales";
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
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    nombre: false,
    correo: false,
    password: false,
    confirmPassword: false,
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
        const key = name as keyof FormState;
        const patch: Partial<ErrorsState> = {};

        if (touched[key] || er[key]) {
          patch[key] = validateField(key, value, next);
        }
        if (
          name === "password" &&
          next.confirmPassword &&
          (touched.confirmPassword || er.confirmPassword)
        ) {
          patch.confirmPassword = validateConfirmPassword(value, next.confirmPassword);
        }
        return { ...er, ...patch };
      });

      return next;
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof FormState;
    const nextForm = { ...form, [key]: e.target.value };

    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({
      ...prev,
      [key]: validateField(key, e.target.value, nextForm),
    }));
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
    if (loading || googleLoading) return;

    setSubmitError(null);
    setTouched({
      nombre: true,
      correo: true,
      password: true,
      confirmPassword: true,
    });

    const nextErrors = validateAll(form, acceptedTerms);
    setErrors(nextErrors);

    const hasFieldErrors =
      nextErrors.nombre ||
      nextErrors.correo ||
      nextErrors.password ||
      nextErrors.confirmPassword ||
      nextErrors.terms;

    if (hasFieldErrors) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLInputElement>("input[aria-invalid='true']")
          ?.focus();
      });
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        password: form.password,
      });
      toast.success(result.message, { id: "auth-register-success" });
      router.push(`/verify-email?correo=${encodeURIComponent(form.correo.trim())}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo registrar la cuenta.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (loading || googleLoading) return;
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
      heroDescription="Encuentra productos ortopédicos con seguimiento claro y asesoría cercana."
    >
      <header className="mb-7">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.19em] text-slate-500">
          Nueva cuenta
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-[2.15rem]">
          Crear cuenta
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Regístrate para administrar tus compras y rentas con facilidad.
        </p>
      </header>

      <div className="grid gap-4">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-4"
          aria-busy={loading}
        >
          {submitError ? <AuthAlertBanner message={submitError} /> : null}

          <AuthTextField
            label="Nombre completo"
            name="nombre"
            type="text"
            autoComplete="name"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
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
            onBlur={handleBlur}
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
              onBlur={(event) => {
                setPasswordFocused(false);
                handleBlur(event);
              }}
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
                <AuthPasswordRulesChecklist
                  id="register-password-rules"
                  password={form.password}
                  size="compact"
                />
              </div>
            </div>
          </div>

          <AuthPasswordField
            label="Confirmar contraseña"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            icon={Lock}
            disabled={loading}
          />

          <div className="grid gap-1.5">
            <div className={`${checkboxRowClassName} text-[13px] leading-snug sm:text-sm`}>
              <input
                id="register-terms"
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
                <label htmlFor="register-terms" className="cursor-pointer select-none">
                  He leído y acepto los{" "}
                </label>
                <Link href="/terminos-y-condiciones" className={authBrandLinkClassName}>
                  términos y condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/politicas-de-privacidad" className={authBrandLinkClassName}>
                  política de privacidad
                </Link>{" "}
                del servicio.
              </span>
            </div>
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
            {loading ? (
              "Creando cuenta…"
            ) : (
              <>
                Crear mi cuenta
                <UserPlus className="size-4" aria-hidden />
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

        <p className="m-0 pt-1 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className={authBrandLinkClassName}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
