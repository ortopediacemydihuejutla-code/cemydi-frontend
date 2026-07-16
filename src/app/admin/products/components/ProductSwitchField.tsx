"use client";

import type { LucideIcon } from "lucide-react";

type ProductSwitchFieldProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: LucideIcon;
};

export function ProductSwitchField({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: ProductSwitchFieldProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 text-left"
    >
      <span className="flex min-w-0 flex-1 items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary dark:bg-primary/20">
            <Icon className="size-4" aria-hidden />
          </span>
        ) : null}
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <span className="text-xs leading-5 text-muted-foreground">{description}</span>
        </span>
      </span>
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${
          checked ? "border-primary bg-primary" : "border-border bg-muted"
        }`}
      >
        <span
          className={`inline-block size-5 rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
