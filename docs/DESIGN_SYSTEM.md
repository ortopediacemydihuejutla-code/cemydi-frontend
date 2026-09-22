# Sistema de diseño existente

## Current behavior — fundamentos

El proyecto usa Tailwind CSS 4 mediante `@import "tailwindcss"` y tokens CSS en `src/app/globals.css`. No hay archivo `tailwind.config`; la configuración temática principal vive en CSS con `@theme`.

Tipografía declarada:

- cuerpo: Inter con fallbacks de sistema;
- encabezados: Montserrat, Inter y fallbacks.

No se observó carga propia de archivos de fuente; los fallbacks forman parte del comportamiento actual.

## Current behavior — tokens

La marca se construye alrededor de verdes `--brand-900` a `--brand-600`, superficies claras, borde suave y texto principal/muted. Los tokens semánticos de Tailwind mapean background, card, popover, primary, secondary, muted, accent, destructive, border, input, ring y sidebar.

Radios principales: 9 px, 14 px y 28 px. `--shadow-md` y `--focus-ring` centralizan elevación y foco de superficies principales.

El panel administrativo soporta tema oscuro anidado mediante `.dark` y `@custom-variant dark`; no depende de aplicar el tema únicamente a `html`.

## Current behavior — familias de componentes

### Sitio público y cuenta

Revisa primero:

- `src/components/ui`: `Button`, dropdown menu, paginación y testimonial.
- `src/components/auth`: layouts y controles de formularios de identidad.
- `src/components/account`: shell, sidebar, headers, paginación, empty states y favoritos.
- `src/components/layout`: header, footer y shell general.
- `src/components/product`, `rentals` y `legal`: patrones especializados reutilizables.

### Panel administrativo

`src/features/admin/components/ui` contiene primitives propias para alert/dialog, badge, breadcrumb, button, card, collapsible, dialog, upload, input, pagination, progress, separator, sheet, sidebar, skeleton, table y tooltip. Están adaptadas al tema, layout y navegación admin.

La separación es intencional por contexto visual y de interacción, aunque existen algunos imports cruzados de utilidades y componentes públicos que usan la utilidad `cn` de admin. Eso no convierte ambas carpetas en una sola biblioteca.

## Required convention — UI nueva

- Para una ruta pública o de cuenta, busca y reutiliza primero `src/components/ui` y componentes del dominio público.
- Para una ruta bajo `/admin`, busca y reutiliza primero `src/features/admin/components/ui` y componentes de `features/admin`.
- No cruces primitives entre ambas familias solo porque tengan nombre similar. Hazlo únicamente cuando una propiedad o comportamiento compartido sea explícitamente necesario y no haya una opción nativa del contexto; documenta el motivo en el cambio.
- Antes de crear UI nueva, revisa el componente análogo, tokens, responsive, estados loading/empty/error y accesibilidad del área objetivo.
- No fusiones ni muevas estas carpetas como parte de una tarea de feature.

## Current behavior — Radix y CVA

Radix UI sustenta dialogs, dropdowns, tooltips, collapsibles, progress, separator y slots. Los wrappers preservan accesibilidad y comportamiento de teclado. `class-variance-authority` se usa en botones y otras variants; `cn` combina clases.

Para dialogs, menús y tooltips nuevos, compón los wrappers existentes antes de usar primitives Radix directamente.

## Current behavior — formularios y feedback

- Auth comparte campos y layout, con labels, autocomplete, `aria-invalid`, mensajes y foco al primer error.
- Administración combina inputs nativos con wrappers propios, dialogs y toasts.
- Los formularios suelen usar estado controlado y validadores locales; no existe React Hook Form.
- `react-hot-toast` está configurado globalmente con roles ARIA distintos para éxito, error y carga.
- Loading se representa con skeletons, textos/botones deshabilitados y `loading.tsx` según la ruta.
- Empty/error states tienen componentes compartidos en cuenta y boundaries a nivel app/admin.

## Current behavior — tablas y datos

