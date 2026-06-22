import type { ReactNode } from "react";

import {
  BadgePercent,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  CircleX,
  ClipboardList,
  Clock3,
  Eye,
  FileSignature,
  Globe2,
  Link2,
  Megaphone,
  PackageCheck,
  Percent,
  Receipt,
  ShieldAlert,
  Star,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/features/admin/lib/utils";
import { Card, CardContent } from "./ui/card";

type AdminMetricContext =
  | "products-active"
  | "products-stock"
  | "products-recipe"
  | "database-online"
  | "database-connections"
  | "database-tables"
  | "database-alerts"
  | "promotions-total"
  | "promotions-active"
  | "promotions-scheduled"
  | "reviews-total"
  | "reviews-pending"
  | "reviews-approved"
  | "reviews-rejected"
  | "reviews-featured"
  | "analytics-sessions"
  | "analytics-conversion"
  | "analytics-revenue"
  | "analytics-avg-order";

type MetricTone = {
  icon: LucideIcon;
  iconWrapperClassName: string;
  iconClassName: string;
  accentClassName: string;
};

const METRIC_TONES: Record<AdminMetricContext, MetricTone> = {
  "products-active": {
    icon: PackageCheck,
    iconWrapperClassName:
      "bg-emerald-500/12 dark:bg-emerald-400/14",
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(52,168,83,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.10),transparent_56%)]",
  },
  "products-stock": {
    icon: Warehouse,
    iconWrapperClassName:
      "bg-amber-500/12 dark:bg-amber-400/14",
    iconClassName: "text-amber-700 dark:text-amber-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_56%)]",
  },
  "products-recipe": {
    icon: FileSignature,
    iconWrapperClassName:
      "bg-slate-500/12 dark:bg-slate-400/14",
    iconClassName: "text-slate-700 dark:text-slate-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(100,116,139,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.11),transparent_56%)]",
  },
  "database-online": {
    icon: CheckCircle2,
    iconWrapperClassName:
      "bg-emerald-500/12 dark:bg-emerald-400/14",
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.10),transparent_56%)]",
  },
  "database-connections": {
    icon: Link2,
    iconWrapperClassName:
      "bg-sky-500/12 dark:bg-sky-400/14",
    iconClassName: "text-sky-700 dark:text-sky-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_56%)]",
  },
  "database-tables": {
    icon: Boxes,
    iconWrapperClassName:
      "bg-violet-500/12 dark:bg-violet-400/14",
    iconClassName: "text-violet-700 dark:text-violet-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.10),transparent_56%)]",
  },
  "database-alerts": {
    icon: ShieldAlert,
    iconWrapperClassName:
      "bg-amber-500/12 dark:bg-amber-400/14",
    iconClassName: "text-amber-700 dark:text-amber-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_56%)]",
  },
  "promotions-total": {
    icon: Megaphone,
    iconWrapperClassName:
      "bg-indigo-500/12 dark:bg-indigo-400/14",
    iconClassName: "text-indigo-700 dark:text-indigo-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.10),transparent_56%)]",
  },
  "promotions-active": {
    icon: BadgePercent,
    iconWrapperClassName:
      "bg-teal-500/12 dark:bg-teal-400/14",
    iconClassName: "text-teal-700 dark:text-teal-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.10),transparent_56%)]",
  },
  "promotions-scheduled": {
    icon: Clock3,
    iconWrapperClassName:
      "bg-orange-500/12 dark:bg-orange-400/14",
    iconClassName: "text-orange-700 dark:text-orange-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,146,60,0.10),transparent_56%)]",
  },
  "reviews-total": {
    icon: Star,
    iconWrapperClassName:
      "bg-blue-500/12 dark:bg-blue-400/14",
    iconClassName: "text-blue-700 dark:text-blue-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.10),transparent_56%)]",
  },
  "reviews-pending": {
    icon: ClipboardList,
    iconWrapperClassName:
      "bg-amber-500/12 dark:bg-amber-400/14",
    iconClassName: "text-amber-700 dark:text-amber-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_56%)]",
  },
  "reviews-approved": {
    icon: CheckCircle2,
    iconWrapperClassName:
      "bg-emerald-500/12 dark:bg-emerald-400/14",
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.10),transparent_56%)]",
  },
  "reviews-rejected": {
    icon: CircleX,
    iconWrapperClassName:
      "bg-rose-500/12 dark:bg-rose-400/14",
    iconClassName: "text-rose-700 dark:text-rose-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.10),transparent_56%)]",
  },
  "reviews-featured": {
    icon: Eye,
    iconWrapperClassName:
      "bg-teal-500/12 dark:bg-teal-400/14",
    iconClassName: "text-teal-700 dark:text-teal-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.10),transparent_56%)]",
  },
  "analytics-sessions": {
    icon: Globe2,
    iconWrapperClassName:
      "bg-cyan-500/12 dark:bg-cyan-400/14",
    iconClassName: "text-cyan-700 dark:text-cyan-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_56%)]",
  },
  "analytics-conversion": {
    icon: Percent,
    iconWrapperClassName:
      "bg-fuchsia-500/12 dark:bg-fuchsia-400/14",
    iconClassName: "text-fuchsia-700 dark:text-fuchsia-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(192,38,211,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(232,121,249,0.10),transparent_56%)]",
  },
  "analytics-revenue": {
    icon: CircleDollarSign,
    iconWrapperClassName:
      "bg-emerald-500/12 dark:bg-emerald-400/14",
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.10),transparent_56%)]",
  },
  "analytics-avg-order": {
    icon: Receipt,
    iconWrapperClassName:
      "bg-sky-500/12 dark:bg-sky-400/14",
    iconClassName: "text-sky-700 dark:text-sky-300",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_56%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_56%)]",
  },
};

