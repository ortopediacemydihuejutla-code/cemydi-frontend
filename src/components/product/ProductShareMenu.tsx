"use client";

import { Copy, Mail, Share2 } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import type { ProductShareData } from "@/lib/product-share";
import {
  copyProductShareLink,
  getFacebookShareUrl,
  getWhatsAppShareUrl,
} from "@/lib/product-share";

type ProductShareMenuProps = {
  shareData: ProductShareData;
  productName: string;
  className?: string;
  menuClassName?: string;
  triggerClassName?: string;
  compact?: boolean;
};

type ShareAction = {
  label: string;
  href?: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconClassName: string;
  buttonClassName: string;
  onClick?: () => void;
};

function FacebookIcon({
  className,
  "aria-hidden": ariaHidden,
}: {
  className?: string;
  "aria-hidden"?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.03 3.68 9.2 8.5 9.94v-7.03H7.98v-2.91h2.52V9.84c0-2.49 1.48-3.86 3.75-3.86 1.09 0 2.23.19 2.23.19v2.45h-1.26c-1.24 0-1.62.77-1.62 1.56v1.88h2.76l-.44 2.91H13.6V22A10.01 10.01 0 0 0 22 12.06Z" />
    </svg>
  );
}

function WhatsAppIcon({
  className,
  "aria-hidden": ariaHidden,
}: {
  className?: string;
  "aria-hidden"?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M20.52 3.48A11.84 11.84 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.1.55 4.15 1.6 5.95L.1 24l6.32-1.66a11.86 11.86 0 0 0 5.66 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.16-3.45-8.42Zm-8.43 18.3h-.01a9.84 9.84 0 0 1-5.01-1.37l-.36-.21-3.75.98 1-3.65-.24-.38a9.85 9.85 0 0 1-1.51-5.27C2.21 6.43 6.64 2 12.1 2a9.82 9.82 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.89 7c0 5.45-4.43 9.88-9.88 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47a8.9 8.9 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5 0 1.46 1.08 2.88 1.23 3.08.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function getMailShareUrl(shareData: ProductShareData) {
  const subject = encodeURIComponent(shareData.title);
  const body = encodeURIComponent(shareData.text);

  return `mailto:?subject=${subject}&body=${body}`;
}

export default function ProductShareMenu({
  shareData,
  productName,
  className = "",
  menuClassName = "",
  triggerClassName = "",
  compact = false,
}: ProductShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const whatsappUrl = useMemo(() => getWhatsAppShareUrl(shareData), [shareData]);
  const facebookUrl = useMemo(() => getFacebookShareUrl(shareData), [shareData]);
  const mailUrl = useMemo(() => getMailShareUrl(shareData), [shareData]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    },
    [],
  );

  const cancelScheduledClose = () => {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const scheduleClose = (pointerType: string) => {
    if (pointerType !== "mouse" && pointerType !== "pen") return;

    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 140);
  };

  const onCopyLink = async () => {
    setIsOpen(false);

    try {
      const result = await copyProductShareLink(shareData);
      if (result === "copied") {
        toast.success("Enlace copiado para compartir.");
      }
    } catch {
      toast.error("No se pudo copiar el enlace.");
    }
  };

  const shareActions: ShareAction[] = [
    {
      label: "Correo",
      href: mailUrl,
      Icon: Mail,
      iconClassName: "text-white",
      buttonClassName:
        "bg-[#16706d] ring-[#0f5b58] shadow-[0_8px_22px_rgba(22,112,109,0.25)] hover:bg-[#0f5f5c] focus-visible:ring-[#16706d]",
    },
    {
      label: "WhatsApp",
      href: whatsappUrl,
      Icon: WhatsAppIcon,
      iconClassName: "text-white",
      buttonClassName:
        "bg-[#25d366] ring-[#16a34a] shadow-[0_8px_22px_rgba(37,211,102,0.28)] hover:bg-[#1fbd5a] focus-visible:ring-[#25d366]",
    },
    {
      label: "Facebook",
      href: facebookUrl,
      Icon: FacebookIcon,
      iconClassName: "text-white",
      buttonClassName:
        "bg-[#1877f2] ring-[#0f5ec7] shadow-[0_8px_22px_rgba(24,119,242,0.27)] hover:bg-[#0f69dc] focus-visible:ring-[#1877f2]",
    },
    {
      label: "Copiar enlace",
      Icon: Copy,
      iconClassName: "text-white",
      buttonClassName:
        "bg-[#344f5b] ring-[#203944] shadow-[0_8px_22px_rgba(32,57,68,0.22)] hover:bg-[#263f4a] focus-visible:ring-[#344f5b]",
      onClick: () => void onCopyLink(),
    },
  ];

  const renderTooltip = (label: string) => (
    <span className="share-tooltip pointer-events-none absolute right-[calc(100%+10px)] top-1/2 z-10 -translate-y-1/2 rounded-md bg-[#17333f] px-2.5 py-1.5 text-xs font-bold text-white opacity-0 shadow-[0_10px_22px_rgba(12,39,49,0.18)] transition">
      {label}
    </span>
  );

  const renderAction = (action: ShareAction, index: number) => {
    const Icon = action.Icon;
    const actionClassName = `share-action relative grid size-10 place-items-center rounded-full ring-1 transition duration-200 ease-out hover:scale-110 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${action.buttonClassName}`;
    const style = {
      animation: "share-menu-item 180ms ease-out both",
      animationDelay: `${index * 34}ms`,
    };

    if (action.href) {
      return (
        <a
          key={action.label}
          role="menuitem"
          href={action.href}
          target={action.href.startsWith("http") ? "_blank" : undefined}
          rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
          className={actionClassName}
          aria-label={action.label}
          title={action.label}
          style={style}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(false);
          }}
        >
          <Icon className={`size-5 ${action.iconClassName}`} aria-hidden />
          {renderTooltip(action.label)}
        </a>
      );
    }

    return (
      <button
        key={action.label}
        role="menuitem"
        type="button"
        className={actionClassName}
        aria-label={action.label}
        title={action.label}
        style={style}
        onClick={(event) => {
          event.stopPropagation();
          action.onClick?.();
        }}
      >
        <Icon className={`size-5 ${action.iconClassName}`} aria-hidden />
        {renderTooltip(action.label)}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      data-open={isOpen ? "true" : "false"}
      className={`z-20 w-max ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
          cancelScheduledClose();
        }
      }}
      onPointerLeave={(event) => scheduleClose(event.pointerType)}
    >
      <button
        type="button"
        className={`grid place-items-center rounded-full bg-transparent text-[#176b67] drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] transition hover:scale-110 hover:bg-transparent hover:text-[#0f4f4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f6a67] focus-visible:ring-offset-2 ${
          compact ? "size-10" : "size-12"
        } ${triggerClassName}`}
        aria-label={`Compartir ${productName}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
      >
        <Share2
          className={compact ? "size-[18px] stroke-[2.2]" : "size-[22px] stroke-[2.2]"}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className={`absolute bottom-[calc(100%+10px)] right-0 flex w-max flex-col items-end gap-1.5 [animation:share-menu-pop_180ms_ease-out_both] ${menuClassName}`}
        >
          {shareActions.map((action, index) => renderAction(action, index))}
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes share-menu-pop {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes share-menu-item {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.82);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .share-action:hover .share-tooltip,
        .share-action:focus-visible .share-tooltip {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
