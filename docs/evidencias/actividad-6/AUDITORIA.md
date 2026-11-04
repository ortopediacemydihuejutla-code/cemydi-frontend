# Auditoría de la Actividad 6 de CEMYDI

Fecha: 27 de octubre de 2026. Repositorios locales: `cemydi-frontend` y `cemydi-backend`. No se hizo push ni se modificó código del backend. Se conservaron los cambios locales encontrados al comenzar, incluidos los de notificaciones, cuenta y carrito.

## Alcance y condiciones

Se inspeccionaron manifiesto, layout, inicio, catálogo, detalle, autenticación, administración, almacenamiento PWA, servicios HTTP, esquema Prisma, productos, carrito y autenticación del backend. La aplicación utiliza Next.js 16.3.8 y React 19.2.3; el backend utiliza NestJS y PostgreSQL. Los comandos del proyecto se ejecutaron con Node.js 24.11.0; el backend declara Node 22.x, por lo que esta ejecución no sustituye una validación específica con su versión de despliegue.

Se distinguieron tres fuentes de evidencia: pruebas unitarias con mocks; suite PWA aislada con el backend fixture de `e2e/pwa/server.mjs`; y navegación contra Next en producción en `localhost:3001` con la API NestJS real en `127.0.0.1:4000`. Las capturas académicas y `navegador-real.json` proceden de este último entorno, sin respuestas simuladas.

La configuración privada existente apuntaba a otro equipo de la red, que no respondió durante esta auditoría. Para probar ambos repositorios locales se utilizó una variable de entorno temporal, mediante `scripts/actividad6-local.mjs`. No se sobrescribió `.env.local`. La lectura directa de PostgreSQL se hizo con Prisma, cargando las variables privadas sin copiarlas al informe.

## Cumplimiento

| Requisito | Estado | Evidencia y límite |
| --- | --- | --- |
| 1. Home Screen | Implementado | Inicio visible a 390 × 844, navegación y marca. Apertura desde un icono instalado pendiente de dispositivo. |
| 2. Splash Screen | Parcial | Manifiesto válido servido, colores, inicio, standalone e iconos normales/maskable comprobados. No se instaló ni se observó el arranque nativo en Android/iOS. |
| 3. Cargas | Implementado | Catálogo y producto con loading.tsx; autenticación con estados propios; admin con loader compartido. Inicio con Suspense reutilizando el indicador existente. Catálogo capturado con red lenta real emulada mediante CDP. Admin autenticado solo inspeccionado. |
| 4. CSR | Implementado | Búsqueda, filtros y navegación comprobados. CatalogClient usa useState, useMemo y useTransition. E2E de hidratación aprobado. |
| 5. SSR | Implementado | HTML HTTP del catálogo contiene nombres de producto fuera de script. Build clasifica inicio, catálogo y producto como dinámicos; manifiesto estático. Streaming necesita JavaScript para revelar segmentos en el navegador probado. |
| 6. Almacenamiento local | Parcial | IndexedDB y Cache Storage comprobados en navegador. Tema localStorage comprobado mediante el proveedor real en una prueba de componente; falta captura y prueba del panel autenticado en navegador. |
| 7. Almacenamiento remoto | Parcial | GET real de productos HTTP 200 y lectura independiente de 57 productos en PostgreSQL. Código Prisma y pruebas de carrito/auth revisados. Escrituras autenticadas no ejecutadas con cuentas reales. |
| 8. Offline y recuperación | Implementado | Catálogo y ficha guardados, imágenes públicas y recuperación al reconectar comprobados. Suite aislada cubre expiración, cuotas, contenido informativo, respaldo y protección de cachés. |
| 9. Sincronización | Parcial | Actualización de lecturas al reconectar comprobada. No hay cola ni Background Sync de compras, rentas o escrituras autenticadas; no se declara sincronización bidireccional. |

