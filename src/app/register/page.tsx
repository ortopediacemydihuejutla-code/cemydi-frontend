// src/app/register/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { registerUser } from "@/services/auth";
import toast from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { useAuth } from "@/providers/AuthContext";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import {
  AuthOrDivider,
  AuthPasswordField,
  AuthPasswordRulesChecklist,
  AuthTextField,
  GoogleAuthButton,
} from "@/components/auth/auth-form-controls";
import { validatePasswordPolicy } from "@/lib/password-validation";
import { resolveApiUrl } from "@/lib/api-config";

const authBrandLinkClassName =
  "font-semibold text-[#258e8b] underline decoration-[#258e8b]/35 underline-offset-4 transition-colors hover:text-[#134e4c] hover:decoration-[#134e4c]";
const primaryButtonClassName =
  "mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-0 bg-[#258e8b] px-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_22px_-12px_rgba(37,142,139,0.35)] transition-[background-color,transform,box-shadow] hover:bg-[#1d7370] hover:shadow-[0_14px_26px_-12px_rgba(37,142,139,0.4)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

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
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    router.replace(user.rol === "ADMIN" ? "/admin" : "/mi-cuenta");
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

    setTouched({
      nombre: true,
      correo: true,
      password: true,
      confirmPassword: true,
    });

    const nextErrors = validateAll(form, acceptedTerms);
    setErrors(nextErrors);

    if (!acceptedTerms) {
      toast.error("Debes aceptar los términos y condiciones para registrarte.", {
        id: "auth-terms-required",
      });
    }

    const hasFieldErrors =
      nextErrors.nombre ||
      nextErrors.correo ||
      nextErrors.password ||
      nextErrors.confirmPassword ||
      nextErrors.terms;

    if (hasFieldErrors) {
      window.requestAnimationFrame(() => {
        if (!acceptedTerms) {
          document.getElementById("register-terms")?.focus();
        } else {
          document
            .querySelector<HTMLInputElement>("input[aria-invalid='true']")
            ?.focus();
        }
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
      const isRateLimit =
        (err instanceof ApiError && err.status === 429) ||
        /intentos|solicitudes|throttler|too many requests/i.test(message);

      if (isRateLimit) {
        toast.error(message, { id: "auth-rate-limit" });
      } else {
        toast.error(message, { id: "auth-register-error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (loading || googleLoading) return;
    setGoogleLoading(true);
    window.location.href = resolveApiUrl("/auth/google");
  };

  const termsErrorId = "register-terms-error";

  if (authLoading || user) {
    return null;
  }

  return (
    <AuthSplitLayout
      heroTitle="El bienestar de tu salud comienza con la elección y el soporte adecuados."
    >
      <div className="w-full space-y-2.5 sm:space-y-3">
        <header className="space-y-0.5 text-center sm:text-left">
          <h1 className="text-xl font-bold uppercase tracking-[0.06em] text-slate-950 sm:text-2xl">
            Crear cuenta
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-snug">
            Regístrate para administrar tus compras y contratos de renta de equipo médico.
          </p>
        </header>

        {/* Botón de Google One-Click al inicio */}
        <GoogleAuthButton
          size="compact"
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={loading}
          text="Continuar con Google"
        />

        <AuthOrDivider size="compact" label="O completa el formulario" />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-2 sm:space-y-2.5"
          aria-busy={loading}
        >
          <AuthTextField
            size="compact"
            label="Nombre completo"
            name="nombre"
            type="text"
            autoComplete="name"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.nombre}
            placeholder="Valeria Méndez"
            icon={User}
            disabled={loading}
          />

          <AuthTextField
            size="compact"
            label="Correo electrónico"
            name="correo"
            type="email"
            autoComplete="email"
            value={form.correo}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.correo}
            placeholder="valeria@ejemplo.com"
            icon={Mail}
            disabled={loading}
          />

          <div className="grid gap-0.5">
            <AuthPasswordField
              size="compact"
              label="Contraseña (mínimo 10 caracteres)"
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
              placeholder="••••••••••••"
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
              <div className="overflow-hidden pt-0.5">
                <AuthPasswordRulesChecklist
                  id="register-password-rules"
                  password={form.password}
                  size="compact"
                />
              </div>
            </div>
          </div>

          <AuthPasswordField
            size="compact"
            label="Confirmar contraseña"
            name="confirmPassword"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            placeholder="••••••••••••"
            icon={Lock}
            disabled={loading}
          />

          <div className="grid gap-0.5 pt-0.5">
            <div className="flex items-start gap-2 text-[11px] leading-tight text-slate-600 sm:text-xs">
              <input
                id="register-terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked) {
                    setErrors((prev) => ({ ...prev, terms: "" }));
                  }
                }}
                className="mt-0.5 size-3.5 shrink-0 cursor-pointer rounded border-slate-300 accent-[#258e8b]"
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? termsErrorId : undefined}
              />
              <label htmlFor="register-terms" className="cursor-pointer select-none">
                Acepto los{" "}
                <Link href="/terminos-y-condiciones" className={authBrandLinkClassName}>
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/politicas-de-privacidad" className={authBrandLinkClassName}>
                  Política de Privacidad
                </Link>{" "}
                de Ortopedia CEMYDI.
              </label>
            </div>
            {errors.terms ? (
              <p id={termsErrorId} role="alert" className="text-[11px] font-medium text-red-600 leading-tight">
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
                <span>Crear mi cuenta</span>
                <ArrowRight className="size-4" aria-hidden />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-200 pt-2 text-center">
          <p className="text-xs text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-slate-900 underline underline-offset-4 hover:text-[#258e8b] transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
