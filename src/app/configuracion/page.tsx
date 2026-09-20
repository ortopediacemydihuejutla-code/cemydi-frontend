"use client";

import {
  Bell,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { updateMyProfile } from "@/services/users";

type AccountPreferences = {
  rentalUpdates: boolean;
  reviewUpdates: boolean;
  promotions: boolean;
  careTips: boolean;
};

const defaultPreferences: AccountPreferences = {
  rentalUpdates: true,
  reviewUpdates: true,
  promotions: false,
  careTips: true,
};

function preferencesKey(userId: number) {
  return `cemydi:account-preferences:${userId}`;
}

function PreferenceRow({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-5 border-b border-[#deebeb] py-4 last:border-b-0">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#17333f]">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-[#607173]">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border transition ${
          checked
            ? "border-[#1f6a67] bg-[#1f6a67]"
            : "border-[#cbd9d9] bg-[#e7eeee]"
        }`}
      >
        <span
          className={`absolute left-[3px] top-[3px] size-4 rounded-full bg-white shadow-sm transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </label>
  );
}

export default function ConfiguracionPage() {
  const { user, updateUser } = useAuth();
  const [preferences, setPreferences] =
    useState<AccountPreferences>(defaultPreferences);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      const stored = window.localStorage.getItem(preferencesKey(user.id));
      if (stored) {
        setPreferences({
          ...defaultPreferences,
          ...(JSON.parse(stored) as Partial<AccountPreferences>),
        });
      }
    } catch {
      // Conservamos las preferencias predeterminadas.
    }
  }, [user]);

  const passwordRules = useMemo(
    () => getPasswordRulesStatus(password),
    [password],
  );

  const setPreference = (
    key: keyof AccountPreferences,
    checked: boolean,
  ) => {
    if (!user) return;
    const next = { ...preferences, [key]: checked };
    setPreferences(next);
    window.localStorage.setItem(preferencesKey(user.id), JSON.stringify(next));
    toast.success("Preferencia guardada.");
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const passwordError = validatePasswordPolicy(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSavingPassword(true);
      const result = await updateMyProfile({
        nombre: user.nombre,
        correo: user.correo,
        telefono: user.telefono ?? "",
        direccion: user.direccion ?? "",
        password,
      });
      updateUser(result.user);
      setPassword("");
      setConfirmPassword("");
      toast.success("Contraseña actualizada correctamente.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
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

        <section className="border-b border-[#deebeb] py-8">
          <div className="flex items-start gap-3">
            <Bell
              className="mt-0.5 size-5 shrink-0 text-[#1f6a67]"
              strokeWidth={1.8}
            />
            <div>
              <h3 className="text-lg font-semibold text-[#17333f]">
                Preferencias
              </h3>
              <p className="mt-1 text-sm text-[#607173]">
                Elige la información que quieres tener presente en tu cuenta.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <PreferenceRow
              checked={preferences.rentalUpdates}
              onChange={(checked) => setPreference("rentalUpdates", checked)}
              label="Actualizaciones de rentas"
              description="Seguimiento de estados, documentos y devoluciones."
            />
            <PreferenceRow
              checked={preferences.reviewUpdates}
              onChange={(checked) => setPreference("reviewUpdates", checked)}
              label="Estado de mis reseñas"
              description="Cambios en la revisión y publicación de opiniones."
            />
            <PreferenceRow
              checked={preferences.promotions}
              onChange={(checked) => setPreference("promotions", checked)}
              label="Promociones y novedades"
              description="Información sobre ofertas y nuevos productos."
            />
            <PreferenceRow
              checked={preferences.careTips}
              onChange={(checked) => setPreference("careTips", checked)}
              label="Consejos de cuidado"
              description="Recomendaciones para usar y conservar tus equipos."
            />
          </div>
        </section>

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
                  !password ||
                  !confirmPassword ||
                  !passwordRules.isValid
                }
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#154f4d] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Save className="size-4" />
                {savingPassword
                  ? "Guardando contraseña..."
                  : "Guardar contraseña"}
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
    </CustomerAccountShell>
  );
}
