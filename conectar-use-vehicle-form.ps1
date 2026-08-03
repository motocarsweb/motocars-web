$ErrorActionPreference = "Stop"

$projectRoot = "C:\MotoCars-Web"
$vehicleFormPath = Join-Path $projectRoot "componentes\admin\vehiculos\VehicleForm.tsx"

if (-not (Test-Path $vehicleFormPath)) {
    throw "No se encontró el archivo: $vehicleFormPath"
}

$content = Get-Content -Raw -Encoding UTF8 $vehicleFormPath

$hookImport = 'import { useVehicleForm } from "./hooks/useVehicleForm";'

if ($content.Contains($hookImport)) {
    throw "VehicleForm.tsx ya parece estar conectado con useVehicleForm. No se aplicaron cambios."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$vehicleFormPath.backup-hook-$timestamp"
Copy-Item $vehicleFormPath $backupPath

function Replace-RegexOnce {
    param(
        [string]$Source,
        [string]$Pattern,
        [string]$Replacement,
        [string]$Description
    )

    $matches = [regex]::Matches(
        $Source,
        $Pattern,
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )

    if ($matches.Count -ne 1) {
        throw "No se pudo aplicar '$Description': se esperaba 1 coincidencia y se encontraron $($matches.Count). El archivo original no fue modificado. Respaldo: $backupPath"
    }

    return [regex]::Replace(
        $Source,
        $Pattern,
        $Replacement,
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
}

# 1. Agregar el import del hook debajo de IdentitySection.
$identityImport = 'import IdentitySection from "./vehicle-form/IdentitySection";'

if (-not $content.Contains($identityImport)) {
    throw "No se encontró el import de IdentitySection. No se aplicaron cambios. Respaldo: $backupPath"
}

$content = $content.Replace(
    $identityImport,
    "$identityImport`r`n$hookImport"
)

# 2. Reemplazar el estado local completo del formulario por el hook.
$formStatePattern = '  const \[form, setForm\] = useState\(\{.*?\r?\n  \}\);\r?\n'
$formStateReplacement = @'
  const {
    form,
    setForm,
    actualizar,
  } = useVehicleForm();

'@

$content = Replace-RegexOnce `
    -Source $content `
    -Pattern $formStatePattern `
    -Replacement $formStateReplacement `
    -Description "reemplazar el estado local form"

# 3. Eliminar la función actualizar local, porque ahora viene del hook.
$actualizarPattern = '  function actualizar\(\r?\n    event: React\.ChangeEvent<.*?\r?\n  \}\r?\n\r?\n  async function cargarModelosPorMarca'
$actualizarReplacement = '  async function cargarModelosPorMarca'

$content = Replace-RegexOnce `
    -Source $content `
    -Pattern $actualizarPattern `
    -Replacement $actualizarReplacement `
    -Description "eliminar la función actualizar local"

Set-Content -Path $vehicleFormPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "VehicleForm conectado con useVehicleForm correctamente." -ForegroundColor Green
Write-Host "Respaldo creado en:" -ForegroundColor Yellow
Write-Host $backupPath
Write-Host ""
Write-Host "Ahora ejecutá: npm run build" -ForegroundColor Cyan
