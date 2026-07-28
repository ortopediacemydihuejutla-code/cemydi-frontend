import { cn } from "@/features/admin/lib/utils";

type PromotionBadgeProps = {
  percent?: number;
  compact?: boolean;
  shortLabel?: boolean;
  className?: string;
};

export function PromotionBadge({
  percent,
  compact = false,
  shortLabel = false,
  className,
}: PromotionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-[#c62828] font-bold uppercase tracking-[0.07em] text-white shadow-[0_3px_10px_rgba(198,40,40,0.2)]",
        compact
          ? "px-2.5 py-1 text-[0.68rem]"
          : "px-3 py-1.5 text-xs",
        className,
      )}
    >
      {percent
        ? shortLabel
          ? `${percent}% OFF`
          : `${percent}% de descuento`
        : "Oferta"}
    </span>
  );
}
