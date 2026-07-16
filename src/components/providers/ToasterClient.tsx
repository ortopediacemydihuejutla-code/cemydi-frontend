"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{ top: 76, right: 16, left: 16 }}
      toastOptions={{
        duration: 4_200,
        style: {
          maxWidth: "min(420px, calc(100vw - 32px))",
          border: "1px solid var(--border-soft)",
          borderRadius: "14px",
          background: "var(--card)",
          color: "var(--text-main)",
          boxShadow: "0 18px 45px rgba(15, 42, 50, 0.18)",
          padding: "12px 14px",
          fontSize: "14px",
          fontWeight: 600,
        },
        success: {
          duration: 3_400,
          ariaProps: { role: "status", "aria-live": "polite" },
        },
        error: {
          duration: 6_000,
          ariaProps: { role: "alert", "aria-live": "assertive" },
        },
        loading: {
          duration: Infinity,
          ariaProps: { role: "status", "aria-live": "polite" },
        },
      }}
    />
  );
}

