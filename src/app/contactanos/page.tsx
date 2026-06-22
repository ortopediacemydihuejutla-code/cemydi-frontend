import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  Mail,
  Navigation,
  Phone,
  Send,
  Timer,
} from "lucide-react";
import { ContactReveal } from "./ContactReveal";

export const metadata: Metadata = {
  title: "Contáctanos",
  description:
    "Contacta a Ortopedia CEMYDI por teléfono, correo o visitando nuestras ubicaciones en Huejutla de Reyes.",
  openGraph: {
    title: "Contáctanos | Ortopedia CEMYDI",
    description:
      "Formulario de contacto, teléfonos, correo y ubicaciones de Ortopedia CEMYDI.",
  },
};

const locations = [
  {
    name: "Farmacia CEMYDI",
    address: "Av. General Corona del Rosal #50, Col. 5 de Mayo, Huejutla de Reyes, Hgo.",
    phone: "789 688 0251",
    hours: "Lunes a sábado, 9:00 am - 7:00 pm",
    mapLabel: "Ver ruta",
    mapHref:
      "https://www.google.com/maps/search/?api=1&query=21.13933997554219,-98.41366661725819",
    embedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3561.4272180925873!2d-98.41366661725819!3d21.13933997554219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d7277214f82ed9%3A0x6e22c3d3258df0aa!2sOrtopedia%20CEMYDI!5e1!3m2!1ses-419!2smx!4v1782070272066!5m2!1ses-419!2smx",
  },
  {
    name: "Ortopedia CEMYDI",
    address: "Av. Javier Rojo Gómez #26, Col. 5 de Mayo, Huejutla de Reyes, Hgo.",
    phone: "789 688 0251",
    hours: "Lunes a sábado, 9:00 am - 7:00 pm",
    mapLabel: "Ver ruta",
    mapHref:
      "https://www.google.com/maps/search/?api=1&query=21.140689216016696,-98.42068715330267",
    embedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d657.8380815794355!2d-98.42068715330267!3d21.140689216016696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d72700541b9c77%3A0x3def06dd75d3f9a2!2sEstacionamiento%20y%20Pensi%C3%B3n!5e0!3m2!1ses-419!2smx!4v1782070324322!5m2!1ses-419!2smx",
  },
];

