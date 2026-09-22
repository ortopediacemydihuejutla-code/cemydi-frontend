# Contexto de CEMYDI Frontend

## Qué es la aplicación

CEMYDI Frontend es la interfaz web de Ortopedia CEMYDI. Presenta productos de movilidad, rehabilitación y cuidado en casa, y ofrece flujos diferenciados para visitantes, clientes autenticados y administradores.

El frontend consume una API externa. El repositorio permite observar los datos que la UI solicita y representa, pero no contiene la implementación ni todas las reglas del servidor.

> Backend-owned behavior — verify against API repository.

## Áreas funcionales observadas

### Sitio público

- Inicio con promociones, testimonios y accesos al catálogo.
- Catálogo con búsqueda, filtros por clasificación, marca, adquisición, receta y disponibilidad, orden y paginación.
- Detalle de producto por identificador o slug, imágenes, promoción, recomendaciones, reseñas y acciones de compra/renta.
- Páginas institucionales: quiénes somos, contacto, política de privacidad y términos y condiciones.
- Metadata global, metadata por página, Open Graph, Twitter cards, `robots.txt`, sitemap y manifest.

### Identidad y cuenta

- Registro, login por correo y contraseña y redirección a autenticación de Google.
- Verificación de correo por enlace o código.
- Recuperación y restablecimiento de contraseña por código o token.
- Perfil de usuario y detección de perfil incompleto.
- Resumen de cuenta, favoritos guardados localmente, pedidos, rentas, reseñas y configuración.

### Compra y renta

- Carrito autenticado con productos en modo `VENTA` o `RENTA`.
- Cupones, promociones, disponibilidad y cálculo presentado a partir de la respuesta de la API.
- Configuración de fechas y notas de renta.
- Carga, reemplazo, descarga y eliminación de recetas médicas.
- Creación y seguimiento de solicitudes de renta, historial de estado, depósito y cancelación del cliente.

No se observó en este frontend un flujo de pago o checkout completo. Las condiciones definitivas de precios, stock, cupones, rentas, recetas, depósitos y estados son responsabilidad del backend.

### Administración

El árbol `/admin` contiene dashboard y módulos para:

- productos, imágenes e importación/exportación CSV;
- marcas, clasificaciones y proveedores;
- promociones y cupones;
- usuarios, reseñas y solicitudes de renta;
- analytics;
- contenido institucional y documentos legales;
- notificaciones y actividad reciente;
- estado, respaldos, mantenimiento y controles de seguridad de base de datos.

Las acciones disponibles en UI no prueban por sí mismas los permisos efectivos del servidor.

> Backend-owned behavior — verify against API repository.

## Current behavior — roles observados

- `CLIENT`: cuenta de cliente, carrito, renta, perfil y contenido personal.
- `ADMIN`: acceso al panel administrativo.

El schema de auth y los tipos administrativos restringen el rol a esos dos valores. Las comparaciones en UI usan `user.rol === "ADMIN"` o `user.rol === "CLIENT"` y sus negaciones.

`USER` aparece únicamente como alias local en `src/app/login/page.tsx`: se asigna a cualquier resultado que no sea `ADMIN` para escoger una redirección. No se recibe del backend, no aparece en schemas ni en `UserRole`, y no debe tratarse como rol.

## Required convention — roles nuevos

No agregues roles, permisos ni aliases de rol desde el frontend. Usa únicamente `ADMIN` y `CLIENT` mientras el contrato del backend no cambie, y nombra cualquier decisión local sin aparentar que es un rol del dominio.

La UI puede orientar o bloquear una acción para UX, pero el backend debe validar todas las acciones protegidas.

## Datos locales

- `src/data/recommendation-demo.ts` contiene recomendaciones demostrativas activadas mediante `NEXT_PUBLIC_ENABLE_RECOMMENDATION_DEMO`.
- Los favoritos usan almacenamiento local del navegador y no un service remoto.
- El estado de sesión y el carrito real proceden de la API.

## Known inconsistency

- La aplicación mezcla etiquetas de rol `CLIENT` con una variable local `USER` usada solo para decidir redirecciones después del login; `USER` no es un rol del contrato.
- Algunas áreas públicas ofrecen defaults de contenido o datos demostrativos cuando la API no responde, mientras otras muestran un error explícito.
- Los contratos funcionales están repartidos entre schemas Zod, tipos de services y tipos locales de páginas; no existe un modelo de dominio único.
