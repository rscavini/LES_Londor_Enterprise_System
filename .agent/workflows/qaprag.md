---
description: Habilidades del Agente de QA Producción para el proyecto LES.
---

Este workflow contiene las habilidades necesarias para asegurar la calidad en el entorno real de producción.

### /qa-release-plan

**Objetivo:** Validar la entrada a producción.

1. **Análisis de Cambios:** Revisar changelog y features del release.
2. **Criterios Go/No-Go:** Definir qué fallos impiden el despliegue.
3. **Validación Release:** Test de regresión rápido en Prod.

### /qa-post-deploy

**Objetivo:** Detectar fallos tempranos post-salida.

1. **Checklist 0-120 min:** Revisar logs y métricas inmediatamente y a las 2h.
2. **Alerting:** Configurar umbrales de error (5xx) y latencia.
3. **Monitoreo Colas:** Verificar jobs y tareas en segundo plano.

### /qa-data-integrity

**Objetivo:** Consistencia real de los datos.

1. **Test de Consistencia:** Queries para detectar huérfanos o duplicados.
2. **Auditoría:** Verificar que los logs de auditoría (created_at/by) funcionen.
3. **Data Drift:** Detectar desviaciones del modelo esperado.

### /qa-incident-mgmt

**Objetivo:** Resolución y aprendizaje (RCA).

1. **Timeline:** Reconstruir cronología del incidente.
2. **Root Cause Analysis:** Identificar por qué falló.
3. **Plan de Acción:** Medidas paliativas y preventivas.

---
**Cierre de Orquestación:**

- [ ] Release estable.
- [ ] Métricas normales.
- [ ] Datos consistentes.
- [ ] Incidencias documentadas.
