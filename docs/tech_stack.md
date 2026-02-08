# Stack Tecnológico: Londor Enterprise System (LES)

Este documento proporciona una visión detallada de las tecnologías y herramientas que componen el núcleo del **LES**, diseñado para garantizar la escalabilidad, la tipificación fuerte y un despliegue optimizado.

## 1. Núcleo del Frontend

- **Framework**: [React 18](https://react.dev/) (Functional Components + Hooks).
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode).
- **Build Tool**: [Vite 5](https://vitejs.dev/) (HMR rápido y optimización de assets).
- **Icons**: [Lucide React](https://lucide.dev/) (Iconografía ligera y escalable).

## 2. Backend & Persistencia (Firebase)

- **Base de Datos**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (Base de datos NoSQL documental).
- **Autenticación**: [Firebase Auth](https://firebase.google.com/docs/auth) (Utilizando `signInAnonymously` para el acceso inicial).
- **SDK**: Firebase JS SDK v12+.

## 3. Infraestructura y Runtime

- **Plataforma de Hosting**: [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).
- **Runtime**: Node.js (Ambiente gestionado).
- **Servidor de Producción**: [Express](https://expressjs.com/) (Utilizado para servir los archivos estáticos y manejar el ruteo de la SPA).
- **Control de Versiones**: GitHub (Integración nativa con App Hosting para CI/CD).

## 4. Gestión de Estado y Datos (Modelos)

La aplicación utiliza una arquitectura modular donde cada módulo (`caja`, `inventario`) tiene sus propios:

- **Models**: Interfaces de TypeScript que definen la estructura de Firestore.
- **Services**: Capas de abstracción para interactuar con Firestore utilizando el alias `@/firebase`.

## 5. Convenciones de Desarrollo

- **Alias de Rutas**:
  - `@/`: Apunta a `src/`.
  - `@modules/`: Apunta a `modules/`.
- **Firebase Initialization**: Se debe importar `db` y `auth` siempre desde `@/firebase` para evitar inicializaciones duplicadas.
- **SPA Routing**: El servidor de producción redirige todas las peticiones no estáticas (`/*all`) al `index.html` para que el router de React tome el control.

## 6. Scripts Clave (`package.json`)

- `npm run dev`: Servidor de desarrollo local.
- `npm run build`: Compilación de TypeScript (`tsc`) + generación de assets con Vite.
- `npm run start`: Ejecución del servidor de producción (levantado por App Hosting).
