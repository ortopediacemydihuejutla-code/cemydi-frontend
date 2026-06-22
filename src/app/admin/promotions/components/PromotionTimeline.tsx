"use client";

import { useState } from "react";

import { cn } from "@/features/admin/lib/utils";
import { formatDate } from "../utils/promotion-formatters";

type PromotionTimelineProps = {
  startAt: string;
  endAt: string;
};

export function PromotionTimeline({ startAt, endAt }: PromotionTimelineProps) {
  const [now] = useState(() => Date.now());
  const s = new Date(startAt).getTime();
  const e = new Date(endAt).getTime();
  const span = e - s;
  let pct = 0;
  if (span > 0) {
    pct = Math.min(100, Math.max(0, ((now - s) / span) * 100));
  }
  const past = now > e;
  const future = now < s;

  return (
    <div
      className="h-1 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--border-soft)_90%,transparent)]"
      title={`${formatDate(startAt)} → ${formatDate(endAt)}`}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500",
          past && "bg-slate-400/80 dark:bg-slate-500/70",
          future && "w-0 bg-amber-400/90",
          !past && !future && "bg-[color-mix(in_srgb,var(--brand-600)_85%,white)]",
        )}
        style={!past && !future ? { width: `${pct}%` } : past ? { width: "100%" } : undefined}
      />
    </div>
  );
}
