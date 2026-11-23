"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/componentes/admin/PageHeader";

const estados = { pendiente: "Pendiente", en_revision: "En revisión", contactado: "Contactado", aceptado: "Aceptado", rechazado: "Rechazado" };
type Solicitud = { id: string; fecha_solicitud: string; nombre_apellido: string; whatsapp: string; localidad: string; marca: string; modelo: string; version: string | null; anio: number; kilometraje: number; precio_solicitado: number; moneda: string; estado: keyof typeof estados; fotos: string[] };

export default function SolicitudesWebPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todas");
  useEffect(() => {
    let vigente = true;
    async function cargar() {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Acceso no autorizado.");
        const { data: perfil, error: errorPerfil } = await supabase.from("usuarios_permisos").select("rol, activo").eq("user_id", auth.user.id).maybeSingle();
        if (errorPerfil || !perfil?.activo || perfil.rol !== "administrador") throw new Error("Acceso no autorizado.");
        const { data, error } = await supabase.from("solicitudes_venta_web").select("id, fecha_solicitud, nombre_apellido, whatsapp, localidad, marca, modelo, version, anio, kilometraje, precio_solicitado, moneda, estado, fotos").order("fecha_solicitud", { ascending: false });
        if (error) throw new Error("No se pudieron consultar las solicitudes.");
        if (vigente) setSolicitudes(data as Solicitud[]);
      } catch (e) {
        if (vigente) setError(e instanceof Error ? e.message : "Error al cargar.");
      } finally { if (vigente) setCargando(false); }
    }
    void cargar();
    return () => { vigente = false; };
  }, []);
  const visibles = solicitudes.filter(s => filtro === "todas" || s.estado === filtro);
  return (
    <section style={{ display: "grid", gap: 20 }}>
      <PageHeader titulo="Solicitudes WEB" descripcion="Vehículos ofrecidos por propietarios desde la página web" />
      {cargando ? <p>Cargando solicitudes...</p> : error ? <p role="alert" style={{ color: "#b91c1c" }}>{error}</p> : <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <strong>{solicitudes.filter(s => s.estado === "pendiente").length} pendientes</strong>
          <label>Estado: <select value={filtro} onChange={e => setFiltro(e.target.value)} style={{ padding: 8, border: "1px solid #ddd", borderRadius: 8, background: "white" }}><option value="todas">Todas</option>{Object.entries(estados).map(([valor, nombre]) => <option key={valor} value={valor}>{nombre}</option>)}</select></label>
        </div>
        {!visibles.length && <p>No hay solicitudes para este estado.</p>}
        <div style={{ display: "grid", gap: 12 }}>
          {visibles.map(s => <article key={s.id} style={{ background: "white", border: "1px solid #ddd", borderRadius: 12, padding: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <strong style={{ fontSize: 18 }}>{s.marca} {s.modelo} {s.version} · {s.anio}</strong>
              <span>{s.kilometraje.toLocaleString("es-AR")} km · {s.localidad}</span>
              <strong>{s.moneda} {Number(s.precio_solicitado).toLocaleString("es-AR")}</strong>
              <span>{s.nombre_apellido} · {s.whatsapp}</span>
            </div>
            <div style={{ display: "grid", gap: 6, alignContent: "start" }}>
              <strong style={{ color: s.estado === "pendiente" ? "#92400e" : "#374151" }}>{estados[s.estado]}</strong>
              <span>{new Date(s.fecha_solicitud).toLocaleString("es-AR", { timeZone: "America/Argentina/Salta" })}</span>
              <span>{s.fotos.length} fotografías</span>
            </div>
          </article>)}
        </div>
      </>}
    </section>
  );
}
