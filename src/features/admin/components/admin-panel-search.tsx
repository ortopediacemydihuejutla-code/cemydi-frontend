"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, X } from "lucide-react";
import toast from "react-hot-toast";

import { searchAdminDestinations } from "@/features/admin/lib/admin-header-data";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const SEARCH_TOAST_ID = "admin-panel-search";

export function AdminPanelSearch({ shortcutLabel }: { shortcutLabel: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const results = useMemo(() => searchAdminDestinations(query), [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (window.matchMedia("(min-width: 640px)").matches) {
          inputRef.current?.focus();
          setOpen(true);
        } else {
          setMobileOpen(true);
          window.setTimeout(() => mobileInputRef.current?.focus(), 0);
        }
      }

      if (event.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstResult = results[0];

    if (!firstResult) {
      toast.error("No encontramos una sección con esa búsqueda.", {
        id: SEARCH_TOAST_ID,
      });
      return;
    }

    toast.dismiss(SEARCH_TOAST_ID);
    setOpen(false);
    setMobileOpen(false);
    setQuery("");
    router.push(firstResult.href);
  };

  const resultsPanel = query.trim() ? (
    <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--card)] shadow-[0_18px_45px_rgba(15,42,50,0.18)]">
      {results.length > 0 ? (
        <ul className="grid gap-1 p-1.5" aria-label="Resultados del panel">
          {results.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex min-h-12 items-center gap-3 rounded-lg px-3 py-2 outline-none transition hover:bg-[var(--surface)] focus-visible:bg-[var(--surface)] focus-visible:ring-2 focus-visible:ring-[var(--brand-600)]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  setMobileOpen(false);
                  setQuery("");
                }}
              >
                <Search className="size-4 shrink-0 text-[var(--brand-700)]" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-[var(--text-main)]">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-[var(--text-muted)]">
                    {item.description}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-[var(--text-muted)] transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 px-4 py-5 text-center text-sm text-[var(--text-muted)]">
          Sin coincidencias. Prueba con productos, rentas o usuarios.
        </p>
      )}
    </div>
  ) : null;

  return (
    <>
      <form
        className="relative hidden max-w-md flex-1 sm:block"
        role="search"
        onSubmit={submitSearch}
      >
        <label htmlFor="admin-panel-search" className="sr-only">
          Buscar en el panel
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--brand-700)]"
          aria-hidden
        />
        <Input
          ref={inputRef}
          id="admin-panel-search"
          type="text"
          role="combobox"
          aria-expanded={open && Boolean(query.trim())}
          aria-controls="admin-panel-search-results"
          autoComplete="off"
          enterKeyHint="go"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder="Buscar en el panel…"
          className="h-10 w-full rounded-[14px] border border-[var(--border-soft)] bg-[var(--card)] pl-10 pr-14 text-sm text-[var(--text-main)] shadow-none placeholder:text-[var(--text-muted)] focus-visible:border-[var(--brand-600)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--brand-600)_35%,transparent)]"
        />
        {query ? (
          <button
            type="button"
            className="absolute top-1/2 right-11 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface)]"
            aria-label="Limpiar búsqueda"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
          {shortcutLabel}
        </kbd>
        {open ? <div id="admin-panel-search-results">{resultsPanel}</div> : null}
      </form>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 rounded-full text-[var(--brand-700)] sm:hidden"
        aria-label="Buscar en el panel"
        onClick={() => {
          setMobileOpen(true);
          window.setTimeout(() => mobileInputRef.current?.focus(), 0);
        }}
      >
        <Search className="size-5" aria-hidden />
      </Button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] bg-black/35 p-3 pt-[72px] sm:hidden" role="dialog" aria-modal="true" aria-label="Buscar en el panel">
          <button className="absolute inset-0" type="button" aria-label="Cerrar búsqueda" onClick={() => setMobileOpen(false)} />
          <form className="relative mx-auto max-w-lg" role="search" onSubmit={submitSearch}>
            <div className="relative z-[1] rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] p-2 shadow-xl">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-[var(--brand-700)]" aria-hidden />
              <Input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar productos, rentas, usuarios…"
                className="h-11 border-0 bg-transparent pl-10 pr-10 shadow-none focus-visible:ring-0"
                aria-label="Buscar en el panel"
                autoComplete="off"
              />
              <button type="button" className="absolute right-4 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)]" aria-label="Cerrar búsqueda" onClick={() => setMobileOpen(false)}>
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="relative z-[1]">{resultsPanel}</div>
          </form>
        </div>
      ) : null}
    </>
  );
}
