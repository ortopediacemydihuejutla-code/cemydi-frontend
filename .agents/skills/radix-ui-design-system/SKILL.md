---
name: radix-ui-design-system
description: Design system and accessible component patterns using Radix UI primitives and Tailwind CSS. Use when building or styling dialogs, dropdowns, tooltips, sheets, accessible forms, focus management, and keyboard navigation.
metadata:
  author: cemydi-engineering
  version: "1.0.0"
---

# Radix UI + Tailwind CSS Design System Patterns

Guidelines for building accessible, headless, unstyled UI primitives styled with Tailwind CSS and `class-variance-authority` (cva).

## 1. Composition with Radix Primitives

Radix primitives separate behavior/accessibility from presentation. Always preserve the compound structure:

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;
```

### Accessible Dialog Content Structure:
Radix requires both `DialogTitle` and `DialogDescription` for screen readers (ARIA `aria-labelledby` and `aria-describedby`).

```tsx
export function DialogContent({ children, className, title, description, ...props }) {
  return (
    <DialogPortal>
      {/* Overlay with blur and fade animation */}
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      
      {/* Centered Modal Content */}
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        <DialogPrimitive.Title className="text-xl font-bold text-slate-900">
          {title}
        </DialogPrimitive.Title>
        {description && (
          <DialogPrimitive.Description className="mt-2 text-sm text-slate-600">
            {description}
          </DialogPrimitive.Description>
        )}
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}
```

---

## 2. Using `asChild` Pattern (Slot Architecture)

When rendering custom links or custom buttons inside Radix triggers, use `asChild` to avoid invalid nested interactive elements (`<button><button>`):

```tsx
// Correct: Radix delegates clicks and attributes to the child Next.js Link
<DropdownMenuItem asChild>
  <Link href="/mi-cuenta" className="flex items-center gap-2 px-3 py-2 text-sm">
    <User className="h-4 w-4" />
    Mi Cuenta
  </Link>
</DropdownMenuItem>

// Incorrect: Causes hydration and accessibility warning (nested button)
<DropdownMenuItem>
  <button onClick={handleClick}>Mi Cuenta</button>
</DropdownMenuItem>
```

---

## 3. Data Attribute Styling (`data-[state]`)

Style state transitions using Tailwind and Radix data attributes:
- `data-[state=open]` and `data-[state=closed]`
- `data-[disabled]`
- `data-[highlighted]`
- `data-[side=bottom]`, `data-[side=top]`

Example dropdown item with keyboard highlight:
```tsx
<DropdownMenuPrimitive.Item
  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900"
>
  {children}
</DropdownMenuPrimitive.Item>
```

---

## 4. Mobile Responsiveness and Touch Targets

- Always ensure interactive triggers and buttons have at least **44x44px** touch target size for mobile accessibility.
- For modal dialogs on mobile (`max-sm:`):
  - Consider drawer or bottom-sheet behavior on small screens: `max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none`.
- Set `modal={true}` to trap focus and prevent body scrolling when open.