Los estados describen lo observado, no una calificación del docente. El enunciado suministrado permite cumplir mediante almacenamiento local y remoto sin añadir una cola de operaciones. Si la rúbrica exige sincronización de escrituras, ese punto queda pendiente de diseño y validación específicos.

## Comportamiento observado

`GET /products?page=1&pageSize=24` devolvió HTTP 200, 24 productos y total 57. `GET /api/products?page=1&pageSize=1` también respondió HTTP 200 a través del proxy. La consulta Prisma independiente confirmó 57 productos persistidos en PostgreSQL. Las consultas iniciales SSR se realizan desde Next; no es correcto exigir que aparezcan como Fetch/XHR del navegador.

El worker se activó en `/sw.js` y controló la página en producción. En la ejecución real se observaron 24 registros públicos en IndexedDB y 134 recursos en Cache Storage. El inventario verificó ausencia de precio, stock y proveedor en los registros offline y ausencia de endpoints privados en los cachés inspeccionados. No se volcaron cookies, tokens ni cabeceras de autenticación.

Tras visitar catálogo y ficha con conexión, se emuló desconexión del contexto y se abrieron nuevamente las rutas. Se conservaron nombre, datos públicos y las imágenes disponibles. Se ocultaron precios y existencias y se mostró «Consultar disponibilidad y precio al reconectar». Al recuperar conexión se volvió a obtener contenido del servidor; no se reenviaron compras ni modificaciones.

La política existente limita el catálogo offline a 200 productos y 30 días; las imágenes runtime a 120 entradas con caducidad. El HTML privado, la API autenticada y los payloads RSC no se almacenan mediante las reglas runtime revisadas. Los recursos precargados incluyen el shell `/offline`, que no contiene una sesión ni precios del catálogo.

## Errores y correcciones

| Hallazgo | Causa | Cambio y verificación |
| --- | --- | --- |
| Se perdía el aviso al recuperar la conexión tras abandonar el documento offline | La navegación reemplazaba el contexto React que mostraba el toast | Marca temporal en sessionStorage antes de navegar; PwaProvider recupera solo la duración restante, rechaza marcas inválidas/vencidas y tolera almacenamiento bloqueado. Seis pruebas aprobadas. |
| Inicio sin respuesta de carga durante las consultas de promociones y testimonios | HomePage esperaba ambas antes de devolver su contenido | Suspense local a la página de inicio con AuthRouteLoading existente. Se conserva HomeContent como componente de servidor asíncrono. |
| Algunas imágenes públicas con query podían omitirse | El worker quitaba la query antes de decidir si el recurso ya estaba precargado | Comparación por URL completa tanto al preparar como al mantener imágenes. La prueba de 24 imágenes identifica URLs distintas y comprueba su lectura offline. |
| Pruebas contaban copias ocultas | React Activity conserva el árbol online mientras muestra el respaldo | Selectores por contenido visible para dimensiones, misión y artículos filtrados. Se mantiene la comprobación de contenido y número de resultados visibles. |
| Prueba esperaba siempre «Producto no guardado» incluso ante un 404 confirmado | La emulación offline de Chromium puede permitir tráfico del worker; Next devuelve 404 mediante streaming | La prueba inspecciona la respuesta: exige 404 cuando existe el marcador de servidor; de lo contrario exige la ficha no guardada. En ambos casos verifica ausencia de compra. |
| API privada configurada no accesible | Destino de otro equipo en `.env.local` | Entorno temporal de auditoría para ambos repositorios locales. Se conserva la configuración del usuario; requiere revisar el destino habitual cuando cambie la red. |

Se ensayó un loading.tsx global y se descartó para limitar el cambio al inicio. No forma parte de la implementación final. La suite PWA presentaba los mismos cuatro fallos tras retirarlo; los registros antes/intermedios se conservaron para distinguir los problemas de pruebas del defecto de imágenes.

## Archivos cambiados en esta auditoría

