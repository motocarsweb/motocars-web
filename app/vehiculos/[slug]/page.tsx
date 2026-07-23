import Link from "next/link";
import { obtenerVehiculos } from "@/lib/supabase-vehicles";

export default async function AdminVehiculosPage() {
  const vehiculos = await obtenerVehiculos();

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Vehículos</h1>

          <p style={{ color: "#666", marginTop: 8 }}>
            Administrá el stock publicado en MotoCars.
          </p>
        </div>

        <Link
          href="/admin/vehiculos/nuevo"
          style={{
            background: "#1f2937",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Agregar vehículo
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          overflowX: "auto",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
              <th style={{ padding: 16 }}>Vehículo</th>
              <th style={{ padding: 16 }}>Año</th>
              <th style={{ padding: 16 }}>Kilómetros</th>
              <th style={{ padding: 16 }}>Precio</th>
              <th style={{ padding: 16 }}>Estado</th>
              <th style={{ padding: 16 }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {vehiculos.map((vehiculo) => (
              <tr
                key={vehiculo.id}
                style={{ borderTop: "1px solid #e5e7eb" }}
              >
                <td style={{ padding: 16 }}>
                  <strong>
                    {vehiculo.marca} {vehiculo.modelo}
                  </strong>

                  {vehiculo.version && (
                    <div style={{ color: "#666", marginTop: 4 }}>
                      {vehiculo.version}
                    </div>
                  )}
                </td>

                <td style={{ padding: 16 }}>
                  {vehiculo.anio ?? "Sin informar"}
                </td>

                <td style={{ padding: 16 }}>
                  {vehiculo.kilometros !== null
                    ? `${new Intl.NumberFormat("es-AR").format(
                        vehiculo.kilometros
                      )} km`
                    : "Sin informar"}
                </td>

                <td style={{ padding: 16 }}>
                  {vehiculo.precio !== null
                    ? new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      }).format(vehiculo.precio)
                    : "Consultar"}
                </td>

                <td style={{ padding: 16 }}>
                  {vehiculo.estado || "Disponible"}
                </td>

                <td style={{ padding: 16 }}>
                  <Link
                    href={`/admin/vehiculos/${vehiculo.id}`}
                    style={{
                      color: "#1d4ed8",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vehiculos.length === 0 && (
          <p style={{ padding: 30, textAlign: "center", color: "#666" }}>
            Todavía no hay vehículos cargados.
          </p>
        )}
      </div>
    </section>
  );
}