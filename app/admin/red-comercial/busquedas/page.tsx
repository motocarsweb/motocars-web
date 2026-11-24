"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const campos = [["marca","Marca"],["modelo","Modelo"],["version","Versión"],["anio_desde","Año desde"],["anio_hasta","Año hasta"],["presupuesto_maximo","Presupuesto máximo"],["kilometros_maximos","Kilometraje máximo"],["transmision","Transmisión"],["combustible","Combustible"],["traccion","Tracción"],["localidad","Localidad"],["provincia","Provincia"],["observaciones","Observaciones"]] as const;
const numericos = ["anio_desde","anio_hasta","presupuesto_maximo","kilometros_maximos"];
const inicial = { ...Object.fromEntries(campos.map(([k])=>[k,""])), comprador_contacto_id:"", categoria:"auto", moneda:"ARS" } as Record<string,string>;
type Contacto = {id:string; nombre:string; apellido:string|null; referido_user_id:string};
type Busqueda = {id:string; comprador_contacto_id:string; categoria:string; marca:string|null; modelo:string|null; presupuesto_maximo:number|null; moneda:string; estado:string};
export default function BusquedasPage(){
 const [contactos,setContactos]=useState<Contacto[]>([]);
 const [filas,setFilas]=useState<Busqueda[]>([]);
 const [usuario,setUsuario]=useState("");
 const [admin,setAdmin]=useState(false);
 const [estado,setEstado]=useState("Cargando...");
 const [form,setForm]=useState(inicial);
 const [nuevo,setNuevo]=useState(false);
 const [guardando,setGuardando]=useState(false);
 async function cargar(id:string, esAdmin:boolean){
  let c=supabase.from("red_contactos").select("id,nombre,apellido,referido_user_id").order("apellido").order("nombre");
  let b=supabase.from("red_busquedas").select("id,comprador_contacto_id,categoria,marca,modelo,presupuesto_maximo,moneda,estado").order("created_at",{ascending:false});
  if(!esAdmin){c=c.eq("referido_user_id",id);b=b.eq("referido_user_id",id);}
  const [rc,rb]=await Promise.all([c,b]);
  if(rc.error||rb.error){setEstado("No se pudieron cargar las búsquedas o contactos.");return;}
  setContactos(rc.data??[]);setFilas(rb.data??[]);setEstado("");
 }
 useEffect(()=>{let vigente=true;async function iniciar(){
  const {data:{user}}=await supabase.auth.getUser();
  if(!vigente)return;
  if(!user){setEstado("Iniciá sesión.");return;}
  const {data:p,error}=await supabase.from("usuarios_permisos").select("rol,activo,codigo_referido").eq("user_id",user.id).maybeSingle();
  if(!vigente)return;
  if(error||!p?.activo||!(p.rol==="administrador"||(p.rol==="vendedor"&&p.codigo_referido))){setEstado("Acceso no autorizado.");return;}
  setUsuario(user.id);setAdmin(p.rol==="administrador");await cargar(user.id,p.rol==="administrador");
 }void iniciar();return()=>{vigente=false;};},[]);
 async function guardar(e:FormEvent){
  e.preventDefault();if(guardando||!usuario)return;
  const contacto=contactos.find(c=>c.id===form.comprador_contacto_id);
  if(!contacto){setEstado("Seleccioná un contacto.");return;}
  if(form.anio_desde&&form.anio_hasta&&Number(form.anio_desde)>Number(form.anio_hasta)){setEstado("El año desde no puede superar el año hasta.");return;}
  const datos=Object.fromEntries(campos.map(([k])=>[k,form[k].trim()===""?null:numericos.includes(k)?Number(form[k]):form[k].trim()]));
  setGuardando(true);
  const {error}=await supabase.from("red_busquedas").insert({...datos,comprador_contacto_id:contacto.id,referido_user_id:contacto.referido_user_id,categoria:form.categoria,moneda:form.moneda,estado:"activa"});
  setGuardando(false);if(error){setEstado("No se pudo guardar la búsqueda: "+error.message);return;}
  setForm(inicial);setNuevo(false);await cargar(usuario,admin);
 }
 const estilo={width:"100%",padding:10,border:"1px solid #ddd",borderRadius:6,boxSizing:"border-box" as const};
 const boton={background:"var(--mc-red)",color:"#fff",border:0,borderRadius:8,padding:"10px 18px"};
 return <section><Link href="/admin/red-comercial">← Red Comercial</Link><h1 style={{fontSize:32}}>Búsquedas</h1>
 {estado&&<p role="status">{estado}</p>}
 {usuario&&<><button style={boton} onClick={()=>{setNuevo(!nuevo);setForm(inicial);}}>{nuevo?"Cancelar":"Nueva búsqueda"}</button>
 {nuevo&&<form onSubmit={guardar} style={{background:"#fff",padding:20,borderRadius:12,margin:"20px 0"}}>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}>
 <label>Contacto comprador *<select required style={estilo} value={form.comprador_contacto_id} onChange={e=>setForm({...form,comprador_contacto_id:e.target.value})}><option value="">Seleccionar</option>{contactos.map(c=><option key={c.id} value={c.id}>{c.apellido} {c.nombre}</option>)}</select></label>
 <label>Categoría<select style={estilo} value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>{["auto","moto","rodantes","otros"].map(c=><option key={c} value={c}>{c}</option>)}</select></label>
 <label>Moneda<select style={estilo} value={form.moneda} onChange={e=>setForm({...form,moneda:e.target.value})}><option>ARS</option><option>USD</option></select></label>
 {campos.map(([k,l])=><label key={k}>{l}{k==="observaciones"?<textarea style={estilo} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>:<input style={estilo} type={numericos.includes(k)?"number":"text"} min={numericos.includes(k)?0:undefined} step={k==="presupuesto_maximo"?"0.01":undefined} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>}</label>)}
 </div><p>Completá solamente los datos conocidos. Las coincidencias se calculan automáticamente.</p><button style={boton} disabled={guardando}>{guardando?"Guardando...":"Guardar búsqueda"}</button></form>}
 <div style={{background:"#fff",padding:16,borderRadius:12,overflowX:"auto",marginTop:20}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}><thead><tr>{["Contacto","Categoría","Marca y modelo","Presupuesto","Estado"].map(t=><th key={t} style={{padding:12}}>{t}</th>)}</tr></thead><tbody>{filas.map(f=>{const c=contactos.find(c=>c.id===f.comprador_contacto_id);return <tr key={f.id}>{[[c?.apellido,c?.nombre].filter(Boolean).join(" "),f.categoria,[f.marca,f.modelo].filter(Boolean).join(" ")||"Búsqueda general",f.presupuesto_maximo===null?"Sin definir":f.moneda+" "+Number(f.presupuesto_maximo).toLocaleString("es-AR"),f.estado].map((v,i)=><td key={i} style={{padding:12,borderTop:"1px solid #eee"}}>{v||"—"}</td>)}</tr>;})}</tbody></table>{!filas.length&&<p>No hay búsquedas registradas.</p>}</div></>}
 </section>;
}
