# Validación e informes

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Validación (`src/validation/validators.ts`)
`validateCourse(course)` recorre el curso y devuelve una lista de `Issue`
(`{ code, severity: 'error'|'warning'|'info', message, location, screenId?, unitId? }`).
Reglas por pantalla / unidad / curso, p. ej.:
- Pantalla marcada como esqueleto/`content_placeholder` → `warning`.
- `type` distinto de `cover`/`summary` **sin** `objective` → aviso (por eso el editor
  rellena `objective` aunque no se muestre como banner; ver `arquitectura-runtime.md`).
- Imagen sin `alt`, vídeo sin `transcript`, interacción sin `learning_objective`, etc.
- **Cobertura de objetivos**: objetivos declarados que ninguna interacción/pregunta
  evalúa → `warning` (`objectives` vs `evaluatedObjectives`).

Uso en UI:
- `Toolbar` muestra el badge `.ed-status` con el recuento `errores ⛔ · avisos ⚠`; al
  pulsarlo navega a la pestaña de validación (`activeTab = 'validation'`).
- `ValidationPanel` (`src/components/ValidationPanel.tsx`) lista los `Issue`; cada uno
  puede llevar a su pantalla.

## Informe (`src/report/report.ts`, `ReportPanel`)
Pestaña «report». Combina:
- **Recuentos** (`counts`): módulos, unidades, pantallas, interacciones, preguntas.
- **Matriz de trazabilidad** (`MatrixRow`): objetivo → pantalla → interacción →
  evaluación, para ver qué objetivos están cubiertos y evaluados.
- Reusa `validateCourse` para incluir el estado de validación.

`ReportPanel` (`src/components/ReportPanel.tsx`) lo renderiza en la pestaña
correspondiente (`activeTab = 'report'`).
