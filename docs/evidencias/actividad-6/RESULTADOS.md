# Resultados comprobados de la Actividad 6

Fecha de ejecución: 27 de octubre de 2026, America/Mexico_City.

| Validación | Antes | Resultado final | Registro |
| --- | --- | --- | --- |
| Frontend build | Aprobó | Aprobó Next.js 16.3.8, TypeScript y generación Serwist: 110 URLs, 9.67 MB | frontend-build.log; frontend-build-final.log |
| Backend build | Aprobó | Aprobó NestJS; no hubo cambios de código allí | backend-tests.json, resultado observado en terminal |
| Frontend unitarias | Se reprodujo un fallo previo en PwaProvider; ejecución completa inicial interrumpida | 276/276, 70 archivos | frontend-tests-antes.log; frontend-tests-final.log |
| Aviso de reconexión | Fallaba la recuperación del tiempo restante | 6/6, incluyendo marca vencida, inválida, futura y almacenamiento bloqueado | reconexion-despues.log |
| Preferencia de tema | Implementación existente sin prueba dedicada en esta auditoría | 1/1 del proveedor real; incluida en las 276 finales | preferencias-locales.log |
| Backend unitarias | Sin correcciones necesarias | 379/379, 76 suites, 218.927 s | backend-tests.json |
| E2E existentes contra producción real | 11/11 en primera ejecución | 11/11 en build final, 6.4 s | frontend-e2e.log; frontend-e2e-final.log |
| PWA aisladas con fixture | 19/23, luego 22/23 tras la primera corrección | 23/23, 1.3 min | pwa-suite-antes-correccion.log; pwa-suite-intermedio.log; pwa-suite-final.log |
| Auditoría adicional contra API real | Primer intento: dos expectativas del script incorrectas | 11/11, sin pageerror | navegador-primer-intento.json; navegador-real.json |
| ESLint global | 0 errores, 94 warnings preexistentes de skills | Sin nuevos errores; lint de todos los archivos JS/TS cambiados sin warnings | frontend-lint.log; lint-cambios.log |
| Revisión del diff | Cambios locales anteriores presentes | git diff --check sin errores de espacios; cambios anteriores conservados | Revisión final en terminal |

Las dos expectativas corregidas del script de auditoría no eran errores de producto: la búsqueda usa `q`, no `search`, en la URL de la página; y el SSR se verifica en el HTML, sin suponer que el streaming será visible con JavaScript deshabilitado. El primer resultado se conserva, incluyendo ambos fallos.

## Comandos ejecutados

En el backend:

```text
npm run build
npm test -- --runInBand
node dist/main.js
```

Se realizó además una lectura independiente mediante Prisma con `node --env-file=.env`. No se imprimió la cadena de conexión y no se crearon ni modificaron cuentas, carritos, compras o rentas para la auditoría. El inicio normal de Nest ejecuta sus tareas de inicialización habituales.

En el frontend:

```text
npm run build
npm run lint
npm run test -- --maxWorkers=2
npm run test:e2e:pwa
node node_modules/@playwright/test/cli.js test --config playwright.pwa.config.ts
node scripts/actividad6-local.mjs build
node scripts/actividad6-local.mjs start
node scripts/audit-actividad6.mjs
node scripts/actividad6-local.mjs e2e
```

`actividad6-local.mjs build` ejecuta Next y Serwist con `INTERNAL_API_URL=http://127.0.0.1:4000`. `start` usa ese mismo origen; `e2e` usa producción en el puerto 3001 sin levantar `next dev`. Las variables no se guardan en `.env.local`.

La última ejecución PWA se lanzó sin recompilar porque la corrección restante afectaba exclusivamente a selectores del test. Después se regeneró el build contra la API local real y se repitieron las capturas, las once comprobaciones de auditoría y los once E2E. El build final no queda apuntando al backend fixture del puerto 4199.

Para revisar el documento se ejecutó `render_docx.py`; faltaba LibreOffice. Se utilizó una instancia separada de Word para exportar la copia a PDF y Poppler para generar imágenes de revisión. El original escolar no fue sobrescrito.

## Lectura de los resultados

La suite PWA usa datos de prueba y comprueba mecanismos, no demuestra la persistencia en la base de datos real. La auditoría adicional sí utiliza la API NestJS local, y la consulta Prisma verifica PostgreSQL. La emulación de desconexión del navegador no reemplaza una prueba con Wi-Fi/datos desactivados en un dispositivo físico: en esta versión de Chromium se observó que alguna navegación del worker aún alcanzó el servidor y recibió un 404 real.

No se probó una instalación nativa, una Splash Screen física, una sesión administrativa real ni una compra/renta autenticada. Los resultados no deben interpretarse como certificación completa de esos flujos.
