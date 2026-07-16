"use client";

import { useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";

import { Button } from "@/features/admin/components/ui/button";
import { Badge } from "@/features/admin/components/ui/badge";
import { cn } from "@/features/admin/lib/utils";

type AdminImageUploadProps = {
  id: string;
  label: string;
  description: string;
  previewSrc: string | null;
  hasLocalFile: boolean;
  disabled?: boolean;
  aspectClassName?: string;
  sourceLabel?: string;
  previewLabel?: string;
  clearLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onFileChange: (file: File | null) => void;
  onClearLocal: () => void;
};

export function AdminImageUpload({
  id,
  label,
  description,
  previewSrc,
  hasLocalFile,
  disabled = false,
  aspectClassName = "aspect-[16/7]",
  sourceLabel,
  previewLabel,
  clearLabel = "Quitar",
  emptyTitle = "Arrastra una imagen aquí",
  emptyDescription = "o haz clic para elegir desde tu equipo",
  onFileChange,
  onClearLocal,
}: AdminImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const applyFile = (file: File | null) => {
    setDragActive(false);
    onFileChange(file);
  };

  return (
    <div className="grid gap-3 text-sm font-semibold">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span>{label}</span>
          <p className="mt-1 text-xs font-normal leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {sourceLabel ? (
          <Badge variant={hasLocalFile ? "blue" : "slate"}>{sourceLabel}</Badge>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          applyFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />

      {previewSrc ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] shadow-sm">
          <div
            className={cn(
              "relative bg-[color-mix(in_srgb,var(--brand-700)_8%,var(--surface))]",
              aspectClassName,
            )}
          >
            {/* Blob URLs and remote providers are both valid previews here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="" className="size-full object-cover" />

            <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={openPicker}
                className="rounded-lg bg-white/95 text-slate-900 shadow-sm hover:bg-white"
              >
                <Upload className="size-4" aria-hidden="true" />
                Cambiar
              </Button>
              {hasLocalFile ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={disabled}
                  onClick={onClearLocal}
                  className="rounded-lg shadow-sm"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {clearLabel}
                </Button>
              ) : null}
            </div>

            {previewLabel ? (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white drop-shadow-sm">
                <ImageIcon className="size-4" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-wide uppercase">
                  {previewLabel}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Subir ${label.toLowerCase()}`}
          className={cn(
            "flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
            dragActive
              ? "border-[color-mix(in_srgb,var(--brand-600)_55%,var(--border-soft))] bg-[color-mix(in_srgb,var(--brand-600)_10%,var(--surface))]"
              : "border-[var(--border-soft)] bg-[var(--surface)] hover:border-[color-mix(in_srgb,var(--brand-600)_35%,var(--border-soft))]",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (!disabled && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled) setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragActive(false);
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (!disabled) applyFile(event.dataTransfer.files?.[0] ?? null);
          }}
        >
          <div className="grid size-14 place-items-center rounded-2xl border border-[var(--border-soft)] bg-[var(--card)] shadow-sm">
            <Upload className="size-7 text-[var(--brand-700)]" aria-hidden="true" />
          </div>
          <div>
            <p className="m-0 text-sm font-semibold text-[var(--text-main)]">
              {emptyTitle}
            </p>
            <p className="mt-1 text-xs font-normal text-[var(--text-muted)]">
              {emptyDescription}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              openPicker();
            }}
          >
            Examinar archivos
          </Button>
        </div>
      )}
    </div>
  );
}
