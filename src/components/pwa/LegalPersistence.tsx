"use client";

import { useEffect } from "react";
import { saveOfflineLegal } from "@/lib/pwa/storage";
import type { LegalDocument } from "@/services/legal-documents";

export default function LegalPersistence({ document }: { document: LegalDocument }) {
  useEffect(() => {
    if (navigator.onLine) void saveOfflineLegal(document).catch(() => {});
  }, [document]);
  return null;
}
