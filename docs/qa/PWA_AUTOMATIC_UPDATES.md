# PWA — actualización silenciosa e instalación nativa

12 de octubre de 2026. Rama `codex/pwa-offline`.

Decisiones confirmadas mediante grilling: retirar «Instalar aplicación» del header en escritorio/móvil; conservar la instalación nativa del navegador; retirar el toast de nueva versión y actualizar al cerrar todas las pestañas y reabrir. Esta política sustituye el flujo manual de actualización descrito en los informes anteriores.

**Decisión vigente del usuario, 13 de octubre:** conservar el comportamiento actual sin toast de guardado exitoso de fichas. El guardado continúa siendo automático; se avisa si falla. Los avisos de desconexión, almacenamiento y navegación bloqueada se conservan. Esta decisión sustituye la referencia anterior que pedía conservar el aviso de éxito.

Se eliminó el botón y su contexto/listeners propios, incluido `beforeinstallprompt.preventDefault()`. El manifiesto y el registro del Service Worker permanecen. La aplicación deja que el navegador presente sus opciones de instalación.

El worker mantiene `skipWaiting: false`. Una versión nueva se instala en segundo plano y espera mientras haya clientes de la anterior. Se retiraron el toast, la confirmación, el envío de `SKIP_WAITING` y el protocolo de activación manual entre pestañas. No hay recargas por actualización. Al cerrar todos los clientes controlados y reabrir, el navegador usa la nueva versión. Cerrar solo una pestaña no basta si otra pestaña o la PWA instalada siguen abiertas.

Los avisos de desconexión, errores de guardado, almacenamiento, navegación sin red y fallos de registro permanecen. También se conserva la protección de formularios frente a la recarga existente al recuperar conexión. No se cambiaron backend, contratos, TTL, capacidad, catálogo offline ni protección de rutas privadas.

## Pruebas relevantes

Playwright cubre una actualización real del archivo del worker: espera con dos pestañas abiertas, conserva un formulario sin terminar, no muestra aviso/botón ni recarga, sigue esperando al cerrar solo una pestaña y activa al cerrar ambas y reabrir. Comprueba conservación de IndexedDB y limpieza de la caché de imágenes antigua. Otro ensayo cierra y relanza un navegador con perfil persistente y comprueba la activación sin confirmación.

La prueba de instalación verifica que el evento cancelable `beforeinstallprompt` no es interceptado y que no existe botón propio en escritorio ni en el menú móvil. Se conserva la prueba del manifiesto. Esto no equivale a instalar la aplicación desde la interfaz nativa de Android/iOS; esa verificación sigue pendiente.

Resultados históricos del 12 de octubre: **18 pruebas PWA pasaron**; lint terminó con cero errores y 94 warnings preexistentes de skills; la compilación pasó con 103 URLs precacheadas, aproximadamente 19.8 MB. Las cifras y fallos de esa revisión son históricos; la validación del commit preparado el 13 de octubre se resume en [PWA_IMPLEMENTATION.md](PWA_IMPLEMENTATION.md).

Suite E2E general contra producción en 3001: 6 pasaron y los mismos 2 fallos previos en inicio/hidratación. La revisión adicional con Chromium visible confirmó ausencia del botón en escritorio y menú móvil, navegación original y registro activo. Evidencia: [diagnóstico](PWA_AUTO_BROWSER_CHECK.json), [escritorio](pwa-auto-header-desktop.png), [móvil](pwa-auto-header-mobile.png). Se inspeccionaron ambas capturas. No se aceptó una instalación nativa ni se modificó el backend.
