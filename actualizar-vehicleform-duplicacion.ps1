$ErrorActionPreference = "Stop"

$projectRoot = "C:\MotoCars-Web"
$vehicleFormPath = Join-Path $projectRoot "componentes\admin\vehiculos\VehicleForm.tsx"

if (-not (Test-Path $vehicleFormPath)) {
    throw "No se encontró el archivo: $vehicleFormPath"
}

$content = Get-Content -Raw -Encoding UTF8 $vehicleFormPath

if ($content.Contains("type VehicleFormProps = {") -or $content.Contains("duplicarId?: number;")) {
    throw "VehicleForm.tsx ya parece contener la integración de duplicación. No se aplicaron cambios."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$vehicleFormPath.backup-$timestamp"
Copy-Item $vehicleFormPath $backupPath

function Replace-Once {
    param(
        [string]$Source,
        [string]$Old,
        [string]$New,
        [string]$Description
    )

    $count = ([regex]::Matches($Source, [regex]::Escape($Old))).Count

    if ($count -ne 1) {
        throw "No se pudo aplicar '$Description': se esperó 1 coincidencia y se encontraron $count. Se conserva el respaldo en $backupPath"
    }

    return $Source.Replace($Old, $New)
}

# 1. Importar el servicio de lectura del vehículo original.
$content = Replace-Once `
    -Source $content `
    -Old 'import { subirImagenesVehiculo } from "@/lib/storage";' `
    -New @'
import { subirImagenesVehiculo } from "@/lib/storage";
import { obtenerVehiculoEditable } from "@/lib/service/obtenerVehiculoEditable";
'@ `
    -Description "importar obtenerVehiculoEditable"

# 2. Declarar la prop duplicarId.
$content = Replace-Once `
    -Source $content `
    -Old 'export default function VehicleForm() {' `
    -New @'
type VehicleFormProps = {
  duplicarId?: number;
};

export default function VehicleForm({
  duplicarId,
}: VehicleFormProps) {
'@ `
    -Description "declarar VehicleFormProps"

# 3. Agregar estado de carga del duplicado.
$content = Replace-Once `
    -Source $content `
    -Old '  const [cargandoModelos, setCargandoModelos] = useState(false);' `
    -New @'
  const [cargandoModelos, setCargandoModelos] = useState(false);
  const [cargandoDuplicado, setCargandoDuplicado] = useState(false);
'@ `
    -Description "agregar cargandoDuplicado"

# 4. Insertar la carga automática del vehículo original.
$effectNeedle = @'
  }, []);

  function actualizar(
'@

$effectReplacement = @'
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

          // Estos datos identifican una unidad física y no deben duplicarse.
          dominio: "",
          numero_chasis: "",
          numero_motor: "",

          // La copia queda sin destacar ni publicar hasta que sea revisada.
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

$content = Replace-Once `
    -Source $content `
    -Old $effectNeedle `
    -New $effectReplacement `
    -Description "insertar carga del vehículo duplicado"

# 5. Mostrar claramente el modo duplicación.
$content = Replace-Once `
    -Source $content `
    -Old '        <h1 style={{ margin: 0 }}>Nuevo vehículo</h1>' `
    -New @'
        <h1 style={{ margin: 0 }}>
          {duplicarId ? "Duplicar vehículo" : "Nuevo vehículo"}
        </h1>
'@ `
    -Description "actualizar título"

$content = Replace-Once `
    -Source $content `
    -Old '          Cargá una unidad para incorporarla al stock de MotoCars.' `
    -New @'
          {cargandoDuplicado
            ? "Cargando datos del vehículo original..."
            : duplicarId
              ? "Revisá los datos copiados y completá los identificadores de la nueva unidad."
              : "Cargá una unidad para incorporarla al stock de MotoCars."}
'@ `
    -Description "actualizar descripción"

# 6. Deshabilitar el guardado mientras se carga la copia.
$content = Replace-Once `
    -Source $content `
    -Old '          disabled={guardando || cargandoCatalogos}' `
    -New '          disabled={guardando || cargandoCatalogos || cargandoDuplicado}' `
    -Description "deshabilitar botón durante la carga"

$content = Replace-Once `
    -Source $content `
    -Old @'
              guardando || cargandoCatalogos
                ? "not-allowed"
                : "pointer",
'@ `
    -New @'
              guardando || cargandoCatalogos || cargandoDuplicado
                ? "not-allowed"
                : "pointer",
'@ `
    -Description "actualizar cursor del botón"

$content = Replace-Once `
    -Source $content `
    -Old @'
              guardando || cargandoCatalogos ? 0.7 : 1,
'@ `
    -New @'
              guardando || cargandoCatalogos || cargandoDuplicado
                ? 0.7
                : 1,
'@ `
    -Description "actualizar opacidad del botón"

Set-Content -Path $vehicleFormPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "VehicleForm.tsx actualizado correctamente." -ForegroundColor Green
Write-Host "Respaldo creado en:" -ForegroundColor Yellow
Write-Host $backupPath
Write-Host ""
Write-Host "Ahora ejecutá: npm run build" -ForegroundColor Cyan
