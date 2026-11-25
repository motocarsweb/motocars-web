"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PageHeader from "@/componentes/admin/PageHeader";

const estados = { pendiente: "Pendiente", en_revision: "En revisión", contactado: "Contactado", aceptado: "Aceptado", rechazado: "Rechazado" };
type Estado = keyof typeof estados;
type Solicitud = { id: string; nombre_apellido: string; whatsapp: string; localidad: string; marca: string; modelo: string; version: string | null; anio: number; kilometraje: number; precio_solicitado: number; moneda: string; estado: Estado; fotos: string[]; observaciones: string | null; observaciones_internas: string | null; fecha_solicitud: string; privacidad_aceptada: boolean; privacidad_fecha: string | null; privacidad_version: string | null };
const panel = { background: "white", border: "1px solid #ddd", borderRadius: 12, padding: 20, display: "grid", gap: 12 };
export default function SolicitudPage() {
  const { id } = useParams<{ id: string }>();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [estado, setEstado] = useState<Estado>("pendiente");
  const [notas, setNotas] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [errorFotos, setErrorFotos] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [captacion, setCaptacion] = useState<string | null>(null);
  const [incorporando, setIncorporando] = useState(false);
  const [errorRed, setErrorRed] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    let vigente = true;
    async function cargar() {
      setCargando(true); setCaptacion(null); setErrorRed(""); setSolicitud(null); setFotos([]); setError(""); setErrorFotos(""); setMensaje("");
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error("Acceso no autorizado.");
        const { data: perfil, error: ep } = await supabase.from("usuarios_permisos").select("rol, activo").eq("user_id", auth.user.id).maybeSingle();
        if (ep || !perfil?.activo || perfil.rol !== "administrador") throw new Error("Acceso no autorizado.");
        const { data, error } = await supabase.from("solicitudes_venta_web").select("*").eq("id", id).single();
        if (error || !data) throw new Error("No se encontró la solicitud.");
        if (!vigente) return;
        const s = data as Solicitud;
        setSolicitud(s); setEstado(s.estado); setNotas(s.observaciones_internas ?? "");
        const vinculada = await supabase.from("red_vehiculos").select("id").eq("solicitud_web_id", id).maybeSingle();
        if (vigente) { if (vinculada.error) setErrorRed(vinculada.error.message); else setCaptacion(vinculada.data?.id ?? null); }
        const resultados = await Promise.all(s.fotos.map(async ruta => {
          const { data } = await supabase.storage.from("solicitudes-venta-web").createSignedUrl(ruta, 900);
          return data?.signedUrl ?? "";
        }));
        if (vigente) { setFotos(resultados.filter(Boolean)); if (resultados.some(u => !u)) setErrorFotos("No se pudieron abrir todas las fotografías."); }
      } catch (e) { if (vigente) setError(e instanceof Error ? e.message : "Error al cargar."); }
      finally { if (vigente) setCargando(false); }
    }
    void cargar();
    return () => { vigente = false; };
  }, [id]);
  async function guardar() {
    if (!solicitud || guardando) return;
    setGuardando(true); setError(""); setMensaje("");
    try {
      const { data, error } = await supabase.from("solicitudes_venta_web").update({ estado, observaciones_internas: notas.trim(), fecha_actualizacion: new Date().toISOString() }).eq("id", solicitud.id).select("id").single();
      if (error || !data) throw new Error("No se pudieron guardar los cambios.");
      setSolicitud(prev => prev ? {...prev, estado, observaciones_internas: notas.trim()} : prev);
      setMensaje("Cambios guardados correctamente.");
    } catch (e) { setError(e instanceof Error ? e.message : "Error al guardar."); }
    finally { setGuardando(false); }
  }
  async function incorporar() {
    if (!solicitud || incorporando || captacion || guardando) return;
    setIncorporando(true); setErrorRed("");
    try {
      const r = await supabase.rpc("red_incorporar_solicitud_web", {p_solicitud_id: solicitud.id});
      if (r.error || !r.data) throw Error(r.error?.message ?? "No se confirmó la incorporación.");
      setCaptacion(String(r.data));
    } catch(e) { setErrorRed(e instanceof Error ? e.message : String(e)); }
    finally { setIncorporando(false); }
  }
  const telefono = solicitud?.whatsapp.replace(/\D/g, "") ?? "";
  const numero = telefono.length === 10 ? "549" + telefono : telefono;
  return <section style={{ display: "grid", gap: 20 }}>
    <Link href="/admin/solicitudes-web" style={{ color: "#555" }}>← Volver a solicitudes</Link>
    <PageHeader titulo="Detalle de solicitud WEB" descripcion="Información del propietario y seguimiento comercial" />
    {cargando && <p>Cargando solicitud...</p>}
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {!cargando && solicitud && <>
      <div style={panel}>
        <h2>{solicitud.marca} {solicitud.modelo} {solicitud.version} · {solicitud.anio}</h2>
        <p>{solicitud.kilometraje.toLocaleString("es-AR")} km · {solicitud.localidad}</p>
        <strong>{solicitud.moneda} {Number(solicitud.precio_solicitado).toLocaleString("es-AR")}</strong>
        <p>Propietario: {solicitud.nombre_apellido}</p>
        <p>WhatsApp: {solicitud.whatsapp}</p>
        <p>Recepción: {new Date(solicitud.fecha_solicitud).toLocaleString("es-AR", { timeZone: "America/Argentina/Salta", hourCycle: "h23" })}</p>
        <p>Observaciones del propietario: {solicitud.observaciones || "Sin observaciones"}</p>
        <a href={"https://wa.me/" + numero} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", background: "#16803d", padding: "10px 16px", borderRadius: 8, justifySelf: "start" }}>Contactar por WhatsApp</a>
      </div>
      <div style={panel}>
        <h2>Fotografías</h2>
        {errorFotos && <p role="alert">{errorFotos}</p>}
        {!solicitud.fotos.length && <p>Sin fotografías adjuntas.</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 12 }}>
          {fotos.map((url, i) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={"Fotografía " + (i + 1)} style={{ width: "100%", height: 260, objectFit: "contain", background: "#f5f5f5", borderRadius: 8 }} />
          </a>)}
        </div>
        {!!fotos.length && <small>Hacé clic en una fotografía para ampliarla. Los enlaces vencen a los 15 minutos; actualizá la página para renovarlos.</small>}
      </div>
      <div style={panel}>
        <h2>Red Comercial</h2>
        <p>Incorporá esta oferta para detectar compradores compatibles. Solo MotoCars podrá acceder a esta captación. Las fotos permanecen en la solicitud original.</p>
        {errorRed && <p role="alert" style={{color:"#b91c1c"}}>{errorRed}</p>}
        {captacion ? <><strong style={{color:"#16803d"}}>Solicitud incorporada a Red Comercial</strong><Link href="/admin/red-comercial/captaciones">Ver captaciones</Link></> : <button type="button" disabled={incorporando || guardando || solicitud.estado==="rechazado" || !solicitud.privacidad_aceptada || !solicitud.privacidad_fecha || !solicitud.privacidad_version?.trim()} onClick={()=>void incorporar()} style={{background:"#c71930",color:"white",padding:"12px 20px",borderRadius:8,justifySelf:"start"}}>{incorporando?"Incorporando...":"Incorporar a Red Comercial"}</button>}
        {!captacion && (solicitud.estado==="rechazado" || !solicitud.privacidad_aceptada || !solicitud.privacidad_fecha || !solicitud.privacidad_version?.trim()) && <p>No se puede incorporar una solicitud rechazada o sin consentimiento válido.</p>}
      </div>
      <div style={panel}>
        <h2>Seguimiento comercial</h2>
        <label>Estado <select disabled={guardando} value={estado} onChange={e => setEstado(e.target.value as Estado)} style={{ display: "block", padding: 10, border: "1px solid #ccc", borderRadius: 8 }}>{Object.entries(estados).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
        <label>Observaciones internas<textarea disabled={guardando} value={notas} onChange={e => setNotas(e.target.value)} rows={5} maxLength={5000} style={{ display: "block", width: "100%", padding: 12, border: "1px solid #ccc", borderRadius: 8 }} /></label>
        {mensaje && <p role="status" style={{ color: "#16803d" }}>{mensaje}</p>}
        <button disabled={guardando} onClick={guardar} style={{ background: "#c71930", color: "white", padding: "12px 20px", borderRadius: 8, justifySelf: "start", cursor: "pointer" }}>{guardando ? "Guardando..." : "Guardar cambios"}</button>
      </div>
    </>}
  </section>;
}
