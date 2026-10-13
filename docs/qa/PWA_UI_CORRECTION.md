# PWA — conservación del diseño

11 de octubre de 2026. Rama `codex/pwa-offline`.

Se eliminó el encabezado simplificado del respaldo. Inicio, Catálogo, Quiénes somos y Contáctanos reutilizan el header, footer y componentes del sitio. Inicio mantiene su hero; catálogo reutiliza sus tarjetas y encabezado. Los enlaces Inicio, Catálogo, Quiénes somos y Contáctanos permanecen visibles en la navegación, también en el menú móvil.

No se muestra una barra fija de desconexión. El aviso se presenta en un toast temporal. Los enlaces a páginas que requieren Internet conservan su aspecto, pero al pulsarlos offline muestran un toast y mantienen la página actual. Se conserva la exclusión de datos comerciales y privados del respaldo. Contacto está disponible desde el shell instalado incluso sin una visita previa; los mapas requieren conexión. Las imágenes institucionales originales se incluyen en el precache para conservar el diseño.

La compilación de esta primera corrección precacheaba **99 URLs, 19.7 MB**. La corrección posterior de la vista detalle se documenta en [PWA_DETAIL_CORRECTION.md](PWA_DETAIL_CORRECTION.md). El tamaño aumentó para guardar las imágenes institucionales originales; las cifras iniciales de 5.11 MB y la comparación anterior de rendimiento ya no describen esta versión. No se realizó una nueva medición representativa de rendimiento en dispositivos físicos.

## Verificación

- Suite PWA con Playwright: **17 pruebas pasaron**, incluidos header compartido, navegación offline, toast de páginas no disponibles, contacto sin visita previa y filtros móviles. Mantiene los ensayos de caducidad, capacidad, rutas privadas, reapertura y actualización entre pestañas.
- Chromium visible con Playwright y backend público local: recorrido online/offline de las cuatro páginas a 1440×900 y 390×844. Un header por página, sin barra fija en main, sin desbordamiento horizontal ni excepciones JavaScript observadas durante ese recorrido. Se inspeccionaron capturas de escritorio y móvil. No es una certificación de todos los tamaños ni de dispositivos físicos.
- El enlace externo de ubicación con `target="_blank"` se comprobó después del último ajuste del guard: toast visible, URL conservada y ninguna pestaña nueva.
- El buscador del header offline navegó por documento a `/catalogo?q=Asiento` y mostró las dos fichas públicas correspondientes. El cliente estaba controlado por `sw.js`, con registro activo. Se restauró la conexión al terminar.
- `npm run lint`: cero errores, 94 warnings preexistentes en skills. `npm run build`: pasó.
- Unitarias: 195 pasaron y 4 fallos preexistentes (HomeHero y búsqueda por voz).
- E2E general contra la producción recién iniciada en 3001: 6 pasaron y 2 fallos preexistentes en inicio/hidratación. Contra el proceso que ya estaba abierto en 3000: 1 pasó y 7 fallaron; esa ejecución no se declara satisfactoria.
- `git diff --check`: sin errores de espacios.

Evidencia: [recorrido](PWA_UI_CHECK.json), [enlace externo](PWA_UI_LINK_CHECK.json), [inicio online](pwa-ui-1440-online-inicio.png), [inicio offline](pwa-ui-1440-offline-inicio.png), [catálogo offline](pwa-ui-1440-offline-catalogo.png), [inicio móvil online](pwa-ui-390-online-inicio.png), [inicio móvil offline](pwa-ui-390-offline-inicio.png), [catálogo móvil offline](pwa-ui-390-offline-catalogo.png). El botón de instalación depende del evento nativo del navegador y puede aparecer entre capturas; no depende del modo offline.

La comprobación del buscador y del registro del worker está en [PWA_UI_SEARCH_CHECK.json](PWA_UI_SEARCH_CHECK.json). Las capturas de las páginas informativas se tomaron durante su animación de entrada; la opacidad inicial del título corresponde a esa animación existente.

Persisten las limitaciones de dispositivos físicos, instalación nativa, sesiones autenticadas reales, presión de cuota real y rendimiento descritas en el informe principal. No se realizaron despliegues, merges ni cambios del backend.
