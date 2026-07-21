"use client";

import { AlertTriangle } from "lucide-react";
import type { RentalRequest } from "@/services/rentals";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/features/admin/components/ui/alert-dialog";

type Props = {
  open: boolean;
  rental: RentalRequest | null;
  submitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export default function RentalCancellationDialog({
  open,
  rental,
  submitting,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && submitting) return;
        onOpenChange(nextOpen);
      }}
    >
      <AlertDialogContent className="w-[min(520px,calc(100vw-2rem))] border-[#dbe5e7] bg-white text-[#17333f]">
        <AlertDialogHeader className="border-b border-[#edf2f3] pb-4">
          <AlertDialogTitle className="text-[#132633]">
            Cancelar solicitud de renta
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#60727a]">
            Esta acción solo está disponible mientras la solicitud siga
            pendiente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-start gap-3 border-y border-[#f4d8a8] py-4 text-sm leading-6 text-[#845b12]">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p>
            ¿Confirmas la cancelación de la solicitud{" "}
            <strong>{rental?.folio ?? "seleccionada"}</strong>? Los documentos
            permanecerán asociados al registro para conservar su trazabilidad.
          </p>
        </div>

        <AlertDialogFooter className="border-t border-[#edf2f3] pt-4">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-xl border border-[#d6e2e4] bg-white px-5 py-3 text-sm font-bold text-[#405b65] transition hover:bg-[#f4f8f8] disabled:opacity-60"
          >
            Volver
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            disabled={!rental || submitting}
            className="rounded-xl bg-[#b42318] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8f1d18] disabled:cursor-not-allowed disabled:bg-[#cfaaa7]"
          >
            {submitting ? "Cancelando…" : "Sí, cancelar solicitud"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
