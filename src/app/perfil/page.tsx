"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import {
  AccountPageHeader,
  accountInputClassName,
} from "@/components/account/AccountPageHeader";
import { CustomerAccountShell } from "@/components/account/CustomerAccountShell";
import { AuthRouteLoading } from "@/components/auth/auth-route-loading";
import { useAuth } from "@/providers/AuthContext";
import { isProfileComplete } from "@/lib/profile-completion";
import { updateMyProfile } from "@/services/users";

type ProfileForm = {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
};

function toForm(user: Record<string, unknown>): ProfileForm {
  return {
    nombre: String(user.nombre ?? ""),
    correo: String(user.correo ?? ""),
    telefono: String(user.telefono ?? ""),
    direccion: String(user.direccion ?? ""),
  };
}

export default function PerfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, updateUser } = useAuth();
  const requestedCompletion = searchParams.get("completar") === "1";
  const [form, setForm] = useState<ProfileForm>({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "",
  });
  const [isEditing, setIsEditing] = useState(requestedCompletion);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  useEffect(() => {
    if (user) setForm(toForm(user as Record<string, unknown>));
  }, [user]);

  const cancelEdit = () => {
    if (user) setForm(toForm(user as Record<string, unknown>));
    setIsEditing(false);
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    const nombre = form.nombre.trim();
    const correo = form.correo.trim();

    if (!nombre) {
      toast.error("El nombre es obligatorio.");
      return;
    }
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      toast.error("Ingresa un correo válido.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateMyProfile({
        nombre,
        correo,
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
      });
      updateUser(result.user);
      setForm(toForm(result.user as Record<string, unknown>));
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente.");

      if (requestedCompletion && isProfileComplete(result.user)) {
        router.push("/catalogo");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthRouteLoading
        title="Cargando perfil"
        description="Preparando tus datos..."
      />
    );
  }
  if (!user) return null;

  const profileComplete = isProfileComplete(user);
  const showCompletionNotice = !profileComplete;

  return (
    <CustomerAccountShell>
      <div>
        <AccountPageHeader
          title="Información personal"
          description="Mantén actualizados los datos que usamos para tus solicitudes y entregas."
          actions={
            !isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#1f6a67] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#154f4d]"
              >
                <Pencil className="size-4" />
                Editar información
              </button>
            ) : null
          }
        />

        <form onSubmit={saveProfile} className="py-10">
          {showCompletionNotice ? (
            <div
              role="status"
              className="mb-10 flex items-start gap-4 rounded-2xl border border-[#f4c27a]/60 bg-gradient-to-r from-[#fff8ed] to-[#fff4e3] p-5 text-[#8a4b0f] shadow-sm"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#fdecd3] text-[#d97706]">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#8a4b0f]">
                  Aún debes completar tu perfil
                </p>
                <p className="mt-1 text-sm leading-6 text-[#9a5d2c]">
                  Agrega tu teléfono y dirección para continuar al catálogo y
                  gestionar entregas o solicitudes de renta.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-8 border-b border-[#e2ecec] pb-10 lg:grid-cols-[280px_1fr] lg:gap-16">
            <div>
              <h3 className="text-lg font-bold text-[#0f3d3b]">
                Información de contacto
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#5e7472]">
                Actualiza tu nombre completo, correo electrónico y la dirección predeterminada que usamos para tus entregas.
              </p>
            </div>

            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="mb-6 flex items-center gap-5 sm:col-span-2">
                <span className="grid size-16 shrink-0 place-items-center rounded-full bg-[#258e8b] text-white shadow-md ring-4 ring-[#258e8b]/15">
                  <UserRound className="size-7" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-lg font-bold text-[#0f3d3b]">
                    {form.nombre || "Cliente"}
                  </p>
                  <p className="text-sm font-medium text-[#5e7472]">
                    {user.emailVerified ? "Cuenta verificada" : "Correo por verificar"}
                  </p>
                </div>
              </div>

              <label className="grid gap-2 text-sm font-bold text-[#0f3d3b]">
                Nombre completo
                <span className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#718184]" />
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nombre: event.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className={`${accountInputClassName} pl-11`}
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#0f3d3b]">
                Correo electrónico
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#718184]" />
                  <input
                    name="correo"
                    type="email"
                    value={form.correo}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        correo: event.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className={`${accountInputClassName} pl-11`}
                    required
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#0f3d3b]">
                Teléfono
                <span className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#718184]" />
                  <input
                    name="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        telefono: event.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    placeholder="Agrega tu teléfono"
                    className={`${accountInputClassName} pl-11`}
                  />
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#0f3d3b] sm:col-span-2">
                Dirección
                <span className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-4 size-4 text-[#718184]" />
                  <textarea
                    name="direccion"
                    value={form.direccion}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        direccion: event.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Agrega una dirección de entrega"
                    className={`${accountInputClassName} h-auto min-h-[100px] resize-y py-3.5 pl-11`}
                  />
                </span>
              </label>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#cfdedd] bg-white px-5 text-sm font-bold text-[#405b65] shadow-sm transition hover:bg-[#f4f8f8] hover:text-[#0f3d3b]"
              >
                <X className="size-4" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1f6a67] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#154f4d] hover:shadow-md disabled:opacity-60"
              >
                <Save className="size-4" />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          ) : null}
        </form>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-16">
          <div>
            <h3 className="text-lg font-bold text-[#0f3d3b]">
              Seguridad
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#5e7472]">
              Configuración de privacidad y seguridad de tu cuenta.
            </p>
          </div>
          
          <div className="flex items-start gap-4">
            <CheckCircle2
              className={`mt-0.5 size-5 shrink-0 ${
                user.emailVerified ? "text-[#1f6a67]" : "text-[#d97706]"
              }`}
            />
            <div>
              <p className="text-sm font-bold text-[#0f3d3b]">
                {user.emailVerified
                  ? "Correo electrónico verificado"
                  : "Verificación de correo pendiente"}
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-[#5e7472]">
                Tus datos solo se usan para gestionar tu cuenta y tus solicitudes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CustomerAccountShell>
  );
}
