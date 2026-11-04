from pathlib import Path
from copy import deepcopy
from docx import Document
from docx.shared import Inches

root = Path(__file__).resolve().parents[1]
out = root / 'docs/evidencias/actividad-6'
source = Path(r'C:\Users\Victo\Documents\DocumentosEscuela\10-A\PWA\Actividad 6 - Reporte de pantallas, contenido PWA, CRS y SSR, APIs de almacenamiento.docx')
doc = Document(source)
cover = [p._p.xml for p in doc.paragraphs[:18]]
paragraphs = list(doc.paragraphs)
changes = {
  21: 'La auditoría del 27 de octubre de 2026 incluyó compilaciones de producción, pruebas automatizadas y navegación con el frontend y el backend locales. Se comprobaron el almacenamiento público, las interacciones del catálogo y la recuperación de conexión. La instalación desde una pantalla de inicio y la presentación nativa de Android o iOS requieren comprobación en un dispositivo físico.',
  34: 'Se verificó que el manifiesto servido responde con HTTP 200, declara display: standalone, start_url: /, scope: / y proporciona iconos normales y maskable de 192 y 512 píxeles. Los cuatro recursos respondieron con HTTP 200. No se realizó una instalación ni se observó una Splash Screen nativa; la figura muestra únicamente la configuración real servida.',
  40: 'El catálogo y el detalle de producto cuentan con loading.tsx; la administración utiliza un componente de carga compartido y la autenticación ofrece estados propios al resolver la sesión o enviar formularios. Se añadió un límite de Suspense en src/app/page.tsx, que reutiliza AuthRouteLoading durante las consultas del inicio. La figura 3 se obtuvo del catálogo con latencia de 1 500 ms y descarga de 60 KiB/s emuladas mediante CDP, sin modificar la interfaz ni las respuestas.',
  50: 'La compilación de Next.js 16.3.8 clasificó /, /catalogo, /producto/[id] y /offline como rutas dinámicas (ƒ), mientras /manifest.webmanifest se generó estáticamente (○). CatalogPage es un componente de servidor asíncrono que consulta getCatalogProducts y entrega los resultados a CatalogClient. Se comprobó que el HTML HTTP contiene el nombre de un producto fuera de las etiquetas script. En el navegador sin JavaScript el segmento de Suspense permaneció oculto: el SSR comprobado no equivale a una experiencia completa sin JavaScript.',
  57: 'CatalogClient declara "use client" y utiliza useState, useMemo y useTransition para administrar filtros y navegación. Se escribió "Silla de ruedas tipo cama" en el buscador y se verificó la URL con q y el producto resultante. Las once pruebas E2E existentes también aprobaron, incluida la regresión de hidratación. La captura ilustra la interacción; componente-cliente.txt conserva el código inspeccionado.',
  68: 'El navegador registró un Service Worker activo en /sw.js y 134 recursos en Cache Storage durante la ejecución real. IndexedDB, en la base cemydi-public-offline, conservó 24 productos consultados y metadatos de orden. Los registros públicos comprobados excluyen precio, stock y proveedor. La política limita el catálogo guardado a 200 productos y aplica caducidad de 30 días; estos límites también se revisaron en código y en las pruebas PWA.',
  74: 'La persistencia estructurada del catálogo utiliza IndexedDB y se comprobó leyendo los registros del navegador y recargando sin conexión. localStorage conserva preferencias como cemydi-admin-theme en el panel administrativo. Una prueba del proveedor real comprobó el cambio de tema, su escritura y su recuperación tras desmontarlo y montarlo nuevamente.',
  75: 'La sesión pública utilizada para las capturas no tenía claves en localStorage. Por tanto, no se presenta una captura de preferencias administrativas como si procediera de una sesión autenticada. sessionStorage se emplea para conservar una marca temporal no sensible del aviso de reconexión cuando la página de respaldo debe navegar al documento en línea. No se almacenaron credenciales de prueba ni se mostraron cookies o tokens en las evidencias.',
  81: 'El backend NestJS local respondió GET /products?page=1&pageSize=24 con HTTP 200 y 24 registros de un total de 57. También se verificó el proxy del frontend mediante GET /api/products?page=1&pageSize=1 con HTTP 200. Una consulta independiente de solo lectura mediante Prisma confirmó 57 productos en PostgreSQL y los identificadores públicos de tres registros.',
  82: 'El catálogo inicial consulta la API desde el servidor de Next.js; esa petición SSR no aparece necesariamente como Fetch/XHR en el navegador. Por ello, la evidencia combina la respuesta HTTP real del proxy, http-backend.json, la consulta directa a la API y postgresql.json. La prueba de lectura y las pruebas unitarias no demuestran por sí solas una escritura autenticada de compra o renta; esos flujos no se ejecutaron con cuentas reales.',
  88: 'Se visitaron el catálogo y una ficha de producto con conexión; después se desactivó la red del contexto del navegador y se abrieron nuevamente ambas rutas. Se conservaron el nombre y la información pública de los productos, mientras los importes y las existencias se sustituyeron por "Consultar disponibilidad y precio al reconectar". Al recuperar la conexión, la aplicación reemplazó la presentación guardada por el catálogo actualizado.',
  89: 'La recuperación del catálogo consiste en volver a consultar el servidor. No existe una cola de operaciones pendientes ni Background Sync para reenviar compras, rentas o cambios autenticados en la implementación revisada. No se añadieron reenvíos sensibles: el alcance comprobado es consulta pública offline y actualización posterior. La sincronización bidireccional de escrituras no se declara implementada.',
  96: 'Las compilaciones del frontend y del backend finalizaron correctamente. El frontend aprobó 276 pruebas en 70 archivos y el backend aprobó 379 pruebas en 76 suites. Las once pruebas E2E existentes pasaron contra producción y las 23 pruebas PWA aisladas también aprobaron. Las once comprobaciones adicionales contra la API real validaron inicio móvil, manifiesto, carga, SSR, búsqueda, almacenamiento, HTTP, detalle y catálogo offline, reconexión y escritorio. ESLint terminó sin errores, con 94 advertencias preexistentes de scripts de skills. Los resultados antes y después de las correcciones se detallan en el informe de auditoría adjunto.',
  100: 'La auditoría comprobó el funcionamiento del inicio, los estados de carga, la combinación de componentes de servidor y cliente, el almacenamiento público y la comunicación con PostgreSQL mediante la API. Se corrigió la pérdida del aviso de reconexión al abandonar la página de respaldo, se incorporó un indicador de carga al inicio y se corrigió la preparación de imágenes públicas cuya URL incluye parámetros de consulta.',
  101: 'Las pruebas distinguieron la consulta de datos guardados de la actualización al reconectarse y de la sincronización de escrituras, que no está implementada. Los datos comerciales no se presentan como actuales sin conexión. El HTML del catálogo se genera en el servidor, aunque su presentación por streaming en el navegador probado necesita JavaScript.',
  102: 'El cumplimiento técnico es amplio dentro de las funciones verificadas. Permanecen pendientes la instalación y Splash Screen en un dispositivo físico, las capturas manuales de DevTools y las operaciones autenticadas de administración, carrito y renta con una cuenta controlada. Estas limitaciones se conservan explícitas para evitar atribuir al proyecto resultados que no se observaron.',
}
captions = {
  29: 'Figura 1. Inicio de CEMYDI en Chromium a 390 × 844 píxeles. La apertura desde la pantalla de inicio del dispositivo no se comprobó.',
  37: 'Figura 2. Manifiesto real servido por la aplicación. Esta captura no representa una Splash Screen nativa.',
  43: 'Figura 3. Indicador real del catálogo durante la carga con condiciones de red lenta emuladas.',
  53: 'Figura 4. Catálogo renderizado en el navegador. La comprobación SSR se completa con componente-servidor.txt, ssr-html-sin-scripts.txt y el registro de compilación.',
  60: 'Figura 5. Búsqueda funcional del catálogo mediante un componente cliente; el código con la directiva se conserva en componente-cliente.txt.',
  71: 'Figura 6. Service Worker y Cache Storage verificados por automatización. Captura de Chrome DevTools pendiente.',
  78: 'Figura 7. IndexedDB verificado en navegador y preferencia localStorage probada en el componente. Captura de DevTools pendiente.',
  85: 'Figura 8. Respuesta JSON real del backend a través del proxy. Método GET y estado HTTP 200 registrados en http-backend.json.',
  92: 'Figura 9. Ficha pública previamente visitada abierta sin conexión. El catálogo offline se incluye como evidencia complementaria.',
}
for index, text in {**changes, **captions}.items():
    p = paragraphs[index]
    properties = deepcopy(p.runs[0]._element.rPr) if p.runs and p.runs[0]._element.rPr is not None else None
    p.clear()
    run = p.add_run(text)
    if properties is not None:
        run._element.insert(0, properties)

