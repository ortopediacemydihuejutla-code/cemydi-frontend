# PWA CEMYDI — decisiones del grilling

Fecha: 11 de octubre de 2026.

Este documento complementa el prompt maestro PWA proporcionado por el usuario. Las decisiones 1–15 y sus condiciones técnicas fueron aceptadas y confirmadas explícitamente. La entrevista quedó cerrada y la implementación por fases fue autorizada. Este documento registra requisitos, no evidencia de pruebas.

## Decisiones aceptadas

1. **Inicio offline.** Al abrir `/` sin conexión, mostrar el respaldo offline con acceso al catálogo guardado. Mantener `start_url: "/"`.
2. **Vigencia y capacidad.** Los 30 días son la vigencia máxima desde la última actualización válida, no una garantía de permanencia mínima. Al superar el límite inicial de 200 productos, desalojar los de actualización más antigua junto con sus detalles. Esta decisión aclara expresamente la restricción del prompt original: la capacidad puede causar eliminación antes de 30 días. No introducir un TTL de productos más corto.
3. **Imágenes.** Garantizar el contenido textual guardado. Las imágenes estarán disponibles cuando permanezcan en caché; mostrar un reemplazo visual cuando falten. No prometer su conservación durante toda la vigencia del producto.
4. **Servicio inaccesible.** Los fallos de red y HTTP 5xx permiten ofrecer datos locales, incluso si `navigator.onLine` indica conexión. Mostrar «Información guardada; servicio temporalmente no disponible» cuando corresponda, ocultar datos comerciales y bloquear operaciones comerciales. HTTP 401, 403, 404 y errores de validación mantienen su tratamiento propio y no activan automáticamente el respaldo. Al reconectar, recuperar datos válidos antes de restaurar la información comercial.
5. **Actualizaciones.** Posponer la activación mientras existan tareas detectables sin terminar. Si no puede comprobarse, requerir confirmación explícita que explique la recarga. «Más tarde» conserva la versión actual sin insistir durante esa sesión. Contemplar las pestañas afectadas por la activación.
6. **Detalle parcial.** Un producto guardado únicamente desde el catálogo puede mostrar una ficha básica offline. Explicar que el detalle completo requiere conexión y no inventar campos faltantes. Una visita válida al detalle amplía la información guardada.
7. **Quiénes somos y fallbacks.** Conservar la última respuesta pública válida. El contenido predeterminado usado tras un fallo no sobrescribe esa respuesta ni renueva su fecha. Cuando no exista contenido válido guardado, mostrar el contenido institucional predeterminado existente, identificado como tal.
8. **Cierre de sesión y borrado.** Conservar los productos públicos al cerrar sesión. Ofrecer «Borrar contenido guardado» para eliminar la persistencia pública y sus imágenes asociadas, preservando los recursos esenciales de la PWA. No almacenar datos privados.
9. **Filtros locales.** Buscar, filtrar y ordenar exclusivamente sobre campos guardados. Mostrar categorías y marcas disponibles localmente y explicar que los resultados son parciales. No usar conteos globales ni equiparar ausencia de resultados locales con inexistencia del producto.
10. **Plataformas de prueba.** Automatizar pruebas offline con una compilación de producción en Chromium. Verificar manualmente instalación y reapertura en Android/Chrome e iPhone/Safari. Registrar expresamente dispositivos no comprobados; la emulación móvil no demuestra instalación real.
11. **Navegación persistente.** Exigir apertura directa offline de `/catalogo`, detalles guardados por ID o slug, `/quienes-somos` y `/contactanos`, también después de cerrar y reabrir la aplicación. Probar además navegación interna. Una pestaña que permanece abierta no demuestra este requisito.
12. **Productos retirados.** Eliminar ficha, detalle y aliases solo cuando el contrato real del servidor confirme inequívocamente que el producto ya no existe o dejó de ser público. No borrar por fallos de red, 5xx o errores de autenticación.
13. **Cuota y fallos de IndexedDB.** Ante cuota agotada, intentar limpieza limitada de vencidos y después de registros más antiguos, con un único reintento del guardado. Si falla, continuar navegando y avisar que los nuevos productos no se guardaron. Si IndexedDB está bloqueado o no disponible, conservar funcionamiento online y explicar la limitación offline.
14. **Vigencia institucional.** El contenido dinámico guardado de «Quiénes somos» tiene vigencia de 30 días y muestra fecha de actualización. Después, usar contenido predeterminado existente identificado como tal. «Contáctanos», cuyo contenido es local, se actualiza con la versión instalada de la aplicación.
15. **Contacto offline.** Conservar la apertura del cliente de correo mediante `mailto:` y explicar que CEMYDI no ha enviado el mensaje; el envío depende del cliente de correo. Mapas y enlaces web externos indican que necesitan conexión. Teléfonos y datos de contacto permanecen visibles. No simular envíos ni crear colas en CEMYDI.

