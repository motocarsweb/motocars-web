$ErrorActionPreference = "Stop"

$projectRoot = "C:\MotoCars-Web"
$vehicleFormPath = Join-Path $projectRoot "componentes\admin\vehiculos\VehicleForm.tsx"

if (-not (Test-Path $vehicleFormPath)) {
    throw "No se encontró el archivo: $vehicleFormPath"
}

$content = Get-Content -Raw -Encoding UTF8 $vehicleFormPath

$oldBlock = @'
  useEffect(() => {
    if (!duplicarId) {
      return;
    }

    let componenteActivo = true;
'@

$newBlock = @'
  useEffect(() => {
    if (!duplicarId) {
      return;
    }

    const vehiculoIdDuplicado = duplicarId;
    let componenteActivo = true;
'@

$count1 = ([regex]::Matches($content, [regex]::Escape($oldBlock))).Count
if ($count1 -ne 1) {
    throw "No se encontró el bloque esperado para declarar vehiculoIdDuplicado. No se aplicaron cambios."
}

$content = $content.Replace($oldBlock, $newBlock)

$oldCall = 'const vehiculo = await obtenerVehiculoEditable(duplicarId);'
$newCall = 'const vehiculo = await obtenerVehiculoEditable(vehiculoIdDuplicado);'

$count2 = ([regex]::Matches($content, [regex]::Escape($oldCall))).Count
if ($count2 -ne 1) {
    throw "No se encontró la llamada esperada a obtenerVehiculoEditable. No se aplicaron cambios."
}

$content = $content.Replace($oldCall, $newCall)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$vehicleFormPath.backup-typefix-$timestamp"
Copy-Item $vehicleFormPath $backupPath

Set-Content -Path $vehicleFormPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Corrección TypeScript aplicada correctamente." -ForegroundColor Green
Write-Host "Respaldo creado en:" -ForegroundColor Yellow
Write-Host $backupPath
Write-Host ""
Write-Host "Ahora ejecutá: npm run build" -ForegroundColor Cyan
