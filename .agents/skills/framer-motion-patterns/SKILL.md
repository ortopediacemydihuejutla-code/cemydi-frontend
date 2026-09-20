---
name: framer-motion-patterns
description: Motion design, micro-interactions, layout transitions, and fluid animations with Framer Motion in React 19 and Next.js. Use when implementing interactive animations, presence transitions, card hovers, tabs, and reduced-motion accessibility.
metadata:
  author: cemydi-engineering
  version: "1.0.0"
---

# Framer Motion Patterns (React 19 & Next.js)

Guidelines for performant, accessible motion design in React 19 using Framer Motion (`framer-motion`).

## 1. Core Principles

- **Hardware Acceleration**: Only animate GPU-composited properties: `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Avoid animating `width`, `height`, `top`, `left`, `margin`, or `padding` as they cause layout thrashing and repaint loops.
- **Physics over Durations**: Prefer spring physics (`type: "spring"`, `stiffness`, `damping`) for tactile, realistic responsiveness.
- **Accessibility**: Always respect users' motion preferences using `useReducedMotion()`.

---

## 2. Accessible Reduced Motion Pattern

Users with vestibular disorders need reduced or eliminated motion. Always provide safe fallbacks:

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function FadeInCard({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0.1 : 0.4,
        ease: [0.16, 1, 0.3, 1], // snappy ease-out curve
      }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {children}
    </motion.div>
  );
}
```

---

## 3. Micro-Interactions: Buttons & Cards

Subtle hover and tap states that elevate the user experience:

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
  className="rounded-xl bg-teal-600 px-5 py-2.5 font-medium text-white shadow-md shadow-teal-700/20 hover:bg-teal-700"
>
  Agregar al carrito
</motion.button>
```

---

## 4. Shared Layout Animations (`layoutId`)

For animated tab indicators, active navigation pills, or modal expansions:

```tsx
export function NavigationTabs({ tabs, activeTab, onSelect }) {
  return (
    <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className="relative px-4 py-2 text-sm font-semibold text-slate-700 transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 rounded-lg bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

---

## 5. AnimatePresence and Exit Transitions

When elements enter and leave the DOM conditionally (drawers, notifications, modal steps):

```tsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="modal-content"
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed z-50 rounded-2xl bg-white p-6 shadow-2xl"
    >
      <ModalBody />
    </motion.div>
  )}
</AnimatePresence>
```

---

## 6. Staggered Children Lists

For product catalogs, order lists, and dashboard cards:

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function ProductGrid({ products }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {products.map((p) => (
        <motion.div key={p.id} variants={itemVariants}>
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```
