import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Database, UserRoundMinus } from "lucide-react";
import { AccountDeletionForm } from "@/components/account/AccountDeletionForm";

export const metadata: Metadata = {
  title: "Eliminar cuenta",
  description:
    "Solicita la eliminación de tu cuenta CEMYDI y sus datos mediante un código enviado a tu correo.",
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="bg-(--brand-900) text-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Eliminar tu cuenta CEMYDI
          </h1>
          <p className="mt-4 max-w-[55ch] leading-7 text-white/90">
            Puedes solicitar la eliminación de tu cuenta y tus datos desde esta
            página, aunque ya no tengas instalada la app.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-8">
          <AccountDeletionForm />
        </div>

        <section aria-labelledby="deletion-consequences">
          <h2 id="deletion-consequences" className="text-2xl font-semibold tracking-tight">
            Qué pasa con tu cuenta
          </h2>
          <div className="mt-2 divide-y divide-border">
            <section className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 py-5">
              <UserRoundMinus aria-hidden="true" className="mt-0.5 size-5 text-(--brand-800)" />
              <div>
                <h3 className="font-semibold">Datos que se eliminan</h3>
                <p className="mt-1.5 text-sm leading-6 text-foreground/75">
                  Eliminaremos tu perfil, credenciales, favoritos, carrito, reseñas,
                  preferencias, notificaciones y recetas almacenadas. Cerraremos tus
                  sesiones cuando empiece la eliminación definitiva.
                </p>
              </div>
            </section>
            <section className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 py-5">
              <CalendarClock aria-hidden="true" className="mt-0.5 size-5 text-(--brand-800)" />
              <div>
                <h3 className="font-semibold">Rentas, devoluciones y depósitos pendientes</h3>
                <p className="mt-1.5 text-sm leading-6 text-foreground/75">
                  Podrás acceder a tu cuenta para resolverlos, pero no podrás
                  solicitar nuevas rentas. La eliminación continuará automáticamente
                  cuando termines de resolver los pendientes.
                </p>
              </div>
            </section>
            <section className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 py-5">
              <Database aria-hidden="true" className="mt-0.5 size-5 text-(--brand-800)" />
              <div>
                <h3 className="font-semibold">Historial y copias de respaldo</h3>
                <p className="mt-1.5 text-sm leading-6 text-foreground/75">
                  El historial operativo se conserva sin tus datos personales.
                  La eliminación termina cuando se borran los archivos, un proceso
                  que puede requerir reintentos. Las copias de respaldo se depuran
                  conforme a la política de conservación y se bloquean las
                  restauraciones directas que podrían reactivar cuentas.
                </p>
              </div>
            </section>
          </div>
          <Link
            href="/politicas-de-privacidad"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-(--brand-900) underline underline-offset-4"
          >
            Consultar política de privacidad
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </section>
      </div>
    </main>
  );
}
