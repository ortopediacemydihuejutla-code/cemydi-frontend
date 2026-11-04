"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SwitchProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Switch({
  label,
  checked,
  disabled,
  onCheckedChange,
}: SwitchProps) {
  const reducedMotion = useReducedMotion();
  return (
    <span className="relative inline-flex h-11 w-[55px] shrink-0 items-center justify-center">
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block h-[31px] w-[51px] rounded-full p-0.5 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#258e8b] peer-disabled:opacity-45 motion-reduce:transition-none",
          checked ? "bg-[#207a77]" : "bg-slate-300",
        )}
      >
        <motion.span
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 450, damping: 43 }
          }
          className="block size-[27px] rounded-full bg-white shadow-sm"
        />
      </span>
    </span>
  );
}
