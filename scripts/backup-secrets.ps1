# Script de Respaldo Inteligente de Secretos - LES
# Detecta archivos ignorados por Git (secretos) y crea un ZIP de respaldo.

$BackupDir = Join-Path $PSScriptRoot "..\backups"
$LastCheckFile = Join-Path $PSScriptRoot "..\.last_backup_check"
$CurrentDate = Get-Date

# 1. Control de Recordatorio (7 días)
if (Test-Path $LastCheckFile) {
    $LastRun = Get-Content $LastCheckFile | Get-Date
    $DaysSince = ($CurrentDate - $LastRun).Days
    if ($DaysSince -ge 7) {
        Write-Host "====================================================" -ForegroundColor Yellow
        Write-Host "AVISO: Han pasado $DaysSince días desde tu último respaldo." -ForegroundColor Yellow
        Write-Host "Se recomienda ejecutar este script para proteger tus secretos." -ForegroundColor Yellow
        Write-Host "====================================================" -ForegroundColor Yellow
    }
}

# 2. Detección Inteligente de Archivos a Respaldar
Write-Host "Buscando archivos críticos ignorados..." -ForegroundColor Cyan

# Obtenemos archivos ignorados por Git
$IgnoredFiles = git status --ignored --porcelain | Where-Object { $_ -like '!! *' } | ForEach-Object { $_.Substring(3) }

# Filtramos para quedarnos solo con lo importante (no node_modules, dist, etc)
$ToBackup = $IgnoredFiles | Where-Object { 
    ($_ -like ".env*") -or 
    ($_ -like "*.json" -and $_ -notlike "package*.json") -or
    ($_ -like "*.key")
} | Where-Object { Test-Path $_ -PathType Leaf }

if ($null -eq $ToBackup) {
    Write-Host "No se encontraron nuevos secretos para respaldar." -ForegroundColor Green
    exit
}

Write-Host "Archivos seleccionados para respaldo:"
$ToBackup | ForEach-Object { Write-Host " - $_" -ForegroundColor Gray }

# 3. Crear Directorio de Respaldo
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# 4. Comprimir Archivos
$Timestamp = $CurrentDate.ToString("yyyyMMdd_HHmm")
$ZipName = "LES_Secrets_Backup_$Timestamp.zip"
$ZipPath = Join-Path $BackupDir $ZipName

Compress-Archive -Path $ToBackup -DestinationPath $ZipPath -Force

Write-Host "`nRespaldo creado con éxito: $ZipPath" -ForegroundColor Green
Write-Host "RECUERDA: Mueve este archivo a un lugar seguro (fuera de este ordenador)." -ForegroundColor Yellow

# 5. Actualizar Fecha de Control
$CurrentDate.ToString("o") | Out-File $LastCheckFile -Force
