---
description: Habilidades del Agente de Backend (Vaquen) para el proyecto LES.
---

Este workflow contiene las habilidades necesarias para implementar la lógica de negocio, APIs y seguridad del backend.

### /be-translate-req

**Objetivo:** Convertir RF/UC en tareas backend concretas.

1. **Analizar Requisitos:** Revisar RF, UC y reglas de negocio.
2. **Identificar Entidades:** Mapear el diccionario de datos y entidades necesarias.
3. **Listar Tareas Técnicas:** Definir endpoints, servicios, validaciones y jobs.
4. **Criterios de Aceptación:** Establecer qué constituye una tarea completada.
5. **Identificar Riesgos:** Detectar posibles cuellos de botella o complejidades.

### /be-api-contract

**Objetivo:** Definir contratos de API claros y versionables (OpenAPI).

1. **Diseñar Endpoints:** Definir rutas, métodos HTTP y parámetros.
2. **Definir Schemas:** Estructurar Request y Response (JSON).
3. **Códigos de Error:** Estandarizar respuestas de error (400, 401, 403, 404, 500).
4. **Filtros y Paginación:** Definir estándar para listados.

### /be-crud-logic

**Objetivo:** Implementar lógica con trazabilidad total a los RF.

1. **Modelado de Datos:** Implementar/actualizar esquemas de base de datos.
2. **Lógica de Negocio:** Desarrollar servicios y controladores.
3. **Validaciones Hardened:** Implementar validaciones de seguridad e integridad en el server.
4. **Trazabilidad:** Mantener tabla de "RF ↔ Función/Servicio".
5. **Transacciones:** Asegurar atomicidad en operaciones complejas.

### /be-security

**Objetivo:** Implementar RBAC/ABAC según roles.

1. **Configurar Middleware:** Implementar guards, policies o middlewares de acceso.
2. **Validar Permisos:** Aplicar el principio de mínimos privilegios en cada endpoint.
3. **Segregación:** Asegurar que un usuario no pueda acceder a datos de otros sin permiso.

### /be-observability

**Objetivo:** Sistema depurable y trazable.

1. **Logs Estructurados:** Implementar logging consistente (niveles info, warn, error).
2. **Correlation ID:** Asegurar trazabilidad de peticiones.
3. **Métricas Base:** Registrar eventos clave para monitoreo.
4. **Seguridad de Logs:** No filtrar PII (Personal Identifiable Information).

---
**Gate Técnico - Criterios de paso:**

- [ ] Cada RF tiene endpoint/servicio asociado.
- [ ] Validaciones backend coherentes con UX.
- [ ] Seguridad aplicada.
- [ ] Logs mínimos definidos.
- [ ] No hay lógica huérfana.
