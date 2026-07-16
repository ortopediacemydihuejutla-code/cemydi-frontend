import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type { LegalDocument } from "@/services/legal-documents";
import { LegalTableOfContents } from "./LegalTableOfContents";
import { RichTextContent } from "./RichTextContent";
import styles from "./legal-document.module.css";

function sectionAnchor(id: string, index: number) {
  const safeId = id
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  return `seccion-${safeId || index + 1}`;
}

function formatEffectiveDate(value: unknown, fallback?: string) {
  const raw = typeof value === "string" && value ? value : fallback;
  if (!raw) return "Versión vigente";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw);
  if (Number.isNaN(date.getTime())) return "Versión vigente";

  return `Actualizado el ${new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)}`;
}

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const effectiveDate = document.fields.effectiveDate;
  const tocItems = document.sections.map((section, index) => ({
    id: sectionAnchor(section.id, index),
    title: section.title,
    isMedicalAlert: section.variant === "medical-alert",
  }));

  return (
    <div data-legal-document className={styles.page}>
      <section className={styles.intro} aria-labelledby="legal-page-title">
        <div className={styles.introInner}>
          <div className={styles.eyebrowRow}>
            <span className={styles.documentIcon} aria-hidden="true">
              {document.slug === "politicas-de-privacidad" ? (
                <ShieldCheck size={20} />
              ) : (
                <FileText size={20} />
              )}
            </span>
            <p className={styles.eyebrow}>Información legal de CEMYDI</p>
          </div>
          <h1 id="legal-page-title" className={styles.title}>
            {document.title}
          </h1>
          {document.description ? (
            <p className={styles.description}>{document.description}</p>
          ) : null}
          {effectiveDate || document.sections.length > 0 ? (
            <div className={styles.metaRow}>
              {effectiveDate ? (
                <span className={styles.metaItem}>
                  <CalendarDays size={16} aria-hidden="true" />
                  {formatEffectiveDate(effectiveDate, document.updatedAt)}
                </span>
              ) : null}
              {effectiveDate && document.sections.length > 0 ? (
                <span className={styles.metaDivider} aria-hidden="true" />
              ) : null}
              {document.sections.length > 0 ? (
                <span className={styles.metaItem}>
                  {document.sections.length} apartados
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {document.sections.length === 0 ? (
        <section className={styles.emptyState} aria-live="polite">
          <p>Contenido pendiente de publicación.</p>
          <span>El administrador todavía no ha completado este documento.</span>
        </section>
      ) : (
        <section className={styles.contentArea}>
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.desktopToc}>
                <div className={styles.tocCard}>
                  <p className={styles.tocTitle}>En este documento</p>
                  <LegalTableOfContents items={tocItems} />
                </div>
              </div>

              <details className={styles.mobileToc}>
                <summary className={styles.tocSummary}>
                  <span>
                    <span className={styles.tocSummaryTitle}>
                      Índice del documento
                    </span>
                    <span className={styles.tocSummaryMeta}>
                      {tocItems.length} apartados
                    </span>
                  </span>
                  <ChevronDown
                    className={styles.tocSummaryIcon}
                    size={18}
                    aria-hidden="true"
                  />
                </summary>
                <div className={styles.tocCard}>
                  <LegalTableOfContents items={tocItems} />
                </div>
              </details>
            </aside>

            <div
              className={styles.documentSurface}
              role="region"
              aria-label={document.title}
            >
              {document.sections.map((section, index) => {
                const id = sectionAnchor(section.id, index);
                const isMedicalAlert = section.variant === "medical-alert";

                if (isMedicalAlert) {
                  return (
                    <article
                      id={id}
                      key={section.id}
                      className={styles.medicalAlert}
                    >
                      <div className={styles.alertHeader}>
                        <span className={styles.alertIcon} aria-hidden="true">
                          <AlertTriangle size={18} />
                        </span>
                        <div>
                          <p className={styles.alertLabel}>
                            Información médica importante
                          </p>
                          <h2 className={styles.alertTitle}>{section.title}</h2>
                        </div>
                      </div>
                      <div className={styles.alertBody}>
                        <RichTextContent value={section.body} />
                      </div>
                    </article>
                  );
                }

                return (
                  <article id={id} key={section.id} className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionNumber} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className={styles.sectionTitle}>{section.title}</h2>
                    </div>
                    <div className={styles.sectionBody}>
                      <RichTextContent value={section.body} />
                    </div>
                  </article>
                );
              })}

              <div className={styles.contactBox}>
                <div>
                  <p className={styles.contactTitle}>
                    ¿Necesitas una aclaración?
                  </p>
                  <p className={styles.contactText}>
                    Nuestro equipo puede orientarte sobre estas condiciones y
                    nuestros servicios.
                  </p>
                </div>
                <Link href="/contactanos" className={styles.contactLink}>
                  Contactar
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
