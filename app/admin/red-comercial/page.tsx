"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Indicador = { label: string; value: number | null };

export default function RedComercialPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [estado, setEstado] = useState("Cargando Red Comercial...");
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let vigente = true;
    async function cargar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!vigente) return;
      if (!user) { setEstado("Iniciá sesión."); return; }
      const { data: perfil, error } = await supabase.from("usuarios_permisos")
        .select("rol, activo, codigo_referido").eq("user_id", user.id).maybeSingle();
      if (!vigente) return;
      if (error || !perfil?.activo || !(perfil.rol === "administrador" || (perfil.rol === "vendedor" && perfil.codigo_referido))) {
        setEstado("No tenés permiso para acceder."); return;
      }
      const esAdmin = perfil.rol === "administrador";
      setAdmin(esAdmin);
      const contactos = supabase.from("red_contactos").select("id", { count: "exact", head: true });
      const busquedas = supabase.from("red_busquedas").select("id", { count: "exact", head: true }).eq("estado", "activa");
      const captaciones = supabase.from("red_vehiculos").select("id", { count: "exact", head: true }).eq("estado", "disponible");
      const consultas = [
        esAdmin ? contactos : contactos.eq("referido_user_id", user.id),
        esAdmin ? busquedas : busquedas.eq("referido_user_id", user.id),
        esAdmin ? captaciones : captaciones.eq("referido_user_id", user.id),
      ];
      const resultados = await Promise.all(consultas);
      const items = ["Contactos", "Búsquedas activas", "Captaciones disponibles"].map((label, i) => ({
        label, value: resultados[i].error ? null : resultados[i].count,
      }));
      if (esAdmin) {
        const coincidencias = await supabase.from("red_coincidencias").select("id", { count: "exact", head: true }).eq("vigente", true);
        items.push({ label: "Coincidencias vigentes", value: coincidencias.error ? null : coincidencias.count });
      }
      if (!vigente) return;
      setIndicadores(items);
      setEstado(items.some(item => item.value === null) ? "No se pudieron cargar todos los indicadores." : "");
    }
    void cargar();
    return () => { vigente = false; };
  }, []);

  return (
    <section>
      <h1 style={{ fontSize: 32, marginTop: 0, marginBottom: 8 }}>Red Comercial</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>Gestión de oportunidades comerciales MotoCars.</p>
      {estado && <p role="status">{estado}</p>}
      {indicadores.length > 0 && <>
        <Link href="/admin/red-comercial/contactos" style={{display:"inline-block",background:"var(--mc-red)",color:"#fff",padding:"10px 18px",borderRadius:8,textDecoration:"none"}}>Gestionar contactos</Link>
        <Link href="/admin/red-comercial/busquedas" style={{display:"inline-block",marginLeft:12,background:"var(--mc-red)",color:"#fff",padding:"10px 18px",borderRadius:8,textDecoration:"none"}}>Gestionar búsquedas</Link>
        <Link href="/admin/red-comercial/captaciones" style={{display:"inline-block",marginLeft:12,background:"var(--mc-red)",color:"#fff",padding:"10px 18px",borderRadius:8,textDecoration:"none"}}>Gestionar captaciones</Link>
        <p style={{ color: "#666", fontSize: 14 }}>{admin ? "Resumen general" : "Mi actividad comercial"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {indicadores.map(item => (
            <div key={item.label} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 12, padding: 22 }}>
              <div style={{ color: "#666", fontSize: 14, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 12, color: "var(--mc-black)" }}>{item.value ?? "—"}</div>
            </div>
          ))}
        </div>
      </>}
    </section>
  );
}
