---
description: Habilidades del Agente UX (UUX) para el proyecto LES.
---

Este workflow contiene las habilidades necesarias para traducir requisitos funcionales en flujos de usuario y diseños de pantalla consistentes.

### /ux-translate-req

**Objetivo:** Convertir Casos de Uso (UC) en flujos de pantallas (happy path + errores).

1. **Analizar Inputs:** Revisar UC, RF, reglas de negocio y tipos de usuario.
2. **Definir User Flow:** Crear un diagrama o descripción del flujo de navegación.
3. **Identificar Pantallas Mínimas:** Listar las vistas esenciales.
4. **Definir Estados UI:** Especificar estados de vacío, carga y error para cada pantalla.
5. **Verificar:** Asegurar que los estados de error y confirmaciones estén cubiertos.

### /ux-validation-patterns

**Objetivo:** Definir validación y mensajes coherentes basados en reglas de negocio.

1. **Mapear Restricciones:** Identificar reglas de negocio y restricciones del modelo de datos.
2. **Definir Reglas de Validación:** Especificar qué campos son obligatorios, formatos, etc.
3. **Diseñar Microcopy:** Crear los mensajes de error, ayuda y éxito.
4. **Estrategia de Validación:** Decidir entre validación inmediata (on-blur/inline) vs submit.

### /ux-components

**Objetivo:** Catálogo de componentes y criterios de consistencia.

1. **Identificar Necesidades:** Revisar qué componentes (tablas, formularios, wizards) se requieren.
2. **Seleccionar Componentes:** Usar los componentes del sistema de diseño (Ant Design en LES).
3. **Definir Props y Comportamiento:** Especificar cómo debe actuar cada componente.
4. **Verificar Consistency:** Asegurar coherencia visual, responsive y accesibilidad.

### /ux-permissions

**Objetivo:** UX de permisos y estados (RBAC).

1. **Matriz de Roles:** Revisar qué acciones puede realizar cada rol.
2. **Diseñar Feedback:** Definir cómo se muestran las acciones no permitidas (disabled, ocultas).
3. **Mensajes de Permiso:** Crear mensajes claros para cuando el usuario no tiene acceso.
4. **Ocultar Acciones:** No exponer botones o links a los que el usuario no tiene permiso.

---
**Gate UX - Criterios de paso:**

- [ ] Todos los RF tienen representación UX.
- [ ] No hay lógica de negocio "inventada".
- [ ] Estados de error definidos.
- [ ] Permisos visibles/entendibles.
