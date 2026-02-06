# Guía de Uso: LES Agents & Skills System

Este sistema implementa un pipeline de desarrollo robusto para **Londor Enterprise System (LES)**, utilizando 5 agentes especializados y un orquestador central.

## Cómo Invocar las Habilidades

Puedes invocar las habilidades de los agentes utilizando los "Slash Commands" definidos en sus respectivos archivos dentro de `.agent/workflows/`.

### 1. Agentes Disponibles

- **UX Agent (`uxag.md`) — `/uxag`**: `/ux-translate-req`, `/ux-validation-patterns`, `/ux-components`, `/ux-permissions`.
- **Backend Agent (`vukag.md`) — `/vukag`**: `/be-translate-req`, `/be-api-contract`, `/be-crud-logic`, `/be-security`, `/be-observability`.
- **QA Dev Agent (`qadeag.md`) — `/qadeag`**: `/qa-structure-review`, `/qa-traceability`, `/qa-test-cases`, `/qa-smoke-test`.
- **Deployment Agent (`depag.md`) — `/depag`**: `/dep-env-prep`, `/dep-pipeline`, `/dep-migrations`, `/dep-runbook`.
- **QA Prod Agent (`qaprag.md`) — `/qaprag`**: `/qa-release-plan`, `/qa-post-deploy`, `/qa-data-integrity`, `/qa-incident-mgmt`.

### 2. El Orquestador (`orqag.md`) — `/orqag`

El comando principal es `/pipeline-run`. Úsalo para iniciar un flujo completo desde requisitos hasta producción.

## Flujo de Trabajo Recomendado

1. **Inicio:** "Agente, vamos a iniciar una nueva feature. Usa `/pipeline-run` basándote en este RF: [descripción]."
2. **Fases:** El agente te irá indicando en qué fase se encuentra y te pedirá validación para pasar los **Gates**.
3. **Gates:** Usa `/gate-check` para ver qué falta para completar la fase actual.

## Ubicación de Entregables

Cada agente generará documentos en carpetas específicas si se requiere persistencia:

- `/UX`: Mockups, flujos, reglas.
- `/BACKEND`: Spec OpenAPI, logs.
- `/QA_DEV`: Informes de tests, datasets.
- `/DEPLOY`: Changelogs, runbooks.
- `/QA_PROD`: Reportes de incidentes, logs post-salida.
