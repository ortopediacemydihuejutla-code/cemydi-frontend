# Flujo de trabajo para agentes de IA

## Required convention — workflow

### 1. Understand

- Lee `AGENTS.md` y el documento especializado por área.
- Traduce la solicitud a comportamiento observable y límites explícitos.
- Identifica qué depende del backend y evita asumir su contrato.
- Revisa `git status` y conserva cambios no relacionados del usuario.

### 2. Search

- Localiza ruta, componente, hook, service, schema, tipos y pruebas relacionados.
- Busca una implementación equivalente antes de diseñar otra.
- Revisa ambas familias UI si el trabajo es visual: pública y admin.
- Busca una skill aplicable en `.agents/skills/` y lee su `SKILL.md` completo.
- Trata inconsistencias documentadas como señales para investigar, nunca como plantilla de implementación.

### 3. Reuse

- Reutiliza primitives, layouts, empty/loading/error states y tokens.
- Extiende el service del dominio y el cliente HTTP existente.
- Reutiliza query keys, schemas, mappers y validadores.
- No dupliques contratos ni agregues dependencias sin una necesidad demostrable.
- Cuando coexistan varios patrones, usa la convención de código nuevo de `CONVENTIONS.md` y no copies el patrón legacy por inercia.

### 4. Plan

- Define el cambio mínimo que satisface la solicitud.
- Enumera archivos y comportamiento afectado, interfaces, estados y pruebas.
- Decide explícitamente carga, error, vacío, responsive, accesibilidad, sesión, rol, caché e invalidación cuando apliquen.
- Detén el plan si falta una decisión de producto o contrato que solo puede confirmar el usuario/backend.

### 5. Implement

- Modifica únicamente archivos relacionados.
- Mantén separación entre UI, red, estado y utilidades.
- No refactorices código vecino solo por preferencia.
- No "limpies" deuda técnica no relacionada durante una tarea acotada.
- Conserva Server Components y límites cliente/servidor actuales.
- Trata datos externos como no confiables y nunca expongas secretos.

### 6. Validate

Ejecuta en proporción al riesgo:

```bash
npm run lint
npm run test
npm run build
```

Para flujos completos:

```bash
npm run test:e2e
```

Agrega pruebas específicas antes o junto con la implementación. Si un comando falla, determina si el fallo es nuevo, preexistente o ambiental; no lo ocultes ni cambies código no relacionado para silenciarlo. Distingue los warnings preexistentes de `.agents/skills/impeccable` de problemas nuevos en `src/`.

### 7. Review

Antes de entregar, verifica:

- TypeScript y ausencia de `any` injustificado;
- errores de runtime y promesas manejadas;
- responsive y tema correspondiente;
- teclado, foco, labels, roles, contraste y targets táctiles;
- estados loading, empty, success y error;
- autenticación frente a autorización real;
- caché, query keys e invalidaciones;
- cleanup de effects, listeners, timers, object URLs y animaciones;
- sanitización de HTML y validación de archivos;
- cambios accidentales en rutas, contratos o dependencias;
- diff final limitado al alcance.

### Entrega

Resume:

- comportamiento implementado;
- archivos relevantes;
- validaciones ejecutadas y resultado;
- inconsistencias preexistentes que afectaron la tarea;
- cualquier comportamiento que deba verificarse en el backend.

No declares éxito si quedan errores introducidos por el cambio.
