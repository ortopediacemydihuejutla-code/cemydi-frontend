---
name: testing-library-react
description: Best practices for React Testing Library and Vitest. Use when writing component unit tests, mocking contexts, testing user interactions, testing accessibility roles, forms, dialogs, and async state in React 19.
metadata:
  author: cemydi-engineering
  version: "1.0.0"
---

# React Testing Library Best Practices

Guide for writing resilient, maintainable, and user-centric component tests with React Testing Library, `@testing-library/jest-dom`, and Vitest.

## Core Philosophy

Test components as real users interact with them. Avoid testing internal state, methods, or component instance details. Test the rendered DOM and accessible behavior.

---

## 1. Query Priority (Accessibility-First)

Always prefer queries accessible to all users and assistive technologies:

1. **`getByRole`** (Primary choice):
   ```tsx
   // Good: checks semantics and accessible name
   screen.getByRole("button", { name: /confirmar pedido/i });
   screen.getByRole("heading", { level: 1, name: /catálogo de productos/i });
   screen.getByRole("textbox", { name: /correo electrónico/i });
   screen.getByRole("dialog", { name: /confirmar eliminación/i });
   ```
2. **`getByLabelText`**: For forms with associated `<label for="...">`.
   ```tsx
   screen.getByLabelText(/nombre completo/i);
   ```
3. **`getByPlaceholderText`**: Only when input lacks persistent label.
4. **`getByText`**: For non-interactive elements (paragraphs, badges, spans).
5. **`getByTestId`** (`data-testid`): Last resort only when elements lack role or text.

Avoid `document.querySelector` or querying by CSS classes (`container.querySelector(".btn-primary")`).

---

## 2. Async Assertions and Waiting

### Difference between Query Prefixes
- **`getBy*`**: Synchronous. Throws immediately if not found. Use when element should already be present.
- **`queryBy*`**: Synchronous. Returns `null` if not found. **Only use for asserting absence**:
  ```tsx
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  ```
- **`findBy*`**: Asynchronous. Retries up to timeout (default 1000ms). Use when waiting for elements after API calls or effects:
  ```tsx
  const successMessage = await screen.findByText(/operación exitosa/i);
  expect(successMessage).toBeInTheDocument();
  ```

### Using `waitFor`
Keep `waitFor` callbacks simple with a single assertion:
```tsx
await waitFor(() => {
  expect(onSuccessMock).toHaveBeenCalledTimes(1);
});
```
Do not put side effects inside `waitFor`.

---

## 3. User Interactions

Use `@testing-library/user-event` for realistic event simulation:
```tsx
import userEvent from "@testing-library/user-event";

it("submits the form with user input", async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={mockSubmit} />);

  await user.type(screen.getByRole("textbox", { name: /correo/i }), "test@example.com");
  await user.type(screen.getByLabelText(/contraseña/i), "Secret123!");
  await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

  expect(mockSubmit).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "Secret123!",
  });
});
```

---

## 4. Wrapper and Provider Setup

When testing components that require Providers (`AuthContext`, `CartContext`, `QueryClient`):

Create a custom render utility:
```tsx
import { render, RenderOptions } from "@testing-library/react";
import { AuthProvider } from "@/providers/AuthContext";
import { CartProvider } from "@/providers/CartContext";

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}
```

---

## 5. Common Anti-Patterns to Avoid

- **Do not wrap `render` or `userEvent` in `act()` manually**: RTL helpers already wrap interactions in `act`.
- **Do not test implementation details**: Do not inspect `component.state` or expect specific helper functions to be called; verify the output shown to the user.
- **Always clean up timers**: If using `vi.useFakeTimers()`, restore them in `afterEach(() => vi.useRealTimers())`.