El panel usa primitives de tabla, encabezados ordenables, filtros, paginación y cards métricas. Analytics usa Recharts con `ResponsiveContainer`. En móvil, varias páginas cambian densidad o estructura en vez de forzar una tabla ancha.

## Current behavior — responsive

- Tailwind usa breakpoints estándar (`sm`, `md`, `lg`, etc.) y algunas media queries específicas.
- El header cambia a menú móvil; sidebar y cuenta tienen variantes compactas.
- A partir de 2560 px el sitio público escala la raíz para conservar legibilidad; admin queda excluido.
- Controles interactivos globales tienen mínimo de 44 × 44 px, con excepciones documentadas para sidebar y paginación.

## Current behavior — accesibilidad

- outline global en `:focus-visible`;
- labels y nombres accesibles en formularios y botones de icono;
- `aria-live`, `role="alert"` y `aria-busy` en feedback;
- soporte de teclado y foco de Radix;
- `sr-only` para inputs de archivo;
- iconos decorativos con `aria-hidden` en numerosos componentes.

## Required convention — accesibilidad y responsive

Mantén contraste, navegación por teclado, foco visible, targets táctiles y semántica al extender la UI. Conserva los patrones responsive del contexto donde trabajes y no conviertas una decisión visual específica de una pantalla en un token global sin evidencia de reutilización.

## Required convention — sobriedad visual y eliminación de clichés de IA

- **Sin gradientes decorativos ni efectos de texto degradado**: Prohibido el uso de gradientes en fondos (`bg-gradient-...`, `radial-gradient`), bordes o textos (`bg-clip-text text-transparent`). La identidad visual de CEMYDI se basa en superficies limpias, sólidas y contrastadas con sus colores oficiales (`#21a5b1`, `#34ab8b`, `#066f60`, `--brand-900: #0f3d3b`).
- **Encabezados limpios sin `<span>` cosméticos**: El `<h1>` principal debe contener directamente su texto semántico. No anidar etiquetas `<span>` para colorear fragmentos de títulos o crear efectos visuales artificiales.
- **Eliminación de artefactos y clichés de IA**:
  - Evitar fondos con luces o resplandores radiales decorativos ("ambient glow").
  - Evitar sombras con colores saturados tipo neón o resplandores artificiales.
  - Evitar tarjetas y contenedores anidados sin justificación funcional.
  - Priorizar interfaces minimalistas, claras, legibles y funcionales acordes al ámbito clínico y ortopédico.

## Current behavior — animación e iconografía

- Lucide React es la fuente principal de iconos; `react-icons` también está instalada y aparece en partes del proyecto.
- Framer Motion anima testimonios y uploads.
- GSAP anima revelado de contacto y quiénes somos mediante `gsap.context` y cleanup.
- CSS cubre transiciones, skeletons y keyframes administrativos.

## Required convention — movimiento e iconos

Reutiliza la librería ya usada por el módulo. Respeta `prefers-reduced-motion` al introducir movimiento nuevo.

## Current behavior — contenido enriquecido e imágenes

- TipTap edita contenido administrativo.
- El contenido legal pasa por `sanitize-html` con allowlist antes de `dangerouslySetInnerHTML`.
- `next/image` se usa en UI pública; `next.config.ts` permite Cloudinary, Unsplash y `placehold.co` bajo patrones definidos.

## Known inconsistency

- UI pública y admin mantienen dos conjuntos de primitives con estilos y firmas no idénticas.
- Varias pantallas usan colores hexadecimales inline en clases en lugar de tokens semánticos.
- Existen dos librerías de iconos y dos librerías de animación, además de CSS transitions.
- `globals.css` contiene tanto tokens globales como numerosos overrides específicos del panel.

## Future improvement

Una tarea de diseño dedicada puede decidir si los tokens repetidos y los primitives de ambas familias deben converger. Debe preservar los contrastes público/admin y no derivarse de la evidencia puntual en `docs/qa/design-qa.md`, que documenta solo el rediseño de Mi cuenta.
