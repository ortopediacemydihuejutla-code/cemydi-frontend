import { Search, X } from "lucide-react";

import { cn } from "@/features/admin/lib/utils";
import { Input } from "./ui/input";

type AdminSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  wrapperClassName?: string;
  inputClassName?: string;
};

export function AdminSearchField({
  value,
  onChange,
  placeholder = "Buscar...",
  id,
  wrapperClassName,
  inputClassName,
}: AdminSearchFieldProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--text-muted)]"
        aria-hidden
      />
      <Input
        id={id}
        type="text"
        role="searchbox"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-11 rounded-md border-[var(--border-soft)] bg-[var(--surface)] pl-10 pr-10",
          inputClassName,
        )}
      />
      {value ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] outline-none transition hover:bg-[var(--card)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