- `src/app/page.tsx`: Suspense y componente servidor HomeContent.
- `src/providers/PwaProvider.tsx`: conservación del aviso de reconexión.
- `src/components/pwa/OfflineEntry.tsx`: guardar la marca antes de recuperar el documento online.
- `src/app/sw.ts`: comparación exacta de URLs públicas de imagen. Se conservaron los manejadores de notificaciones que ya estaban modificados al iniciar.
- `src/providers/__tests__/PwaProvider.test.tsx`: marcas inválidas, vencidas y almacenamiento bloqueado.
- `src/features/admin/components/__tests__/admin-theme-provider.test.tsx`: persistencia de la preferencia existente.
- `e2e/pwa/offline.spec.ts`: selectores visibles y distinción de respuesta 404 confirmada.
- `scripts/actividad6-local.mjs`, `scripts/audit-actividad6.mjs`: ejecución reproducible y evidencia contra la API real.
- `scripts/actividad6-documento.py`, `scripts/actividad6-render-word.ps1`: actualización de una copia del reporte y exportación para comprobar su presentación.
- Esta carpeta: capturas, registros y reporte académico actualizado. `public/sw.js` se genera al compilar y está ignorado por Git.

## Resultados de pruebas

Los resultados finales y los comandos exactos están en `RESULTADOS.md`. Los archivos terminados en `antes`, `primer-intento` e `intermedio` se conservan como antecedentes, no como la validación final. La primera ejecución unitaria completa se interrumpió después de reproducir el fallo previo de PwaProvider; no se atribuye a esa ejecución un total que no llegó a producir.

La suite PWA inicial terminó con 19 aprobadas y cuatro fallidas. Tras corregir imágenes y tres expectativas de pruebas llegó a 22 aprobadas; el fallo restante era otra coincidencia con un texto oculto por Activity, corregida con el mismo criterio de visibilidad. La validación completa posterior figura en el registro final.

No se ejecutó el comando de lint del backend porque aplica `--fix` y no hubo modificaciones allí. Sí se ejecutaron su compilación y toda su suite unitaria. Las pruebas unitarias con mocks no se presentan como transacciones reales autenticadas.

## Evidencias y pies de figura

| Figura | Archivo o procedimiento | Qué demuestra |
| --- | --- | --- |
| 1 | `figura-01-inicio-movil.png` | Inicio real en viewport móvil; no instalación física. |
| 2 | `figura-02-manifiesto-servido.png`, `manifest-verificado.json` | Configuración real; los iconos respondieron HTTP 200. No representa un splash observado. |
| 3 | `figura-03-carga-catalogo-red-lenta.png` | Loader existente con 1 500 ms de latencia y 60 KiB/s. Sin modificar DOM ni respuestas. |
| 4 | `figura-04-catalogo-renderizado.png`, `componente-servidor.txt`, `ssr-html-sin-scripts.txt`, build | UI real y comprobación de contenido generado en servidor. La captura utiliza hidratación normal. |
| 5 | `figura-05-busqueda-cliente.png`, `componente-cliente.txt` | Interacción real y directiva use client en el código. |
| 6 | Captura manual pendiente; `almacenamiento-real.json` como comprobación ejecutada | Worker activo y recursos de Cache Storage comprobados por APIs del navegador. |
| 7 | Captura manual pendiente; `almacenamiento-real.json`, `preferencias-locales.log` | Datos públicos de IndexedDB y prueba del tema localStorage; no existe captura de una sesión autenticada. |
| 8 | `figura-08-respuesta-http-backend.png`, `http-backend.json`, `postgresql.json` | Respuesta real; JSON adjunto registra endpoint, GET y HTTP 200. La imagen sola no muestra el panel Network. |
| 9 | `figura-09-detalle-sin-conexion.png`, `figura-09b-catalogo-sin-conexion.png` | Ficha y catálogo previamente guardados sin conexión. |

