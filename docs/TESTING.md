# Pruebas y validación

## Current behavior — herramientas

- Vitest 4 con entorno `jsdom`.
- React Testing Library y `@testing-library/jest-dom`.
- Playwright 1.60, proyecto Chromium Desktop.
- ESLint 9 con configuraciones Core Web Vitals y TypeScript de Next.js.
- `next build` como validación de TypeScript, App Router y producción.

## Current behavior — configuración

`vitest.config.ts` incluye `src/**/*.test.ts` y `src/**/*.test.tsx`, configura el alias `@` y carga `vitest.setup.ts`.

El setup:

- registra matchers de jest-dom;
- ejecuta `cleanup` después de cada prueba;
- simula `window.matchMedia`.

`playwright.config.ts`:

- busca pruebas en `e2e/`;
- ejecuta en paralelo localmente;
- prohíbe `test.only` en CI;
- reintenta una vez y usa un worker en CI;
- conserva trace en el primer retry;
- usa `PLAYWRIGHT_BASE_URL` o `http://localhost:3000`;
- inicia `npm run dev` automáticamente fuera de CI.

## Current behavior — cobertura observada

- Services: forma del request, verbos, respuesta y fallos de auth, carrito, catálogo, rentas y usuarios.
- `lib`: schemas, errores de API, sesión admin, formatos, precios/promociones, perfil, contraseñas, recetas, share y site config.
- Providers: hidratación/cambios de auth y estado de carrito.
- Componentes: interacciones, render y estados de cuenta, header, producto, rentas y admin.
- Estructura: algunos tests aseguran hitos de fases de carrito/rentas y páginas admin.
- Route handler de observabilidad.
- E2E: home, catálogo, login y una regresión de hidratación causada por atributos inyectados.

## Required convention — qué prueba usar

### Unitarias

Para funciones puras, mappers, validadores, schemas, cálculo, query params, formatters y comportamiento de services con red simulada.

### Componentes

Para formularios, accesibilidad por roles/labels, dialogs, botones, providers, loading/error/empty y cambios visibles después de interacción. Prueba comportamiento observable; evita acoplarte a clases salvo que el estilo sea el contrato.

### E2E

Para navegación y flujos completos entre rutas, integración con el servidor de Next, hidratación, guards, login real controlado y regresiones que no pueden representarse con jsdom. El suite actual es smoke-level y no cubre administración o renta de extremo a extremo.

## Current behavior — mocks y aislamiento

- Vitest usa `vi.mock`, `vi.spyOn` y stubs de `fetch` para aislar services y navegación.
- Los tests de providers simulan `next/navigation` y services.
- No hay servidor de mocks global ni fixtures de API compartidos.
- Playwright usa el comportamiento disponible en el entorno; las pruebas existentes no definen autenticación almacenada ni Page Objects.

## Required convention — validación

```bash
npm run lint
npm run test
npm run test:watch
npm run build
npm run test:e2e
```

Para cualquier cambio ejecuta lint, test y build. Añade E2E cuando se modifiquen navegación, layouts, autenticación, integración completa o un flujo crítico. Los 94 warnings de `.agents/skills/impeccable` son preexistentes, pero todo warning o error nuevo —especialmente bajo `src/`— debe revisarse y no ignorarse.

## Required convention — checklist para nuevas pruebas

- Caso exitoso y fallo relevante.
- Loading, empty y error cuando sean estados reales.
- Interacción por nombre/rol accesible.
- Respuesta inválida si el contrato usa Zod.
- Mutación: request correcto y estado/caché posterior.
- Auth: usuario ausente, rol incorrecto y sesión válida cuando aplique.
- Limpieza de timers, object URLs, listeners y mocks.

## Current behavior — línea base auditada

Al preparar esta documentación:

- 45 archivos de Vitest pasaron;
- 159 tests pasaron;
- el build de producción pasó;
- ESLint terminó con 0 errores y 94 warnings procedentes de scripts vendorizados bajo `.agents/skills/impeccable`.

## Known inconsistency

- ESLint inspecciona scripts grandes de skills y produce warnings ajenos al código de aplicación.
- La cobertura E2E es deliberadamente pequeña frente al número de rutas.
- Algunos tests llamados `*-structure.test.ts` verifican estructura/fases más que comportamiento de usuario.
- No existe configuración de cobertura ni umbral mínimo declarado.

## Future improvement

Una tarea de calidad podría aislar los scripts de skills de ESLint, ampliar E2E por flujos críticos y definir cobertura si el equipo acuerda un objetivo. No hay un umbral de cobertura oficialmente adoptado.

## Carrito compartido con app — 16 de octubre de 2026

CartContext y cart service: 16 pruebas aprobadas, incluyendo cambios externos por foco/red e intervalo, pausa offline/oculto, cleanup, conservación de datos tras error, lectura atrasada después de escritura y descarte de escritura al cambiar de cuenta. GET /cart usa no-store. La configuración privada local se alineó con el destino móvil y se verificó el rewrite activo; no se copiaron valores a Git ni se migraron bases de datos. Se requiere iniciar sesión nuevamente con la misma cuenta. La comparación con una sesión real móvil/web queda pendiente.

`npm run lint`: 0 errores y 94 warnings preexistentes de scripts de skills; lint dirigido de los cuatro archivos TypeScript modificados sin warnings. `npm run test -- --maxWorkers=2`: 60 archivos aprobados y uno fallido; 224 pruebas aprobadas y una fallida en PwaProvider, sobre la recuperación del tiempo restante del aviso de reconexión. Se reprodujo ejecutando esa prueba por separado; tanto PwaProvider como su prueba permanecen sin cambios en esta tarea.

`npm run build`: aprobado, incluida comprobación TypeScript y generación del service worker. Playwright completo: 11/11 aprobadas contra ese build servido temporalmente en el puerto 3001, con PLAYWRIGHT_BASE_URL y CI para evitar reutilizar el servidor de desarrollo. Los intentos contra Next dev mostraron fallos de scroll del encabezado y nonce CSP que no se reprodujeron contra producción. El servidor temporal se detuvo al terminar; el desarrollo local permanece disponible.
