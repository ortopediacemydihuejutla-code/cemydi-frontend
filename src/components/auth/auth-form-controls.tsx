"use client";

import { useId, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { getPasswordRulesStatus } from "@/lib/password-validation";

/* ── Estilos base de los campos ── */
const inputShell =
  "flex h-12 w-full items-center gap-3 rounded-[14px] border bg-white px-3.5 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus-within:border-[#1e6260] focus-within:shadow-[0_0_0_3px_rgba(30,98,96,0.1)] focus-within:ring-0";
const inputShellError =
  "border-red-400 bg-red-50/30 focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]";
const inputShellOk = "border-slate-200/90 hover:border-slate-300";
const fieldClass =
  "w-full min-w-0 border-0 bg-transparent py-1 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400";
const labelClass =
  "mb-2 block text-[13px] font-semibold text-slate-700";
const errorClass =
  "mt-1.5 flex items-start gap-1.5 text-[12px] font-medium leading-5 text-red-600";

/* ── Campo de texto ── */
type TextFieldProps = {
  id?: string;
  label: string;
  name: string;
  type?: "text" | "email";
  autoComplete?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  icon: LucideIcon;
  disabled?: boolean;
  required?: boolean;
};

export function AuthTextField({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  icon: Icon,
  disabled,
  required = true,
}: TextFieldProps) {
  const genId = useId();
  const fieldId = id ?? `${name}-${genId}`;
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="w-full">
      <label htmlFor={fieldId} className={labelClass}>
        {label}
      </label>
      <div className={`${inputShell} ${hasError ? inputShellError : inputShellOk}`}>
        <Icon
          className={`size-[17px] shrink-0 transition-colors ${hasError ? "text-red-400" : "text-slate-400"}`}
          aria-hidden
        />
        <input
          id={fieldId}
          name={name}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className={fieldClass}
        />
      </div>
      {hasError ? (
        <p id={errorId} role="alert" className={errorClass}>
          <AlertCircle className="size-[13px] shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ── Campo de contraseña ── */
type PasswordFieldProps = {
  id?: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  icon: LucideIcon;
  autoComplete?: string;
  disabled?: boolean;
  auxiliaryDescribedBy?: string;
  required?: boolean;
};

export function AuthPasswordField({
  id,
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  placeholder = "••••••••",
  icon: Icon,
  autoComplete,
  disabled,
  auxiliaryDescribedBy,
  required = true,
}: PasswordFieldProps) {
  const genId = useId();
  const fieldId = id ?? `${name}-${genId}`;
  const errorId = `${fieldId}-error`;
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);
  const describedBy = [hasError ? errorId : null, auxiliaryDescribedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      <label htmlFor={fieldId} className={labelClass}>
        {label}
      </label>
      <div className={`${inputShell} ${hasError ? inputShellError : inputShellOk}`}>
        <Icon
          className={`size-[17px] shrink-0 transition-colors ${hasError ? "text-red-400" : "text-slate-400"}`}
          aria-hidden
        />
        <input
          id={fieldId}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
          className={`${fieldClass} pr-1`}
        />
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible
            ? <EyeOff className="size-[15px]" />
            : <Eye className="size-[15px]" />}
        </button>
      </div>
      {hasError ? (
        <p id={errorId} role="alert" className={errorClass}>
          <AlertCircle className="size-[13px] shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ── Checklist de requisitos de contraseña ── */
export function AuthPasswordRulesChecklist({
  password,
  id,
  size = "default",
}: {
  password: string;
  id?: string;
  size?: "default" | "compact";
}) {
  const s = getPasswordRulesStatus(password);
  const compact = size === "compact";
  const items: { met: boolean; label: string; labelFull: string }[] = [
    { met: s.minLength && s.maxLength, label: "10-72 caracteres", labelFull: "Entre 10 y 72 caracteres" },
    { met: s.hasUpper, label: "Mayúscula", labelFull: "Una letra mayúscula (A-Z)" },
    { met: s.hasDigit, label: "Número", labelFull: "Un número (0-9)" },
    { met: s.hasSymbol, label: "Símbolo", labelFull: "Un símbolo (!@#$…)" },
  ];

  return (
    <div
      id={id}
      className={`border-l-2 border-slate-200 ${compact ? "py-1 pl-3" : "py-1.5 pl-3.5"}`}
      role="region"
      aria-label="Requisitos de la contraseña"
    >
      {!compact && (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Tu contraseña debe incluir
        </p>
      )}
      <ul
        className={`m-0 grid list-none p-0 ${compact ? "grid-cols-2 gap-x-3 gap-y-1.5" : "gap-1.5"}`}
        aria-live="polite"
      >
        {items.map((item) => (
          <li
            key={item.labelFull}
            className={`flex items-center gap-2 leading-tight ${compact ? "text-[11px] sm:text-xs" : "text-[12px] sm:text-[13px]"}`}
            title={item.labelFull}
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-full transition-all ${compact ? "size-4" : "size-[18px]"} ${
                item.met
                  ? "bg-[#1e6260]"
                  : "border-2 border-slate-300 bg-transparent"
              }`}
              aria-hidden
            >
              {item.met ? (
                <Check
                  className={`text-white ${compact ? "size-2.5" : "size-3"}`}
                  strokeWidth={3.5}
                />
              ) : null}
            </span>
            <span
              className={item.met ? "font-semibold text-slate-700" : "text-slate-400"}
            >
              {compact ? item.label : item.labelFull}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Botón de Google ── */
export function GoogleAuthButton({
  disabled,
  loading,
  onClick,
}: {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[14px] border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6260]/20 disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="Continuar con Google"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.044l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
      {loading ? "Conectando con Google..." : "Continuar con Google"}
    </button>
  );
}

/* ── Divisor "o" ── */
export function AuthOrDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          o
        </span>
      </div>
    </div>
  );
}

/* ── Banner de alerta de error ── */
export function AuthAlertBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-[14px] border border-red-200 bg-red-50/80 px-3.5 py-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
      <p className="m-0 leading-snug">{message}</p>
    </div>
  );
}
