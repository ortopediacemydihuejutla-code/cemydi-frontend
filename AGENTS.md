# CEMYDI Frontend — instrucciones para agentes

## Project

Frontend independiente de Ortopedia CEMYDI para catálogo, venta y renta de equipo médico, cuentas de cliente y administración. El backend vive en otro repositorio y es la fuente de verdad para contratos, autorización y reglas de negocio del servidor.

## Tech Stack

`package.json` declara Next.js `^16.2.10` (App Router), React `19.2.3`, TypeScript 5, Tailwind CSS `^4.2.2`, TanStack Query 5, Radix UI, Zod 4, TipTap, Framer Motion, GSAP, Recharts, Vitest, Testing Library y Playwright. El gestor del repositorio es npm.

## Repository Architecture

- `src/app/`: rutas, layouts, loading/error boundaries y composición de páginas.
- `src/features/admin/`: shell, providers, hooks, utilidades y primitives exclusivas del panel administrativo.
- `src/components/`: componentes reutilizables del sitio público y la cuenta de cliente.
- `src/services/`: contratos TypeScript y operaciones contra la API; `src/services/admin/` agrupa operaciones administrativas.
- `src/lib/`: clientes HTTP, sesión de servidor, schemas Zod y utilidades puras.
- `src/providers/`: estado global de autenticación, carrito, toasts y monitoreo de errores.
- `src/data/`: datos de demostración controlados por feature flag.
- `src/proxy.ts`: propagación de pathname y primera barrera para rutas `/admin`.
- `e2e/`: smoke tests de Playwright. `docs/qa/` conserva evidencia de QA existente.

## Mandatory Reading

- Contexto funcional: `docs/PROJECT_CONTEXT.md`.
- Arquitectura o límites de módulos: `docs/ARCHITECTURE.md`.
- API, services, queries, caché o uploads: `docs/API_INTEGRATION.md`.
- Sesión, roles o rutas protegidas: `docs/AUTHENTICATION.md`.
- UI, estilos, componentes o animación: `docs/DESIGN_SYSTEM.md`.
- Código o módulos nuevos: `docs/CONVENTIONS.md`.
- Pruebas: `docs/TESTING.md`.
- Flujo de trabajo completo: `docs/AI_WORKFLOW.md`.

## Existing Skills

Antes de implementar, busca una skill aplicable en `.agents/skills/`, lee su `SKILL.md` completo y sigue sus referencias relevantes. No dupliques sus instrucciones aquí, no elimines skills y no modifiques `skills-lock.json` salvo que la tarea trate explícitamente de administrar skills.

## Core Rules

- Estudia código existente y una implementación análoga antes de crear algo.
- Reutiliza componentes, primitives, hooks, services, schemas, tipos y utilidades existentes.
- Respeta los límites actuales; no introduzcas capas o abstracciones por anticipación.
- No hagas refactors fuera del alcance ni cambios funcionales incidentales.
- Las inconsistencias existentes son documentación, no plantillas: no reproduzcas un patrón inconsistente solo porque ya exista.
- Cuando haya varios patrones existentes, prefiere la convención documentada para código nuevo.
- No "limpies" deuda técnica no relacionada mientras completas una tarea acotada.
- No inventes endpoints, campos de respuesta, roles, permisos o reglas del backend.
- No crees otro cliente HTTP. Usa `publicFetch`, `apiFetch` o `adminRequest` según el flujo existente.
- No agregues una dependencia si el stack actual resuelve el problema.
- Evita `any`; valida límites externos según la política Zod documentada y conserva TypeScript estricto.
- Preserva compatibilidad con Next.js 16 y React 19, accesibilidad, responsive y lenguaje visual existente.
- Ocultar UI no es autorización. Mantén la protección de servidor para cualquier capacidad administrativa.
- No expongas secretos ni copies valores de `.env` a código o documentación.

## Before Coding

1. Localiza rutas y archivos relacionados.
2. Revisa implementaciones similares.
3. Busca componentes y primitives reutilizables.
4. Revisa tipos, schemas y validadores existentes.
5. Revisa services, query keys y estrategia de estado relacionada.
6. Revisa pruebas existentes y estados loading, empty y error.
7. Identifica y lee la skill correspondiente.

## After Coding

Ejecuta según el alcance:

```bash
npm run lint
npm run test
npm run build
```

Para cambios que afecten flujos completos o navegación real:

```bash
npm run test:e2e
```

No des por terminada una tarea si introduce errores. Distingue fallos nuevos de los 94 warnings preexistentes en `.agents/skills/impeccable`; no ignores warnings o errores nuevos en `src/`.
