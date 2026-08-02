import Link from "next/link";

import VehiclePublishButton from "@/componentes/admin/vehiculos/VehiclePublishButton";
import VehicleFeaturedButton from "./VehicleFeaturedButton";
import type { VehiculoSupabase } from "@/lib/supabase-vehicles";

type VehicleRowProps = {
  vehiculo: VehiculoSupabase;
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

export default function VehicleRow({
  vehiculo,
}: VehicleRowProps) {
  const titulo = [vehiculo.marca, vehiculo.modelo]
    .filter(Boolean)
    .join(" ");

  const imagen =
    vehiculo.imagen_principal?.trim() ||
    "/images/placeholder-vehicle.jpg";

  const estado = vehiculo.estado?.trim() || "Disponible";
  const vendido = estado.toLowerCase() === "vendido";
  const publicado = vehiculo.publicado ?? false;

  return (
    <tr style={styles.filaVehiculo}>
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
          {formatearKilometros(vehiculo.kilometros)}
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

      <td style={styles.celda}>
        <span
          style={{
            ...styles.badgeEstado,
            ...(publicado
              ? styles.badgePublicado
              : styles.badgeOculto),
          }}
        >
          {publicado ? "Publicado" : "Oculto"}
        </span>
      </td>

      <td style={styles.celdaAcciones}>
        <div style={styles.acciones}>
        <VehiclePublishButton
  vehiculoId={vehiculo.id}
  publicado={publicado}
/>

<VehicleFeaturedButton
  vehiculoId={vehiculo.id}
  destacado={vehiculo.destacado ?? false}
/>

<Link
  href={`/vehiculos/${vehiculo.id}`}
            style={styles.botonEditar}
          >
            Editar
          </Link>
        </div>
      </td>
    </tr>
  );
}

const styles: Record<string, React.CSSProperties> = {
  filaVehiculo: {
    borderTop: "1px solid #e5e7eb",
  },

  celdaImagen: {
    padding: "14px 16px",
    verticalAlign: "middle",
  },

  imagenVehiculo: {
    display: "block",
    width: 82,
    height: 58,
    objectFit: "cover",
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },

  celda: {
    padding: 16,
    color: "#111827",
    fontSize: 14,
    verticalAlign: "middle",
  },

  vehiculoTituloFila: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },

  vehiculoTitulo: {
    color: "#111827",
    fontSize: 15,
  },

  vehiculoVersion: {
    display: "block",
    marginBottom: 4,
    color: "#475569",
    fontSize: 13,
  },

  vehiculoId: {
    display: "block",
    color: "#94a3b8",
    fontSize: 12,
  },

  badgeDestacado: {
    display: "inline-flex",
    padding: "4px 7px",
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: 11,
    fontWeight: 800,
  },

  datoPrincipal: {
    display: "block",
    marginBottom: 4,
    color: "#111827",
    fontSize: 14,
  },

  datoSecundario: {
    display: "block",
    color: "#64748b",
    fontSize: 13,
  },

  precio: {
    color: "#111827",
    fontSize: 15,
    whiteSpace: "nowrap",
  },

  badgeEstado: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
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

  badgePublicado: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
  },

  badgeOculto: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },

  celdaAcciones: {
    padding: 16,
    textAlign: "right",
    verticalAlign: "middle",
  },

  acciones: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
  },

  botonVer: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    color: "#374151",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
  },

  botonEditar: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    padding: "0 12px",
    borderRadius: 8,
    backgroundColor: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 700,
  },
};