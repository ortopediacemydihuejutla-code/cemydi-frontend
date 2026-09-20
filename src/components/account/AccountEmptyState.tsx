import type { LucideIcon } from "lucide-react";

export function AccountEmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`flex w-full flex-col items-center justify-center px-5 text-center ${
        compact ? "min-h-64 py-10" : "min-h-[360px] py-14"
      }`}
    >
      <span className="grid size-14 place-items-center rounded-full border border-[#d4e3e2] bg-[#edf7f6] text-[#1f6a67]">
        <Icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-[#17333f]">{title}</h2>
      <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#607173]">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
