"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BadgePercent,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomerNotification } from "@/lib/schemas/notifications";
import { notificationHref } from "@/services/notifications";
import {
  notificationAction,
  notificationTime,
} from "./notification-presentation";

const categories = {
  SYSTEM: {
    label: "Sistema",
    Icon: ShieldCheck,
    style: "bg-slate-100 text-slate-600",
  },
  RENTAL: {
    label: "Rentas",
    Icon: ClipboardCheck,
    style: "bg-blue-50 text-blue-700",
  },
  OFFER: {
    label: "Ofertas",
    Icon: BadgePercent,
    style: "bg-amber-50 text-amber-700",
  },
};
type NotificationRowProps = {
  item: CustomerNotification;
  disabled?: boolean;
  readDisabled?: boolean;
  onRead: () => void;
};

function OfferImage({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white sm:size-14">
      {failed ? (
        <BadgePercent className="size-6 text-amber-700" aria-hidden />
      ) : (
        <Image
          src={src}
          alt=""
          width={56}
          height={56}
          unoptimized
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function NotificationRow({
  item,
  disabled = false,
  readDisabled = false,
  onRead,
}: NotificationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const unread = !item.readAt;
  const category = categories[item.category];
  const Icon = category.Icon;
  const href = notificationHref(item);
  const action = href ? notificationAction(item) : null;
  const preview = item.category === "OFFER" ? item.preview : null;
  const read = () => {
    if (unread && !readDisabled && !disabled) onRead();
  };
  const expand = () => {
    setExpanded(!expanded);
    if (!expanded) read();
  };
  const content = (
    <>
      <span
        className={`flex size-12 shrink-0 items-center justify-center self-center rounded-2xl sm:size-14 ${category.style}`}
      >
        <Icon className="size-6 sm:size-7" strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="block text-xs text-[#607173]">{category.label}</span>
        <span className="flex min-w-0 items-start gap-1">
          <span
            className={`min-w-0 break-words text-sm leading-6 ${expanded ? "" : "truncate"} ${unread ? "font-bold text-[#17333f]" : "font-medium text-[#607173]"}`}
          >
            {item.title}
          </span>
          <motion.span
            initial={false}
            animate={{ opacity: unread ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500"
            aria-hidden
          />
        </span>
        <motion.span
          initial={false}
          animate={{ height: expanded ? "auto" : 48 }}
          transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeInOut" }}
          className="block min-h-12 overflow-hidden"
        >
          <span
            className={`whitespace-pre-wrap break-words text-sm leading-6 text-[#607173] ${expanded ? "block" : "line-clamp-2"}`}
          >
            {item.body}
          </span>
        </motion.span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-3">
        <time
          dateTime={item.createdAt}
          className="block whitespace-nowrap text-[10px] text-[#607173] sm:text-xs"
        >
          {notificationTime(item.createdAt)}
        </time>
        {preview?.imageUrl ? (
          <OfferImage key={preview.imageUrl} src={preview.imageUrl} />
        ) : preview?.discountPercent ? (
          <span className="flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 px-1 text-base font-bold text-amber-700">
            -{preview.discountPercent}%
          </span>
        ) : null}
      </span>
    </>
  );
  const label = `${item.title}${unread ? ", nueva, sin leer" : ""}`;
  const rowClass =
    "flex w-full items-start gap-2 px-1 pb-0 pt-3 text-left outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#258e8b] sm:gap-3 sm:px-2";
  return (
    <motion.li
      initial={false}
      animate={{
        backgroundColor: unread ? "#ffffff" : "#fafbfc",
      }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      className="overflow-hidden border-b border-[#e7edef] last:border-b-0"
    >
      {href ? (
        <Link
          href={href}
          aria-label={label}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={(event) => {
            if (disabled) event.preventDefault();
            else read();
          }}
          className={rowClass}
        >
          {content}
        </Link>
      ) : (
        <Button
          variant="ghost"
          aria-label={label}
          disabled={disabled}
          onClick={expand}
          className={`${rowClass} h-auto justify-start whitespace-normal rounded-none font-normal`}
        >
          {content}
        </Button>
      )}
      <div className="mx-1 flex items-center gap-1 sm:mx-2">
        <Button
          variant="ghost"
          className="size-11 shrink-0 text-[#607173]"
          style={{ padding: 0 }}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Contraer" : "Leer mensaje completo"}: ${item.title}`}
          disabled={disabled}
          onClick={expand}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22 }}
            className="flex"
          >
            <ChevronDown className="size-5" aria-hidden />
          </motion.span>
        </Button>
        {unread && (
          <Button
            variant="ghost"
            aria-label={`Marcar como leída: ${item.title}`}
            disabled={disabled || readDisabled}
            className="size-11 shrink-0 text-[#607173]"
            style={{ padding: 0 }}
            onClick={read}
          >
            <Check className="size-4" aria-hidden />
          </Button>
        )}
        {action && href && (
          <Button
            asChild
            variant="ghost"
            className="ml-auto min-h-11 gap-1 px-0 text-xs font-semibold text-[#207a77]"
            style={{ paddingInline: 0 }}
          >
            <Link
              href={href}
              aria-label={`${action}: ${item.title}`}
              aria-disabled={disabled || undefined}
              tabIndex={disabled ? -1 : undefined}
              onClick={(event) => {
                if (disabled) event.preventDefault();
                else read();
              }}
            >
              {action}
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        )}
      </div>
    </motion.li>
  );
}
