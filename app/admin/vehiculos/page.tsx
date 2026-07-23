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
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "30px" }}>Vehículos</h1>

          <p style={{ marginTop: "8px", color: "#6b7280" }}>
            Administrá el stock publicado en MotoCars.
          </p>
        </div>

        <Link
          href="/admin/vehiculos/nuevo"
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            backgroundColor: "#111827",
            color: "white",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          + Nuevo vehículo
        </Link>
      </div>

      {vehiculos.length === 0 ? (
        <div
          style={{
            padding: "30px",
            borderRadius: "10px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
          }}
        >
          No hay vehículos cargados.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: "10px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                <th style={encabezado}>Vehículo</th>
                <th style={encabezado}>Año</th>
                <th style={encabezado}>Kilómetros</th>
                <th style={encabezado}>Precio</th>
                <th style={encabezado}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {vehiculos.map((vehiculo) => (
                <tr
                  key={vehiculo.id}
                  style={{ borderTop: "1px solid #e5e7eb" }}
                >
                  <td style={celda}>
  <strong>
    {vehiculo.marca} {vehiculo.modelo}
  </strong>
</td>

<td style={celda}>{vehiculo.anio ?? "-"}</td>

<td style={celda}>
  {vehiculo.kilometros !== null
    ? `${vehiculo.kilometros.toLocaleString("es-AR")} km`
    : "-"}
</td>

<td style={celda}>
  {vehiculo.precio !== null
    ? `$ ${vehiculo.precio.toLocaleString("es-AR")}`
    : "Consultar"}
</td>

                  <td style={celda}>
                    <Link
                      href={`/admin/vehiculos/${vehiculo.id}`}
                      style={{
                        color: "#111827",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const encabezado = {
  padding: "16px",
  fontSize: "14px",
  color: "#374151",
};

const celda = {
  padding: "16px",
  fontSize: "15px",
  color: "#111827",
};