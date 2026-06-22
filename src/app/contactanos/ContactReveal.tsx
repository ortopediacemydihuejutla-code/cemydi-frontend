"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";

export function ContactReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-contact-reveal]", {
        autoAlpha: 0,
        y: 28,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.11,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="overflow-hidden bg-white">
      {children}
    </div>
  );
}