## Hechos del repositorio observados durante la revisión

- Existe manifiesto standalone con iconos `any` de 192 y 512; no se encontró implementación de Service Worker, Serwist, IndexedDB, install prompt ni ruta `/offline`.
- El catálogo obtiene datos en servidor y sus filtros actuales navegan mediante `router.push`; necesita una ruta de funcionamiento local que no dependa de peticiones RSC para filtrar offline. La paginación actual ya utiliza 24 productos.
- Los datos de catálogo y detalle se validan con Zod y contienen campos públicos útiles, pero también campos comerciales que deben quedar fuera de la proyección offline.
- El detalle admite ID y slug, tiene redirecciones y consultas adicionales de reseñas. Una representación offline no puede depender de esas operaciones del servidor ni conservar HTML comercial como solución indiscriminada.
- «Quiénes somos» obtiene `/about-page` y actualmente devuelve contenido predeterminado ante fallos; necesita distinguir una actualización válida del fallback antes de persistir.
- «Contáctanos» contiene datos locales, Google Maps y un formulario `mailto:`; no se encontró endpoint de envío para ese formulario.
- El shell público se personaliza al hidratar la sesión mediante `/users/me`; no se verificó aún la seguridad de respuestas HTML/RSC para caché.
- Existen rutas sensibles adicionales como `/configuracion`, `/favoritos`, `/mis-resenas`, `/forgot-password`, `/reset-password` y `/verify-email`. La política de exclusión debe partir del inventario real completo.
- Playwright actualmente prueba Desktop Chromium con servidor de desarrollo. Las pruebas de Service Worker necesitan configuración de producción.

Estos hechos proceden de inspección de solo lectura; no equivalen a resultados de pruebas.

## Condiciones técnicas de aceptación

- Verificar versiones, dependencias y API de Serwist en documentación oficial vigente antes de instalar. La compatibilidad aún no fue comprobada durante el grilling.
- Seleccionar una arquitectura que resuelva documentos, RSC, apertura directa y reapertura offline sin almacenar sesión ni mostrar datos comerciales antiguos, incluso antes de la hidratación. El prompt permite un respaldo público que reutilice el diseño existente si cachear respuestas completas no resulta seguro.
- Probar aislamiento de caché e IndexedDB con sesiones autenticadas y rutas sensibles reales; una revisión visual de botones no demuestra seguridad.
- Tratar una actualización válida y un fallback como estados diferentes. Leer datos offline no renueva vigencia; un error o contenido predeterminado tampoco.
- Resolver ID y aliases observados sin depender de redirecciones online; no elegir silenciosamente un producto si existen aliases ambiguos.
- Comprobar actualización con varias pestañas y formularios abiertos, conservación de IndexedDB y limpieza de recursos estáticos antiguos.
- Ejecutar y reportar resultados reales de lint, unitarias, build y E2E; obtener una línea base actual para distinguir fallos previos. No presentar cifras históricas de pruebas o warnings como verificación de esta implementación.
- Comparar rendimiento antes y después bajo condiciones equivalentes. Registrar limitaciones de entorno y verificaciones manuales pendientes sin declarar éxito no demostrado.

## Estado

Decisiones de producto aceptadas y confirmadas: 15 de 15. Entrevista cerrada. Resultados y limitaciones se documentan en `PWA_IMPLEMENTATION.md`. El 13 de octubre el usuario pidió verificar y preparar el commit en main local. El despliegue, push y cambios de backend permanecen pendientes.

## Precisiones de la confirmación final

El 12 de octubre se aprobó retirar el botón propio de instalación y el toast de actualización. Se mantiene la instalación nativa y la nueva versión se activa al cerrar todas las pestañas/PWA y reabrir. El 13 de octubre el usuario confirmó conservar el comportamiento actual sin toast de guardado exitoso; permanecen los avisos de fallo. Véase `PWA_AUTOMATIC_UPDATES.md`.

La precisión posterior del usuario exige conservar el diseño original del header y de Inicio, Catálogo, Quiénes somos y Contáctanos offline. La desconexión se indica únicamente mediante toast; los enlaces permanecen y las páginas que requieren conexión avisan sin navegar. Contacto está disponible desde el shell instalado, sin exigir visita previa. La implementación y evidencia vigente están en `PWA_UI_CORRECTION.md`.

- Un HTTP 5xx permite respaldo, pero no se almacena como respuesta válida ni renueva vigencia.
- La apertura directa tras cerrar y reabrir no depende de respuestas nuevas RSC.
- La eliminación por capacidad conserva consistencia de productos, detalles y aliases y respeta recursos compartidos.
- La actualización considera múltiples pestañas y evita recargas inesperadas con trabajo sin terminar.
