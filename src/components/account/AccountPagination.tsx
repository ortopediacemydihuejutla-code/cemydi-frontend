"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Ellipsis,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type AccountPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
};

export function AccountPagination({
  page,
  pageSize,
  total,
  totalPages,
  disabled = false,
  onPageChange,
}: AccountPaginationProps) {
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const pages = Math.max(1, totalPages);
  const selected = new Set([
    1,
    pages,
    Math.max(1, page - 1),
    page,
    Math.min(pages, page + 1),
  ]);
  const numbers = [...selected].sort((a, b) => a - b);
  const go = (next: number) => {
    if (!disabled && next >= 1 && next <= pages && next !== page)
      onPageChange(next);
  };
  const iconButton = (
    label: string,
    next: number,
    Icon: typeof ChevronLeft,
    boundary: boolean,
  ) => (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      disabled={disabled || boundary || !total}
      onClick={() => go(next)}
      className="size-11 shrink-0 rounded-xl p-0"
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  );
  return (
    <div className="space-y-4 border-t border-[#e7edef] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs tabular-nums text-[#607173]" aria-live="polite">
          {total ? (page - 1) * pageSize + 1 : 0}–
          {Math.min(page * pageSize, total)} de {total} resultados
        </p>
        <span className="text-xs text-[#607173]">
          Página {page} de {pages}
        </span>
      </div>
      <nav
        aria-label="Paginación"
        className="flex flex-wrap items-center justify-center gap-1"
      >
        {iconButton("Primera página", 1, ChevronsLeft, page <= 1)}
        {iconButton("Página anterior", page - 1, ChevronLeft, page <= 1)}
        {numbers.map((number, index) => (
          <span key={number} className="contents">
            {index > 0 && number - numbers[index - 1] > 1 && (
              <span className="hidden w-5 justify-center text-slate-400 sm:inline-flex">
                <Ellipsis className="size-4" aria-hidden />
              </span>
            )}
            <Button
              type="button"
              variant={number === page ? "default" : "ghost"}
              aria-label={`Página ${number}`}
              aria-current={number === page ? "page" : undefined}
              disabled={disabled || !total}
              onClick={() => go(number)}
              className={`size-11 rounded-xl p-0 tabular-nums ${number === page ? "bg-[#207a77] text-white hover:bg-[#1b6f6c]" : "hidden text-[#475569] sm:inline-flex"}`}
            >
              {number}
            </Button>
          </span>
        ))}
        {iconButton("Página siguiente", page + 1, ChevronRight, page >= pages)}
        {iconButton("Última página", pages, ChevronsRight, page >= pages)}
      </nav>
      {pages > 1 && (
        <form
          className="flex flex-wrap items-center justify-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const next = Number(target);
            if (
              !/^\d+$/.test(target) ||
              !Number.isSafeInteger(next) ||
              next < 1 ||
              next > pages
            ) {
              setError(`Escribe una página del 1 al ${pages}.`);
              return;
            }
            go(next);
            setTarget("");
            setError("");
          }}
        >
          <label className="flex items-center gap-2 text-xs text-[#607173]">
            Ir a página
            <input
              aria-label="Página de destino"
              aria-invalid={!!error}
              aria-describedby={error ? "pagination-error" : undefined}
              className="h-11 w-20 rounded-xl border border-[#dce7e7] bg-white px-3 text-center text-sm text-[#17333f] outline-offset-2 focus-visible:outline-[#258e8b]"
              inputMode="numeric"
              value={target}
              disabled={disabled}
              onChange={(event) => {
                setTarget(event.target.value);
                setError("");
              }}
            />
          </label>
          <Button
            type="submit"
            variant="secondary"
            disabled={disabled}
            className="h-11 rounded-xl"
          >
            Ir
          </Button>
          {error && (
            <p
              id="pagination-error"
              role="alert"
              className="w-full text-center text-xs text-red-700"
            >
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
