---
name: tanstack-query-patterns
description: Best practices for TanStack React Query v5 in Next.js App Router and React 19. Use when implementing data fetching, query keys factories, caching strategies, mutations, optimistic updates, and SSR hydration.
metadata:
  author: cemydi-engineering
  version: "1.0.0"
---

# TanStack React Query v5 Patterns

Guidelines for robust, declarative server-state management in Next.js and React 19.

## 1. Query Key Factories

Never use loose string arrays like `["products", id]` throughout the codebase. Use Query Key Factories for type-safety and reliable cache invalidation.

```typescript
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string | number) => [...productKeys.details(), id] as const,
};
```

### Invalidation with Factories:
```typescript
// Invalidate only the specific product:
queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });

// Invalidate all product lists while keeping details fresh:
queryClient.invalidateQueries({ queryKey: productKeys.lists() });

// Invalidate everything related to products:
queryClient.invalidateQueries({ queryKey: productKeys.all });
```

---

## 2. Encapsulating Queries in Custom Hooks

Wrap `useQuery` calls in custom domain hooks:

```typescript
export function useProduct(id: string | number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    gcTime: 1000 * 60 * 30, // 30 minutes in garbage collection
    enabled: Boolean(id),
  });
}
```

---

## 3. Mutations and Optimistic Updates

Always handle `onMutate`, `onError`, and `onSettled` for a complete optimistic lifecycle:

```typescript
export function useUpdateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavoriteApi,
    onMutate: async ({ productId, nextFavorited }) => {
      // 1. Cancel ongoing outgoing queries
      await queryClient.cancelQueries({ queryKey: productKeys.detail(productId) });

      // 2. Snapshot previous value
      const previousProduct = queryClient.getQueryData(productKeys.detail(productId));

      // 3. Optimistically update cache
      queryClient.setQueryData(productKeys.detail(productId), (old: Product | undefined) => {
        if (!old) return old;
        return { ...old, isFavorite: nextFavorited };
      });

      return { previousProduct, productId };
    },
    onError: (err, variables, context) => {
      // 4. Rollback to snapshot on error
      if (context?.previousProduct) {
        queryClient.setQueryData(
          productKeys.detail(context.productId),
          context.previousProduct
        );
      }
    },
    onSettled: (data, error, variables) => {
      // 5. Always refetch to sync with server truth
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.productId),
      });
    },
  });
}
```

---

## 4. Error Handling and Toasts

Never trigger global side-effects (like notifications or redirects) inside `queryFn`. Keep `queryFn` pure and handle feedback in mutation callbacks or component effects:

```typescript
const { mutate } = useMutation({
  mutationFn: createRentalOrder,
  onSuccess: (order) => {
    toast.success("Renta programada correctamente");
    router.push(`/mis-rentas/${order.id}`);
  },
  onError: (error) => {
    toast.error(getApiErrorMessage(error));
  },
});
```

---

## 5. Next.js App Router Hydration Pattern

When prefetching on the server in Next.js Server Components:

```tsx
// app/productos/[id]/page.tsx (Server Component)
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductServer(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailClient id={id} />
    </HydrationBoundary>
  );
}
```
