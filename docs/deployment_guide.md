# Guía Técnica: Despliegue en Firebase App Hosting (LES)

Este documento detalla la configuración, los retos técnicos y las soluciones implementadas para el despliegue exitoso del proyecto **Londor Enterprise System (LES)** en Firebase App Hosting.

## 1. Arquitectura de Despliegue

La aplicación utiliza un modelo de **Single Page Application (SPA)** construida con Vite + React, pero desplegada bajo un entorno de **App Hosting** que requiere un servidor en ejecución.

- **Frontend**: Vite / React / TypeScript.
- **Backend de Despliegue**: Firebase App Hosting (us-east4 / europe-west4).
- **Runtime**: Node.js managed environment (Cloud Run).

## 2. Configuración de App Hosting (`apphosting.yaml`)

El archivo de configuración define los recursos y el comando de arranque:

```yaml
kind: "AppStack"
schemaVersion: "v1"
runConfig:
  concurrency: 80
  cpu: 1
  memoryMiB: 512
  runCommand: "npm run start" # Punto crítico: Fuerza el uso del servidor de producción
```

## 3. Problemas Solucionados y Lecciones Aprendidas

### A. Discrepancia Local vs. CI (TypeScript)

**Problema**: El entorno de compilación de Firebase (CI) fallaba con errores de "implicit any" o variables potencialmente `undefined`, a pesar de que en local compilaba correctamente.
**Solución**:

- Se refactorizó `src/firebase.ts` para usar exportaciones constantes y no-nulables de `db` y `auth`.
- Se eliminaron bloques `try-catch` que impedían que TypeScript infiriera correctamente el tipo de los servicios tras la inicialización.
- Se unificaron los imports de Firebase en todo el proyecto hacia la raíz `@/firebase`.

### B. El Error del Puerto 8080 (SPA vs runtime)

**Problema**: Firebase App Hosting espera que el contenedor escuche en el puerto `8080` (definido en la variable de entorno `PORT`). Un build estático de Vite no levanta un servidor, provocando un fallo de timeout.
**Solución**:

- Se instaló `express` como dependencia de producción.
- Se creó `server.js` para servir los archivos estáticos de la carpeta `dist`.
- Se añadió el script `"start": "node server.js"` en `package.json`.

### C. Compatibilidad con Express 5 (Ruteo SPA)

**Problema**: El servidor crasheaba al arrancar con el error `PathError: Missing parameter name`.
**Causa**: Express 5 (y `path-to-regexp` v8) ya no soporta comodines `*` sin nombre.
**Solución**: Cambiar la ruta de captura de SPA de `app.get('*', ...)` a `app.get('/*all', ...)` (comodín con nombre).

## 4. Flujo de Trabajo para Despliegue

Cada `git push origin main` dispara automáticamente un rollout en Firebase App Hosting.

- **Backend Principal**: `les` (europe-west4).
- **Backend Secundario**: `londor-enterprise-system` (us-east4).

> [!IMPORTANT]
> Siempre verificar que el commit hash en la consola de Firebase coincida con el último commit de la rama `main` para asegurar que las correcciones están aplicadas.