figures = {
 28: 'figura-01-inicio-movil.png',
 36: 'figura-02-manifiesto-servido.png',
 42: 'figura-03-carga-catalogo-red-lenta.png',
 52: 'figura-04-catalogo-renderizado.png',
 59: 'figura-05-busqueda-cliente.png',
 84: 'figura-08-respuesta-http-backend.png',
 91: 'figura-09-detalle-sin-conexion.png',
}
from PIL import Image
for index, filename in figures.items():
    path = out / filename
    p = paragraphs[index]
    p.clear()
    width, height = Image.open(path).size
    max_height = 3.6 if index == 59 else 4.8
    inches = min(6.0, max_height * width / height)
    p.add_run().add_picture(str(path), width=Inches(inches))
    p.alignment = 1
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_after = Inches(0.06)

manual = {
 70: 'Comprobación realizada: trabajador activo en /sw.js y 134 recursos guardados. El inventario real se conserva en almacenamiento-real.json. Para completar la figura, abrir Chrome DevTools → Application → Service workers y Cache storage, con el build de producción activo en el mismo origen. No se obtuvo la captura: el control de Windows se detuvo mediante Escape y el acceso automatizado a devtools:// devolvió ERR_ABORTED.',
 77: 'Comprobación realizada: 24 productos públicos en IndexedDB; la sesión visitante no almacenó preferencias en localStorage. Para completar la figura, abrir Application → IndexedDB → cemydi-public-offline → products y, con una cuenta administrativa controlada, cambiar el tema y mostrar únicamente cemydi-admin-theme en Local storage. No mostrar cookies, tokens ni información de usuario. La prueba de componente de la preferencia se conserva en preferencias-locales.log.',
}
for index, text in manual.items():
    paragraphs[index].clear().add_run(text)

