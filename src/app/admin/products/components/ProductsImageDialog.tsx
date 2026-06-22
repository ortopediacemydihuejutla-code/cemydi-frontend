"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/features/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/features/admin/components/ui/dialog";
import type { ProductsAdminState } from "../hooks/useProducts";

type ProductsImageDialogProps = {
  state: Pick<
    ProductsAdminState,
    | "imageDialogProduct"
    | "imageDialogImages"
    | "imageDialogIndex"
    | "currentDialogImage"
    | "setImageDialogIndex"
    | "closeImageDialog"
    | "showPreviousDialogImage"
    | "showNextDialogImage"
  >;
};

export function ProductsImageDialog({ state }: ProductsImageDialogProps) {
  const {
    imageDialogProduct,
    imageDialogImages,
    imageDialogIndex,
    currentDialogImage,
    setImageDialogIndex,
    closeImageDialog,
    showPreviousDialogImage,
    showNextDialogImage,
  } = state;

  return (
    <Dialog
      open={Boolean(imageDialogProduct)}
      onOpenChange={(open) => {
        if (!open) closeImageDialog();
      }}
    >
      <DialogContent className="flex h-[min(92vh,860px)] w-[min(96vw,1380px)] max-w-none flex-col gap-0 overflow-hidden border-white/10 bg-[rgba(8,10,12,0.98)] p-0 text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {imageDialogProduct
              ? `Imágenes de ${imageDialogProduct.nombre}`
              : "Imágenes del producto"}
          </DialogTitle>
          <DialogDescription>
            Navega entre las imágenes del producto desde el visor del administrador.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 py-5 max-[640px]:px-2 max-[640px]:py-3">
          {imageDialogImages.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 size-12 rounded-full bg-black/35 text-white hover:bg-black/55 max-[640px]:left-2 max-[640px]:size-10"
                onClick={showPreviousDialogImage}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="size-6" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 size-12 rounded-full bg-black/35 text-white hover:bg-black/55 max-[640px]:right-2 max-[640px]:size-10"
                onClick={showNextDialogImage}
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="size-6" />
              </Button>
            </>
          ) : null}

          {currentDialogImage ? (
            <div className="relative h-full w-full">
              <Image
                src={currentDialogImage.imageUrl}
                alt={imageDialogProduct?.nombre ?? "Imagen del producto"}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          ) : null}
        </div>

        {imageDialogImages.length > 1 ? (
          <div className="border-t border-white/8 bg-[rgba(14,16,18,0.78)] px-3 py-2 backdrop-blur-sm max-[640px]:px-2 max-[640px]:py-1.5">
            <div className="flex items-center gap-2 overflow-x-auto">
              {imageDialogImages.map((image, index) => {
                const isActive = index === imageDialogIndex;

                return (
                  <button
                    key={`admin-image-${image.id}-${image.sortOrder}`}
                    type="button"
                    className={`relative h-14 w-14 shrink-0 overflow-hidden bg-white/5 transition max-[640px]:h-11 max-[640px]:w-11 ${
                      isActive ? "ring-2 ring-[#22f0a6]" : "opacity-70 hover:opacity-100"
                    }`}
                    onClick={() => setImageDialogIndex(index)}
                    aria-label={`Ir a imagen ${index + 1}`}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`${imageDialogProduct?.nombre ?? "Producto"} ${index + 1}`}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
