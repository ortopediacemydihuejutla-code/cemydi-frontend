import type { Metadata } from "next";
import Link from "next/link";
import { AccountDeletionForm } from "@/components/account/AccountDeletionForm";

export const metadata: Metadata = {
  title: "Eliminar cuenta | Ortopedia CEMYDI",
  description:
    "Solicita la eliminación de tu cuenta CEMYDI y sus datos mediante un código enviado a tu correo.",
};

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-7 bg-white px-5 py-12 text-foreground sm:px-8">
      <h1 className="text-3xl font-semibold">Eliminar tu cuenta CEMYDI</h1>
      <p className="leading-7">
        Puedes solicitarlo aquí aunque ya no tengas la app instalada.
        Confirmaremos que eres titular con un código enviado al correo
        verificado de la cuenta.
      </p>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Qué eliminaremos</h2>
        <p className="leading-7">
          Tu perfil, credenciales, favoritos, carrito, reseñas, preferencias,
          notificaciones y recetas almacenadas. Se cerrarán las sesiones cuando
          comience la eliminación definitiva.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Rentas y devoluciones pendientes
        </h2>
        <p className="leading-7">
          Si hay rentas, devoluciones o depósitos pendientes, registraremos tu
          solicitud y podrás acceder para resolverlos. No podrás solicitar
          nuevas rentas. Al resolverlos, la eliminación continuará
          automáticamente.
        </p>
        <p className="leading-7">
          El historial operativo se conservará sin tus datos personales. La
          limpieza se procesa en segundo plano y puede requerir reintentos si el
          almacenamiento no responde. No se considerará completada hasta
          eliminar los archivos.
        </p>
        <p className="leading-7">
          Las copias de respaldo se depuran conforme a la política de
          conservación; las restauraciones directas quedan bloqueadas cuando
          existen solicitudes de eliminación, para impedir que se reactiven
          cuentas.
        </p>
        <Link
          href="/politicas-de-privacidad"
          className="inline-flex min-h-11 items-center text-primary underline"
        >
          Consultar política de privacidad
        </Link>
      </section>
      <AccountDeletionForm />
    </main>
  );
}
