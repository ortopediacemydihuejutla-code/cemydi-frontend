"use client";

import { FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function buildCatalogSearchPath(
  search: string,
  currentParams: { get(name: string): string | null },
  keepFilters: boolean,
) {
  const nextParams = new URLSearchParams();
  const cleanSearch = search.trim();

  if (cleanSearch) {
    nextParams.set("q", cleanSearch);
  }

  if (keepFilters) {
    const preserveKeys = [
      "clasificaciones",
      "marcas",
      "tipos",
      "receta",
      "disponible",
      "sort",
      "v",
    ] as const;

    for (const key of preserveKeys) {
      const value = currentParams.get(key);
      if (value) {
        nextParams.set(key, value);
      }
    }
  }

  const query = nextParams.toString();
  return query ? `/catalogo?${query}` : "/catalogo";
}

export function HeaderSearchSkeleton() {
  return (
    <div
      className="relative h-12 w-full max-w-full animate-pulse rounded-full bg-white/15 lg:max-w-[560px]"
      aria-hidden="true"
    />
  );
}

type HeaderSearchProps = {
  inputId?: string;
};

export default function HeaderSearch({ inputId = "header-search" }: HeaderSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchValue = String(formData.get("header-search") ?? "");
    const keepFilters = pathname === "/catalogo";
    const destination = buildCatalogSearchPath(
      searchValue,
      searchParams,
      keepFilters,
    );
    router.push(destination);
  };

  return (
    <form className="relative w-full max-w-full lg:max-w-[560px]" onSubmit={onSearchSubmit}>
      <label htmlFor={inputId} className="sr-only">
        Buscar productos
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
      >
        <svg viewBox="0 0 16 16" className="size-4">
          <circle
            cx="6.5"
            cy="6.5"
            r="4.5"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
          />
          <path
            d="M10.2 10.2 14 14"
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </span>
      <input
        id={inputId}
        key={`${pathname}-${searchParams.get("q") ?? ""}`}
        name="header-search"
        type="search"
        placeholder="Buscar productos..."
        className="h-12 w-full rounded-full border border-white/25 bg-white/15 py-0 pr-[104px] pl-11 text-[0.95rem] text-white outline-none placeholder:text-white/82 focus:border-white/55"
        defaultValue={pathname === "/catalogo" ? (searchParams.get("q") ?? "") : ""}
      />
      <button
        type="submit"
        className="absolute top-1/2 right-[6px] h-9 -translate-y-1/2 rounded-full border-0 bg-white/92 px-[14px] font-extrabold text-[#1e6260]"
      >
        Buscar
      </button>
    </form>
  );
}
