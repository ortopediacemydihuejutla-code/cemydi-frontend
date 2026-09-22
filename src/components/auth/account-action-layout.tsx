import type { ReactNode } from "react";
import { AuthSplitLayout } from "./auth-split-layout";

type AccountActionLayoutProps = {
  children: ReactNode;
  asideTitle: string;
  eyebrow?: string;
  asideDescription?: string;
  asideItems?: string[];
};

export const accountLabelClassName =
  "mb-2 block text-[13px] font-semibold text-slate-700";
export const accountInputClassName =
  "h-12 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#258e8b] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,142,139,0.15)] disabled:cursor-not-allowed disabled:opacity-60";
export const accountPrimaryButtonClassName =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#258e8b] bg-[#258e8b] px-4 text-sm font-bold text-white shadow-[0_10px_22px_-12px_rgba(37,142,139,0.35)] transition-[background-color,transform,box-shadow] hover:border-[#1d7370] hover:bg-[#1d7370] hover:shadow-[0_14px_26px_-12px_rgba(37,142,139,0.4)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258e8b]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
export const accountSecondaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#258e8b]/45 hover:bg-[#f4f9f8] hover:text-[#1d7370] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258e8b]/25 disabled:cursor-not-allowed disabled:opacity-60";
export const accountTextLinkClassName =
  "inline-flex items-center gap-2 text-sm font-semibold text-[#258e8b] no-underline transition hover:text-[#134e4c]";

export function AccountActionLayout({
  children,
  asideTitle,
}: AccountActionLayoutProps) {
  return (
    <AuthSplitLayout heroTitle={asideTitle}>
      {children}
    </AuthSplitLayout>
  );
}
