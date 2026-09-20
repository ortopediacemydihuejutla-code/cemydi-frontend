---
name: web-performance-vitals
description: Performance optimization and Core Web Vitals (LCP, INP, CLS) for Next.js 16 and React 19. Use when optimizing bundle sizes, lazy loading heavy components, optimizing images, preventing layout shifts, and improving responsiveness.
metadata:
  author: cemydi-engineering
  version: "1.0.0"
---

# Web Performance & Core Web Vitals (Next.js 16 & React 19)

Practical rules for maximizing Lighthouse scores, maintaining fast interaction response times (INP < 200ms), fast Largest Contentful Paint (LCP < 2.5s), and zero Cumulative Layout Shift (CLS < 0.1).

## 1. Largest Contentful Paint (LCP)

LCP measures loading performance. The largest image or text block in the viewport must load immediately.

### Priority on Hero/Main Product Images
Always add `priority` and explicit `sizes` to above-the-fold images:

```tsx
import Image from "next/image";

// Good: Hero or primary product image
<Image
  src={product.imageUrl}
  alt={product.name}
  width={600}
  height={600}
  priority
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover rounded-xl"
/>
```

- Never use `priority` on images below the fold (catalog lists, footer logos).
- Always supply `sizes` when using `fill` so Next.js doesn't serve the full 4K desktop image to mobile phones.

---

## 2. Interaction to Next Paint (INP)

INP measures responsiveness to clicks, taps, and key presses. Keep main-thread tasks under 50ms.

### Rules for Snappy Interactions:
1. **Never block the main thread with heavy sync calculations**:
   Use `useTransition` or `useDeferredValue` for filtering catalogs, live search, or sorting large tables:
   ```tsx
   const [isPending, startTransition] = useTransition();

   function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
     const nextQuery = e.target.value;
     setQuery(nextQuery); // Immediate input update
     startTransition(() => {
       setFilteredList(filterProducts(allProducts, nextQuery)); // Deferred expensive filter
     });
   }
   ```
2. **Avoid re-rendering large trees on keystroke**: Lift inputs or use uncontrolled form patterns (`react-hook-form` or native `FormData`).

---

## 3. Cumulative Layout Shift (CLS)

CLS measures visual stability. Content must never jump while loading.

### Prevention Techniques:
- **Always reserve space for dynamic content**:
  - Use skeletons with matching aspect ratios (`aspect-video`, `aspect-square`, or fixed min-height) while loading product cards or charts.
- **Images and Icons**:
  - Never render images with undetermined width/height.
  - Reserve icon wrapper dimensions (`w-5 h-5` with `shrink-0`) to prevent layout jump while Lucide icons mount.
- **Dynamic Banners & Alerts**:
  - If a banner loads asynchronously, reserve a container height or animate height smoothly rather than popping into document flow.

---

## 4. Code-Splitting with `next/dynamic`

Heavy libraries must not be loaded into initial route bundles. Lazy-load them when needed:

```tsx
import dynamic from "next/dynamic";

// Rich text editor (TipTap is ~250KB) - only load when admin edits:
const RichTextEditor = dynamic(
  () => import("@/features/admin/components/rich-text-editor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-48 w-full animate-pulse rounded-xl bg-slate-100" />,
  }
);

// Charts (Recharts is ~180KB) - lazy load on analytics dashboards:
const DemandForecastChart = dynamic(
  () => import("@/app/admin/analytics/components/DemandForecastChart"),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-100" />,
  }
);
```

---

## 5. Client Bundle Hygiene

- **Lucide Icons**: Import only named icons `import { Check, X } from "lucide-react";`. Never use wildcard `import * as Icons from "lucide-react"`.
- **Sanitize HTML**: Keep `sanitize-html` strictly on Server Actions or Route Handlers; do not bundle heavy sanitize parsers into client bundles unless necessary.
