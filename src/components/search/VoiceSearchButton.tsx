"use client";

import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type VoiceSearchButtonProps = {
  isListening: boolean;
  onToggle: () => void | Promise<void>;
  variant?: "header" | "catalog";
  className?: string;
  disabled?: boolean;
};

export default function VoiceSearchButton({
  isListening,
  onToggle,
  variant = "header",
  className,
  disabled = false,
}: VoiceSearchButtonProps) {
  const isHeader = variant === "header";

  const buttonClasses = isHeader
    ? cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-full transition outline-none",
        isListening
          ? "bg-red-500 text-white shadow-md focus-visible:ring-2 focus-visible:ring-white"
          : "text-white/80 hover:bg-white/15 hover:text-white focus-visible:ring-2 focus-visible:ring-white",
        className,
      )
    : cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center rounded-md transition outline-none",
        isListening
          ? "bg-red-50 text-red-600 ring-1 ring-red-400 focus-visible:ring-2 focus-visible:ring-red-500"
          : "text-[#6f8590] hover:bg-[#eef5f6] hover:text-[#18313f] focus-visible:ring-2 focus-visible:ring-[#0f6a67]",
        className,
      );

  return (
    <button
      type="button"
      onClick={() => void onToggle()}
      disabled={disabled}
      aria-label={isListening ? "Detener búsqueda por voz" : "Buscar por voz"}
      aria-pressed={isListening}
      title={isListening ? "Escuchando... Haz clic para detener" : "Buscar por voz"}
      className={buttonClasses}
    >
      {isListening ? (
        <span
          className={cn(
            "absolute inset-0 animate-ping rounded-full opacity-75 pointer-events-none",
            isHeader ? "bg-red-400" : "bg-red-300",
          )}
          aria-hidden="true"
        />
      ) : null}
      <Mic
        className={cn("size-4 transition-transform", isListening && "scale-110 animate-pulse")}
        aria-hidden="true"
      />
    </button>
  );
}
