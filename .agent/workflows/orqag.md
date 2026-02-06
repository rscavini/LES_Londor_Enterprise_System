---
description: Orquestador del Pipeline End-to-End para LES.
---

Este workflow coordina los 5 agentes especializados para asegurar que los requisitos se convierten en releases estables sin saltar pasos.

### /pipeline-run

**Entrada:** Requisitos Funcionales (RF), Casos de Uso, Modelo de Datos.

1. **Validar Input Controlado (Fase 0):**
    - ¿Están los RF detallados?
    - ¿Existen reglas de negocio claras?
    - *Si falta algo, el orquestador se detiene.*

2. **Ejecutar Fase 1 - Agente UX:**
    - Invocar `uxag.md` con `/ux-translate-req`.
    - Verificar **Gate UX**.

3. **Ejecutar Fase 2 - Agente Backend:**
    - Invocar `vukag.md` con `/be-translate-req` y `/be-crud-logic`.
    - Verificar **Gate Técnico**.

4. **Ejecutar Fase 3 - Agente QA Desarrollo:**
    - Invocar `qadeag.md` con `/qa-traceability` y `/qa-smoke-test`.
    - Verificar **Gate Dev**.

5. **Ejecutar Fase 4 - Agente Despliegue:**
    - Invocar `depag.md` con `/dep-migrations` y `/dep-pipeline`.
    - Verificar **Gate Release**.

6. **Ejecutar Fase 5 - Agente QA Producción:**
    - Invocar `qaprag.md` con `/qa-post-deploy`.
    - Verificar **Cierre de Orquestación**.

### /gate-check

Usa este comando para verificar si una fase actual cumple los criterios para avanzar a la siguiente.

| Gate | Requisito Principal |
| :--- | :--- |
| UX | RF cubiertos en pantalla |
| Técnico | RF cubiertos en API/Backend |
| Dev | Smoke Test OK + Estructura |
| Release | Pipeline Verde + Rollback listo |

### /rollback-flow

En caso de fallo en Fase 4 o 5, activa este flujo para revertir cambios a la última versión estable.
