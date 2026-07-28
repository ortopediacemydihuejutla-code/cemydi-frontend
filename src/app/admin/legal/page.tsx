"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Cookie,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { AdminFilterTabs } from "@/features/admin/components/admin-filter-tabs";
import { PageHeader } from "@/features/admin/components/page-header";
import { PublicPageLinkButton } from "@/features/admin/components/public-page-link-button";
import { RichTextEditor } from "@/features/admin/components/rich-text-editor";
import { Button } from "@/features/admin/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/features/admin/components/ui/card";
import { Input } from "@/features/admin/components/ui/input";
import {
  defaultLegalDocuments,
  type LegalCustomSection,
  type LegalDocument,
  type LegalDocumentSlug,
} from "@/services/legal-documents";
import {
  getAdminLegalDocument,
  updateAdminLegalDocument,
  type UpdateLegalDocumentPayload,
} from "@/services/admin/legal-documents";

type FixedField = {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  type: "text" | "email" | "textarea" | "rich" | "toggle";
};

type FixedSection = {
  id: string;
  title: string;
  description?: string;
  fields: FixedField[];
  variant?: "medical-alert";
};

const DOCUMENT_OPTIONS: Array<{
  slug: LegalDocumentSlug;
  label: string;
  count: number;
}> = [
  {
    slug: "politicas-de-privacidad",
    label: "Política de privacidad",
    count: 10,
  },
  {
    slug: "terminos-y-condiciones",
    label: "Términos y condiciones",
    count: 16,
  },
];

const rich = (
  key: string,
  label: string,
  description?: string,
): FixedField => ({ key, label, description, type: "rich" });

const PRIVACY_SECTIONS: FixedSection[] = [
  {
    id: "responsable",
    title: "Responsable del tratamiento",
    description: "Datos de identificación y contacto del responsable.",
    fields: [
      { key: "companyName", label: "Razón social / empresa", type: "text" },
      { key: "taxId", label: "RFC / identificación", type: "text" },
      { key: "address", label: "Domicilio físico", type: "textarea" },
      { key: "privacyEmail", label: "Correo de privacidad", type: "email" },
    ],
  },
  {
    id: "datos-recopilados",
    title: "Datos personales que recopilamos",
    fields: [rich("personalDataCollected", "Contenido")],
  },
  {
    id: "datos-medicos",
    title: "Datos sensibles y médicos",
    fields: [
      rich(
        "medicalData",
        "Contenido",
        "Explica qué datos sensibles pueden recopilarse y cómo se protegen.",
      ),
    ],
  },
  {
    id: "uso-informacion",
    title: "Uso de la información",
    fields: [rich("informationUse", "Contenido")],
  },
  {
    id: "consentimiento",
    title: "Consentimiento y fundamento del tratamiento",
    fields: [rich("consentAndLegalBasis", "Contenido")],
  },
  {
    id: "transferencias",
    title: "Transferencia a terceros",
    fields: [rich("thirdPartyTransfer", "Contenido")],
  },
  {
    id: "cookies",
    title: "Uso de cookies",
    fields: [
      { key: "cookiesEnabled", label: "Cookies habilitadas", type: "toggle" },
      rich("cookiesContent", "Detalle del uso de cookies"),
    ],
  },
  {
    id: "derechos-arco",
    title: "Derechos ARCO",
    fields: [rich("arcoRights", "Contenido")],
  },
  {
    id: "conservacion-seguridad",
    title: "Conservación y seguridad",
    fields: [rich("retentionAndSecurity", "Contenido")],
  },
  {
    id: "cambios-privacidad",
    title: "Cambios al aviso y contacto",
    fields: [rich("privacyChanges", "Contenido")],
  },
];

