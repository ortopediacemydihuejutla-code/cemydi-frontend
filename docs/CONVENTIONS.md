# Convenciones del repositorio

## Current behavior

### TypeScript e imports

- `strict: true`, `noEmit: true`, resolución `bundler` y JSX de React.
- Alias `@/*` hacia `src/*`; es el estilo dominante para imports entre áreas.
- `import type` se usa para dependencias solo de tipos.
- Unions literales modelan roles, estados y modos de adquisición.
- Tipos inferidos con `z.infer` cuando el dominio ya tiene schema Zod.
- Los archivos evitan `any` en el código revisado; para fronteras no confiables se usa `unknown` y narrowing.

### Nombres y archivos

- Componentes React: PascalCase; en áreas públicas conviven nombres PascalCase y kebab-case de primitives.
- Hooks: prefijo `use` y normalmente archivo `use-*.ts(x)` o `useNombre.ts` según el módulo existente.
- Services y utilidades: funciones en camelCase y nombres de archivo kebab-case o nombre del dominio.
- Tests unitarios/de componente: `*.test.ts` y `*.test.tsx`, junto al módulo o dentro de `__tests__`.
- Playwright: `e2e/*.spec.ts`.

### Server y Client Components

- Las páginas sin `"use client"` cargan datos y metadata en servidor cuando pueden.
- Se añade `"use client"` al usar hooks, eventos, navegador, contexto o componentes interactivos.
- Los datos iniciales pueden pasar de una página servidor a un componente cliente, como en catálogo y detalle de producto.
- No conviertas un árbol completo en cliente si la interactividad puede aislarse.

### Services y API

- Las operaciones de red viven en `src/services`.
- Coexisten `publicFetch`, `apiFetch`, `adminRequest` y llamadas directas con `fetch(resolveApiUrl(...))`.
- `parseApiResponse` es el punto común de errores y validación opcional.
- Los payloads JSON declaran `Content-Type`; `FormData` deja que el navegador construya el boundary.
- Paths variables se codifican cuando aceptan strings externos.

### Zod y validación

- Importa `z` desde `@/lib/zod`, no directamente desde `zod`, al crear schemas de aplicación; esto conserva la configuración `jitless` para CSP.
- Los schemas de respuesta existentes viven en `src/lib/schemas`.
- `safeParse` se usa para responses con schemas y para el route handler de telemetría; no todos los límites externos tienen validación runtime.
- Los formularios actuales usan validadores locales y estado controlado; reutiliza helpers como política de contraseña y validación de recetas.

### TanStack Query

- Está limitado al árbol administrativo mediante `AdminProviders`.
- Reutiliza `adminQueryKeys` o la key estable del módulo.
- Tras mutar, actualiza caché de forma determinista o invalida la query relevante; no dejes datos visibles obsoletos.
- Los filtros/paginación derivados suelen mantenerse como estado local y `useMemo`.

### Errores

- Los services lanzan `ApiError` o `Error`; la UI captura y muestra mensajes en español.
- Usa toast para resultados de acciones y superficies/boundaries para fallos de carga.
- No expongas stack, body de API o detalles internos en producción.
- Reporta errores inesperados mediante la infraestructura de observabilidad existente.

### Estilos y `cn`

- Tailwind es el mecanismo principal; tokens globales viven en `globals.css`.
- Hay dos funciones `cn`: `@/lib/utils` y `@/features/admin/lib/utils`. Son funcionalmente equivalentes: filtran valores falsy y unen las clases con espacios. La utilidad admin además exporta `matchSidebarPath`, pero `cn` no cambia de comportamiento.
- Reutiliza wrappers Radix existentes y los tokens del contexto público/admin.
- Mantén breakpoints, target mínimo, foco visible y tema oscuro admin.

### Organización

