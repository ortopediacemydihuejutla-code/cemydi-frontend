import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/admin/components/ui/card";
import { cn } from "@/features/admin/lib/utils";

export function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[var(--text-main)]">{label}</span>
      {children}
      <small className="text-[var(--text-muted)]">{hint}</small>
    </label>
  );
}

export function HeroStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-black/12 px-4 py-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/68">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold leading-tight text-white">
        {value}
      </p>
    </div>
  );
}

export function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="space-y-1 rounded-2xl border border-[var(--border-soft)] bg-[var(--card)]/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className={cn("text-sm font-medium leading-6 text-[var(--text-main)]", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export function IconInfoCard({
  icon,
  title,
  value,
  helper,
  valueClassName,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <Card className="h-full min-w-0 max-w-full overflow-hidden rounded-2xl border-[var(--border-soft)] bg-[var(--surface)]/55 shadow-none">
      <CardHeader className="gap-2 p-4 pb-2 sm:p-5 sm:pb-2">
        <CardTitle className="flex min-w-0 items-start gap-2 text-sm font-medium leading-snug text-[var(--text-main)]">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-[var(--brand-700)]">
            {icon}
          </span>
          <span className="min-w-0 break-words">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-2 px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
        <p
          className={cn(
            "min-w-0 max-w-full break-words text-2xl font-semibold leading-tight tracking-tight text-[var(--text-main)] sm:text-[1.65rem]",
            valueClassName,
          )}
        >
          {value}
        </p>
        <p className="min-w-0 break-words text-sm leading-5 text-[var(--text-muted)]">{helper}</p>
      </CardContent>
    </Card>
  );
}

export function InfoStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--card)] p-4">
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <strong className="mt-2 block text-[15px] text-[var(--text-main)]">{value}</strong>
    </div>
  );
}
