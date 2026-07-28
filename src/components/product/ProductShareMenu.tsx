"use client";

import { Copy, Mail, Share2 } from "lucide-react";
import type { ElementType } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { SiFacebook, SiWhatsapp } from "react-icons/si";

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
  Icon: ElementType;
  iconClassName: string;
  buttonClassName: string;
  onClick?: () => void;
};

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
      buttonClassName: "bg-[#16706d] hover:bg-[#0f5f5c]",
    },
    {
      label: "WhatsApp",
      href: whatsappUrl,
      Icon: SiWhatsapp,
      iconClassName: "size-[22px] text-white",
      buttonClassName: "bg-[#25d366] hover:bg-[#1ebc59]",
    },
    {
      label: "Facebook",
      href: facebookUrl,
      Icon: SiFacebook,
      iconClassName: "size-[22px] text-white",
      buttonClassName: "bg-[#1877f2] hover:bg-[#0f69dc]",
    },
    {
      label: "Copiar enlace",
      Icon: Copy,
      iconClassName: "text-white",
      buttonClassName: "bg-[#344f5b] hover:bg-[#263f4a]",
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
    const actionClassName = `share-action relative grid size-10 place-items-center rounded-full transition duration-200 ease-out hover:scale-110 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f9299] focus-visible:ring-offset-2 ${action.buttonClassName}`;
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
