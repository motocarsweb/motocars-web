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
  const [editando, setEditando] = useState<string | null>(null);
  const normalizar = (valor: string | null) => (valor ?? "").replace(/\D/g, "");
  const duplicados = filas.filter(f => f.id !== editando && ((normalizar(form.dni) !== "" && normalizar(form.dni) === normalizar(f.dni)) || [form.whatsapp, form.telefono].some(n => normalizar(n) !== "" && [f.whatsapp, f.telefono].some(t => normalizar(n) === normalizar(t)))));
  function editar(f: Contacto) {
    setForm(Object.fromEntries(campos.map(([key]) => [key, f[key] ?? ""])) as Record<Campo, string>);
    setEditando(f.id); setNuevo(true); setEstado("");
  }
  function alternarFormulario() {
    setNuevo(!nuevo); setEditando(null); setForm(inicial); setEstado("");
  }
  async function cargar(id: string, esAdmin: boolean) {
    let consulta = supabase.from("red_contactos").select("id,nombre,apellido,whatsapp,telefono,dni,localidad,provincia,observaciones").order("apellido").order("nombre");
    if (!esAdmin) consulta = consulta.eq("referido_user_id", id);
    const { data, error } = await porBloques((a,b)=>consulta.order("id").range(a,b));
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
    const { error } = editando
      ? await supabase.from("red_contactos").update(datos).eq("id", editando).select("id").single()
      : await supabase.from("red_contactos").insert({ ...datos, referido_user_id: usuario });
    setGuardando(false);
    if (error) { setEstado("No se pudo guardar el contacto."); return; }
    setForm(inicial); setEditando(null); setNuevo(false); await cargar(usuario,admin);
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
        <button type="button" onClick={alternarFormulario} style={{background:"var(--mc-red)",color:"#fff",border:0,borderRadius:8,padding:"10px 18px"}}>{nuevo?"Cancelar":"Nuevo contacto"}</button>
      </div>
      {nuevo && <form onSubmit={guardar} style={{background:"#fff",padding:20,borderRadius:12,marginBottom:20}}>
        <h2 style={{marginTop:0}}>{editando ? "Editar contacto" : "Nuevo contacto"}</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
          {campos.map(([key,label])=><label key={key} style={{display:"grid",gap:6}}>{label}{key==="nombre"?" *":""}
            {key==="observaciones"?<textarea style={inputStyle} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input style={inputStyle} required={key==="nombre"} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>}
          </label>)}
        </div>
        <p>Ingresá al menos un WhatsApp o teléfono.</p>
        {duplicados.length > 0 && <p role="alert" style={{color:"#925500"}}>Posible duplicado: {duplicados.map(f=>[f.nombre,f.apellido].filter(Boolean).join(" ")).join("; ")}. Verificá los datos antes de guardar.</p>}
        <button disabled={guardando} style={{background:"var(--mc-red)",color:"#fff",border:0,borderRadius:8,padding:"10px 18px"}}>{guardando?"Guardando...":"Guardar contacto"}</button>
      </form>}
      <div style={{background:"#fff",borderRadius:12,padding:16,overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}><thead><tr>{["Apellido y nombre","WhatsApp","Teléfono","Localidad","Acciones"].map(t=><th key={t} style={{padding:12}}>{t}</th>)}</tr></thead>
        <tbody>{visibles.map(f=><tr key={f.id}>{[[f.apellido,f.nombre].filter(Boolean).join(", "),f.whatsapp,f.telefono,f.localidad].map((v,i)=><td key={i} style={{padding:12,borderTop:"1px solid #eee"}}>{v||"—"}</td>)}<td style={{padding:12,borderTop:"1px solid #eee"}}><button type="button" onClick={()=>editar(f)} disabled={guardando}>Editar</button></td></tr>)}</tbody></table>
        {!visibles.length && <p>No hay contactos para mostrar.</p>}
      </div>
    </>}
  </section>;
}

async function porBloques<T>(consulta:(a:number,b:number)=>PromiseLike<{data:T[]|null;error:{message:string}|null}>){const data:T[]=[];for(let a=0;;a+=500){const r=await consulta(a,a+499);if(r.error)return {data:null,error:r.error};const lote=r.data??[];data.push(...lote);if(lote.length<500)return {data,error:null};}}
