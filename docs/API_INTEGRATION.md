# Integración con la API

## Fuente de verdad

> El backend es un proyecto independiente y es la fuente de verdad para contratos de API, autorización y reglas de negocio del servidor.

Este documento describe únicamente cómo el frontend realiza solicitudes hoy. Antes de cambiar un endpoint, payload, estado o campo de respuesta, verifica el repositorio de la API.

## Current behavior — resolución de URLs

`src/lib/api-config.ts` define dos contextos:

- `NEXT_PUBLIC_API_URL`: base visible para el navegador. Su default es `/api`.
- `INTERNAL_API_URL`: origen directo usado en servidor. Su default local es `http://localhost:4000`.

`resolveApiUrl(path)` usa `INTERNAL_API_URL` durante SSR y `NEXT_PUBLIC_API_URL` en el navegador. `next.config.ts` reescribe `/api/:path*` hacia `INTERNAL_API_URL/:path*`; así, el navegador puede trabajar same-origin y el servidor puede llamar directamente al backend.

La CSP permite conexiones al mismo origen, al backend local, a Cloudinary y al origen absoluto de `NEXT_PUBLIC_API_URL` cuando puede resolverse.

## Current behavior — clientes HTTP existentes

### `publicFetch`

Para lectura pública. Resuelve la URL, agrega `Accept: application/json` y usa `credentials: "omit"` por default. Acepta opciones de Next como `next.revalidate`.

### `apiFetch`

Para sesión y datos autenticados:

1. usa `credentials: "include"`;
2. para métodos distintos de GET, HEAD y OPTIONS solicita primero `/auth/csrf` si falta la cookie `cemydi_csrf`;
3. añade el token como `X-CSRF-Token`;
4. si recibe `401`, intenta una sola renovación con `POST /auth/refresh`;
5. repite la solicitud original si la renovación funciona.

La promesa de refresh se comparte mediante `refreshInFlight` para evitar múltiples renovaciones simultáneas en el mismo runtime cliente.

### `adminRequest`

Wrapper de `apiFetch` para administración. Agrega `Content-Type: application/json` cuando el body no es `FormData` y devuelve el resultado de `parseApiResponse`. No crea un mecanismo de autorización distinto.

### Uso directo de `fetch`

Los flujos iniciales de auth y algunas lecturas de reseñas llaman `fetch(resolveApiUrl(...))`. Los uploads de recetas usan `XMLHttpRequest` para progreso, cookies y CSRF. No copies estos casos especiales sin necesitar sus propiedades concretas.

## Current behavior — respuestas, errores y schemas

`parseApiResponse`:

- intenta leer JSON sin lanzar si el body no es JSON;
- crea `ApiError` con `status` y `body` ante una respuesta no exitosa;
- extrae `message`, incluidas listas de mensajes;
- traduce mensajes de rate limit conocidos;
- cuando recibe un schema, usa `safeParse` y convierte una respuesta incompatible en un `ApiError` 502.

Zod está configurado como `jitless` para ser compatible con la CSP. Actualmente hay schemas para auth/perfil, carrito y catálogo, además del payload de telemetría. No todas las respuestas de admin tienen validación runtime.

## Current behavior — services

- `auth.ts`: registro, login, verificación de correo, recuperación de contraseña, logout y export de refresh.
- `users.ts`: perfil de la sesión.
- `catalog.ts`: catálogo, detalle, recomendaciones y promociones activas.
- `cart.ts`: carrito, items, rentas del carrito y cupones.
- `rentals.ts`: solicitudes del cliente, documentos de receta, creación y cancelación.
- `reviews.ts`: reseñas públicas, testimonios y reseñas del cliente.
- `about-page.ts` y `legal-documents.ts`: contenido público con defaults controlados.
- `admin/`: productos, catálogos, proveedores, promociones, cupones, usuarios, reseñas, rentas, analytics, contenido, notificaciones, actividad y base de datos.

