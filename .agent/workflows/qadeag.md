---
description: Habilidades del Agente de QA Desarrollo para el proyecto LES.
---

Este workflow contiene las habilidades necesarias para verificar la estructura y funcionalidad en el entorno de desarrollo.

### /qa-structure-review

**Objetivo:** Asegurar arquitectura limpia y estándares.

1. **Revisión de Carpetas:** Verificar convención de nombres y separación de capas.
2. **Modularidad:** Asegurar que el código sea modular y reutilizable.
3. **Lint/Format:** Validar que el código pase las reglas de linting.

### /qa-traceability

**Objetivo:** Trazabilidad real entre RF e Implementación.

1. **Mapear RF:** Verificar que cada RF tenga una evidencia (test, endpoint, UI).
2. **Gaps:** Identificar requisitos no cubiertos.
3. **Actualizar Matriz:** Mantener el documento de trazabilidad al día.

### /qa-test-cases

**Objetivo:** Pruebas reproducibles y datos de test.

1. **Escenarios de Prueba:** Definir casos Happy Path y Edge Cases para cada UC.
2. **Dataset de Prueba:** Crear archivos JSON/Scripts para poblar datos.
3. **Verificar Límites:** Probar valores frontera y concurrencia básica.

### /qa-smoke-test

**Objetivo:** Comprobación "end-to-end mínimo" post-build.

1. **Flujos Críticos:** Probar Login, CRUD básico y permisos.
2. **Integración:** Verificar que el UI conecte correctamente con el Backend.
3. **Persistencia:** Confirmar que los datos se leen y escriben correctamente en DB.

---
**Gate Dev - Criterios de paso:**

- [ ] Proyecto bien estructurado.
- [ ] Todos los RF cubiertos por test.
- [ ] Smoke test OK.
- [ ] Errores documentados o resueltos.
