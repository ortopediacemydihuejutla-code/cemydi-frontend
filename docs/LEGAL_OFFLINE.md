# Documentos legales sin conexión

Las rutas `/terminos-y-condiciones` y `/politicas-de-privacidad` usan el respaldo público de la PWA en producción.

- Al visitar cada página con conexión se guarda únicamente un documento público validado, nunca el HTML de la sesión ni respuestas administrativas.
- Las copias se guardan por slug en IndexedDB y caducan a los 30 días. Leerlas no renueva su vigencia.
- Un fallo de red o del servidor permite consultar la copia guardada. Los defaults demostrativos, errores y documentos incompatibles no reemplazan una copia existente.
- Sin copia vigente se muestra un mensaje para visitar la página con conexión. Una copia disponible conserva el contenido, formato e índice y muestra cuándo se guardó.
- La acción existente para borrar contenido sin conexión elimina también estos documentos.

Validación: `npm run test`, `npm run lint`, `npm run build` y `npm run test:e2e:pwa`. La prueba de documentos legales cubre ambas rutas, recarga offline, ausencia de copia y caducidad.
