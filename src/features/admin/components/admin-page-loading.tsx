import { cn } from "@/features/admin/lib/utils";

type AdminPageLoadingProps = {
  /** section: área principal del listado; viewport: pantalla parcial (p. ej. antes de saber rol). */
  layout?: "section" | "viewport";
  className?: string;
};

export function AdminPageLoading({
  layout = "section",
  className,
}: AdminPageLoadingProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-4 rounded-2xl text-center",
        layout === "viewport" ? "min-h-[420px] p-8" : "min-h-[220px] p-6",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative grid size-14 place-items-center">
        <div className="absolute inset-0 rounded-full border-4 border-[color-mix(in_srgb,var(--brand-600)_18%,transparent)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--brand-700)] border-r-[var(--brand-600)]" />
        <div className="size-5 rounded-full bg-[var(--brand-700)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--brand-600)_14%,transparent)]" />
      </div>
      <div className="grid gap-1">
        <p className="m-0 text-sm font-bold text-[var(--text-main)]">
          Cargando panel
        </p>
        <p className="m-0 text-xs text-[var(--text-muted)]">
          Preparando la informacion...
        </p>
      </div>
      <span className="sr-only">Cargando panel...</span>
    </div>
  );
}
