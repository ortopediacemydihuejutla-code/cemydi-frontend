"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SEARCH_EXAMPLES = [
  "sillas de ruedas",
  "andaderas",
  "muletas",
  "fajas ortopédicas",
] as const;

const DEFAULT_SEARCH_PLACEHOLDER = "Buscar productos...";

function useAnimatedSearchPlaceholder(paused: boolean) {
  const [placeholder, setPlaceholder] = useState(DEFAULT_SEARCH_PLACEHOLDER);

  useEffect(() => {
    if (paused) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion) {
      const timeoutId = window.setTimeout(
        () => setPlaceholder("Buscar productos, por ejemplo: sillas de ruedas"),
        0,
      );
      return () => window.clearTimeout(timeoutId);
    }

    let exampleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeoutId: number;

    const updatePlaceholder = () => {
      const example = SEARCH_EXAMPLES[exampleIndex];

      if (deleting) {
        characterIndex = Math.max(0, characterIndex - 1);
      } else {
        characterIndex = Math.min(example.length, characterIndex + 1);
      }

      setPlaceholder(`Buscar ${example.slice(0, characterIndex)}`);

      let delay = deleting ? 45 : 85;

      if (!deleting && characterIndex === example.length) {
        deleting = true;
        delay = 1_500;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        exampleIndex = (exampleIndex + 1) % SEARCH_EXAMPLES.length;
        delay = 350;
      }

      timeoutId = window.setTimeout(updatePlaceholder, delay);
    };

    timeoutId = window.setTimeout(updatePlaceholder, 500);

    return () => window.clearTimeout(timeoutId);
  }, [paused]);

  return paused ? DEFAULT_SEARCH_PLACEHOLDER : placeholder;
}

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
      className="relative h-11 w-full max-w-full animate-pulse rounded-full bg-white/15 lg:max-w-[35rem]"
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
  const [isFocused, setIsFocused] = useState(false);
  const animatedPlaceholder = useAnimatedSearchPlaceholder(isFocused);

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
    <form
      className="relative flex h-10 w-full max-w-full items-center overflow-hidden rounded-full border border-white/35 bg-white/15 pl-3.5 shadow-inner transition-colors focus-within:border-white focus-within:bg-white/20 lg:max-w-[35rem]"
      onSubmit={onSearchSubmit}
    >
      <label htmlFor={inputId} className="sr-only">
        Buscar productos
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none text-white/80 shrink-0"
      >
        <svg viewBox="0 0 16 16" className="size-4">
          <circle
            cx="6.5"
            cy="6.5"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M10.2 10.2 14 14"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </span>
      <input
        id={inputId}
        key={`${pathname}-${searchParams.get("q") ?? ""}`}
        name="header-search"
        type="text"
        role="searchbox"
        enterKeyHint="search"
        autoComplete="off"
        placeholder={animatedPlaceholder}
        className="h-full w-full min-w-0 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/80"
        defaultValue={pathname === "/catalogo" ? (searchParams.get("q") ?? "") : ""}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button
        type="submit"
        className="inline-flex h-full shrink-0 items-center justify-center bg-white px-5 text-xs font-bold text-[#258e8b] transition hover:bg-slate-100 focus-visible:outline-none"
      >
        Buscar
      </button>
    </form>
  );
}
