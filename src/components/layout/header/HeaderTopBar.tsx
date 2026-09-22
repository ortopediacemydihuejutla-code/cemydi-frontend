"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface HeaderTopBarProps {
  isHidden?: boolean;
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M23.9981 11.9991C23.9981 5.37216 18.626 0 11.9991 0C5.37216 0 0 5.37216 0 11.9991C0 17.9882 4.38789 22.9522 10.1242 23.8524V15.4676H7.07758V11.9991H10.1242V9.35553C10.1242 6.34826 11.9156 4.68714 14.6564 4.68714C15.9692 4.68714 17.3424 4.92149 17.3424 4.92149V7.87439H15.8294C14.3388 7.87439 13.8739 8.79933 13.8739 9.74824V11.9991H17.2018L16.6698 15.4676H13.8739V23.8524C19.6103 22.9522 23.9981 17.9882 23.9981 11.9991Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  );
}

export function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const SOCIAL_NETWORKS = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/OrtopediaCEMYDI",
    ariaLabel: "Visitar página de Facebook de CEMYDI",
    Icon: FacebookIcon,
    hoverClass: "hover:text-[#4599ff] hover:bg-white/10",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/527896880251?text=Hola%20Ortopedia%20CEMYDI%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n",
    ariaLabel: "Contactar por WhatsApp a CEMYDI",
    Icon: WhatsAppIcon,
    hoverClass: "hover:text-[#38e07b] hover:bg-white/10",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    ariaLabel: "Visitar perfil de Instagram de CEMYDI",
    Icon: InstagramIcon,
    hoverClass: "hover:text-[#ff6b8b] hover:bg-white/10",
  },
] as const;

export default function HeaderTopBar({ isHidden = false }: HeaderTopBarProps) {
  return (
    <aside
      aria-label="Barra informativa superior"
      aria-hidden={isHidden}
      className={cn(
        "grid w-full overflow-hidden bg-[#000000] text-xs text-white/80 [&_a]:min-h-0 [&_a]:min-w-0 [&_button]:min-h-0 [&_button]:min-w-0",
        "transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
        isHidden
          ? "grid-rows-[0fr] opacity-0 pointer-events-none select-none"
          : "grid-rows-[1fr] opacity-100",
      )}
    >
      <div
        className={cn(
          "min-h-0 overflow-hidden transition-[transform,opacity] duration-300 ease-in-out motion-reduce:transition-none",
          isHidden ? "-translate-y-2 opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        <div className="flex h-9 w-full flex-nowrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 xl:px-14">
          {/* Ubicaciones y Direcciones */}
          <div className="flex min-w-0 flex-nowrap items-center gap-2 whitespace-nowrap">
            <MapPinIcon className="size-3.5 shrink-0 text-[#32a39f]" />

            {/* Versión móvil */}
            <div className="flex flex-nowrap items-center gap-1.5 sm:hidden">
              <span className="font-semibold text-white leading-none">Huejutla, Hgo.</span>
              <span className="text-white/30 leading-none">·</span>
              <Link
                href="/contactanos"
                tabIndex={isHidden ? -1 : 0}
                className="inline-flex min-h-0 min-w-0 items-center truncate text-[#32a39f] underline-offset-2 transition-colors hover:text-white hover:underline leading-none"
                title="Ver direcciones completas de las sucursales"
              >
                2 Sucursales
              </Link>
            </div>

            {/* Versión desktop */}
            <div className="hidden min-w-0 flex-nowrap items-center gap-2 text-[11px] sm:flex md:text-xs">
              <span className="font-semibold tracking-wide text-[#32a39f] leading-none">
                Huejutla:
              </span>
              <Link
                href="https://www.google.com/maps/search/?api=1&query=21.13933997554219,-98.41366661725819"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isHidden ? -1 : 0}
                className="inline-flex min-h-0 min-w-0 items-center truncate text-white/75 transition-colors hover:text-white hover:underline leading-none"
                title="Abrir ubicación de Farmacia CEMYDI en Google Maps"
              >
                Av. Corona del Rosal #50
              </Link>
              <span className="text-white/20 leading-none" aria-hidden="true">
                |
              </span>
              <Link
                href="https://www.google.com/maps/search/?api=1&query=21.140689216016696,-98.42068715330267"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isHidden ? -1 : 0}
                className="inline-flex min-h-0 min-w-0 items-center truncate text-white/75 transition-colors hover:text-white hover:underline leading-none"
                title="Abrir ubicación de Ortopedia CEMYDI en Google Maps"
              >
                Av. Javier Rojo Gómez #26
              </Link>
            </div>
          </div>

          {/* Teléfono y Redes Sociales */}
          <div className="flex shrink-0 flex-nowrap items-center gap-3 sm:gap-4 whitespace-nowrap">
            {/* Teléfono directo */}
            <div className="hidden flex-nowrap items-center gap-1.5 text-[11px] md:flex md:text-xs">
              <span className="text-white/50 leading-none">Atención:</span>
              <Link
                href="tel:7896880251"
                tabIndex={isHidden ? -1 : 0}
                className="inline-flex min-h-0 min-w-0 items-center font-bold text-[#32a39f] transition-colors hover:text-white leading-none"
              >
                789 688 0251
              </Link>
            </div>

            <div
              className="hidden h-3.5 w-px bg-white/20 md:block"
              aria-hidden="true"
            />

            {/* Redes Sociales */}
            <div className="flex flex-nowrap items-center gap-1">
              <span className="sr-only">Nuestras redes sociales</span>
              {SOCIAL_NETWORKS.map(({ name, href, ariaLabel, Icon, hoverClass }) => (
                <Link
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={ariaLabel}
                  title={name}
                  tabIndex={isHidden ? -1 : 0}
                  className={cn(
                    "inline-flex size-7 min-h-0 min-w-0 items-center justify-center rounded-full text-white/70 transition-all duration-200",
                    hoverClass,
                  )}
                >
                  <Icon className="size-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
