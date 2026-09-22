# Arquitectura actual

## Current behavior — vista general

La aplicación usa Next.js App Router. No sigue una única cadena obligatoria para todos los módulos; actualmente coexisten tres flujos principales.

```text
Página pública Server Component
  → service público
  → publicFetch / fetch
  → API externa

Página o componente autenticado
  → AuthContext / CartContext o service directo
  → apiFetch (cookies + CSRF + refresh)
  → API externa

Página administrativa Client Component
  → hook/useQuery/useMutation
  → service admin
  → adminRequest → apiFetch
  → API externa
```

## Current behavior — App Router y layouts

- `src/app/layout.tsx` es un Server Component. Declara metadata, lee `x-pathname` y monta `AuthProvider`, `CartProvider`, toasts, observabilidad y `AppShell`.
- `AppShell` decide si muestra header y footer públicos. El panel `/admin` usa su propio shell.
- `src/app/admin/layout.tsx` valida la sesión en servidor, hidrata el contexto cliente y monta TanStack Query, tema y sidebar administrativos.
- Existen `loading.tsx` y `error.tsx` en rutas seleccionadas, además de boundaries globales.
- La mayoría de rutas de cuenta y administración son Client Components. Catálogo, páginas legales, detalle de producto y contenido institucional conservan composición o carga inicial en servidor donde resulta útil.

## Current behavior — responsabilidad por directorio

### `src/app`

Define rutas y ensambla UI. Algunas subcarpetas mantienen componentes, hooks y utilidades muy específicos de su ruta —por ejemplo catálogo, productos y promociones—, por lo que no todo el código de dominio vive en `features`.

### `src/features`

Actualmente contiene `admin/`: shell, navegación, primitives Radix, hooks de paginación/bootstrap, query keys y utilidades compartidas del panel. No es una capa universal para todas las funcionalidades públicas.

### `src/components`

Agrupa UI compartida por contexto: cuenta, autenticación, errores, home, layout, legal, producto, recomendaciones, rentas y `ui`. `src/components/ui` es el conjunto reutilizable público; `src/features/admin/components/ui` es un conjunto separado para administración.

### `src/services`

Contiene operaciones de red y tipos de datos. Los services públicos/autenticados usan `publicFetch`, `apiFetch` o `fetch(resolveApiUrl(...))`. `src/services/admin` centraliza el panel mediante `adminRequest` y reexporta desde `index.ts`.

### `src/lib`

Contiene infraestructura y lógica transversal: resolución de URLs, fetch autenticado, errores, sesión de servidor, schemas Zod, observabilidad, formateo y reglas puras comprobables.

### `src/providers`

- `AuthContext`: hidrata `/users/me`, expone estado y limpia claves legacy de `localStorage`.
- `CartContext`: administra el carrito del usuario `CLIENT` y delega persistencia a services.
- `ToasterClient`: configuración global de `react-hot-toast`.
- `ErrorMonitoringClient`: captura errores globales y promesas rechazadas.

### `src/data`

Contiene únicamente recomendaciones demostrativas y sus pruebas.

### `src/proxy.ts`

Es el proxy de Next.js. Propaga el pathname mediante `x-pathname` y consulta `/users/me` con las cookies entrantes antes de permitir rutas `/admin`.

## Current behavior — estado

- Estado remoto administrativo: TanStack Query dentro de `AdminProviders`, con `staleTime` de 30 segundos, un reintento y sin refetch al enfocar la ventana.
- Estado remoto público: normalmente se obtiene en Server Components o con efectos/services directos; no usa un QueryClient global.
- Estado global cliente: React Context para autenticación y carrito.
- Estado local: formularios, filtros, paginación, dialogs y previews usan `useState`, `useMemo` y hooks específicos.
- Favoritos: `localStorage` mediante `use-favorites`.

## Current behavior — errores y observabilidad

- `parseApiResponse` convierte respuestas no exitosas en `ApiError` y puede validar el body con Zod.
- Los services aportan mensajes fallback en español; las pantallas suelen usar toasts o estados de error.
- `error.tsx`, `global-error.tsx` y el boundary administrativo permiten reintentar y reportan errores.
- La telemetría del cliente se envía a `/api/observability/client-error`, que valida tamaño y forma con Zod y registra el evento en el servidor.
- Los detalles técnicos solo se muestran en desarrollo.

## Required convention — límites que deben preservarse

- Las páginas componen; los services realizan red; `lib` alberga infraestructura/utilidades; los providers mantienen estado transversal.
- Las consultas administrativas deben usar el QueryClient ya montado en `/admin` y sus query keys existentes.
- Una operación autenticada no debe saltarse `apiFetch` salvo un flujo especial ya justificado, como login inicial o upload con progreso.
- La protección cliente mejora UX, pero la autorización de admin depende del proxy, layout y backend.

## Known inconsistency

- Componentes y lógica específica de features existen tanto bajo `src/app` como bajo `src/features`; moverlos sería un refactor, no una corrección documental.
- Hay dos familias de primitives UI —pública y administrativa— con APIs y estilos similares pero independientes.
- TanStack Query solo cubre parte del estado remoto administrativo; otras pantallas usan effects y estado manual.
- Algunos services públicos llaman `fetch(resolveApiUrl(...))` directamente en lugar de `publicFetch`.
- Los tipos de API están duplicados parcialmente entre services, schemas y módulos administrativos.

## Future improvement

Una tarea acotada podría evaluar, con pruebas de regresión, si conviene unificar la ubicación de lógica de feature, los tipos de contrato o la estrategia de estado remoto. No se ha adoptado una migración y esta documentación no la autoriza.