const TERMS_SECTIONS: FixedSection[] = [
  {
    id: "aceptacion-alcance",
    title: "Aceptación y alcance",
    fields: [rich("acceptanceAndScope", "Contenido")],
  },
  {
    id: "cuentas-elegibilidad",
    title: "Cuentas y capacidad para contratar",
    fields: [rich("accountEligibility", "Contenido")],
  },
  {
    id: "productos-precios",
    title: "Productos, precios y disponibilidad",
    fields: [rich("productsPricingAvailability", "Contenido")],
  },
  {
    id: "descargo-medico",
    title: "Descargo médico",
    description: "En el sitio público se mostrará como una alerta destacada.",
    fields: [rich("medicalDisclaimer", "Contenido")],
    variant: "medical-alert",
  },
  {
    id: "ventas-envios",
    title: "Ventas — Envíos y tiempos",
    fields: [rich("salesShipping", "Contenido")],
  },
  {
    id: "ventas-garantias",
    title: "Ventas — Garantías",
    fields: [rich("salesWarranties", "Contenido")],
  },
  {
    id: "devoluciones-cancelaciones",
    title: "Cancelaciones, cambios y devoluciones",
    fields: [rich("returnsAndCancellations", "Contenido")],
  },
  {
    id: "rentas-requisitos",
    title: "Rentas — Requisitos y documentos",
    fields: [rich("rentalRequirements", "Contenido")],
  },
  {
    id: "rentas-depositos",
    title: "Rentas — Depósitos (fianza)",
    fields: [rich("rentalDeposits", "Contenido")],
  },
  {
    id: "rentas-higiene",
    title: "Rentas — Higiene y estado",
    fields: [rich("rentalHygiene", "Contenido")],
  },
  {
    id: "rentas-penalizaciones",
    title: "Rentas — Penalizaciones",
    fields: [rich("rentalPenalties", "Contenido")],
  },
  {
    id: "instalacion-domicilio",
    title: "Instalación a domicilio",
    fields: [rich("homeInstallation", "Contenido")],
  },
  {
    id: "pagos-facturacion",
    title: "Métodos de pago y facturación",
    fields: [rich("paymentAndBilling", "Contenido")],
  },
  {
    id: "responsabilidad-uso",
    title: "Uso seguro y responsabilidad",
    fields: [rich("liabilityAndSafeUse", "Contenido")],
  },
  {
    id: "propiedad-intelectual",
    title: "Propiedad intelectual",
    fields: [rich("intellectualProperty", "Contenido")],
  },
  {
    id: "cambios-reclamaciones",
    title: "Cambios, contacto y reclamaciones",
    fields: [rich("changesAndClaims", "Contenido")],
  },
];

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function toForm(document: LegalDocument): UpdateLegalDocumentPayload {
  return {
    title: document.title,
    description: document.description,
    fields: { ...document.fields },
    customSections: document.customSections.map((section) => ({ ...section })),
  };
}

function createSection(): LegalCustomSection {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `section-${Date.now()}`,
    title: "Nueva sección",
    body: "",
  };
}

function readOrder(
  value: string | boolean | undefined,
  availableIds: string[],
) {
  let saved: string[] = [];
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    if (Array.isArray(parsed)) {
      saved = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    saved = [];
  }
  const available = new Set(availableIds);
  return [
    ...saved.filter(
      (id, index) => available.has(id) && saved.indexOf(id) === index,
    ),
    ...availableIds.filter((id) => !saved.includes(id)),
  ];
}

