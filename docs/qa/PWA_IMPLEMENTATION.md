# PWA CEMYDI — implementación y evidencia

Fecha: 11 de octubre de 2026. Rama: `codex/pwa-offline`.

**Política vigente desde el 12 de octubre:** instalación desde el navegador y actualización silenciosa al cerrar todos los clientes y reabrir, sin botón propio ni toast de nueva versión. Véase [PWA_AUTOMATIC_UPDATES.md](PWA_AUTOMATIC_UPDATES.md); sustituye los controles manuales descritos en este informe.

**Actualización del 13 de octubre:** se mantiene el guardado automático sin aviso de éxito, por decisión explícita del usuario. Se conserva el aviso ante fallos. Se corrigieron foco y navegación por teclado del diálogo de filtros offline, aviso de almacenamiento institucional bloqueado, expectativas antiguas de tests, CSP mediante nonces, telemetría y dependencias de seguridad. Las imágenes de QA permanecen locales y están ignoradas por Git. La medición inicial de rendimiento y las capturas históricas no corresponden a esta versión.

Requisitos: [decisiones aprobadas](PWA_GRILLING_DECISIONS.md). Implementación disponible para revisión, con verificaciones de dispositivos y backend real pendientes. No se realizó despliegue, merge ni modificación del backend.

## Preparación y compatibilidad

Se inspeccionó el estado de Git antes de editar y se creó la rama sobre el checkout existente. Se conservaron cambios previos del usuario en catálogo, encabezado, pruebas, configuración de entorno y skills; el diff completo contra HEAD contiene también ese trabajo previo.

Versiones verificadas: Node 24.11, Next.js 16.3.8, React 19.2.3 y Serwist 9.5.13. Los peers publicados aceptan Next >=14 y React >=18, y este Node satisface el engine. Se instalaron `@serwist/next`, `@serwist/cli`, `serwist` y `esbuild` como dependencias de desarrollo. El configurador independiente genera el worker después de `next build`, compatible con Turbopack; no se añadió integración exclusiva de Webpack.

