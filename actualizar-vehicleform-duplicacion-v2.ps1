$ErrorActionPreference = "Stop"

$projectRoot = "C:\MotoCars-Web"
$vehicleFormPath = Join-Path $projectRoot "componentes\admin\vehiculos\VehicleForm.tsx"

if (-not (Test-Path $vehicleFormPath)) {
    throw "No se encontró el archivo: $vehicleFormPath"
}

$content = Get-Content -Raw -Encoding UTF8 $vehicleFormPath

if ($content -match 'type\s+VehicleFormProps\s*=') {
    throw "VehicleForm.tsx ya contiene VehicleFormProps. No se aplicaron cambios."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$vehicleFormPath.backup-$timestamp"
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
        [System.Text.RegularExpressions.RegexOptions]::Multiline
    )

    if ($matches.Count -ne 1) {
        throw "No se pudo aplicar '$Description': se esperaba 1 coincidencia y se encontraron $($matches.Count). El archivo original no fue modificado. Respaldo: $backupPath"
    }

    return [regex]::Replace(
        $Source,
        $Pattern,
        $Replacement,
        [System.Text.RegularExpressions.RegexOptions]::Multiline
    )
}

# 1. Importar el servicio.
$content = Replace-RegexOnce `
    -Source $content `
    -Pattern 'import \{ subirImagenesVehiculo \} from "@/lib/storage";' `
    -Replacement @'
import { subirImagenesVehiculo } from "@/lib/storage";
import { obtenerVehiculoEditable } from "@/lib/service/obtenerVehiculoEditable";
'@ `
    -Description "importar obtenerVehiculoEditable"

# 2. Agregar la prop duplicarId.
$content = Replace-RegexOnce `
    -Source $content `
    -Pattern 'export default function VehicleForm\(\) \{' `
    -Replacement @'
type VehicleFormProps = {
  duplicarId?: number;
};

export default function VehicleForm({
  duplicarId,
}: VehicleFormProps) {
'@ `
    -Description "declarar VehicleFormProps"

# 3. Estado de carga del duplicado.
$content = Replace-RegexOnce `
    -Source $content `
    -Pattern '  const \[cargandoModelos, setCargandoModelos\] = useState\(false\);' `
    -Replacement @'
  const [cargandoModelos, setCargandoModelos] = useState(false);
  const [cargandoDuplicado, setCargandoDuplicado] = useState(false);
'@ `
    -Description "agregar cargandoDuplicado"

# 4. Insertar efecto de duplicación después del primer useEffect.
$duplicationEffect = @'
  }, []);

  useEffect(() => {
    if (!duplicarId) {
      return;
    }

    let componenteActivo = true;

    async function cargarVehiculoParaDuplicar() {
      setCargandoDuplicado(true);

      try {
        const vehiculo = await obtenerVehiculoEditable(duplicarId);

        if (!componenteActivo) {
          return;
        }

        const marcaId = String(vehiculo.marca_id ?? "");

        if (marcaId) {
          await cargarModelosPorMarca(marcaId);
        }

        if (!componenteActivo) {
          return;
        }

        setModeloNuevo("");
        setAgregandoModelo(false);
        setImagenes([]);

        setForm({
          marca: String(vehiculo.marca ?? ""),
          modelo: String(vehiculo.modelo ?? ""),
          version: String(vehiculo.version ?? ""),
          combustible: String(vehiculo.combustible ?? ""),
          transmision: String(vehiculo.transmision ?? ""),
          tipo: String(vehiculo.tipo ?? ""),

          marca_id: marcaId,
          modelo_id: String(vehiculo.modelo_id ?? ""),
          version_id: String(vehiculo.version_id ?? ""),
          tipo_vehiculo_id: String(vehiculo.tipo_vehiculo_id ?? ""),
          combustible_id: String(vehiculo.combustible_id ?? ""),
          transmision_id: String(vehiculo.transmision_id ?? ""),
          traccion_id: String(vehiculo.traccion_id ?? ""),
          tipo_ingreso_id: String(vehiculo.tipo_ingreso_id ?? ""),

          anio: String(vehiculo.anio ?? ""),
          precio: String(vehiculo.precio ?? ""),
          precio_compra: String(vehiculo.precio_compra ?? ""),
          kilometros: String(vehiculo.kilometros ?? ""),

          color: String(vehiculo.color ?? ""),
          estado: String(vehiculo.estado ?? "Usado"),
          condicion: String(vehiculo.condicion ?? "usado"),

          dominio: "",
          numero_chasis: "",
          numero_motor: "",

          destacado: false,
          publicado: false,

          descripcion: String(vehiculo.descripcion ?? ""),
          observaciones_internas: String(
            vehiculo.observaciones_internas ?? ""
          ),
        });
      } catch (error) {
        console.error("Error al cargar el vehículo para duplicar:", error);

        alert(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el vehículo para duplicar."
        );
      } finally {
        if (componenteActivo) {
          setCargandoDuplicado(false);
        }
      }
    }

    cargarVehiculoParaDuplicar();

    return () => {
      componenteActivo = false;
    };
  }, [duplicarId]);

  function actualizar(
'@

$content = Replace-RegexOnce `
    -Source $content `
    -Pattern '  \}, \[\]\);\r?\n\r?\n  function actualizar\(' `
    -Replacement $duplicationEffect `
    -Description "insertar carga del vehículo duplicado"

# 5. Título.
$content = Replace-RegexOnce `
    -Source $content `
    -Pattern '        <h1 style=\{\{ margin: 0 \}\}>Nuevo vehículo</h1>' `
    -Replacement @'
        <h1 style={{ margin: 0 }}>
          {duplicarId ? "Duplicar vehículo" : "Nuevo vehículo"}
        </h1>
'@ `
    -Description "actualizar título"

# 6. Texto introductorio.
$content = Replace-RegexOnce `
    -Source $content `
    -Pattern '          Cargá una unidad para incorporarla al stock de MotoCars\.' `
    -Replacement @'
          {cargandoDuplicado
            ? "Cargando datos del vehículo original..."
            : duplicarId
              ? "Revisá los datos copiados y completá los identificadores de la nueva unidad."
              : "Cargá una unidad para incorporarla al stock de MotoCars."}
'@ `
    -Description "actualizar descripción"

# 7. Botón durante carga.
$content = Replace-RegexOnce `
    -Source $content `
    -Pattern 'disabled=\{guardando \|\| cargandoCatalogos\}' `
    -Replacement 'disabled={guardando || cargandoCatalogos || cargandoDuplicado}' `
    -Description "deshabilitar botón durante la carga"

$content = Replace-RegexOnce `
    -Source $content `
    -Pattern 'guardando \|\| cargandoCatalogos\r?\n\s+\? "not-allowed"' `
    -Replacement @'
guardando || cargandoCatalogos || cargandoDuplicado
                ? "not-allowed"
'@ `
    -Description "actualizar cursor"

$content = Replace-RegexOnce `
    -Source $content `
    -Pattern 'guardando \|\| cargandoCatalogos \? 0\.7 : 1' `
    -Replacement @'
guardando || cargandoCatalogos || cargandoDuplicado
                ? 0.7
                : 1
'@ `
    -Description "actualizar opacidad"

Set-Content -Path $vehicleFormPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "VehicleForm.tsx actualizado correctamente." -ForegroundColor Green
Write-Host "Respaldo creado en:" -ForegroundColor Yellow
Write-Host $backupPath
Write-Host ""
Write-Host "Ahora ejecutá: npm run build" -ForegroundColor Cyan
