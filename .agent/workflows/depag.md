---
description: Habilidades del Agente de Despliegue para el proyecto LES.
---

Este workflow contiene las habilidades necesarias para gestionar entornos y despliegues seguros.

### /dep-env-prep

**Objetivo:** Estandarizar configuración por entorno (Dev/Staging/Prod).

1. **Matriz de Variables:** Definir .env para cada entorno.
2. **Gestión de Secrets:** Asegurar que las claves no estén en el código.
3. **Servicios Externos:** Configurar URLs de APIs, DB y Storage.

### /dep-pipeline

**Objetivo:** Build/Test/Deploy reproducible.

1. **Definir Pasos:** Build, Test, Deploy, Smoke Test.
2. **Estrategia de Release:** Definir ramas (main/develop) y tags de versión.
3. **Rollback:** Tener plan de retorno en caso de fallo.

### /dep-migrations

**Objetivo:** Despliegue de esquemas sin romper datos.

1. **Plan de Migración:** Revisar cambios en el modelo.
2. **Scripts:** Desarrollar scripts de migración (Forward/Backward).
3. **Sembrado:** Gestionar seeds de datos maestros y operativos.

### /dep-runbook

**Objetivo:** Operación y mantenimiento del sistema.

1. **Manual Operativo:** Instrucciones de arranque, parada y reinicio.
2. **Manejo de Incidencias:** Lista de errores frecuentes y su solución.
3. **Contactos y SLA:** Información de soporte.

---
**Gate Release - Criterios de paso:**

- [ ] Pipeline verde.
- [ ] Migraciones seguras.
- [ ] Rollback definido.
- [ ] QA Dev aprobado.