Referencias oficiales consultadas: [configurador Serwist](https://serwist.pages.dev/docs/next/config), [inicio Serwist](https://serwist.pages.dev/docs/next/getting-started) y [PWA en Next.js](https://nextjs.org/docs/app/guides/progressive-web-apps).

Se aplicaron las skills locales de Next.js, Vitest y buenas prácticas de Playwright. La entrevista previa utilizó grilling; está cerrada.

## Fase 1: instalación y respaldo seguro

- Manifiesto único, standalone, inicio `/`, iconos normales y maskable de 192/512, idioma y shortcuts públicos. Registro del worker exclusivamente en producción; en desarrollo se retira el registro propio `/sw.js` conservando datos locales.
- Instalación nativa mediante el navegador, sin botón propio ni interceptar el evento de instalación. No se verificó la interfaz nativa en dispositivos Android/iOS reales.
- Precache de `/offline`, assets de compilación y recursos públicos esenciales. La compilación del 13 de octubre genera 104 entradas y 9.19 MB tras optimizar imágenes. No precachea HTML comercial ni páginas prerenderizadas del sitio.
- Documentos públicos: intento de red sin guardar HTML; red caída o HTTP 5xx sirven el shell offline seguro. 401/403/404 conservan su respuesta. API, RSC, autenticación y rutas fuera de la lista pública usan red sin caché; no hay cola de operaciones.
- `sw.js` lleva `no-cache, no-store, must-revalidate` y scope `/`. Se conserva la CSP existente, sin añadir `unsafe-eval`.

La apertura fría sirve un documento precacheado y lee IndexedDB; no necesita respuestas nuevas de React Server Components. El shell presenta navegación propia mediante enlaces de documentos, evitando depender del router RSC estando offline. El HTML de precios, existencias y datos de cuenta no se almacena como respaldo.

## Fase 2: contenido público persistente

IndexedDB `cemydi-public-offline` v1 contiene productos y metadatos públicos. Una proyección validada con Zod guarda identidad, campos descriptivos y clasificación, imágenes públicas observadas, aliases y detalle público cuando existe. Excluye precios, existencias, depósitos y datos privados.

- Catálogo unificado por ID: páginas/filtros visitados amplían el conjunto; filtro, búsqueda y orden alfabético trabajan localmente sobre datos guardados. Paginación de 24, conteos parciales y estados vacíos explícitos. Stock, orden comercial, sugerencias remotas y acciones de compra/renta requieren conexión.
- Vigencia de 30 días desde respuesta válida; una lectura, fallback, 5xx o contenido predeterminado no renuevan fechas. La ficha detallada tiene fecha independiente de la actualización de la lista.
- Límite inicial de 200 productos, eliminación de los más antiguos y transacción atómica: detalle y aliases viven dentro del registro del producto. Un alias ambiguo no escoge silenciosamente una ficha. Registros vencidos o incompatibles se excluyen aunque la limpieza física falle.
- Cuota: limpieza limitada y un reintento; error permanente avisa y mantiene navegación online. Las lecturas válidas no dependen de poder escribir. IndexedDB bloqueado no impide usar el sitio conectado.
- Una retirada confirmada por ID o estado inactivo elimina ficha/detalle/aliases; no se interpreta un 404 de slug ambiguo, una falla de red o un 5xx como retirada.
- Imágenes públicas: caché separada de hasta 120 entradas/30 días, respuesta válida 200, origen permitido y observación desde contenido público validado. Branding separado. El desalojo de una ficha no elimina imágenes compartidas; las imágenes pueden faltar y muestran placeholder. Borrar contenido guardado elimina productos, metadatos e imágenes públicas, conservando esenciales.
- Quiénes somos: conserva respuesta institucional válida y fecha; defaults y errores no sobrescriben la copia. Tras caducidad muestra contenido predeterminado identificado. Contáctanos usa contenido local de la versión instalada después de visitar la página, sin mapa embebido offline; mantiene teléfonos y apertura de correo con explicación explícita de que CEMYDI no envió el mensaje.

## Fase 3: actualización y reconexión

El worker nuevo se instala en segundo plano y espera hasta cerrar todos los clientes controlados. No hay protocolo de confirmación, toast de actualización ni activación o recarga forzada. Al reabrir, el navegador usa la nueva versión. Se mantiene IndexedDB y se limpian caches versionadas obsoletas del worker.

Al reconectar una página pública sin formulario pendiente se solicita un documento fresco antes de volver a mostrar información comercial. Un formulario pendiente impide esa recarga automática. El control de tareas se limita a cambios detectables en formularios y rutas conservadoras; no demuestra reconocimiento de cualquier trabajo futuro de otras funcionalidades.

## Pruebas ejecutadas el 13 de octubre

| Verificación | Resultado y alcance |
| --- | --- |
| `npm run lint` | 0 errores; 94 warnings existentes en `.agents/skills/impeccable`. Sin nuevos warnings en `src/`. |
| `npm run test` | 212 pruebas pasan. Se actualizaron expectativas antiguas del hero y el mock del constructor de voz; se añadieron comprobaciones de seguridad, pausa del carrusel y fallos de persistencia institucional. |
| `npm run build` | Pasa, incluyendo generación final del worker con configuración normal del proyecto. |
| `npm run test:e2e:pwa` | 20 pruebas pasan en Chromium con compilación de producción y API fixture aislada; incluye foco del diálogo y almacenamiento institucional bloqueado. |
| `npm run test:e2e` | 9 pruebas de navegación y seguridad; incluye nonce por petición e interacción del formulario. |
| `npm audit --omit=dev` | 0 vulnerabilidades de producción. Persisten 5 avisos de desarrollo derivados de braces, sin parche compatible disponible. |
| QA visual | Catálogo offline a 1440×900 y 390×844: sin desbordamiento horizontal; capturas inspeccionadas. Iconos maskable inspeccionados visualmente. |

La suite PWA verifica catálogo acumulado de 48 productos y páginas locales de 24, filtros, datos comerciales ocultos, detalles por ID/slug, ficha ausente, contenido informativo, 5xx sin renovación, caducidad, almacenamiento bloqueado, retirada confirmada, cuotas, manifest/headers, actualización con varias pestañas y formularios, conservación de datos, imágenes guardadas, reconexión y borrado explícito. Incluye cierre y relanzamiento completo de Chromium con el mismo perfil y apertura directa sin red de `/catalogo`, detalles por ID y slug, `/quienes-somos` y `/contactanos`.

El aislamiento de caché se prueba con respuestas 200 controladas de rutas privadas y comprobación de URLs almacenadas; la proyección excluye campos comerciales mediante tests. Esto no sustituye una sesión autenticada del backend real. La eliminación por el límite de 200 y la resolución de aliases se prueban con tests unitarios; la retirada y preservación de un recurso compartido esencial también tienen prueba de navegador.

Logs locales ignorados por Git: `pwa-baseline-test.log`, `pwa-baseline-build.log`, `pwa-test.log`, `pwa-lint.log`, `pwa-e2e.log`, `pwa-existing-e2e.log`, `pwa-existing-baseline-e2e.log`, `pwa-final-build.log`. Los resultados resumidos aquí evitan depender de archivos temporales para revisar la evidencia.

## Rendimiento y capacidad

[Mediciones](PWA_PERFORMANCE.json): Quiénes somos en producción local, tres contextos fríos por variante, sin throttling, referencia reconstruida para esa ruta. LCP mediano previo 320 ms y PWA 324 ms; muestras PWA 1664/156/324 ms. CLS 0 en las seis muestras. JavaScript transferido previo 378671 bytes y PWA 387068 bytes: +8397 bytes, aproximadamente 2.22%. Son muestras pequeñas y variables, no una garantía de Core Web Vitals ni una mejora general de rendimiento.

Los 24 productos mínimos del fixture ocupan 6985 bytes serializados. La capacidad de 200 limita retención y se valida funcionalmente; esa muestra no permite estimar el espacio de descripciones y fotos reales. El precache actual de 9.19 MB tiene un costo de instalación adicional separado de las transferencias de la página. Debe revisarse con datos reales antes de ajustar capacidad o política de imágenes.

Capturas: [móvil](pwa-mobile.png), [escritorio](pwa-desktop.png).

## Reproducción y pendientes

1. `npm ci` con dependencias de desarrollo disponibles para compilar.
2. `npm run lint`, `npm run test`, `npm run build`.
3. `npm run test:e2e:pwa` compila usando la API fixture 4199 y sirve producción en 3199. Requiere Chromium instalado para Playwright. Al terminar, ejecutar `npm run build` con el entorno habitual antes de usar `npm start`: los rewrites de la compilación fixture son deliberadamente locales.
4. `npm run test:e2e` usa la configuración general existente. Para verificar producción local, apuntar PLAYWRIGHT_BASE_URL a un servidor recién iniciado con el build normal; no reutilizar un proceso abierto durante compilaciones distintas.
5. Producción necesita HTTPS o localhost, scope raíz y los headers del worker. No se realizó despliegue. El servidor debe permitir actualizar `/sw.js` y servir el shell público `/offline` sin autenticación.

Pendientes que impiden declarar aceptación completa en todos los entornos:

- Instalación, reapertura standalone, actualización y límites de almacenamiento reales en Android/Chrome e iPhone/Safari: no hubo dispositivos disponibles. La captura móvil y los eventos simulados no equivalen a esas pruebas.
- Sesiones autenticadas y cuentas/roles del backend real, revisión de respuestas HTML/RSC privadas, retirada de productos reales y fallos reales de infraestructura. La cobertura actual es fixture y política del frontend; no se modificó ni certificó el backend.
- Apertura efectiva de una aplicación de correo y envío desde ella: solo se verificó la interfaz y construcción de `mailto:`; no se envió correo.
- Medición representativa en red/dispositivos de producción, imágenes reales y presión de cuota real. La cuota automatizada se simula mediante fallos controlados.
- Las expectativas antiguas de tests y errores de tipos detectados se corrigieron. Las copias locales bajo `output/` se excluyen del análisis de TypeScript; el código de aplicación conserva validación estricta.

Las fases de implementación están disponibles y las pruebas descritas pasaron donde se indica. Los puntos pendientes anteriores siguen sin verificarse; no se presentan como funciones aceptadas en dispositivos reales.

## Revisión interactiva adicional con navegador y DevTools

Se abrió Chromium visible mediante Playwright, con perfil persistente y DevTools reales, sobre `npm start -- --port 3001` y el backend local existente, sin iniciar sesión ni hacer mutaciones del servidor. El REPL integrado no pudo cargar Playwright por un error de permisos; se utilizó un REPL de Node en terminal con el mismo paquete local.

Inventario de esta revisión: worker activo y cliente controlado; manifest e instalabilidad; catálogo online/offline, búsqueda y recuperación del conjunto; detalle observado y ficha no guardada; páginas informativas sin iframe offline; reinicio completo sin servidor; ruta administrativa sin respaldo; imágenes públicas guardadas y reconexión. Los controles de actualización con varias pestañas permanecen cubiertos por la suite automatizada anterior, no por un nuevo ensayo de versión en esta revisión.

- **Application → Service workers** muestra `sw.js`, scope `http://localhost:3001/`, cliente `/catalogo` y `#0 activated and is running`. Confirmado también por CDP y `navigator.serviceWorker.controller`.
- Chrome reconoce el manifiesto sin errores de parseo; `Page.getInstallabilityErrors` devuelve una lista vacía en el perfil normal. El evento nativo de instalación hizo visible «Instalar aplicación». No se aceptó la instalación nativa ni se afirma instalación en Android/iOS.
- Con datos reales locales, 24 fichas públicas se guardaron. Offline se muestran 24, sin precios; buscar «tipo cama» devuelve una ficha y limpiar la búsqueda recupera el conjunto. La ficha visitada abre; una desconocida muestra «Producto no guardado».
- Quiénes somos y Contáctanos abren desde la copia guardada; el contacto no inserta mapas offline. Se cerró y relanzó Chromium con el mismo perfil, con el servidor 3001 detenido: catálogo de 24, detalle observado y ambas páginas informativas abren. `/admin` falla por red, sin servir un respaldo privado. Al haber servidor y emulación offline inicial, el worker todavía pudo pedir red y el guard redirigió a `/login`; por eso se comprobó además la caída efectiva del servidor. Hubo una navegación interrumpida durante esa transición, repetida después con resultado correcto.
- La inspección de Cache Storage no encontró rutas API, users, login, carrito o admin almacenadas. Esto sigue sin demostrar aislamiento de una sesión autenticada real.
- Después de visitar y cargar imágenes con el worker activo, se mostraron 18 fotos de productos desde blobs guardados, sin imágenes guardadas rotas. Las que no estaban disponibles presentan el placeholder acordado. No se observaron excepciones de JavaScript durante el recorrido online inicial.
- DevTools muestra advertencias opcionales del manifiesto: faltan screenshots para Richer PWA Install UI en desktop/mobile y un icono de 96×96 para cada shortcut. Son mejoras de presentación pendientes; Chrome no las reportó como errores de instalabilidad.
- Durante la caída, Console sí registra rechazos `no-response` del worker para recursos que no tienen respaldo, como administración, API de sesión, manifest y favicons. Por tanto no se afirma que la consola completa esté libre de errores. El aviso «Banner not shown» corresponde al evento nativo interceptado para ofrecer el botón propio de instalación.

Evidencia: [diagnóstico JSON](PWA_BROWSER_CHECK.json), [Service Worker en DevTools](pwa-devtools-sw.png), [manifest en DevTools](pwa-devtools-manifest.png), [catálogo offline con datos locales](pwa-browser-offline.png). No se modificó código de la aplicación durante esta revisión. El servidor local de producción se restauró y el navegador se conservó abierto para inspección.