export default function ContactPage() {
  return (
    <ContactReveal>
      <section className="relative flex min-h-[520px] items-center overflow-hidden border-b border-border px-5 py-20 text-white md:px-8 lg:px-14">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,54,52,0.88)_0%,rgba(18,79,77,0.66)_44%,rgba(18,79,77,0.26)_100%),url('/img_Contactanos.png')] bg-cover bg-center" />
        <div className="relative z-[1] mx-auto flex w-full max-w-[1320px] flex-col items-center text-center">
          <h1 data-contact-reveal className="m-0 max-w-[780px] text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-normal">
            Atención sin vueltas.
          </h1>
          <p data-contact-reveal className="mt-5 mb-0 max-w-[720px] text-base leading-8 text-white/88 md:text-lg">
            Escríbenos, llámanos o ven a sucursal. Te orientamos con disponibilidad,
            precios y la mejor opción para tu necesidad.
          </p>
        </div>
      </section>

      <section className="px-5 py-10 md:px-8 lg:px-14 lg:py-14">
        <div className="mx-auto grid max-w-[1320px] gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div data-contact-reveal>
            <Link
              href="tel:7896880251"
              className="group flex h-full min-h-[172px] flex-col justify-between rounded-lg border border-border bg-card p-6 text-foreground no-underline shadow-[0_18px_42px_rgba(15,61,59,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,61,59,0.12)]"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-muted-foreground">Teléfono</span>
                <span className="text-xl font-bold group-hover:text-primary">789 688 0251</span>
              </span>
            </Link>
          </div>

          <div data-contact-reveal>
            <Link
              href="mailto:contacto@cemydi.com"
              className="group flex h-full min-h-[172px] flex-col justify-between rounded-lg border border-border bg-card p-6 text-foreground no-underline shadow-[0_18px_42px_rgba(15,61,59,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,61,59,0.12)]"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-muted-foreground">Correo</span>
                <span className="break-all text-base font-bold group-hover:text-primary">
                  contacto@cemydi.com
                </span>
              </span>
            </Link>
          </div>

          <div data-contact-reveal className="flex min-h-[172px] flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-[0_18px_42px_rgba(15,61,59,0.08)]">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Horario</span>
              <span className="text-xl font-bold text-foreground">9:00 am - 7:00 pm</span>
            </span>
          </div>

          <div data-contact-reveal className="flex min-h-[172px] flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-[0_18px_42px_rgba(15,61,59,0.08)]">
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Timer className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Respuesta</span>
              <span className="text-xl font-bold text-foreground">Horario laboral</span>
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[#f7faf9] px-5 py-14 md:px-8 lg:px-14 lg:py-20">
        <div className="mx-auto grid max-w-[1320px] gap-10 xl:grid-cols-[minmax(360px,0.8fr)_1.2fr] xl:items-start">
          <div className="grid gap-8">
            <div data-contact-reveal className="grid gap-4">
              <p className="m-0 text-sm font-bold text-primary">Ubicaciones</p>
              <h2 className="m-0 text-[clamp(1.9rem,4vw,3.35rem)] leading-tight text-foreground">
                Encuéntranos en Huejutla.
              </h2>
              <p className="m-0 max-w-[620px] text-base leading-8 text-muted-foreground">
                Dos puntos de atención para farmacia, ortopedia y servicios médicos.
              </p>
            </div>

            <div className="grid gap-4">
              {locations.map((location, index) => (
                <article
                  key={location.name}
                  data-contact-reveal
                  className="rounded-lg border border-border bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      {index + 1}
                    </span>
                    <div className="grid gap-3">
                      <div>
                        <h3 className="m-0 text-xl leading-tight text-foreground">
                          {location.name}
                        </h3>
                        <p className="mt-2 mb-0 text-sm leading-6 text-muted-foreground">
                          {location.address}
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <p className="m-0 flex gap-2">
                          <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          <Link
                            href={`tel:${location.phone.replaceAll(" ", "")}`}
                            className="min-h-0 font-semibold text-foreground no-underline hover:text-primary hover:underline"
                          >
                            {location.phone}
                          </Link>
                        </p>
                        <p className="m-0 flex gap-2">
                          <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span>{location.hours}</span>
                        </p>
                      </div>
                      <Link
                        href={location.mapHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-bold text-primary no-underline transition hover:border-primary/40 hover:bg-accent"
                      >
                        <Navigation className="size-4" aria-hidden="true" />
                        {location.mapLabel}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div data-contact-reveal className="rounded-lg border border-border bg-white p-5 shadow-sm md:p-7">
              <div className="mb-6 grid gap-2">
                <p className="m-0 text-sm font-bold text-primary">Formulario</p>
                <h2 className="m-0 text-2xl leading-tight text-foreground">
                  Déjanos tus datos.
                </h2>
                <p className="m-0 text-sm leading-6 text-muted-foreground">
                  El formulario abre tu cliente de correo con el mensaje listo para enviar.
                </p>
              </div>

              <form
                action="mailto:contacto@cemydi.com"
                method="post"
                encType="text/plain"
                className="grid gap-5"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                    Nombre
                    <input
                      name="nombre"
                      required
                      className="min-h-12 rounded-lg border border-input bg-background px-4 text-base font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white"
                      placeholder="Tu nombre"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                    Teléfono
                    <input
                      name="telefono"
                      type="tel"
                      className="min-h-12 rounded-lg border border-input bg-background px-4 text-base font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white"
                      placeholder="789 000 0000"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Correo
                  <input
                    name="correo"
                    type="email"
                    required
                    className="min-h-12 rounded-lg border border-input bg-background px-4 text-base font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white"
                    placeholder="tu@correo.com"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
                  Mensaje
                  <textarea
                    name="mensaje"
                    required
                    rows={6}
                    className="min-h-40 resize-y rounded-lg border border-input bg-background px-4 py-3 text-base font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white"
                    placeholder="Necesito información sobre..."
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-[#154f4d]"
                >
                  <Send className="size-5" aria-hidden="true" />
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>

          <div data-contact-reveal className="sticky top-28 overflow-hidden rounded-lg border border-border bg-white shadow-[0_22px_70px_rgba(15,61,59,0.12)]">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div>
                <h2 className="m-0 text-xl text-foreground">Mapa de sucursales</h2>
                <p className="mt-1 mb-0 text-sm text-muted-foreground">
                  Acerca, aleja y explora la zona desde Google Maps.
                </p>
              </div>
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                Vista satelital
              </span>
            </div>

            <div className="relative min-h-[560px] bg-muted xl:min-h-[820px]">
              <iframe
                src={locations[0].embedSrc}
                title="Mapa satelital de sucursales CEMYDI"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="pointer-events-none absolute inset-0">
                <Link
                  href={locations[0].mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto absolute top-[45%] left-[56%] flex size-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white no-underline shadow-[0_12px_28px_rgba(15,61,59,0.32)] ring-4 ring-white"
                  aria-label={`Abrir ruta a ${locations[0].name}`}
                >
                  1
                </Link>
                <Link
                  href={locations[1].mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto absolute top-[38%] left-[24%] flex size-10 items-center justify-center rounded-full bg-white text-sm font-extrabold text-primary no-underline shadow-[0_12px_28px_rgba(15,61,59,0.32)] ring-4 ring-primary"
                  aria-label={`Abrir ruta a ${locations[1].name}`}
                >
                  2
                </Link>
              </div>

              <div className="absolute right-4 bottom-4 left-4 grid gap-3 md:grid-cols-2">
                {locations.map((location, index) => (
                  <Link
                    key={location.name}
                    href={location.mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="grid gap-1 rounded-lg border border-white/70 bg-white/92 p-4 text-foreground no-underline shadow-[0_12px_28px_rgba(15,61,59,0.16)] backdrop-blur"
                  >
                    <span className="text-xs font-bold text-primary">Marcador {index + 1}</span>
                    <span className="font-bold">{location.name}</span>
                    <span className="text-xs leading-5 text-muted-foreground">
                      {location.address}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ContactReveal>
  );
}
