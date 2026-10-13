# PWA — vista detalle y avisos por toast

11 de octubre de 2026. Rama `codex/pwa-offline`.

La política de actualización cambió el 12 de octubre: el toast de nueva versión descrito abajo se retiró y se usa el ciclo automático al cerrar todos los clientes y reabrir. Los demás avisos de esta ficha permanecen. Véase [PWA_AUTOMATIC_UPDATES.md](PWA_AUTOMATIC_UPDATES.md).

La ficha online y offline comparten el contenedor, breadcrumbs, distribución de tres columnas, descripción y ficha ortopédica originales. La versión guardada conserva la apariencia de galería, clasificación, marca, modelo y requisitos de receta. Permite seleccionar imágenes guardadas y ampliarlas. Los precios, existencias, proveedor, reseñas y acciones de cuenta/compra siguen excluidos del respaldo público.

**Decisión vigente del usuario, 13 de octubre:** la visita online guarda automáticamente el detalle público en IndexedDB sin aviso de éxito. Un fallo de almacenamiento muestra un toast con la indicación de recargar para reintentar. No se añade una barra al header ni al contenido. Las imágenes disponibles son las que llegaron a cargarse y almacenarse. Una ficha básica o inexistente también avisa mediante toast. «Actualizar ficha» recarga cuando hay conexión y, offline, avisa sin salir de la página.

El aviso de nueva versión del Service Worker se trasladó a un toast con «Actualizar» y «Más tarde». Mantiene la comprobación de tareas abiertas en todas las pestañas y la confirmación antes de activar y recargar. No modifica el header.

## Evidencia histórica del 11 de octubre

Los avisos de éxito, cifras y capturas de este apartado corresponden a esa versión anterior. Las capturas permanecen locales, fuera de Git. Para la validación vigente, véase [PWA_IMPLEMENTATION.md](PWA_IMPLEMENTATION.md).

- Playwright PWA: **18 pruebas pasaron** después de corregir la altura de galería, incluyendo guardado y reapertura del detalle por ID/slug, conservación de su contenedor, toast de guardado, actualización de ficha, ficha básica, galería móvil/ampliación y coordinación de actualización entre pestañas. Se añadió una comprobación de altura mínima de galería tras detectar que la regla global de botones la reducía.
- Lint: cero errores y los 94 warnings preexistentes en skills. Unitarias: 195 pasaron y los mismos 4 fallos previos en HomeHero/búsqueda por voz. La suite general ejecutada contra producción en 3001 antes del ajuste final de altura tuvo 6 aprobadas y los 2 fallos previos de inicio/hidratación; el ajuste de altura se comprobó después en la suite PWA.
- Chromium visible, backend público local: ficha «Silla de ruedas tipo cama», confirmación de guardado, registro público con detalle en IndexedDB y recorrido online/offline en escritorio y móvil. El inventario de campos guardados y las excepciones observadas están en [PWA_DETAIL_CHECK.json](PWA_DETAIL_CHECK.json); no se guardaron campos comerciales.
- Confirmación visual posterior al ajuste: galería de aproximadamente 360 px en móvil y 560 px en escritorio, sin desbordamiento horizontal observado. Se activó la nueva versión mediante el toast real y su confirmación. No se observaron excepciones JavaScript en el recorrido. La compilación final de producción pasó.
- Capturas: [escritorio online](pwa-detail-desktop-online.png), [escritorio offline](pwa-detail-desktop-offline.png), [móvil online](pwa-detail-mobile-online.png), [móvil offline](pwa-detail-mobile-offline.png).

Se conserva la caducidad de 30 días y la exclusión de rutas privadas. La compilación genera 104 URLs precacheadas, aproximadamente 19.8 MB. La instalación nativa y los dispositivos físicos siguen pendientes; no se presenta esta revisión como certificación de Android/iOS. No se realizaron despliegues, merges ni cambios de backend.
