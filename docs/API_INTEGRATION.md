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
