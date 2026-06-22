"use client";

import { getClientErrorDetail } from "@/lib/api-error";

type ErrorDetailPanelProps = {
  error: Error & { digest?: string };
};

const detailClassName = "mt-6 text-[0.92rem] text-[#64748b]";
const stackClassName =
  "mt-2.5 rounded-[14px] border border-[#e2e8f0] bg-white px-[14px] py-3 text-[0.9rem] break-words whitespace-pre-wrap text-[#334155]";

export function ErrorDetailPanel({ error }: ErrorDetailPanelProps) {
  const detail = getClientErrorDetail(error);

  if (!detail) {
    return null;
  }

  return (
    <>
      <p className={detailClassName}>{"Detalle t\u00e9cnico (solo desarrollo):"}</p>
      <pre className={stackClassName}>{detail}</pre>
    </>
  );
}
