"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <section>
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            color: "#111827",
          }}
        >
          Dashboard
        </h1>

        <p
          style={{
            marginTop: "8px",
            marginBottom: 0,
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          Panel principal de administración de MotoCars.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <Link
          href="/admin/vehiculos"
          style={{
            display: "block",
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            color: "#111827",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              marginBottom: "12px",
            }}
          >
            🚗
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "20px",
            }}
          >
            Vehículos
          </h2>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            Administrar el stock publicado de autos y motos.
          </p>
        </Link>

        <Link
          href="/admin/vehiculos/nuevo"
          style={{
            display: "block",
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            color: "#111827",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              marginBottom: "12px",
            }}
          >
            ➕
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "20px",
            }}
          >
            Agregar vehículo
          </h2>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            Cargar un nuevo vehículo en el sistema.
          </p>
        </Link>

        <Link
          href="/admin/configuracion"
          style={{
            display: "block",
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            color: "#111827",
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              marginBottom: "12px",
            }}
          >
            ⚙️
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: "20px",
            }}
          >
            Configuración
          </h2>

          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            Editar los datos comerciales y generales de MotoCars.
          </p>
        </Link>
      </div>
    </section>
  );
}