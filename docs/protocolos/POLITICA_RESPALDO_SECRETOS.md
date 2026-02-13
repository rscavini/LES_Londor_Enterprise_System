# Política de Respaldo y Gestión de Secretos (LES)

## 1. Identificación de Activos Críticos

Los siguientes archivos son vitales para el funcionamiento del sistema pero están excluidos del control de versiones (GitHub) por seguridad:

- `.env`: Variables de entorno y configuración local.
- `service-account.json`: Llave de acceso maestro a Firebase Admin SDK.

## 2. Estrategia de Respaldo 3-2-1

Para garantizar la recuperación ante desastres, se aplica el estándar 3-2-1:

- **3 Copias:** Original local, copia en gestor de secretos (ej. Bitwarden/KeePass), y copia de seguridad comprimida.
- **2 Medios:** Disco local y almacenamiento en la nube cifrado/externo.
- **1 Off-site:** Mantener al menos una copia fuera de la oficina o del hogar físico.

## 3. Protocolo de Ejecución

- **Periodicidad Recomendada:** Semanal o después de cada cambio en los archivos `.env`.
- **Automatización:** Se debe utilizar el script `scripts/backup-secrets.ps1`.
- **Recordatorios:** El script emitirá un aviso si han pasado más de 7 días desde la última ejecución exitosa.

## 4. Recuperación ante Desastres (DRP)

En caso de pérdida total del equipo de desarrollo:

1. Clonar el repositorio desde GitHub.
2. Recuperar el último respaldo de secretos desde el medio externo.
3. Restaurar los archivos `.env` y `service-account.json` en la raíz del proyecto.
4. Ejecutar `npm install` y verificar la conectividad.

---
*Última actualización: 13 de febrero de 2026*
