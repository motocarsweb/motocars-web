import Link from "next/link";
import { obtenerVehiculos } from "@/lib/supabase-vehicles";

type AdminVehiculosPageProps = {
  searchParams: Promise<{
    buscar?: string;
  }>;
};

function formatearPrecio(precio: number | null | undefined) {
  if (precio === null || precio === undefined) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatearKilometros(
  kilometros: number | null | undefined
) {
  if (kilometros === null || kilometros === undefined) {
    return "Sin informar";
  }

  return `${new Intl.NumberFormat("es-AR").format(
    kilometros
  )} km`;
}

export default async function AdminVehiculosPage({
  searchParams,
}: AdminVehiculosPageProps) {
  const parametros = await searchParams;
  const busqueda = parametros.buscar?.trim().toLowerCase() ?? "";

  const vehiculos = await obtenerVehiculos();

  const vehiculosFiltrados = vehiculos.filter((vehiculo) => {
    if (!busqueda) {
      return true;
    }

    const contenido = [
      vehiculo.marca,
      vehiculo.modelo,
      vehiculo.version,
      vehiculo.anio,
      vehiculo.estado,
    ]
      .filter(
        (valor) =>
          valor !== null &&
          valor !== undefined &&
          valor !== ""
      )
      .join(" ")
      .toLowerCase();

    return contenido.includes(busqueda);
  });

  return (
    <section style={styles.seccion}>
      <div style={styles.encabezadoPagina}>
        <div>
          <p style={styles.etiquetaSuperior}>
            ADMINISTRACIÓN DE STOCK
          </p>

          <h1 style={styles.titulo}>Vehículos</h1>

          <p style={styles.descripcion}>
            Administrá los vehículos publicados en MotoCars.
          </p>
        </div>

        <Link
          href="/admin/vehiculos/nuevo"
          style={styles.botonNuevo}
        >
          + Nuevo vehículo
        </Link>
      </div>

      <div style={styles.resumenGrid}>
        <div style={styles.resumenCard}>
          <span style={styles.resumenEtiqueta}>
            Total cargados
          </span>

          <strong style={styles.resumenValor}>
            {vehiculos.length}
          </strong>
        </div>

        <div style={styles.resumenCard}>
          <span style={styles.resumenEtiqueta}>
            Resultados visibles
          </span>

          <strong style={styles.resumenValor}>
            {vehiculosFiltrados.length}
          </strong>
        </div>

        <div style={styles.resumenCard}>
          <span style={styles.resumenEtiqueta}>
            Destacados
          </span>

          <strong style={styles.resumenValor}>
            {
              vehiculos.filter(
                (vehiculo) => vehiculo.destacado
              ).length
            }
          </strong>
        </div>
      </div>

      <form method="GET" style={styles.buscador}>
        <div style={styles.buscadorContenido}>
          <label htmlFor="buscar" style={styles.buscadorLabel}>
            Buscar vehículo
          </label>

          <input
            id="buscar"
            name="buscar"
            type="search"
            defaultValue={parametros.buscar ?? ""}
            placeholder="Marca, modelo, versión, año o estado"
            style={styles.buscadorInput}
          />
        </div>

        <button type="submit" style={styles.botonBuscar}>
          Buscar
        </button>

        {busqueda && (
          <Link
            href="/admin/vehiculos"
            style={styles.botonLimpiar}
          >
            Limpiar
          </Link>
        )}
      </form>

      {vehiculosFiltrados.length === 0 ? (
        <div style={styles.estadoVacio}>
          <strong style={styles.estadoVacioTitulo}>
            {vehiculos.length === 0
              ? "No hay vehículos cargados"
              : "No encontramos resultados"}
          </strong>

          <p style={styles.estadoVacioTexto}>
            {vehiculos.length === 0
              ? "Cargá el primer vehículo para comenzar a administrar el stock."
              : "Probá con otra marca, modelo, versión o año."}
          </p>
        </div>
      ) : (
        <div style={styles.tablaContenedor}>
          <table style={styles.tabla}>
            <thead>
              <tr style={styles.filaEncabezado}>
                <th style={styles.columnaImagen}>Imagen</th>
                <th style={styles.encabezadoTabla}>Vehículo</th>
                <th style={styles.encabezadoTabla}>Datos</th>
                <th style={styles.encabezadoTabla}>Precio</th>
                <th style={styles.encabezadoTabla}>Estado</th>
                <th style={styles.encabezadoAcciones}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {vehiculosFiltrados.map((vehiculo) => {
                const titulo = [
                  vehiculo.marca,
                  vehiculo.modelo,
                ]
                  .filter(Boolean)
                  .join(" ");

                const imagen =
                  vehiculo.imagen_principal?.trim() ||
                  "/images/placeholder-vehicle.jpg";

                const estado =
                  vehiculo.estado?.trim() || "Disponible";

                const vendido =
                  estado.toLowerCase() === "vendido";

                return (
                  <tr
                    key={vehiculo.id}
                    style={styles.filaVehiculo}
                  >
                    <td style={styles.celdaImagen}>
                      <img
                        src={imagen}
                        alt={titulo || "Vehículo"}
                        style={styles.imagenVehiculo}
                      />
                    </td>

                    <td style={styles.celda}>
                      <div style={styles.vehiculoTituloFila}>
                        <strong style={styles.vehiculoTitulo}>
                          {titulo || "Vehículo sin nombre"}
                        </strong>

                        {vehiculo.destacado && (
                          <span style={styles.badgeDestacado}>
                            Destacado
                          </span>
                        )}
                      </div>

                      {vehiculo.version && (
                        <span style={styles.vehiculoVersion}>
                          {vehiculo.version}
                        </span>
                      )}

                      <span style={styles.vehiculoId}>
                        ID #{vehiculo.id}
                      </span>
                    </td>

                    <td style={styles.celda}>
                      <strong style={styles.datoPrincipal}>
                        {vehiculo.anio ?? "Año sin informar"}
                      </strong>

                      <span style={styles.datoSecundario}>
                        {formatearKilometros(
                          vehiculo.kilometros
                        )}
                      </span>
                    </td>

                    <td style={styles.celda}>
                      <strong style={styles.precio}>
                        {formatearPrecio(vehiculo.precio)}
                      </strong>
                    </td>

                    <td style={styles.celda}>
                      <span
                        style={{
                          ...styles.badgeEstado,
                          ...(vendido
                            ? styles.badgeVendido
                            : styles.badgeDisponible),
                        }}
                      >
                        {estado}
                      </span>
                    </td>

                    <td style={styles.celdaAcciones}>
                      <div style={styles.acciones}>
                        <Link
                          href={`/vehiculos/${vehiculo.id}`}
                          target="_blank"
                          style={styles.botonVer}
                        >
                          Ver
                        </Link>

                        <Link
                          href={`/admin/vehiculos/${vehiculo.id}`}
                          style={styles.botonEditar}
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  seccion: {
    width: "100%",
  },

  encabezadoPagina: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "28px",
  },

  etiquetaSuperior: {
    margin: "0 0 8px",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.12em",
  },

  titulo: {
    margin: 0,
    color: "#111827",
    fontSize: "32px",
    lineHeight: 1.15,
  },

  descripcion: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "15px",
  },

  botonNuevo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "0 18px",
    borderRadius: "10px",
    backgroundColor: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(17, 24, 39, 0.14)",
  },

  resumenGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },

  resumenCard: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    padding: "18px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
  },

  resumenEtiqueta: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 600,
  },

  resumenValor: {
    color: "#111827",
    fontSize: "28px",
    lineHeight: 1,
  },

  buscador: {
    display: "flex",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
  },

  buscadorContenido: {
    display: "flex",
    flex: "1 1 320px",
    flexDirection: "column",
    gap: "7px",
  },

  buscadorLabel: {
    color: "#374151",
    fontSize: "13px",
    fontWeight: 700,
  },

  buscadorInput: {
    width: "100%",
    minHeight: "44px",
    padding: "0 14px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: "15px",
  },

  botonBuscar: {
    minHeight: "44px",
    padding: "0 18px",
    border: "none",
    borderRadius: "9px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
  },

  botonLimpiar: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "44px",
    padding: "0 16px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    color: "#374151",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 700,
  },

  estadoVacio: {
    padding: "42px 24px",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },

  estadoVacioTitulo: {
    display: "block",
    marginBottom: "8px",
    color: "#111827",
    fontSize: "18px",
  },

  estadoVacioTexto: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  tablaContenedor: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },

  tabla: {
    width: "100%",
    minWidth: "920px",
    borderCollapse: "collapse",
  },

  filaEncabezado: {
    backgroundColor: "#f8fafc",
    textAlign: "left",
  },

  columnaImagen: {
    width: "112px",
    padding: "14px 16px",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  encabezadoTabla: {
    padding: "14px 16px",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },

  encabezadoAcciones: {
    padding: "14px 16px",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textAlign: "right",
    textTransform: "uppercase",
  },

  filaVehiculo: {
    borderTop: "1px solid #e5e7eb",
  },

  celdaImagen: {
    padding: "14px 16px",
    verticalAlign: "middle",
  },

  imagenVehiculo: {
    display: "block",
    width: "82px",
    height: "58px",
    objectFit: "cover",
    borderRadius: "8px",
    backgroundColor: "#f1f5f9",
  },

  celda: {
    padding: "16px",
    color: "#111827",
    fontSize: "14px",
    verticalAlign: "middle",
  },

  vehiculoTituloFila: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "4px",
  },

  vehiculoTitulo: {
    color: "#111827",
    fontSize: "15px",
  },

  vehiculoVersion: {
    display: "block",
    marginBottom: "4px",
    color: "#475569",
    fontSize: "13px",
  },

  vehiculoId: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
  },

  badgeDestacado: {
    display: "inline-flex",
    padding: "4px 7px",
    borderRadius: "999px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 800,
  },

  datoPrincipal: {
    display: "block",
    marginBottom: "4px",
    color: "#111827",
    fontSize: "14px",
  },

  datoSecundario: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
  },

  precio: {
    color: "#111827",
    fontSize: "15px",
    whiteSpace: "nowrap",
  },

  badgeEstado: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  badgeDisponible: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
  },

  badgeVendido: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
  },

  celdaAcciones: {
    padding: "16px",
    textAlign: "right",
    verticalAlign: "middle",
  },

  acciones: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },

  botonVer: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "36px",
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    color: "#374151",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
  },

  botonEditar: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "36px",
    padding: "0 12px",
    borderRadius: "8px",
    backgroundColor: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 700,
  },
};