Capturas adicionales: `reconexion-catalogo.png`, `catalogo-escritorio.png` y `limite-streaming-sin-javascript.png`. Esta última registra la limitación observada; no debe usarse como evidencia de éxito visual sin JavaScript.

### Cómo completar las capturas pendientes

1. Ejecutar el backend local y el frontend de producción con el mismo destino de API. Abrir `/catalogo` online y esperar a que el worker lo controle. Evitar `next dev`, que desregistra el worker de CEMYDI.
2. Figura 6: Chrome DevTools → Application → Service workers; capturar `/sw.js` activado y el origen. Después Application → Cache storage; capturar un caché abierto con sus recursos públicos. Guardar `figura-06a-service-worker-devtools.png` y `figura-06b-cache-storage-devtools.png`.
3. Figura 7: Application → IndexedDB → cemydi-public-offline → products, refrescar y seleccionar un registro público. Guardar `figura-07a-indexeddb-devtools.png`. Con una cuenta administrativa controlada, cambiar el tema y mostrar únicamente `cemydi-admin-theme` en Local storage; guardar `figura-07b-localstorage-tema.png`. No mostrar otras claves, cookies o datos de la cuenta.
4. Para ampliar figura 8, abrir la URL `/api/products?page=1&pageSize=1` con Network abierto, seleccionar esa petición y mostrar solo Request URL, Request Method y Status Code. Evitar cabeceras de autenticación y cookies.
5. Instalación/splash: en Android con navegador compatible y origen HTTPS accesible, instalar CEMYDI, fotografiar el icono y grabar el arranque para extraer un fotograma real. Anotar modelo, sistema y navegador. En iOS comprobar por separado «Añadir a pantalla de inicio» y el arranque; no inferir su splash a partir del manifiesto.

No se obtuvieron las capturas de DevTools porque el control de Windows se detuvo mediante Escape y la apertura programática de `devtools://` terminó con ERR_ABORTED. No se reanudó el control de Windows ni se fabricaron paneles de desarrollo. No hubo un dispositivo físico disponible para instalación y splash.

## Documento académico

Se localizó el original en la carpeta escolar PWA y se creó `Actividad 6 - Reporte actualizado.docx` en esta carpeta, sin sobrescribir el original. Se conservaron portada, datos académicos, encabezados, pies y numeración de secciones y figuras. Se insertaron siete capturas principales y se describieron las dos capturas de DevTools pendientes en su ubicación correspondiente.

El renderizador empaquetado `render_docx.py` se intentó ejecutar y no encontró LibreOffice en este Windows. Para verificar el documento se exportó una copia de solo lectura a PDF mediante una instancia separada de Word con macros deshabilitadas y se renderizaron sus páginas con Poppler. Se revisaron las 13 páginas finales, se eliminó una página vacía y se actualizó también la tabla de resultados del original. La portada se comparó estructuralmente con el documento fuente y se comprobó que contiene siete imágenes nuevas y ningún marcador «Insertar». Los archivos de revisión visual quedan bajo `output/docx-actividad6`, fuera de los entregables académicos.

## Conclusión y limitaciones

CEMYDI demuestra consulta pública offline, actualización al reconectar, almacenamiento estructurado local y acceso a datos persistidos en PostgreSQL. El manifiesto, la generación de servidor, la interactividad cliente y los estados de carga están respaldados por ejecuciones concretas. Se corrigieron el aviso de reconexión y las imágenes versionadas, y se añadió respuesta de carga al inicio.

No se declara cumplimiento total de instalación/splash nativos, escrituras autenticadas ni sincronización bidireccional. Quedan dos capturas manuales de DevTools y las validaciones en dispositivo. La aplicación requiere JavaScript para la presentación normal del contenido transmitido por streaming. El destino privado habitual de la API debe ser accesible para reproducir los resultados fuera del entorno temporal usado aquí.
