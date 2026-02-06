# LES Architecture Guide: Multi-Module & Agent-Driven Development

Este documento define la estructura y el modelo operativo del **Londor Enterprise System (LES)**. Sirve como base para el desarrollo de todos los módulos actuales y futuros, asegurando consistencia y calidad mediante el uso de agentes especializados.

## 1. Estructura de Directorios (Root)

El proyecto LES utiliza una arquitectura multi-módulo centralizada:

```text
c:\PROYECTOS\les\
├── .agent\                     # Inteligencia y Automatización
│   └── workflows\              # Skills de los Agentes (/uxag, /vukag, etc.)
├── docs\                       # Repositorio de Conocimiento
│   ├── z_docs_consultoria\     # Documentación de negocio y funcional
│   ├── extracted_text\         # Datos procesados para contexto de IA
│   └── LES_ARCHITECTURE_GUIDE.md # (Este documento)
├── modules\                    # Aplicaciones Específicas
│   └── inventario\             # Código fuente del Módulo de Inventario
│       ├── src\
│       ├── public\
│       └── package.json
├── scripts\                    # Utilidades Compartidas
│   └── extract_docs.ps1        # Scripts de mantenimiento/procesamiento
├── ux-ui\                      # Assets de Diseño
│   └── screens\                # Capturas y definiciones de UI transversales
└── LES_SKILLS_GUIDE.md         # Manual rápido de comandos de agentes
```

## 2. Ecosistema de Agentes y Skills

LES es operado por 5 agentes especializados que siguen una filosofía de **Shift-Left** (detección temprana de errores). Cada agente puede ser invocado mediante su alias simplificado:

### /orqag — El Orquestador

Coordina el pipeline end-to-end. Su misión es asegurar que nada pase a producción sin cumplir los "Gates".

- **Comando principal**: `/pipeline-run`
- **Autonomía**: Invoca automáticamente a los demás agentes según la fase actual.

### /uxag — Agente UX (UUX)

Traduce requisitos funcionales a flujos de usuario y pantallas mínimas sin inventar lógica.

- **Entregables**: User flows, estados UI (carga/error), reglas de validación UX.

### /vukag — Agente Backend (Vaquen)

Implementa la lógica de negocio, APIs y seguridad con trazabilidad total a los requisitos.

- **Entregables**: OpenAPI Specs, servicios CRUD, RBAC, logs estructurados.

### /qadeag — Agente QA Desarrollo

Verifica la calidad técnica en el entorno local antes de cualquier despliegue.

- **Entregables**: Smoke tests, revisión de estructura, matriz de trazabilidad RF-Test.

### /depag — Agente de Despliegue

Gestiona entornos, pipelines de CI/CD y migraciones de datos.

- **Entregables**: Matriz de variables (.env), planes de migración, runbooks operativos.

### /qaprag — Agente QA Producción

Asegura la calidad real en el entorno productivo y gestiona incidentes.

- **Entregables**: Monitorización post-deploy, auditoría de integridad, RCA de incidentes.

## 3. El Pipeline de Desarrollo (Steps & Gates)

1. **Fase 0: Input** (Solo si hay RF claros).
2. **Fase 1: UX** → **Gate UX** (Validación funcional visual).
3. **Fase 2: Backend** → **Gate Técnico** (Validación de lógica y seguridad).
4. **Fase 3: QA Dev** → **Gate Dev** (Validación técnica de estructura y tests).
5. **Fase 4: Deploy** → **Gate Release** (Validación de entorno y rollback).
6. **Fase 5: QA Prod** → **Cierre** (Validación de uso real).

## 4. Estándares para Nuevos Módulos

Cualquier módulo nuevo (por ejemplo, `modules/ventas`) debe seguir estas reglas:

- **Modularidad**: Debe ser independiente, compartiendo solo los activos de la raíz.
- **Consistencia**: Utilizar el sistema de diseño Ant Design (si aplica) y los patrones de validación definidos en `/uxag`.
- **Trazabilidad**: Cada función técnica debe estar ligada a un Requisito Funcional (RF).
- **Operatividad**: Debe incluir scripts de sembrado (`seed`) para datos maestros en la carpeta del módulo.
