import Image from "next/image";
import Link from "next/link";
import {
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Share2,
  UsersRound,
} from "lucide-react";

const quickLinks = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/quienes-somos", label: "Quienes somos" },
  { href: "/contactanos", label: "Contactanos" },
  { href: "/login", label: "Iniciar sesion" },
  { href: "/register", label: "Crear cuenta" },
];

const locations = [
  "Av. General Corona del Rosal #50, Col. 5 de Mayo, Huejutla de Reyes, Hgo.",
  "Av. Javier Rojo Gomez #26, Col. 5 de Mayo, Huejutla de Reyes, Hgo.",
];

const socialLinks = [
  { href: "/contactanos", label: "Facebook", icon: UsersRound },
  { href: "/contactanos", label: "Twitter", icon: MessageCircle },
  { href: "/contactanos", label: "Instagram", icon: Camera },
  { href: "/contactanos", label: "LinkedIn", icon: Share2 },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white text-foreground">
      <div className="mx-auto grid max-w-[82.5rem] gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1.15fr_0.75fr_1fr_0.8fr] lg:px-14">
        
        {/* Cambié 'grid' por 'flex flex-col' para que el margen negativo se aplique mejor */}
        <section className="relative flex flex-col gap-4 overflow-hidden">
          <div className="absolute top-0 right-6 size-24 rounded-full bg-primary/10 blur-2xl" />
          
          {/* Aumenté el margen negativo inferior (-mb-16) para jalar el texto hacia arriba */}
          <Link href="/" className="relative flex items-center no-underline -mt-6 -mb-16 md:-mt-8 md:-mb-20 w-fit z-10">
            <Image
              src="/logoOriginalEslogan.svg"
              alt="CEMYDI"
              width={340}
              height={152}
              className="h-auto w-[15rem] object-contain sm:w-[17.5rem] md:w-[20rem]"
              priority
            />
          </Link>

          <div className="relative grid gap-2 z-10">
            <h2 className="m-0 text-2xl leading-tight text-foreground md:text-3xl">
              Mantente conectado
            </h2>
            <p className="m-0 max-w-[26.875rem] text-sm leading-6 text-muted-foreground">
              Recibe orientacion, disponibilidad de equipos y novedades para movilidad,
              rehabilitacion y cuidado en casa.
            </p>
          </div>
          
          <div className="relative mt-1 max-w-[26.25rem] z-10">
            <label className="sr-only" htmlFor="footer-email">
              Correo electronico
            </label>
            <input
              id="footer-email"
              name="correo"
              type="email"
              placeholder="tu@correo.com"
              className="min-h-12 w-full rounded-lg border border-input bg-background px-4 pr-14 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-white"
            />
            <Link
              href="mailto:contacto@cemydi.com"
              className="absolute top-1 right-1 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-[#154f4d]"
              aria-label="Enviar correo"
            >
              <Send className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="grid content-start gap-3">
          <h3 className="m-0 text-lg text-foreground">Enlaces rapidos</h3>
          <nav className="grid gap-1.5 text-sm" aria-label="Enlaces del footer">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-0 w-fit items-center py-1.5 text-muted-foreground no-underline transition hover:text-primary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </section>

        <section className="grid content-start gap-4">
          <h3 className="m-0 text-lg text-foreground">Contacto</h3>
          <address className="grid gap-3 text-sm not-italic text-muted-foreground">
            <Link
              href="tel:7896880251"
              className="flex min-h-0 items-start gap-3 text-muted-foreground no-underline transition hover:text-primary"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>789 688 0251</span>
            </Link>
            <Link
              href="mailto:contacto@cemydi.com"
              className="flex min-h-0 items-start gap-3 break-all text-muted-foreground no-underline transition hover:text-primary"
            >
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>contacto@cemydi.com</span>
            </Link>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="grid gap-2 leading-6">
                {locations.map((location) => (
                  <p key={location} className="m-0">
                    {location}
                  </p>
                ))}
              </div>
            </div>
          </address>
        </section>

        <section className="grid content-start gap-4">
          <h3 className="m-0 text-lg text-foreground">Siguenos</h3>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-primary no-underline transition hover:border-primary/40 hover:bg-accent"
                aria-label={label}
                title={label}
              >
                <Icon className="size-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <div className="grid gap-2 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
            <p className="m-0 font-semibold text-foreground">Horario de atencion</p>
            <p className="m-0">Lunes a sabado</p>
            <p className="m-0">9:00 am - 7:00 pm</p>
          </div>
        </section>
      </div>

      <div className="mx-auto flex max-w-[82.5rem] flex-col items-center justify-between gap-3 border-t border-border px-5 py-5 text-center text-sm text-muted-foreground md:flex-row md:px-8 md:text-left lg:px-14">
        <small>
          © {new Date().getFullYear()} CEMYDI. Todos los derechos reservados.
        </small>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Legal">
          <Link href="/politicas-de-privacidad" className="min-h-0 text-muted-foreground no-underline hover:text-primary hover:underline">
            Política de privacidad
          </Link>
          <Link href="/terminos-y-condiciones" className="min-h-0 text-muted-foreground no-underline hover:text-primary hover:underline">
            Términos y condiciones
          </Link>
        </nav>
      </div>  
    </footer>
  );
}