export default function AdminLegalPage() {
  const queryClient = useQueryClient();
  const [activeSlug, setActiveSlug] = useState<LegalDocumentSlug>(
    "politicas-de-privacidad",
  );
  const [form, setForm] = useState<UpdateLegalDocumentPayload>(() =>
    toForm(defaultLegalDocuments[activeSlug]),
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>();

  const { data } = useQuery({
    queryKey: ["admin-legal-document", activeSlug],
    queryFn: () => getAdminLegalDocument(activeSlug),
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(toForm(data?.document ?? defaultLegalDocuments[activeSlug]));
  }, [activeSlug, data?.document]);

  const mutation = useMutation({
    mutationFn: ({
      slug,
      payload,
    }: {
      slug: LegalDocumentSlug;
      payload: UpdateLegalDocumentPayload;
    }) => updateAdminLegalDocument(slug, payload),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(["admin-legal-document", variables.slug], {
        document: result.document,
      });
      toast.success(result.message);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudieron guardar los cambios",
      );
    },
  });

  const fixedSections =
    activeSlug === "politicas-de-privacidad"
      ? PRIVACY_SECTIONS
      : TERMS_SECTIONS;
  const orderedIds = useMemo(
    () =>
      readOrder(form.fields.sectionOrder, [
        ...fixedSections.map((section) => section.id),
        ...form.customSections.map((section) => section.id),
      ]),
    [fixedSections, form.customSections, form.fields.sectionOrder],
  );
  const activeSectionId =
    selectedSectionId && orderedIds.includes(selectedSectionId)
      ? selectedSectionId
      : orderedIds[0];
  const activeSectionIndex = orderedIds.indexOf(activeSectionId);
  const activeFixedSection = fixedSections.find(
    (section) => section.id === activeSectionId,
  );
  const activeCustomSection = form.customSections.find(
    (section) => section.id === activeSectionId,
  );

  const setBaseField = (field: "title" | "description", value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const setLegalField = (key: string, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      fields: { ...current.fields, [key]: value },
    }));
  };

  const setOrder = (ids: string[]) =>
    setLegalField("sectionOrder", JSON.stringify(ids));

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= orderedIds.length) return;
    const next = [...orderedIds];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const addSection = () => {
    const section = createSection();
    setForm((current) => ({
      ...current,
      fields: {
        ...current.fields,
        sectionOrder: JSON.stringify([...orderedIds, section.id]),
      },
      customSections: [...current.customSections, section],
    }));
    setSelectedSectionId(section.id);
  };

  const setCustomSection = (
    id: string,
    field: "title" | "body" | "variant",
    value: string | undefined,
  ) => {
    setForm((current) => ({
      ...current,
      customSections: current.customSections.map((section) =>
        section.id === id
          ? field === "variant"
            ? {
                ...section,
                variant:
                  value === "medical-alert" ? "medical-alert" : undefined,
              }
            : { ...section, [field]: value ?? "" }
          : section,
      ),
    }));
  };

  const removeCustomSection = (id: string) => {
    setForm((current) => ({
      ...current,
      fields: {
        ...current.fields,
        sectionOrder: JSON.stringify(
          orderedIds.filter((sectionId) => sectionId !== id),
        ),
      },
      customSections: current.customSections.filter(
        (section) => section.id !== id,
      ),
    }));
    if (selectedSectionId === id) setSelectedSectionId(undefined);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Escribe el título del documento");
      return;
    }
    if (form.customSections.some((section) => !section.title.trim())) {
      toast.error("Todas las secciones nuevas necesitan un título");
      return;
    }

    mutation.mutate({
      slug: activeSlug,
      payload: {
        title: form.title.trim(),
        description: form.description.trim(),
        fields: Object.fromEntries(
          Object.entries(form.fields).map(([key, value]) => [
            key,
            typeof value === "string" ? value.trim() : value,
          ]),
        ),
        customSections: form.customSections.map((section) => ({
          ...section,
          title: section.title.trim(),
          body: section.body.trim(),
        })),
      },
    });
  };

  return (
    <>
      <PageHeader
        title="Contenido legal"
        subtitle="Edita, ordena y publica cada sección sin depender de cambios de programación."
      >
        <PublicPageLinkButton
          href={`/${activeSlug}`}
          pageName={form.title || "la página legal"}
        />
        <Button
          type="submit"
          variant="update"
          form="legal-document-form"
          disabled={mutation.isPending}
        >
          <Save className="size-4" aria-hidden="true" />
          {mutation.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </PageHeader>

      <div className="mt-5 grid gap-4">
        <AdminFilterTabs
          tabs={DOCUMENT_OPTIONS.map(({ slug, label, count }) => ({
            id: slug,
            label,
            count: slug === activeSlug ? orderedIds.length : count,
          }))}
          activeId={activeSlug}
          onChange={(slug) => {
            setActiveSlug(slug);
            setSelectedSectionId(undefined);
          }}
        />

        <form
          id="legal-document-form"
          onSubmit={handleSubmit}
          className="grid min-w-0 gap-4"
        >
          <div className="grid min-w-0 gap-4">
            <Card className="rounded-xl border-border shadow-none">
              <CardContent className="grid gap-4 p-4 lg:grid-cols-[190px_minmax(220px,0.9fr)_210px_minmax(320px,1.35fr)] lg:items-start">
                <div className="border-b border-border pb-3 lg:border-r lg:border-b-0 lg:pr-4 lg:pb-0">
                  <CardTitle className="text-base">Datos generales</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-5">
                    Información visible en la cabecera pública.
                  </CardDescription>
                </div>
                <FieldLabel label="Título de la página">
                  <Input
                    value={form.title}
                    onChange={(event) =>
                      setBaseField("title", event.target.value)
                    }
                    maxLength={120}
                    required
                  />
                </FieldLabel>
                <FieldLabel label="Fecha de actualización">
                  <Input
                    type="date"
                    value={String(form.fields.effectiveDate ?? "")}
                    onChange={(event) =>
                      setLegalField("effectiveDate", event.target.value)
                    }
                  />
                </FieldLabel>
                <FieldLabel
                  label="Introducción"
                  description="Opcional; si queda vacía no se publica."
                >
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setBaseField("description", event.target.value)
                    }
                    rows={2}
                    maxLength={500}
                    className={`${textareaClassName} min-h-16`}
                  />
                </FieldLabel>
              </CardContent>
            </Card>

            <div className="min-h-[620px] overflow-hidden rounded-xl border border-border bg-card lg:grid lg:grid-cols-[310px_minmax(0,1fr)]">
              <aside className="border-b border-border bg-muted/20 lg:border-r lg:border-b-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-4">
                  <div>
                    <h2 className="m-0 text-sm font-semibold">Estructura</h2>
                    <p className="mt-0.5 mb-0 text-xs text-muted-foreground">
                      {orderedIds.length} secciones
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addSection}
                    aria-label="Agregar nueva sección"
                    title="Agregar nueva sección"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                <div className="max-h-[70vh] overflow-x-hidden overflow-y-auto p-2 [scrollbar-gutter:stable]">
                  {orderedIds.map((id, index) => {
                    const fixed = fixedSections.find(
                      (section) => section.id === id,
                    );
                    const custom = form.customSections.find(
                      (section) => section.id === id,
                    );
                    if (!fixed && !custom) return null;
                    const title =
                      fixed?.title ?? custom?.title ?? "Nueva sección";
                    const selected = id === activeSectionId;

                    return (
                      <div
                        key={id}
                        className={`group mb-1 grid w-full min-w-0 grid-cols-[minmax(0,1fr)_48px] items-center rounded-md border transition ${
                          selected
                            ? "border-primary/40 bg-primary/5 shadow-xs"
                            : "border-transparent hover:bg-card/70"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedSectionId(id)}
                          className="min-w-0 overflow-hidden px-3 py-2.5 text-left"
                        >
                          <span className="mb-1 block text-[10px] font-bold tracking-wider text-muted-foreground">
                            {String(index + 1).padStart(2, "0")} ·{" "}
                            {fixed ? "BASE" : "NUEVA"}
                          </span>
                          <span className="block truncate text-xs font-semibold text-foreground">
                            {title}
                          </span>
                        </button>
                        <div className="flex pr-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveSection(index, -1)}
                            className="flex size-7 min-h-0 min-w-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
                            aria-label={`Subir ${title}`}
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === orderedIds.length - 1}
                            onClick={() => moveSection(index, 1)}
                            className="flex size-7 min-h-0 min-w-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
                            aria-label={`Bajar ${title}`}
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>

              <section className="min-w-0 p-5 sm:p-7">
                {activeFixedSection || activeCustomSection ? (
                  <>
                    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
                            Sección{" "}
                            {String(activeSectionIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {activeFixedSection
                              ? "BASE"
                              : "CREADA POR EL CLIENTE"}
                          </span>
                          {(activeFixedSection?.variant ??
                            activeCustomSection?.variant) ===
                          "medical-alert" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                              <AlertTriangle className="size-3" /> Alerta
                            </span>
                          ) : null}
                        </div>
                        <h2 className="m-0 text-xl font-semibold tracking-tight">
                          {activeFixedSection?.title ??
                            activeCustomSection?.title}
                        </h2>
                        <p className="mt-1.5 mb-0 text-sm text-muted-foreground">
                          {activeFixedSection?.description ??
                            "Edita el título, el estilo y el contenido de esta sección."}
                        </p>
                      </div>
                      {activeCustomSection ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() =>
                            removeCustomSection(activeCustomSection.id)
                          }
                        >
                          <Trash2 className="size-4" />
                          Eliminar
                        </Button>
                      ) : null}
                    </div>

                    {activeFixedSection ? (
                      <div className="grid gap-5 xl:grid-cols-2">
                        {activeFixedSection.fields.map((field) => (
                          <div
                            key={field.key}
                            className={
                              field.type === "rich" ||
                              field.type === "textarea" ||
                              field.type === "toggle"
                                ? "xl:col-span-2"
                                : undefined
                            }
                          >
                            <FixedFieldControl
                              field={field}
                              value={form.fields[field.key] ?? ""}
                              onChange={(value) =>
                                setLegalField(field.key, value)
                              }
                              disabled={mutation.isPending}
                            />
                          </div>
                        ))}
                      </div>
                    ) : activeCustomSection ? (
                      <div className="grid gap-6">
                        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
                          <FieldLabel label="Título de la sección">
                            <Input
                              value={activeCustomSection.title}
                              onChange={(event) =>
                                setCustomSection(
                                  activeCustomSection.id,
                                  "title",
                                  event.target.value,
                                )
                              }
                              maxLength={120}
                              required
                            />
                          </FieldLabel>
                          <FieldLabel label="Estilo visual">
                            <select
                              value={activeCustomSection.variant ?? "standard"}
                              onChange={(event) =>
                                setCustomSection(
                                  activeCustomSection.id,
                                  "variant",
                                  event.target.value === "medical-alert"
                                    ? "medical-alert"
                                    : undefined,
                                )
                              }
                              className={`${textareaClassName} h-10 py-0`}
                            >
                              <option value="standard">Sección normal</option>
                              <option value="medical-alert">
                                Alerta destacada
                              </option>
                            </select>
                          </FieldLabel>
                        </div>
                        <FieldLabel
                          label="Contenido"
                          description="El editor guarda títulos, listas, enlaces, alineación y formato enriquecido."
                        >
                          <RichTextEditor
                            id={`custom-section-${activeCustomSection.id}`}
                            value={activeCustomSection.body}
                            onChange={(value) =>
                              setCustomSection(
                                activeCustomSection.id,
                                "body",
                                value,
                              )
                            }
                            disabled={mutation.isPending}
                          />
                        </FieldLabel>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="py-20 text-center text-sm text-muted-foreground">
                    Selecciona o agrega una sección para comenzar.
                  </div>
                )}
              </section>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function FieldLabel({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      <span>{label}</span>
      {description ? (
        <span className="-mt-1 text-xs font-normal leading-5 text-muted-foreground">
          {description}
        </span>
      ) : null}
      {children}
    </label>
  );
}

function FixedFieldControl({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FixedField;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  disabled: boolean;
}) {
  if (field.type === "toggle") {
    const checked = Boolean(value);
    return (
      <div className="flex items-center justify-between gap-4 border-y border-border py-4">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 size-5 text-primary" aria-hidden="true" />
          <div>
            <p className="m-0 text-sm font-semibold">{field.label}</p>
            <p className="mt-1 mb-0 text-xs text-muted-foreground">
              Indica el estado actual del sitio.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-12 min-h-0 min-w-0 rounded-full transition ${checked ? "bg-primary" : "bg-muted-foreground/35"}`}
        >
          <span
            className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`}
          />
          <span className="sr-only">{checked ? "Sí" : "No"}</span>
        </button>
      </div>
    );
  }

  if (field.type === "rich") {
    return (
      <FieldLabel label={field.label} description={field.description}>
        <RichTextEditor
          id={`legal-field-${field.key}`}
          value={String(value)}
          onChange={onChange}
          disabled={disabled}
          placeholder={
            field.placeholder ?? `Escribe el contenido de “${field.label}”...`
          }
        />
      </FieldLabel>
    );
  }

  if (field.type === "textarea") {
    return (
      <FieldLabel label={field.label} description={field.description}>
        <textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={4}
          maxLength={500}
          placeholder={field.placeholder}
          className={`${textareaClassName} min-h-28`}
        />
      </FieldLabel>
    );
  }

  return (
    <FieldLabel label={field.label} description={field.description}>
      <Input
        type={field.type}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={field.placeholder}
      />
    </FieldLabel>
  );
}
