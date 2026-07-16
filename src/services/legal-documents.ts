import { publicFetch } from "@/lib/api/public-fetch";
import { parseApiResponse } from "@/lib/api-error";

export const legalDocumentSlugs = [
  "politicas-de-privacidad",
  "terminos-y-condiciones",
] as const;

export type LegalDocumentSlug = (typeof legalDocumentSlugs)[number];
export type LegalDocumentFields = Record<string, string | boolean>;

export type LegalDocumentSection = {
  id: string;
  title: string;
  body: string;
  variant?: "medical-alert";
};

export type LegalCustomSection = LegalDocumentSection;

export type LegalDocument = {
  id?: number;
  slug: LegalDocumentSlug;
  title: string;
  description: string;
  fields: LegalDocumentFields;
  customSections: LegalCustomSection[];
  sections: LegalDocumentSection[];
  updatedAt?: string;
  createdAt?: string;
};

export const privacySectionOrder = [
  "responsable",
  "datos-recopilados",
  "datos-medicos",
  "uso-informacion",
  "consentimiento",
  "transferencias",
  "cookies",
  "derechos-arco",
  "conservacion-seguridad",
  "cambios-privacidad",
];

export const termsSectionOrder = [
  "aceptacion-alcance",
  "cuentas-elegibilidad",
  "productos-precios",
  "descargo-medico",
  "ventas-envios",
  "ventas-garantias",
  "devoluciones-cancelaciones",
  "rentas-requisitos",
  "rentas-depositos",
  "rentas-higiene",
  "rentas-penalizaciones",
  "instalacion-domicilio",
  "pagos-facturacion",
  "responsabilidad-uso",
  "propiedad-intelectual",
  "cambios-reclamaciones",
];

