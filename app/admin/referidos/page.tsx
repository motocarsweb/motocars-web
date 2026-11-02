import { redirect } from "next/navigation";
import { obtenerPerfilAcceso } from "@/lib/permisos-acceso";

export default async function ReferidosPage() {
  const perfil = await obtenerPerfilAcceso();

  if (!perfil) redirect("/admin/login");

  return (
    <section>
      <h1 style={{ margin: 0, color: "#111827", fontSize: 32 }}>
        Referidos
      </h1>
      <p style={{ color: "#6b7280", marginTop: 12 }}>
        {perfil.rol === "administrador"
          ? "Panel de seguimiento y administración de referidos de MotoCars."
          : `Bienvenido, ${perfil.nombre}. Este es tu panel de referido de MotoCars.`}
      </p>
      <div
        style={{
          background: "#ffffff",
          borderRadius: 12,
          padding: 24,
          marginTop: 24,
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 19 }}>Estadísticas</h2>
        <p style={{ marginBottom: 0, color: "#6b7280" }}>
          Las visitas, los clics de WhatsApp y el ranking estarán disponibles
          cuando se habilite el registro de actividad de los referidos.
        </p>
      </div>
    </section>
  );
}
