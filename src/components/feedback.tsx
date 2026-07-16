"use client";

import { useEffect } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/admin/components/ui/alert-dialog";
import { Button } from "@/features/admin/components/ui/button";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  type: ToastType;
  text: string;
};

export type ConfirmDialogConfig = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger" | "success";
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

type ToastViewportProps = {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
  autoHideMs?: number;
};

export function ToastViewport({
  toasts,
  onDismiss,
  autoHideMs = 3600,
}: ToastViewportProps) {
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), autoHideMs),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [toasts, onDismiss, autoHideMs]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-[18px] right-[18px] z-[120] grid w-[min(360px,calc(100vw-24px))] gap-2.5 max-sm:top-3 max-sm:right-3 max-sm:left-3 max-sm:w-auto"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between gap-2 rounded-xl border border-transparent px-3 py-[11px] shadow-[0_10px_26px_rgba(14,36,45,0.23)] ${
            toast.type === "success"
              ? "border-[#bee8cb] bg-[#edf9f1]"
              : toast.type === "error"
                ? "border-[#f1c3c3] bg-[#ffecec]"
                : "border-[#c7dee3] bg-[#eef7f9]"
          }`}
          role="status"
        >
          <p
            className={`m-0 text-[0.92rem] font-bold ${
              toast.type === "success"
                ? "text-[#165734]"
                : toast.type === "error"
                  ? "text-[#8c1e1e]"
                  : "text-[#1c4c57]"
            }`}
          >
            {toast.text}
          </p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="cursor-pointer rounded-lg bg-[rgba(19,49,60,0.1)] px-[9px] py-1.5 text-[0.78rem] font-bold text-[#17323a]"
          >
            Cerrar
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog(config: ConfirmDialogConfig) {
  const {
    open,
    title,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    tone = "default",
    busy = false,
    onConfirm,
    onCancel,
  } = config;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !busy) onCancel();
      }}
    >
      <AlertDialogContent className="w-[min(480px,calc(100vw-2rem))]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={
              tone === "danger"
                ? "destructive"
                : tone === "success"
                  ? "success"
                  : "default"
            }
            onClick={() => void onConfirm()}
            disabled={busy}
          >
            {busy ? "Procesando..." : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