Familias de endpoints observadas: `/auth`, `/users/me`, `/products`, `/promotions`, `/cart`, `/rentals`, `/reviews`, `/about-page`, `/legal-documents`, `/catalogs`, `/suppliers`, `/coupons`, `/analytics`, `/admin` y `/database`. Esta lista no sustituye documentación de API y no garantiza endpoints adicionales ni estabilidad contractual.

## Current behavior — TanStack Query y caché

TanStack Query se monta solo bajo el layout administrativo. Sus defaults son:

- `staleTime: 30_000`;
- `retry: 1`;
- `refetchOnWindowFocus: false`.

`adminQueryKeys` define keys compartidas para productos, referencia de productos, promociones, catálogos de promociones y cupones. Otros módulos definen alguna key local, como notificaciones.

Los hooks administrativos combinan varios patrones:

- `useQuery` para listas y catálogos;
- `useMutation` en algunas pantallas;
- mutaciones manuales que actualizan caché con `setQueryData`;
- invalidación con `invalidateQueries` cuando conviene recargar desde servidor.

Las páginas públicas usan opciones `cache`, `next.revalidate` o carga dinámica según el service. No existe una política de caché global fuera de admin.

El carrito público usa `CartContext` y `apiFetch`, con cookies de sesión. `GET /cart` solicita `cache: no-store`; el contexto consulta cada 10 segundos mientras la página está visible y conectada, y también al recuperar foco, visibilidad o conexión. Evita consultas periódicas durante escrituras y descarta lecturas atrasadas y resultados de una sesión anterior. Un error de actualización conserva el último carrito disponible.

Para compartir carrito con la app móvil, ambos clientes deben consultar el mismo backend con la misma cuenta. En desarrollo, `/api` se redirige al `INTERNAL_API_URL` privado de la web; debe coincidir con el origen configurado en la app. La configuración local está ignorada por Git. Cambiar el servidor no migra datos entre bases y requiere iniciar sesión nuevamente. La actualización periódica no reemplaza control transaccional de ediciones simultáneas en el backend.

## Current behavior — serialización y uploads

- JSON: headers explícitos y `JSON.stringify` en services.
- Query strings: `URLSearchParams`; valores de ruta variables se codifican en los flujos revisados.
- Productos: `FormData` para imágenes, URLs y IDs conservados; JSON cuando no hay adjuntos.
- Promociones y contenido institucional: `FormData` cuando contienen archivo.
- Recetas: `XMLHttpRequest` con progreso, validación local de extensión/MIME/tamaño y un reintento tras refresh.
- Descargas administrativas: blob y nombre derivado de `Content-Disposition` con fallback.

Las restricciones del cliente, incluidas las de archivo, son UX. El backend debe repetir toda validación de seguridad.

## Required convention — política HTTP para código nuevo

1. Confirma el contrato en el backend y agrega la operación al service de su dominio.
2. Usa `publicFetch` para lecturas públicas JSON que no deben enviar credenciales. Conserva sus opciones de caché de Next solo cuando el caso las requiera.
3. Usa `apiFetch` para operaciones normales que dependen de cookies de sesión, tanto lecturas autenticadas como mutaciones. No reimplementes cookies, CSRF o refresh en cada service.
4. Usa `adminRequest` únicamente desde services del panel administrativo; delega cookies, CSRF, refresh y errores a `apiFetch`.
5. `fetch` directo está permitido solo cuando un wrapper no puede expresar el transporte requerido: reenvío explícito de cookies en servidor, una respuesta no JSON/stream o una necesidad de transporte especial como progreso XHR. Documenta localmente el motivo. Las llamadas directas existentes no son una plantilla automática.
6. Para respuestas JSON, pasa la respuesta por `parseApiResponse` y proporciona un mensaje fallback. Para `FormData`, no fijes `Content-Type`; para JSON, decláralo y serializa con `JSON.stringify`.
7. Para una respuesta no JSON, comprueba `response.ok`, procesa explícitamente `blob`, `text` o stream, y convierte el fallo en un error con mensaje seguro. Reutiliza `downloadBinaryResponse` para descargas admin cuando aplique.
8. No configures manualmente `credentials`, CSRF o refresh si usas `apiFetch`/`adminRequest`. Las excepciones de transporte deben incluir las cookies y CSRF que su flujo necesite.
9. En admin, usa una query key estable y define actualización o invalidación de caché. Añade pruebas de service y de los estados loading/error/empty de UI.

