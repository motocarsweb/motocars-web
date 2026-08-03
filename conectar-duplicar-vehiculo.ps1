$ErrorActionPreference = "Stop"

$projectRoot = "C:\MotoCars-Web"
$vehicleFormPath = Join-Path $projectRoot "componentes\admin\vehiculos\VehicleForm.tsx"

if (-not (Test-Path $vehicleFormPath)) {
    throw "No se encontró el archivo: $vehicleFormPath"
}

$content = Get-Content -Raw -Encoding UTF8 $vehicleFormPath
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$vehicleFormPath.backup-duplicar-service-$timestamp"
Copy-Item $vehicleFormPath $backupPath

# Reemplazar import anterior por el nuevo servicio.
$oldImport = 'import { obtenerVehiculoEditable } from "@/lib/service/obtenerVehiculoEditable";'
$newImport = 'import { duplicarVehiculo } from "@/lib/service/duplicarVehiculo";'

if (-not $content.Contains($oldImport)) {
    throw "No se encontró el import anterior. No se aplicaron cambios. Respaldo: $backupPath"
}

$content = $content.Replace($oldImport, $newImport)

# Reemplazar solamente el bloque interno que armaba manualmente los datos duplicados.
$pattern = '(?s)        const vehiculo = await obtenerVehiculoEditable\(vehiculoIdDuplicado\);.*?        setForm\(\{.*?        \}\);'

$matches = [regex]::Matches($content, $pattern)

if ($matches.Count -ne 1) {
    throw "No se encontró exactamente un bloque de duplicación para reemplazar. Se encontraron $($matches.Count). No se guardaron cambios. Respaldo: $backupPath"
}

$replacement = @'
        const datosDuplicados = await duplicarVehiculo(
          vehiculoIdDuplicado
        );

        if (!componenteActivo) {
          return;
        }

        if (datosDuplicados.marca_id) {
          await cargarModelosPorMarca(
            datosDuplicados.marca_id
          );
        }

        if (!componenteActivo) {
          return;
        }

        setModeloNuevo("");
        setAgregandoModelo(false);
        setImagenes([]);
        setForm(datosDuplicados);
'@

$content = [regex]::Replace($content, $pattern, $replacement)

Set-Content -Path $vehicleFormPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "VehicleForm conectado con duplicarVehiculo correctamente." -ForegroundColor Green
Write-Host "Respaldo creado en:" -ForegroundColor Yellow
Write-Host $backupPath
Write-Host ""
Write-Host "Ahora ejecutá: npm run build" -ForegroundColor Cyan