function orderSections(
  sections: LegalDocumentSection[],
  rawOrder: string | boolean | undefined,
) {
  let order: string[] = [];
  try {
    const parsed = JSON.parse(String(rawOrder ?? "[]"));
    if (Array.isArray(parsed)) {
      order = parsed.filter(
        (value): value is string => typeof value === "string",
      );
    }
  } catch {
    order = [];
  }
  const positions = new Map(order.map((id, index) => [id, index]));
  return sections.sort(
    (a, b) =>
      (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

function buildSections(
  slug: LegalDocumentSlug,
  fields: LegalDocumentFields,
  customSections: LegalCustomSection[],
): LegalDocumentSection[] {
  const responsibleBody = [
    ["Razón social / empresa", fields.companyName],
    ["RFC / identificación", fields.taxId],
    ["Domicilio", fields.address],
    ["Correo de privacidad", fields.privacyEmail],
  ]
    .filter(([, value]) => String(value ?? "").trim())
    .map(([label, value]) => `**${label}:** ${String(value)}`)
    .join("\n\n");

  const fixed: LegalDocumentSection[] =
    slug === "politicas-de-privacidad"
      ? [
          {
            id: "responsable",
            title: "Responsable del tratamiento",
            body: responsibleBody,
          },
          {
            id: "datos-recopilados",
            title: "Datos personales que recopilamos",
            body: String(fields.personalDataCollected ?? ""),
          },
          {
            id: "datos-medicos",
            title: "Datos sensibles y médicos",
            body: String(fields.medicalData ?? ""),
          },
          {
            id: "uso-informacion",
            title: "Uso de la información",
            body: String(fields.informationUse ?? ""),
          },
          {
            id: "consentimiento",
            title: "Consentimiento y fundamento del tratamiento",
            body: String(fields.consentAndLegalBasis ?? ""),
          },
          {
            id: "transferencias",
            title: "Transferencia a terceros",
            body: String(fields.thirdPartyTransfer ?? ""),
          },
          {
            id: "cookies",
            title: "Uso de cookies",
            body: String(fields.cookiesContent ?? "").trim()
              ? `${fields.cookiesEnabled ? "**Cookies habilitadas.**" : "**Cookies no habilitadas.**"}\n\n${String(fields.cookiesContent)}`
              : "",
          },
          {
            id: "derechos-arco",
            title: "Derechos ARCO",
            body: String(fields.arcoRights ?? ""),
          },
          {
            id: "conservacion-seguridad",
            title: "Conservación y seguridad",
            body: String(fields.retentionAndSecurity ?? ""),
          },
          {
            id: "cambios-privacidad",
            title: "Cambios al aviso y contacto",
            body: String(fields.privacyChanges ?? ""),
          },
        ]
      : [
          {
            id: "aceptacion-alcance",
            title: "Aceptación y alcance",
            body: String(fields.acceptanceAndScope ?? ""),
          },
          {
            id: "cuentas-elegibilidad",
            title: "Cuentas y capacidad para contratar",
            body: String(fields.accountEligibility ?? ""),
          },
          {
            id: "productos-precios",
            title: "Productos, precios y disponibilidad",
            body: String(fields.productsPricingAvailability ?? ""),
          },
          {
            id: "descargo-medico",
            title: "Descargo médico",
            body: String(fields.medicalDisclaimer ?? ""),
            variant: "medical-alert",
          },
          {
            id: "ventas-envios",
            title: "Ventas — Envíos y tiempos",
            body: String(fields.salesShipping ?? ""),
          },
          {
            id: "ventas-garantias",
            title: "Ventas — Garantías",
            body: String(fields.salesWarranties ?? ""),
          },
          {
            id: "devoluciones-cancelaciones",
            title: "Cancelaciones, cambios y devoluciones",
            body: String(fields.returnsAndCancellations ?? ""),
          },
          {
            id: "rentas-requisitos",
            title: "Rentas — Requisitos y documentos",
            body: String(fields.rentalRequirements ?? ""),
          },
          {
            id: "rentas-depositos",
            title: "Rentas — Depósitos (fianza)",
            body: String(fields.rentalDeposits ?? ""),
          },
          {
            id: "rentas-higiene",
            title: "Rentas — Higiene y estado",
            body: String(fields.rentalHygiene ?? ""),
          },
          {
            id: "rentas-penalizaciones",
            title: "Rentas — Penalizaciones",
            body: String(fields.rentalPenalties ?? ""),
          },
          {
            id: "instalacion-domicilio",
            title: "Instalación a domicilio",
            body: String(fields.homeInstallation ?? ""),
          },
          {
            id: "pagos-facturacion",
            title: "Métodos de pago y facturación",
            body: String(fields.paymentAndBilling ?? ""),
          },
          {
            id: "responsabilidad-uso",
            title: "Uso seguro y responsabilidad",
            body: String(fields.liabilityAndSafeUse ?? ""),
          },
          {
            id: "propiedad-intelectual",
            title: "Propiedad intelectual",
            body: String(fields.intellectualProperty ?? ""),
          },
          {
            id: "cambios-reclamaciones",
            title: "Cambios, contacto y reclamaciones",
            body: String(fields.changesAndClaims ?? ""),
          },
        ];

  return orderSections(
    [...fixed, ...customSections].filter(
      (section) => section.title.trim() && section.body.trim(),
    ),
    fields.sectionOrder,
  );
}

function createDefaultDocument(
  slug: LegalDocumentSlug,
  title: string,
  description: string,
  fields: LegalDocumentFields,
): LegalDocument {
  return {
    slug,
    title,
    description,
    fields,
    customSections: [],
    sections: buildSections(slug, fields, []),
  };
}

const demoParagraph =
  '<p style="text-align: justify"><strong>Texto de demostración.</strong> Este contenido permite revisar la tipografía, el espaciado y la lectura del documento. El cliente podrá reemplazarlo completamente desde el panel administrativo.</p>';
const demoList =
  '<p style="text-align: justify">Ejemplo de información presentada mediante viñetas:</p><ul><li>Primer elemento de ejemplo.</li><li>Segundo elemento de ejemplo.</li><li>Tercer elemento de ejemplo.</li></ul>';

export const defaultLegalDocuments: Record<LegalDocumentSlug, LegalDocument> = {
  "politicas-de-privacidad": createDefaultDocument(
    "politicas-de-privacidad",
    "Política de privacidad",
    "Contenido demostrativo para revisar la estructura visual del aviso de privacidad.",
    {
      effectiveDate: "2026-07-15",
      companyName: "Empresa de ejemplo S.A. de C.V.",
      taxId: "XAXX010101000",
      address: "Domicilio de ejemplo, Huejutla de Reyes, Hidalgo.",
      privacyEmail: "privacidad@ejemplo.com",
      personalDataCollected: demoList,
      medicalData: demoParagraph,
      informationUse: demoParagraph,
      consentAndLegalBasis: demoParagraph,
      thirdPartyTransfer: demoParagraph,
      cookiesEnabled: true,
      cookiesContent: demoParagraph,
      arcoRights: demoList,
      retentionAndSecurity: demoParagraph,
      privacyChanges: demoParagraph,
      sectionOrder: JSON.stringify(privacySectionOrder),
    },
  ),
  "terminos-y-condiciones": createDefaultDocument(
    "terminos-y-condiciones",
    "Términos y condiciones",
    "Contenido demostrativo para revisar la estructura visual de los términos y condiciones.",
    {
      effectiveDate: "2026-07-15",
      acceptanceAndScope:
        '<h2>Alcance de ejemplo</h2><p style="text-align: justify">Este es un texto de demostración para visualizar cómo se presentará una sección extensa. El administrador podrá modificar títulos, párrafos, listas, enlaces y su orden desde el panel.</p>',
      accountEligibility: demoParagraph,
      productsPricingAvailability: demoList,
      medicalDisclaimer:
        '<p style="text-align: justify"><strong>Aviso de demostración:</strong> esta alerta muestra cómo resaltará la información médica importante dentro del documento.</p>',
      salesShipping: demoParagraph,
      salesWarranties: demoParagraph,
      returnsAndCancellations: demoList,
      rentalRequirements: demoList,
      rentalDeposits: demoParagraph,
      rentalHygiene: demoParagraph,
      rentalPenalties: demoParagraph,
      homeInstallation: demoParagraph,
      paymentAndBilling: demoList,
      liabilityAndSafeUse: demoParagraph,
      intellectualProperty: demoParagraph,
      changesAndClaims: demoParagraph,
      sectionOrder: JSON.stringify(termsSectionOrder),
    },
  ),
};

type LegalDocumentResponse = { document: LegalDocument };

export async function getLegalDocument(
  slug: LegalDocumentSlug,
): Promise<LegalDocument> {
  try {
    const response = await publicFetch(`/legal-documents/${slug}`, {
      next: { revalidate: 60 },
    });
    const data = await parseApiResponse<LegalDocumentResponse>(
      response,
      "No se pudo cargar el documento",
    );
    return data.document ?? defaultLegalDocuments[slug];
  } catch {
    return defaultLegalDocuments[slug];
  }
}