interface AdminMetricCardProps {
  context: AdminMetricContext;
  label: string;
  value: ReactNode;
  helper?: string;
  className?: string;
}

export function AdminMetricCard({
  context,
  label,
  value,
  helper,
  className,
}: AdminMetricCardProps) {
  const tone = METRIC_TONES[context];
  const Icon = tone.icon;

  return (
    <Card
      className={cn(
        "group relative min-h-[148px] overflow-hidden rounded-3xl border border-(--border-soft) bg-(--card) shadow-[0_8px_28px_rgba(15,61,59,0.07)] ring-1 ring-black/3 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(15,61,59,0.1)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.38)] dark:ring-white/6 dark:hover:shadow-[0_18px_48px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-100",
          tone.accentClassName,
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.14)_0%,transparent_42%,transparent_100%)] dark:bg-[linear-gradient(165deg,rgba(255,255,255,0.06)_0%,transparent_45%)]"
      />

      <CardContent className="relative flex h-full flex-col gap-5 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-[0.9375rem] font-semibold leading-snug tracking-tight text-(--text-muted) sm:text-[1rem]">
              {label}
            </p>
            {helper ? (
              <p className="mt-2 max-w-[20rem] text-xs font-normal leading-relaxed text-(--text-muted)/88 sm:text-[0.8125rem]">
                {helper}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "flex size-13 shrink-0 items-center justify-center rounded-2xl border border-white/50 shadow-[0_4px_14px_rgba(15,61,59,0.08),inset_0_1px_0_rgba(255,255,255,0.45)] ring-1 ring-black/4 transition-transform duration-300 ease-out group-hover:scale-[1.06] dark:border-white/10 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:ring-white/7",
              tone.iconWrapperClassName,
            )}
          >
            <Icon className={cn("size-5.5", tone.iconClassName)} aria-hidden />
          </div>
        </div>

        <div className={cn(helper ? "mt-auto" : "")}>
          <p className="text-[2rem] font-bold leading-[1.05] tracking-[-0.045em] text-(--text-main) tabular-nums sm:text-[2.35rem]">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
