# Autenticación y autorización

## Current behavior — modelo de sesión

El frontend no persiste un access token activo en `localStorage`. La sesión actual se consulta a `/users/me` y las solicitudes autenticadas incluyen cookies mediante `credentials: "include"`. El backend es responsable de crear, rotar, expirar y validar las cookies de sesión.

`AuthContext` elimina claves legacy (`accessToken`, `authUser`, `user`, `lastActivity` y `GDPR_REMOVAL_FLAG`) al hidratar o cerrar sesión.

> Backend-owned behavior — verify against API repository.

## Current behavior — login y redirects

1. La página valida correo y presencia de contraseña en cliente.
2. `loginUser` envía `POST /auth/login` con cookies incluidas.
3. Para `CLIENT`, la página vuelve a solicitar `/users/me` para obtener el perfil completo.
4. `AuthContext.login` guarda al usuario solo en memoria.
5. `ADMIN` se dirige a `/admin`; un cliente con perfil completo a `/catalogo`; uno incompleto a `/mi-cuenta`.

También existe un inicio con Google que navega a `/auth/google`. Callback, intercambio de credenciales y reglas del proveedor pertenecen al backend.

El alias local `USER` se usa en login para el caso que no es `ADMIN`; no es parte de la respuesta, schema o tipo de rol del backend. Los roles de contrato observados son exclusivamente `ADMIN` y `CLIENT`.

## Current behavior — hidratación de sesión

- En rutas públicas normales, `AuthContext` llama `getMyProfile` al montar y mantiene un fallback de loading de 900 ms.
- Omite esa consulta en rutas de auth públicas y en `/admin`.
- El layout administrativo obtiene al usuario en servidor y `AdminSessionHydrator` lo inserta en el contexto cliente.
- `CartContext` solo carga carrito cuando el usuario hidratado tiene rol `CLIENT`.

## Current behavior — cookies, CSRF y refresh

- `apiFetch` siempre incluye cookies.
- Para mutaciones garantiza la cookie legible `cemydi_csrf` mediante `GET /auth/csrf`.
- Envía su valor en `X-CSRF-Token`.
- Ante `401`, llama `POST /auth/refresh` y repite una vez.
- Los uploads XHR de receta replican cookies, CSRF y reintento porque necesitan eventos de progreso.

Los nombres, flags, duración y contenido de las cookies de sesión no pueden verificarse aquí.

> Backend-owned behavior — verify against API repository.

## Current behavior — logout

`POST /auth/logout` usa `apiFetch`. Aunque el request falle por una sesión ya expirada, la UI limpia el usuario y las claves legacy, muestra confirmación y navega a `/login`. La invalidación definitiva de cookies pertenece al backend.

## Current behavior — registro, verificación y recuperación

- Registro: `/auth/register` y navegación a `/verify-email`.
- Verificación: envío, confirmación por token y confirmación por código.
- Recuperación: solicitud, verificación de código/token y confirmación de nueva contraseña.
- Contraseña: el helper local exige 10–72 caracteres, mayúscula, dígito y símbolo; un comentario indica alineación con backend, pero este frontend no es la fuente normativa.

## Current behavior — protección administrativa

Hay tres niveles visibles:

1. `src/proxy.ts` intercepta `/admin`, reenvía cookies a `/users/me`, redirige sin sesión a `/login` y roles no admin a `/perfil`.
2. `src/app/admin/layout.tsx` repite la comprobación en servidor con `requireAdminSessionUser`.
3. Hooks/componentes cliente usan el contexto para experiencia de carga y visibilidad.

Los dos primeros evitan renderizar el panel a un usuario no autorizado por la comprobación del frontend. La API debe autorizar cada endpoint administrativo de forma independiente.

## Current behavior — rutas de cliente

Rutas como carrito, rentas y detalle de renta realizan guards cliente mediante `useAuth` y redirecciones. Los componentes también bloquean acciones a roles distintos de `CLIENT`. Esto es protección de UX, no una frontera de seguridad: los endpoints deben verificar sesión, propietario y rol.

## Current behavior — roles y permisos

Los únicos roles observados en schemas y tipos son `ADMIN` y `CLIENT`. No existe una matriz granular de permisos en el frontend. `ADMIN` se redirige al panel y es requerido por proxy/layout; `CLIENT` habilita carrito y áreas de cuenta. No inventes scopes, jerarquías ni capacidades adicionales.

## Required convention — código nuevo

- Trata `ADMIN` y `CLIENT` como los únicos roles de contrato hasta una modificación verificada de backend.
- No uses aliases locales como `USER` para representar autorización.
- Usa `apiFetch` para operaciones autenticadas normales; no dupliques CSRF, refresh ni almacenamiento de tokens.
- Conserva guards de UI para UX, pero requiere protección de servidor para rutas/capacidades administrativas y autorización en la API para cualquier dato o mutación protegida.
- No deduzcas atributos, vida útil o seguridad de cookies fuera de lo confirmado por la API.

## Known inconsistency

- La protección robusta de servidor está explícita para `/admin`; varias páginas de cliente dependen de guards ejecutados después de hidratar en el navegador.
- Login/registro usan `fetch` directo con cookies, mientras logout y datos autenticados usan `apiFetch` con CSRF/refresh.
- La política de contraseña está duplicada localmente para UX y puede divergir del backend si se cambia solo un repositorio.

## Future improvement

Se podría definir una estrategia de protección server-side para rutas de cliente que hoy hidratan y redirigen en navegador. Requiere confirmar el UX esperado y la política de sesión del backend antes de adoptarla.
