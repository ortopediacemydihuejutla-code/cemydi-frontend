"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, ImageIcon, Save, Upload, X } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/features/admin/components/page-header";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { Button } from "@/features/admin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/admin/components/ui/card";
import { Input } from "@/features/admin/components/ui/input";
import {
  defaultAboutPageContent,
  type AboutPageContent,
} from "@/services/about-page";
import {
  getAdminAboutPage,
  updateAdminAboutPage,
  type UpdateAboutPagePayload,
} from "@/services/admin/about-page";

type AboutForm = UpdateAboutPagePayload;
type ImageField = "hero" | "secondary";

const MAX_ABOUT_IMAGE_BYTES = 8 * 1024 * 1024;

function toForm(content: AboutPageContent): AboutForm {
  return {
    heroTitle: content.heroTitle,
    heroSubtitle: content.heroSubtitle,
    missionTitle: content.missionTitle,
    missionText: content.missionText,
    visionTitle: content.visionTitle,
    visionText: content.visionText,
    valuesTitle: content.valuesTitle,
    values: content.values,
    storyTitle: content.storyTitle,
    storyText: content.storyText,
    heroImageUrl: content.heroImageUrl,
    secondaryImageUrl: content.secondaryImageUrl,
  };
}

export default function AdminAboutPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AboutForm>(() => toForm(defaultAboutPageContent));
  const [valuesText, setValuesText] = useState(defaultAboutPageContent.values.join("\n"));
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-about-page"],
    queryFn: getAdminAboutPage,
  });

  const sourceContent = useMemo(
    () => data?.aboutPage ?? defaultAboutPageContent,
    [data?.aboutPage],
  );

  useEffect(() => {
    setForm(toForm(sourceContent));
    setValuesText(sourceContent.values.join("\n"));
  }, [sourceContent]);

  useEffect(() => {
    return () => {
      if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
      if (secondaryImagePreview) URL.revokeObjectURL(secondaryImagePreview);
    };
  }, [heroImagePreview, secondaryImagePreview]);

  const mutation = useMutation({
    mutationFn: ({
      payload,
      heroImageFile,
      secondaryImageFile,
    }: {
      payload: UpdateAboutPagePayload;
      heroImageFile: File | null;
      secondaryImageFile: File | null;
    }) =>
      updateAdminAboutPage(payload, {
        heroImageFile,
        secondaryImageFile,
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.setQueryData(["admin-about-page"], {
        aboutPage: result.aboutPage,
      });
      setHeroImageFile(null);
      setSecondaryImageFile(null);
      if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
      if (secondaryImagePreview) URL.revokeObjectURL(secondaryImagePreview);
      setHeroImagePreview(null);
      setSecondaryImagePreview(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    },
  });

  const setField = (field: keyof AboutForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyImageFile = (field: ImageField, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Usa un archivo de imagen.");
      return;
    }

    if (file.size > MAX_ABOUT_IMAGE_BYTES) {
      toast.error("La imagen no debe superar 8 MB.");
      return;
    }

    const preview = URL.createObjectURL(file);

    if (field === "hero") {
      if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
      setHeroImageFile(file);
      setHeroImagePreview(preview);
      return;
    }

    if (secondaryImagePreview) URL.revokeObjectURL(secondaryImagePreview);
    setSecondaryImageFile(file);
    setSecondaryImagePreview(preview);
  };

  const clearLocalImage = (field: ImageField) => {
    if (field === "hero") {
      if (heroImagePreview) URL.revokeObjectURL(heroImagePreview);
      setHeroImageFile(null);
      setHeroImagePreview(null);
      return;
    }

    if (secondaryImagePreview) URL.revokeObjectURL(secondaryImagePreview);
    setSecondaryImageFile(null);
    setSecondaryImagePreview(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values = valuesText
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);

    mutation.mutate({
      payload: {
        ...form,
        values,
      },
      heroImageFile,
      secondaryImageFile,
    });
  };

  if (isLoading) {
    return <AdminPageLoading />;
  }

  return (
    <>
      <PageHeader
        title="Quiénes somos"
        subtitle="Edita la misión, visión, valores e imágenes de la página institucional."
      >
        <Button asChild variant="outline">
          <Link href="/quienes-somos" target="_blank">
            <Eye className="size-4" aria-hidden="true" />
            Ver página
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Portada</CardTitle>
              <CardDescription>
                Título principal, texto inicial y foto de apertura.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
              <label className="grid gap-2 text-sm font-semibold">
                Título
                <Input
                  value={form.heroTitle}
                  onChange={(event) => setField("heroTitle", event.target.value)}
                  maxLength={90}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Descripción
                <textarea
                  value={form.heroSubtitle}
                  onChange={(event) => setField("heroSubtitle", event.target.value)}
                  rows={4}
                  maxLength={320}
                  required
                  className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>
              <ImageUploadControl
                id="about-hero-image"
                label="Imagen principal"
                description="Esta imagen aparece como fondo superior de la página."
                currentSrc={heroImagePreview ?? form.heroImageUrl ?? defaultAboutPageContent.heroImageUrl}
                hasLocalFile={Boolean(heroImageFile)}
                disabled={mutation.isPending}
                onFileChange={(file) => applyImageFile("hero", file)}
                onClearLocal={() => clearLocalImage("hero")}
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                titleKey: "missionTitle" as const,
                textKey: "missionText" as const,
                label: "Misión",
              },
              {
                titleKey: "visionTitle" as const,
                textKey: "visionText" as const,
                label: "Visión",
              },
            ].map((section) => (
              <Card key={section.label} className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle>{section.label}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
                  <label className="grid gap-2 text-sm font-semibold">
                    Título
                    <Input
                      value={form[section.titleKey]}
                      onChange={(event) => setField(section.titleKey, event.target.value)}
                      maxLength={60}
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    Texto
                    <textarea
                      value={form[section.textKey]}
                      onChange={(event) => setField(section.textKey, event.target.value)}
                      rows={7}
                      maxLength={900}
                      required
                      className="min-h-44 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </label>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Historia y cierre</CardTitle>
              <CardDescription>
                Bloque final con imagen secundaria y llamado a contacto.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
              <label className="grid gap-2 text-sm font-semibold">
                Título
                <Input
                  value={form.storyTitle}
                  onChange={(event) => setField("storyTitle", event.target.value)}
                  maxLength={90}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Texto
                <textarea
                  value={form.storyText}
                  onChange={(event) => setField("storyText", event.target.value)}
                  rows={6}
                  maxLength={1200}
                  required
                  className="min-h-40 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>
              <ImageUploadControl
                id="about-secondary-image"
                label="Imagen secundaria"
                description="Se usa en la sección final como apoyo visual."
                currentSrc={
                  secondaryImagePreview ??
                  form.secondaryImageUrl ??
                  defaultAboutPageContent.secondaryImageUrl
                }
                hasLocalFile={Boolean(secondaryImageFile)}
                disabled={mutation.isPending}
                onFileChange={(file) => applyImageFile("secondary", file)}
                onClearLocal={() => clearLocalImage("secondary")}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="grid h-fit gap-4">
          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Valores</CardTitle>
              <CardDescription>Escribe un valor por línea. Máximo 8.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
              <label className="grid gap-2 text-sm font-semibold">
                Título
                <Input
                  value={form.valuesTitle}
                  onChange={(event) => setField("valuesTitle", event.target.value)}
                  maxLength={60}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Lista
                <textarea
                  value={valuesText}
                  onChange={(event) => setValuesText(event.target.value)}
                  rows={8}
                  required
                  className="min-h-52 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle>Publicación</CardTitle>
              <CardDescription>
                Los cambios se reflejan en la página pública al guardar.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5 sm:px-6 sm:pb-6">
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                <Save className="size-4" aria-hidden="true" />
                {mutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </form>
    </>
  );
}

function ImageUploadControl({
  id,
  label,
  description,
  currentSrc,
  hasLocalFile,
  disabled,
  onFileChange,
  onClearLocal,
}: {
  id: string;
  label: string;
  description: string;
  currentSrc: string | null;
  hasLocalFile: boolean;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onClearLocal: () => void;
}) {
  return (
    <div className="grid gap-3 text-sm font-semibold">
      <div>
        <span>{label}</span>
        <p className="mt-1 text-xs font-normal leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <input
        id={id}
        type="file"
        accept="image/*,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          onFileChange(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />

      <div className="overflow-hidden rounded-lg border border-[var(--border-soft)] bg-[var(--surface)]">
        <div className="relative aspect-[16/7] bg-[color-mix(in_srgb,var(--brand-700)_8%,var(--surface))]">
          {currentSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentSrc} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[var(--text-muted)]">
              <ImageIcon className="size-8" aria-hidden="true" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={() => document.getElementById(id)?.click()}
              className="rounded-lg bg-white/95 text-[var(--text-main)] hover:bg-white"
            >
              <Upload className="size-4" aria-hidden="true" />
              Cambiar
            </Button>
            {hasLocalFile ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={onClearLocal}
                className="rounded-lg bg-white/95 text-destructive hover:bg-red-50"
              >
                <X className="size-4" aria-hidden="true" />
                Quitar
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
