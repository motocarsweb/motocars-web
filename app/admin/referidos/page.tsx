"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const nombres = ["David", "Nazareno", "Alexander", "Cristian", "Jorge", "German"];

type Metrica = { codigo_referido: string; visitas: number; clics_whatsapp: number };

export default function ReferidosPage() {
  const [filas, setFilas] = useState<Metrica[]>([]);
  const [codigoVisible, setCodigoVisible] = useState<string | null>(null);
  const [estado, setEstado] = useState("Cargando estadísticas...");

  useEffect(() => {
    let activo = true;
    async function cargar() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { if (activo) setEstado("Iniciá sesión para consultar las estadísticas."); return; }
      const { data: perfil, error: perfilError } = await supabase.from("usuarios_permisos")
        .select("rol, activo, codigo_referido").eq("user_id", user.id).maybeSingle();
      if (perfilError || !perfil?.activo || !["administrador", "vendedor"].includes(perfil.rol)) {
        if (activo) setEstado("No tenés permiso para consultar las estadísticas.");
        return;
      }
      if (perfil.rol === "vendedor" && !perfil.codigo_referido) {
        if (activo) setEstado("No tenés un código de referido asignado.");
        return;
      }
      const inicio = new Date();
      inicio.setDate(inicio.getDate() - 29);
      let consulta = supabase.from("referidos_metricas_diarias")
        .select("codigo_referido, visitas, clics_whatsapp")
        .gte("fecha", inicio.toISOString().slice(0, 10));
      if (perfil.rol === "vendedor") consulta = consulta.eq("codigo_referido", perfil.codigo_referido);
      const { data, error } = await consulta;
      if (!activo) return;
      if (error) { setEstado("No se pudieron consultar las estadísticas."); return; }
      setCodigoVisible(perfil.rol === "vendedor" ? perfil.codigo_referido : null);
      setFilas(data ?? []);
      setEstado("");
    }
    void cargar();
    return () => { activo = false; };
  }, []);

  const resumen = nombres.filter((nombre) => !codigoVisible || nombre.toLowerCase() === codigoVisible).map((nombre) => {
    const codigo = nombre.toLowerCase();
    const registros = filas.filter((fila) => fila.codigo_referido === codigo);
    return {
      nombre,
      visitas: registros.reduce((total, fila) => total + Number(fila.visitas), 0),
      clics: registros.reduce((total, fila) => total + Number(fila.clics_whatsapp), 0),
    };
  }).sort((a, b) => b.clics - a.clics || b.visitas - a.visitas);

  return (
    <section>
      <h1 style={{ fontSize: 32, marginTop: 0 }}>Referidos</h1>
      <p>Visitas aproximadas por sesión y clics en WhatsApp de los últimos 30 días. Un clic no confirma un mensaje enviado.</p>
      {estado ? <p role="status">{estado}</p> : (
        <div style={{ background: "white", padding: 24, borderRadius: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead><tr><th>Referido</th><th>Visitas</th><th>Clics WhatsApp</th></tr></thead>
            <tbody>{resumen.map((fila) => (
              <tr key={fila.nombre}>
                <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{fila.nombre}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{fila.visitas}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{fila.clics}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