- Código compartido de una sección: `components/<dominio>` o `features/admin` según el contexto actual.
- Código exclusivo de una ruta compleja puede permanecer junto a esa ruta.
- Lógica pura transversal: `lib`; red: `services`; estado transversal: `providers`.
- Los barrel exports existen principalmente en `services/admin`; no agregues barrels globales sin necesidad.

## Required convention

### Política HTTP

- `publicFetch`: lecturas públicas JSON sin credenciales.
- `apiFetch`: operaciones normales con sesión o cookies, incluidas mutaciones; este wrapper administra cookies, CSRF y el único retry tras refresh.
- `adminRequest`: services exclusivos del panel administrativo; no lo uses para áreas públicas o de cuenta.
- `fetch` directo: excepción documentada para transporte que los wrappers no expresan, como reenvío de cookie en servidor o respuesta/transporte no JSON. Una llamada existente no justifica copiarla.
- Usa `parseApiResponse` para JSON esperado; para `FormData` no declares `Content-Type`; para descargas u otras respuestas no JSON comprueba `ok` y procesa el formato de forma explícita.

### Política Zod

- Importa `z` desde `@/lib/zod`.
- Valida con Zod datos estructurados no confiables en límites externos nuevos: payloads de Route Handlers, respuestas JSON de API que alimentan UI o decisiones de dominio, y parámetros externos complejos antes de convertirlos en datos de dominio.
- Para formularios nuevos, usa un schema Zod cuando haya estructura reutilizable, validación cruzada o relación directa con un contrato externo. Los validadores locales simples siguen siendo válidos para feedback inmediato y no sustituyen la validación del backend.
- No exige Zod para estado local ya tipado, respuestas intencionalmente no JSON, ni para migrar módulos existentes sin alcance.

### UI, estado y organización

- En público/cuenta usa primero sus primitives y `@/lib/utils`; en `/admin` usa primero primitives y utilidades de `features/admin`. Para código nuevo fuera de admin, prefiere `@/lib/utils` para `cn`; dentro de admin, conserva `@/features/admin/lib/utils` para mantener el límite del módulo y acceso a `matchSidebarPath` cuando corresponda.
- Centraliza una query key si más de un consumidor admin depende de ella y deja explícita la actualización o invalidación de caché después de mutar.
- Coloca un componente cerca de su único consumidor y promuévelo a compartido solo con reutilización real.
- Mantén funciones de página pequeñas cuando sea útil, sin imponer una migración de estructura global.

### Validación obligatoria

Ejecuta siempre:

```bash
npm run lint
npm run test
npm run build
```

Ejecuta también `npm run test:e2e` cuando cambies navegación, autenticación, layouts o un flujo de usuario completo. Distingue los warnings preexistentes de `.agents/skills/impeccable` de cualquier warning o error nuevo en `src/`; no ignores los últimos.

## Antes de crear algo

Busca, en este orden:

1. componente o hook del mismo dominio;
2. primitive pública o administrativa;
3. service y tipos existentes;
4. schema/validador/utilidad de `lib`;
5. implementación equivalente y sus tests;
6. skill relevante en `.agents/skills`.

## Known inconsistency

- Coexisten nombres de archivo PascalCase, kebab-case y camelCase.
- Algunas rutas contienen feature logic completa y otras delegan a `src/features`.
- Hay contracts validados por Zod y contracts tipados solo en compilación.
- El formateo de algunos módulos admin omite punto y coma, mientras la mayoría del proyecto los usa; ESLint no impone una única presentación.
- Hay utilidades `cn` en `src/lib/utils.ts` y `src/features/admin/lib/utils.ts`.

No copies llamadas directas de `fetch`, duplicación de tipos o imports cruzados de `cn` como precedente para código nuevo.

## Future improvement

Una tarea separada podría elegir una sola ubicación para `cn`, una política de schemas más uniforme y una organización de features consistente. Requiere cambios coordinados de imports, pruebas y revisión visual; no es parte de una feature ordinaria.