## Known inconsistency

- Algunas lecturas públicas usan `publicFetch` y otras `fetch(resolveApiUrl(...))` directamente.
- Solo parte de las respuestas se valida con Zod; numerosos services administrativos confían en tipos genéricos de TypeScript.
- Query keys centralizadas y keys locales coexisten.
- `services/catalog.ts` declara tipos semejantes a los inferidos en `lib/schemas/catalog.ts`.

## Future improvement

Una futura tarea puede consolidar las llamadas directas equivalentes y decidir una estrategia uniforme de validación runtime para responses. Debe hacerse por dominio, con contratos del backend y pruebas, no como cambio mecánico global.

# Cambios de credenciales del perfil

La edición ordinaria de `/perfil` envía a `PATCH /users/me` solo `nombre`, `telefono` y `direccion`; el correo se muestra como lectura. El cambio de correo usa `POST /users/me/email-change/request` con `newEmail` y `currentPassword`, `/resend` sin datos y `/confirm` con `newEmail` y `codigo` de ocho dígitos. La configuración de contraseña usa las rutas equivalentes `/users/me/password-change/request`, `/resend` y `/confirm`; confirma con `codigo` y `newPassword`. Ambos flujos muestran el tiempo de reenvío del servidor. Al confirmar, todas las sesiones quedan revocadas y la web dirige a login. Las llamadas pasan por `apiFetch` para conservar cookies y CSRF existentes.

# Notificaciones de clientes

El nuevo módulo `/notifications` y la gestión `/admin/notification-campaigns` están documentados en [NOTIFICATIONS.md](./NOTIFICATIONS.md). Las preferencias de `/configuracion` se guardan en el backend y se sincronizan con móvil.

## Moderación de reseñas — 1 de noviembre de 2026

Se confirmó e implementó con autorización del usuario `PATCH /reviews/:id/reject`
en el backend. Requiere JWT y rol ADMIN, sin body; devuelve `{ message, review }`
con la misma forma administrativa de aprobación. Rechazar conserva la opinión,
la deja `REJECTED`, quita su visibilidad en Inicio y limpia `approvedAt` y
`approvedBy`. `rejectReview` valida la respuesta mediante Zod antes de actualizar
la tabla. El diálogo conserva el estado ante errores y bloquea acciones durante
el envío. Las reseñas rechazadas pueden aprobarse posteriormente.

Aprobación y rechazo generan un aviso `SYSTEM`/`REVIEW_STATUS` para el cliente
activo, con destino `PRODUCT`. Estado, bandeja y trabajos de push se guardan
atómicamente. Repetir un estado no repite el aviso; un cambio concurrente devuelve 409. El historial administrativo admite el origen `REVIEW_STATUS`. No hay nuevos
roles, preferencias o destinos ni cambios en cookies/CSRF.

Validación de esta ampliación: build de producción Next.js/Serwist, 283 pruebas
Vitest y 11 escenarios Playwright aprobados contra el build en un servidor local
aislado, sin reintentos. Playwright cubre smoke público, formularios y CSP; la
moderación se cubre con Testing Library/Radix y servicios simulados, y la API con
pruebas HTTP de permisos. ESLint no presenta errores y conserva los 94 warnings
existentes en skills. No se comprobó entrega externa de push para reseñas.
