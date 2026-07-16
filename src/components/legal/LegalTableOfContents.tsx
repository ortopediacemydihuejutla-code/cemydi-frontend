"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./legal-document.module.css";

type TableOfContentsItem = {
  id: string;
  title: string;
  isMedicalAlert?: boolean;
};

export function LegalTableOfContents({
  items,
}: {
  items: TableOfContentsItem[];
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Contenido del documento" className={styles.tocNav}>
      {items.map((item, index) => {
        const active = activeId === item.id;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setActiveId(item.id);
              document.getElementById(item.id)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
              window.history.replaceState(null, "", `#${item.id}`);
            }}
            className={`${styles.tocLink} ${active ? styles.tocLinkActive : ""} ${
              item.isMedicalAlert ? styles.tocLinkAlert : ""
            }`}
          >
            <span className={styles.tocIndex} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={styles.tocLabel}>{item.title}</span>
            {item.isMedicalAlert ? (
              <AlertTriangle
                className={styles.tocAlertIcon}
                size={13}
                aria-hidden="true"
              />
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
