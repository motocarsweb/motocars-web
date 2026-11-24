"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const campos = [
  ["nombre", "Nombre"], ["apellido", "Apellido"], ["whatsapp", "WhatsApp"],
  ["telefono", "Teléfono"], ["dni", "DNI"], ["localidad", "Localidad"],
  ["provincia", "Provincia"], ["observaciones", "Observaciones"],
] as const;
type Campo = typeof campos[number][0];
type Contacto = Record<Campo, string | null> & { id: string };
const inicial = Object.fromEntries(campos.map(([key]) => [key, ""])) as Record<Campo, string>;

export default function ContactosPage() {
  const [filas, setFilas] = useState<Contacto[]>([]);
  const [form, setForm] = useState(inicial);
  const [usuario, setUsuario] = useState("");
  const [admin, setAdmin] = useState(false);
  const [estado, setEstado] = useState("Cargando...");
  const [guardando, setGuardando] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [nuevo, setNuevo] = useState(false);
  async function cargar(id: string, esAdmin: boolean) {
    let consulta = supabase.from("red_contactos").select("id,nombre,apellido,whatsapp,telefono,dni,localidad,provincia,observaciones").order("apellido").order("nombre");
    if (!esAdmin) consulta = consulta.eq("referido_user_id", id);
    const { data, error } = await consulta;
    if (error) { setEstado("No se pudieron cargar los contactos."); return; }
    setFilas(data ?? []);
    setEstado("");
  }
  useEffect(() => {
    let vigente = true;
    async function iniciar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!vigente) return;
      if (!user) { setEstado("Iniciá sesión."); return; }
      const { data: p, error } = await supabase.from("usuarios_permisos").select("rol,activo,codigo_referido").eq("user_id",user.id).maybeSingle();
      if (!vigente) return;
      if (error || !p?.activo || !(p.rol === "administrador" || (p.rol === "vendedor" && p.codigo_referido))) { setEstado("Acceso no autorizado."); return; }
      setUsuario(user.id); setAdmin(p.rol === "administrador");
      await cargar(user.id,p.rol === "administrador");
    }
    void iniciar();
    return () => { vigente = false; };
  }, []);
  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!usuario || guardando) return;
    if (!form.nombre.trim() || !(form.whatsapp.trim() || form.telefono.trim())) { setEstado("Ingresá nombre y WhatsApp o teléfono."); return; }
    setGuardando(true);
    const datos = Object.fromEntries(campos.map(([key]) => [key, form[key].trim() || null]));
    const { error } = await supabase.from("red_contactos").insert({ ...datos, referido_user_id: usuario });
    setGuardando(false);
    if (error) { setEstado("No se pudo guardar el contacto."); return; }
    setForm(inicial); setNuevo(false); await cargar(usuario,admin);
  }
  const visibles = filas.filter(f => [f.nombre,f.apellido,f.whatsapp,f.telefono,f.dni].join(" ").toLowerCase().includes(buscar.toLowerCase()));
  const inputStyle = { width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, boxSizing: "border-box" as const };
  return <section>
    <Link href="/admin/red-comercial">← Red Comercial</Link>
    <h1 style={{fontSize:32}}>Contactos</h1>
    {estado && <p role="status">{estado}</p>}
    {usuario && <>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        <input aria-label="Buscar contactos" placeholder="Buscar nombre, teléfono o DNI" value={buscar} onChange={e=>setBuscar(e.target.value)} style={{...inputStyle,maxWidth:360}}/>
        <button type="button" onClick={()=>setNuevo(!nuevo)} style={{background:"var(--mc-red)",color:"#fff",border:0,borderRadius:8,padding:"10px 18px"}}>{nuevo?"Cancelar":"Nuevo contacto"}</button>
      </div>
      {nuevo && <form onSubmit={guardar} style={{background:"#fff",padding:20,borderRadius:12,marginBottom:20}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
          {campos.map(([key,label])=><label key={key} style={{display:"grid",gap:6}}>{label}{key==="nombre"?" *":""}
            {key==="observaciones"?<textarea style={inputStyle} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input style={inputStyle} required={key==="nombre"} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}
          </label>)}
        </div>
        <p>Ingresá al menos un WhatsApp o teléfono.</p>
        <button disabled={guardando} style={{background:"var(--mc-red)",color:"#fff",border:0,borderRadius:8,padding:"10px 18px"}}>{guardando?"Guardando...":"Guardar contacto"}</button>
      </form>}
      <div style={{background:"#fff",borderRadius:12,padding:16,overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}><thead><tr>{["Apellido y nombre","WhatsApp","Teléfono","Localidad"].map(t=><th key={t} style={{padding:12}}>{t}</th>)}</tr></thead>
        <tbody>{visibles.map(f=><tr key={f.id}>{[[f.apellido,f.nombre].filter(Boolean).join(", "),f.whatsapp,f.telefono,f.localidad].map((v,i)=><td key={i} style={{padding:12,borderTop:"1px solid #eee"}}>{v||"—"}</td>)}</tr>)}</tbody></table>
        {!visibles.length && <p>No hay contactos para mostrar.</p>}
      </div>
    </>}
  </section>;
}
