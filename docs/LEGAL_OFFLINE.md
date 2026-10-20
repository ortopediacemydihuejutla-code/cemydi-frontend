# Documentos legales en precache

Términos y privacidad se descargan automáticamente al instalar o actualizar el service worker en producción. Basta abrir cualquier página que registre la PWA; no hace falta visitar las páginas legales.

- Serwist incluye `/pwa/legal/terminos-y-condiciones` y `/pwa/legal/politicas-de-privacidad` como recursos esenciales, con revisión vinculada al build.
- Estos endpoints de Next.js entregan únicamente JSON público validado. No reenvían cookies ni guardan HTML de sesión. Un documento no disponible devuelve 503; el fallback demostrativo del frontend no completa una instalación.
- El worker valida estado HTTP, formato y slug antes de aceptar cada entrada. Si falta un documento, la instalación falla y una versión anterior activa puede seguir funcionando.
- Al consultar las páginas offline se lee la revisión del worker activo mediante MessageChannel, sin solicitudes de red ni escrituras en IndexedDB. El formato y el índice son los de la página legal existente.
- Las copias se renuevan con la instalación de una nueva versión; no caducan a los 30 días ni se eliminan con el borrado del contenido opcional de catálogo.
- Si el navegador elimina el precache, la página indica que se necesita conexión para completar una instalación o actualización.

Validación: `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e` y `npm run test:e2e:pwa`. La prueba específica instala la PWA desde catálogo y abre ambos documentos por primera vez sin internet.
