# CEMYDI Frontend

Frontend independiente de Ortopedia CEMYDI para consultar productos de equipo médico, gestionar carrito y solicitudes de renta, mantener una cuenta de cliente y operar el panel administrativo.

El backend/API pertenece a un proyecto separado. Este repositorio no define por sí solo los contratos ni las reglas de negocio del servidor.

## Requisitos

- Node.js compatible con Next.js 16 (el repositorio no fija una versión mediante `engines`).
- npm y acceso a una instancia del backend de CEMYDI.

## Instalación

```bash
npm install
```

Copia el archivo de ejemplo y ajusta las URLs para tu entorno:

```bash
cp .env.local.example .env.local
```

Variables principales:

- `NEXT_PUBLIC_API_URL`: URL que usa el navegador. El valor recomendado para desarrollo es `/api`.
- `INTERNAL_API_URL`: URL directa del backend que usan rewrites y solicitudes ejecutadas en el servidor.
- `NEXT_PUBLIC_SITE_URL`: origen público del frontend para metadata y URLs canónicas.
- `NEXT_PUBLIC_ENABLE_RECOMMENDATION_DEMO`: habilita datos demostrativos de recomendaciones cuando corresponde.

Con `NEXT_PUBLIC_API_URL=/api`, Next.js reescribe `/api/*` hacia `INTERNAL_API_URL`. No guardes secretos en variables `NEXT_PUBLIC_*` ni confirmes `.env` locales.

## Desarrollo

```bash
npm run dev
```

La aplicación queda disponible normalmente en `http://localhost:3000`.

## Producción

```bash
npm run build
npm run start
```

## Validación

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

`test:e2e` inicia el servidor de desarrollo automáticamente fuera de CI y usa `PLAYWRIGHT_BASE_URL` si está definida.

## Estructura resumida

```text
src/app/          rutas y layouts del App Router
src/components/   UI reutilizable pública y de cuenta
src/features/     módulos transversales; actualmente concentra administración
src/services/     acceso a la API y contratos de datos
src/lib/          clientes HTTP, schemas, sesión y utilidades
src/providers/    autenticación, carrito, toasts y observabilidad
src/data/         datos demostrativos controlados
e2e/              pruebas Playwright
docs/             arquitectura y guías del proyecto
```

## Documentación

- [AGENTS.md](AGENTS.md): reglas operativas para agentes de IA.
- [Contexto del proyecto](docs/PROJECT_CONTEXT.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Integración con API](docs/API_INTEGRATION.md)
- [Autenticación](docs/AUTHENTICATION.md)
- [Sistema de diseño](docs/DESIGN_SYSTEM.md)
- [Convenciones](docs/CONVENTIONS.md)
- [Pruebas](docs/TESTING.md)
- [Flujo de trabajo para IA](docs/AI_WORKFLOW.md)

La evidencia histórica de revisión visual permanece en `docs/qa/`.
