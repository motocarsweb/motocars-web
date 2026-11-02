import { redirect } from "next/navigation";
import Link from "next/link";
import { obtenerPerfilAcceso } from "@/lib/permisos-acceso";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const REFERIDOS = [
  { codigo: "david", nombre: "David" },
  { codigo: "nazareno", nombre: "Nazareno" },
  { codigo: "alexander", nombre: "Alexander" },
  { codigo: "cristian", nombre: "Cristian" },
  { codigo: "jorge", nombre: "Jorge" },
  { codigo: "german", nombre: "German" },
];

export default async function ReferidosPage() {
  const perfil = await obtenerPerfilAcceso();
  if (!perfil) redirect("/admin/login");

  const esAdmin = perfil.rol === "administrador";
  if (!esAdmin && !perfil.codigoReferido) redirect("/admin/login");

  const inicio = new Date();
  inicio.setUTCDate(inicio.getUTCDate() - 29);
  const fechaInicio = inicio.toISOString().slice(0, 10);

  let consulta = supabaseAdmin
    .from("referidos_metricas_diarias")
    .select("codigo_referido, visitas, clics_whatsapp")
    .gte("fecha", fechaInicio);
  if (!esAdmin) consulta = consulta.eq("codigo_referido", perfil.codigoReferido!);
  const { data, error } = await consulta;

  const estadisticas = REFERIDOS
    .filter((r) => esAdmin || r.codigo === perfil.codigoReferido)
    .map((r) => {
      const filas = (data ?? []).filter((fila) => fila.codigo_referido === r.codigo);
      return {
        ...r,
        visitas: filas.reduce((n, fila) => n + Number(fila.visitas), 0),
        clics: filas.reduce((n, fila) => n + Number(fila.clics_whatsapp), 0),
      };
    })
    .sort((a, b) => b.clics - a.clics || b.visitas - a.visitas);

  return (
    <section>
      <h1 style={{ margin: 0, color: "#111827", fontSize: 32 }}>Referidos</h1>
      <p style={{ color: "#6b7280", marginTop: 12 }}>
        {esAdmin
          ? "Estadísticas de los seis referidos de MotoCars."
          : `Bienvenido, ${perfil.nombre}. Estas son tus estadísticas de referido.`}
      </p>
      {!esAdmin && perfil.puedePresupuestos && (
        <Link href="/admin/referidos/presupuestos/nuevo"
          style={{ display: "inline-block", marginTop: 16, padding: "12px 18px",
            borderRadius: 8, background: "#d71920", color: "#fff", textDecoration: "none" }}>
          Crear presupuesto
        </Link>
      )}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginTop: 24, border: "1px solid #e5e7eb" }}>
        <h2 style={{ marginTop: 0, fontSize: 19 }}>Actividad de los últimos 30 días</h2>
        <p style={{ color: "#6b7280" }}>
          Visitas aproximadas por sesión y clics de WhatsApp. Los clics no confirman mensajes enviados.
        </p>
        {error ? (
          <p role="alert">No se pudieron cargar las estadísticas. Verificá la conexión con Supabase.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead><tr>
                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Referido</th>
                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Visitas</th>
                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>Clics WhatsApp</th>
              </tr></thead>
              <tbody>
                {estadisticas.map((r) => (
                  <tr key={r.codigo}>
                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{r.nombre}</td>
                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{r.visitas}</td>
                    <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{r.clics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
