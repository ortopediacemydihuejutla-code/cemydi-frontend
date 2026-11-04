# Notificaciones

El administrador gestiona envíos inmediatos en `/admin/notifications`, dentro de Marketing. Pestañas: Crear envío, Historial y Automáticas. El formulario selecciona categoría, todos los clientes activos o clientes específicos, título, mensaje y destino interno opcional; muestra vista previa y exige confirmación antes de enviar. Cada intento conserva un UUID idempotente mientras no cambie el contenido. Esta versión no incluye programación.

Los clientes registrados tienen `/notificaciones`, con filtros Todas/Rentas/Sistema/Ofertas y una lista plana de avisos individuales. No hay contenedores ni encabezados de agrupación. Cada fila utiliza una única separación inferior sutil y no tiene divisores internos. Los avisos pendientes llevan un punto azul junto al título, con espacio reservado aun después de leer, sin etiqueta «Nueva». Los leídos tienen título y superficie discretamente atenuados. Los iconos están centrados y conservan colores por categoría.

Las pestañas están centradas, con una línea verde animada mediante spring. Mantienen la lista anterior deshabilitada durante el cambio de categoría y ocultan el contenido saliente a tecnologías de asistencia. El tiempo relativo aparece arriba a la derecha, sobre la miniatura o porcentaje. La flecha anima la expansión del mensaje; el CTA queda abajo a la derecha. Se respeta movimiento reducido.

La campana del encabezado público, incluida la de Inicio, muestra el contador con el estilo del carrito. La pantalla tiene su propio contador junto al título. La lectura optimista comunica el nuevo total a las campanas de la misma cuenta y restaura ambos estados si falla. Las respuestas anteriores a ese cambio no sobrescriben el contador. «Marcar todas como leídas» usa `PATCH /notifications/read-all` para toda la cuenta, incluyendo categorías y páginas no cargadas.

La carga progresiva solicita páginas reales del backend al acercarse al final después de desplazar; conserva los avisos visibles y deduplica IDs. No hay pie de paginación. El sondeo actualiza las páginas ya cargadas, se evitan solicitudes simultáneas y respuestas de filtros anteriores, y un fallo permite reintentar sin vaciar la lista. `AccountPagination` permanece en otras secciones.

Pulsar un aviso abre directamente su producto, promoción vigente, renta propia o configuración y registra la lectura. `/notificaciones/:id` resuelve enlaces push sin mostrar detalle. Los avisos sin destino se expanden en la bandeja. La API verifica el propietario. Las miniaturas y porcentajes solo aparecen si la respuesta incluye `preview`.

## Ajustes

`/configuracion` usa las preferencias compartidas con móvil de `/notifications/preferences`. Cada interruptor guarda inmediatamente; se bloquean cambios simultáneos mientras se confirma la petición. Si falla, se restaura el valor anterior y aparece un toast breve. No hay botón Guardar, descarte ni mensajes permanentes de guardado. Las lecturas periódicas y de foco no sobrescriben una escritura en curso ni aceptan una respuesta anterior a ella. Apagar push conserva las categorías elegidas y el acceso a la bandeja.

## Verificación

Build y lint correctos, con los 94 warnings previos de skills y ninguno nuevo en los archivos modificados. Pasan 256 pruebas excluyendo la suite con el fallo previo de reconexión de `PwaProvider`. Playwright revisó 390/320 px y escritorio, separación única, ausencia de bordes internos y etiqueta roja, contadores, guardado persistido, rollback con un 503 simulado, permiso rechazado sin bloquear la bandeja y una sola solicitud tras recargas y navegación. Se comprobó carga 20 → 40 → 41. Evidencia: `output/playwright/polish-*.png`.

No se añadieron archivo/eliminación/silenciado por gesto sin persistencia de esos estados, cupones deducidos del texto ni agrupación de campañas independientes.

## Push PWA

La activación requiere una acción del cliente y permisos del navegador. El botón «Activar en este navegador» obtiene la clave pública desde el backend, usa el worker Serwist existente y registra la suscripción con la sesión actual. Una suscripción ya autorizada se vuelve a vincular al iniciar sesión/recuperar foco. Se solicita permiso al pulsar la campana de Inicio o entrar en la bandeja únicamente con estado default y sin un intento previo. La petición se comparte entre accesos concurrentes y se recuerda por navegador; rechazar o descartar no bloquea la bandeja. La campana inicia la petición antes de cualquier await para conservar la activación del gesto. El botón de ajustes sigue disponible para la activación explícita. El registro de suscripciones y el worker continúan reservados a producción.

`src/app/sw.ts` maneja `push` y `notificationclick`; admite únicamente identificadores de bandeja y abre un destino same-origin `/notificaciones/:id`. No procesa URLs arbitrarias de payloads ni guarda datos privados en la caché offline. El tag del aviso es el identificador del destinatario. El worker se registra únicamente en producción, preservando la política PWA existente.

Requisitos de operación: HTTPS (o localhost para desarrollo), build de producción, claves VAPID persistentes en backend. En iPhone/iPad compatibles, abrir la PWA instalada en pantalla de inicio. Si el navegador o los permisos no permiten push, la bandeja y preferencias siguen disponibles. No se pueden cambiar permisos del navegador desde un formulario web.

## Validación

`npm run build`, `npm run lint`, pruebas de contratos y del formulario en `src/services/__tests__/notifications.test.ts` y `src/components/account/__tests__/NotificationPreferencesForm.test.tsx`. Se revisaron en navegador el formulario, destinatarios, confirmación, historial, automatizaciones y experiencia del cliente con respuestas aisladas de QA; esas pruebas no envían mensajes reales.

La suite general conserva un fallo ajeno en `src/providers/__tests__/PwaProvider.test.tsx`: espera restaurar un aviso de reconexión desde sessionStorage, comportamiento ausente en el provider actual. Ese provider no se modificó en esta tarea. La recepción push real requiere validación adicional con navegador y backend configurados.

También se comprobó el worker de producción en Chromium con `ServiceWorker.deliverPushMessage`: se mostró el aviso esperado con su tag e identificador de bandeja. Este evento local verifica el handler y la presentación del sistema; no sustituye una entrega desde un proveedor externo. Capturas locales bajo `output/playwright/notifications-*.png`.

Rediseño del 18 de octubre: build y lint sin errores; 239 de 240 pruebas aprobadas, con el mismo fallo previo de PwaProvider. Playwright comprobó escritorio, 390 y 320 px, sin desbordamiento horizontal, lectura individual/de página, categorías, primera/última, salto inválido/válido, teclado en switches, desactivación global, descarte y guardado. Se usaron respuestas aisladas de QA; las capturas están en `output/playwright/redesign-*.png`.

Contrato completo: `cemydi-backend/docs/NOTIFICATIONS.md`. Referencia: [Web Push y PWA en Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps).

## Avisos de reseñas — 1 de noviembre de 2026

El backend genera avisos de aprobación y rechazo para clientes activos después de
la moderación administrativa. Se guardan con el cambio de estado en la misma
transacción; la bandeja recibe categoría `SYSTEM` y el historial reconoce origen
`REVIEW_STATUS`. El destino `PRODUCT` abre el producto, donde el cliente puede
consultar o editar su opinión; también permanece disponible en Mis reseñas.

Push respeta los interruptores general y Sistema, las suscripciones vigentes y
la sesión verificada por el worker. Repetir una decisión no duplica avisos. No se
ha comprobado entrega real desde el proveedor para estos eventos.
