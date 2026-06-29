"use client";

import { cn } from "@/features/admin/lib/utils";

export type AdminFilterTab<T extends string> = {
  id: T;
  label: string;
  count: number;
};

type AdminFilterTabsProps<T extends string> = {
  tabs: AdminFilterTab<T>[];
  activeId: T;
  onChange: (id: T) => void;
  formatCount?: (n: number) => string;
};

export function AdminFilterTabs<T extends string>({
  tabs,
  activeId,
  onChange,
  formatCount = (n) => String(n),
}: AdminFilterTabsProps<T>) {
  return (
    <div className="w-full max-w-full overflow-x-auto rounded-xl bg-[var(--surface)] p-1 [-webkit-overflow-scrolling:touch]">
      <div className="flex w-max min-w-full items-center gap-1">
        {tabs.map((tab) => {
          const active = activeId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition sm:px-4",
                active
                  ? "bg-[var(--card)] text-[var(--brand-900)] shadow-[0_1px_3px_rgba(15,61,59,0.14)]"
                  : "text-[var(--text-muted)] hover:text-[var(--brand-800)]",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-sm px-1.5 py-0.5 text-xs",
                  active
                    ? "bg-[color-mix(in_srgb,var(--brand-600)_12%,var(--surface))] text-[var(--brand-800)]"
                    : "bg-[var(--card)] text-[var(--brand-800)]",
                )}
              >
                {formatCount(tab.count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
