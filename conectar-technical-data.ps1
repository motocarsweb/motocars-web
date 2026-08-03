$ErrorActionPreference = "Stop"

$projectRoot = "C:\MotoCars-Web"
$vehicleFormPath = Join-Path $projectRoot "componentes\admin\vehiculos\VehicleForm.tsx"

if (-not (Test-Path $vehicleFormPath)) {
    throw "No se encontró el archivo: $vehicleFormPath"
}

$content = Get-Content -Raw -Encoding UTF8 $vehicleFormPath
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$vehicleFormPath.backup-technical-$timestamp"
Copy-Item $vehicleFormPath $backupPath

$basicImport = 'import BasicData from "./vehicle-form/BasicData";'
$technicalImport = 'import TechnicalData from "./vehicle-form/TechnicalData";'

if ($content.Contains($technicalImport)) {
    throw "TechnicalData ya está importado. No se aplicaron cambios."
}

if (-not $content.Contains($basicImport)) {
    throw "No se encontró el import de BasicData. No se aplicaron cambios. Respaldo: $backupPath"
}

$content = $content.Replace(
    $basicImport,
    "$basicImport`r`n$technicalImport"
)

$pattern = '(?s)        <input\r?\n          type="number"\r?\n          name="anio".*?        <input\r?\n          name="color"\r?\n          placeholder="Color"\r?\n          value=\{form\.color\}\r?\n          onChange=\{actualizar\}\r?\n        />'

$matches = [regex]::Matches($content, $pattern)

if ($matches.Count -ne 1) {
    throw "No se encontró exactamente un bloque técnico para reemplazar. Se encontraron $($matches.Count). No se guardaron cambios. Respaldo: $backupPath"
}

$replacement = @'
        <TechnicalData
          form={form}
          combustibles={combustibles}
          transmisiones={transmisiones}
          tracciones={tracciones}
          cargandoCatalogos={cargandoCatalogos}
          onChange={actualizar}
          onCombustibleChange={actualizarCombustible}
          onTransmisionChange={actualizarTransmision}
        />
'@

$content = [regex]::Replace($content, $pattern, $replacement)

Set-Content -Path $vehicleFormPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "TechnicalData conectado correctamente." -ForegroundColor Green
Write-Host "Respaldo creado en:" -ForegroundColor Yellow
Write-Host $backupPath
Write-Host ""
Write-Host "Ahora ejecutá: npm run build" -ForegroundColor Cyan