for p in paragraphs[18:]:
    p.paragraph_format.keep_together = True
for index in [18, 23, 24, 31, 38, 46, 48, 55, 61, 65, 66, 73, 80, 87, 95, 99, 104]:
    paragraphs[index].paragraph_format.keep_with_next = True
for index in captions:
    paragraphs[index].paragraph_format.keep_with_next = False

# Preserve the original section starts without blank pages when a preceding
# section now ends exactly at a page boundary.
for index, p in enumerate(paragraphs[18:], start=18):
    if not p.text and p._p.xpath('.//w:br[@w:type="page"]'):
        following = next((item for item in paragraphs[index + 1:] if item.text.strip()), None)
        if following is not None:
            following.paragraph_format.page_break_before = True
            p._p.getparent().remove(p._p)

results = [
    ('Home Screen', 'Implementado. Inicio observado en móvil; apertura desde un icono instalado pendiente.'),
    ('Splash Screen', 'Parcial. Manifiesto e iconos verificados; arranque nativo pendiente de dispositivo.'),
    ('Pantalla de carga', 'Implementado. Catálogo capturado con red lenta; inicio con Suspense y estados por ruta.'),
    ('CSR', 'Implementado. Búsqueda y filtros funcionales; componentes cliente e hidratación comprobados.'),
    ('SSR', 'Implementado. Catálogo en HTML HTTP; rutas dinámicas identificadas en la compilación.'),
    ('Almacenamiento local', 'Parcial. IndexedDB y cachés reales verificados; tema localStorage probado en componente. Captura del panel pendiente.'),
    ('Almacenamiento remoto', 'Parcial. API real con HTTP 200 y 57 productos en PostgreSQL. Escrituras autenticadas pendientes.'),
    ('Offline y recuperación', 'Implementado. Catálogo, ficha e imágenes guardados; actualización al recuperar conexión.'),
    ('Sincronización', 'Parcial. Actualización de lecturas comprobada. Sin cola ni sincronización bidireccional de escrituras.'),
]
table = doc.tables[0]
while len(table.rows) < len(results) + 1:
    table._tbl.append(deepcopy(table.rows[-1]._tr))
for row, values in zip(list(table.rows)[1:], results):
    for cell, value in zip(row.cells, values):
        p = cell.paragraphs[0]
        properties = deepcopy(p.runs[0]._element.rPr) if p.runs and p.runs[0]._element.rPr is not None else None
        p.clear()
        run = p.add_run(value)
        if properties is not None:
            run._element.insert(0, properties)
        p.paragraph_format.keep_together = True

# Keep all academic cover paragraphs, section properties, headers and footers.
assert [p._p.xml for p in doc.paragraphs[:18]] == cover
target = out / 'Actividad 6 - Reporte actualizado.docx'
doc.save(target)
print(target)
