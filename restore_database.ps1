# Script para restaurar la base de datos de Supabase
# Autor: Asistente de IA
# Fecha: $(Get-Date)

Write-Host "=== RESTAURACIÓN DE BASE DE DATOS SUPABASE ===" -ForegroundColor Green
Write-Host ""

# Configuración de la base de datos
$DB_URL = "postgresql://postgres.wtcwtfcesapingokhmxk:564783921%40Pruebas@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
$BACKUP_FILE = "db_cluster-21-03-2025@15-00-53.backup/db_cluster-21-03-2025@15-00-53.backup"

# Verificar que el archivo de backup existe
if (-not (Test-Path $BACKUP_FILE)) {
    Write-Host "ERROR: No se encontró el archivo de backup en: $BACKUP_FILE" -ForegroundColor Red
    Write-Host "Asegúrate de que el archivo esté en la ubicación correcta." -ForegroundColor Yellow
    exit 1
}

Write-Host "Archivo de backup encontrado: $BACKUP_FILE" -ForegroundColor Green
Write-Host ""

# Confirmar antes de proceder
Write-Host "ADVERTENCIA: Esta operación sobrescribirá completamente la base de datos actual." -ForegroundColor Yellow
Write-Host "¿Estás seguro de que quieres continuar? (s/N): " -NoNewline
$confirmation = Read-Host

if ($confirmation -ne "s" -and $confirmation -ne "S") {
    Write-Host "Restauración cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Iniciando restauración..." -ForegroundColor Green

try {
    # Comando para restaurar la base de datos
    $restoreCommand = "psql `"$DB_URL`" -f `"$BACKUP_FILE`""
    
    Write-Host "Ejecutando: $restoreCommand" -ForegroundColor Cyan
    Write-Host ""
    
    # Ejecutar el comando de restauración
    Invoke-Expression $restoreCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host "La base de datos ha sido restaurada desde el backup." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ ERROR EN LA RESTAURACIÓN" -ForegroundColor Red
        Write-Host "Código de salida: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Revisa los mensajes de error anteriores." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalles del error: $($_.Exception)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== FIN DEL SCRIPT ===" -ForegroundColor Green 