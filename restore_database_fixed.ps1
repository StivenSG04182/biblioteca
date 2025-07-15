# Script corregido para restaurar la base de datos de Supabase
# Autor: Asistente de IA
# Fecha: $(Get-Date)

Write-Host "=== RESTAURACIÓN DE BASE DE DATOS SUPABASE (CORREGIDO) ===" -ForegroundColor Green
Write-Host ""

# Configuración de la base de datos - probando diferentes formatos
$DB_URL_1 = "postgresql://postgres.rtwoyfnetnlwdimmylaz:564783921biblioteca@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
$DB_URL_2 = "postgresql://postgres.rtwoyfnetnlwdimmylaz:564783921biblioteca@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
$DB_URL_3 = "postgresql://postgres:564783921biblioteca@aws-0-us-east-2.pooler.supabase.com:6543/postgres"

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

# Función para probar conexión
function Test-DBConnection {
    param($url, $name)
    Write-Host "Probando conexión: $name" -ForegroundColor Cyan
    $testCommand = "psql `"$url`" -c `"SELECT 1;`""
    try {
        $result = Invoke-Expression $testCommand 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Conexión exitosa con $name" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Error de conexión con $name" -ForegroundColor Red
            Write-Host "Error: $result" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Excepción con $name`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Probar diferentes URLs de conexión
$workingURL = $null
$urls = @(
    @{url=$DB_URL_1; name="URL Original (puerto 6543)"},
    @{url=$DB_URL_2; name="URL con puerto 5432"},
    @{url=$DB_URL_3; name="URL simplificada"}
)

foreach ($urlConfig in $urls) {
    if (Test-DBConnection $urlConfig.url $urlConfig.name) {
        $workingURL = $urlConfig.url
        break
    }
    Write-Host ""
}

if (-not $workingURL) {
    Write-Host "❌ No se pudo establecer conexión con ninguna URL" -ForegroundColor Red
    Write-Host "Verifica las credenciales y la configuración de Supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Usando URL: $workingURL" -ForegroundColor Green
Write-Host ""

# Intentar restauración con psql (más compatible con archivos SQL)
Write-Host "Intentando restauración con psql..." -ForegroundColor Cyan

try {
    $psqlCommand = "psql `"$workingURL`" -f `"$BACKUP_FILE`""
    Write-Host "Ejecutando: $psqlCommand" -ForegroundColor Cyan
    Write-Host ""
    
    # Ejecutar el comando de restauración
    Invoke-Expression $psqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host "La base de datos ha sido restaurada desde el backup." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ ERROR EN LA RESTAURACIÓN CON PSQL" -ForegroundColor Red
        Write-Host "Código de salida: $LASTEXITCODE" -ForegroundColor Red
        
        # Intentar con pg_restore como alternativa
        Write-Host ""
        Write-Host "Intentando con pg_restore..." -ForegroundColor Yellow
        
        # Extraer componentes de la URL para pg_restore
        if ($workingURL -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
            $user = $matches[1]
            $password = $matches[2]
            $host = $matches[3]
            $port = $matches[4]
            $database = $matches[5]
            
            $pgrestoreCommand = "pg_restore --clean --if-exists --no-owner --no-privileges --verbose --host=$host --port=$port --username=$user --dbname=$database `"$BACKUP_FILE`""
            
            Write-Host "Ejecutando: $pgrestoreCommand" -ForegroundColor Cyan
            Write-Host ""
            
            # Establecer variable de entorno para la contraseña
            $env:PGPASSWORD = $password
            Invoke-Expression $pgrestoreCommand
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ RESTAURACIÓN COMPLETADA CON PGRESTORE" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "❌ AMBOS MÉTODOS FALLARON" -ForegroundColor Red
            }
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalles del error: $($_.Exception)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== FIN DEL SCRIPT ===" -ForegroundColor Green 