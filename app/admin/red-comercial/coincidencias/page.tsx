"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Contacto = {id:string;nombre:string;apellido:string|null;whatsapp:string|null;telefono:string|null};
type Busqueda = {id:string;comprador_contacto_id:string;marca:string|null;modelo:string|null};
type Oferta = {id:string|number;marca:string|null;modelo:string|null;version:string|null;precio:number|null;moneda:string;origen_captacion?:string;propietario_contacto_id?:string;referido_user_id?:string};
type Detectada = {busqueda_id:string;vehiculo_id:string|null;vehiculo_motocars_id:number|null;origen:string;puntaje:number;cobertura_informacion:number|null;pendiente_verificacion:boolean;requisitos_pendientes:string[]};
type Gestion = {id:string;busqueda_id:string;vehiculo_id:string|null;vehiculo_motocars_id:number|null;estado:string};
const clave=(r:{busqueda_id:string;vehiculo_id:string|null;vehiculo_motocars_id:number|null})=>r.busqueda_id+"/"+(r.vehiculo_id??"m"+r.vehiculo_motocars_id);
const estados=["detectada","revisada","gestionada","descartada"];
const formato=(v:Oferta|undefined)=>v?.precio!=null?(v.moneda==="USD"?"USD ":"$ ")+Number(v.precio).toLocaleString("es-AR"):"Precio a consultar";
export default function Coincidencias(){
const [referidos,setReferidos]=useState<{user_id:string;nombre:string}[]>([]);
const [rows,setRows]=useState<Detectada[]>([]);
const [gestiones,setGestiones]=useState<Gestion[]>([]);
const [busquedas,setBusquedas]=useState<Busqueda[]>([]);
const [contactos,setContactos]=useState<Contacto[]>([]);
const [ofertas,setOfertas]=useState<Oferta[]>([]);
const [stock,setStock]=useState<Oferta[]>([]);
const [mensaje,setMensaje]=useState("");
const [busy,setBusy]=useState(true);
const [q,setQ]=useState("");
const [origen,setOrigen]=useState("");
const [estado,setEstado]=useState("abiertas");
const [min,setMin]=useState("0");
const [pagina,setPagina]=useState(1);
useEffect(()=>{setPagina(1);},[q,origen,estado,min]);
async function cargar(){
setBusy(true);setMensaje("");setRows([]);
try{
const {data:{user}}=await supabase.auth.getUser();
if(!user)throw Error("Iniciá sesión.");
const p=await supabase.from("usuarios_permisos").select("rol,activo").eq("user_id",user.id).single();
if(p.error||!p.data?.activo||p.data.rol!=="administrador")throw Error("Acceso exclusivo del administrador.");
const r=await Promise.all([
supabase.rpc("red_detectar_coincidencias_unificadas_admin"),
supabase.from("red_coincidencias").select("id,busqueda_id,vehiculo_id,vehiculo_motocars_id,estado"),
supabase.from("red_busquedas").select("id,comprador_contacto_id,marca,modelo").eq("estado","activa"),
supabase.from("red_contactos").select("id,nombre,apellido,whatsapp,telefono"),
supabase.from("red_vehiculos").select("id,marca,modelo,version,precio,moneda,origen_captacion,propietario_contacto_id,referido_user_id").eq("estado","disponible"),
supabase.from("vehiculos").select("id,marca,modelo,version,precio,moneda"),
supabase.rpc("red_referidos_identificacion_admin")
]);
for(const x of r)if(x.error)throw Error(x.error.message);
setReferidos((r[6].data??[]) as {user_id:string;nombre:string}[]);setGestiones((r[1].data??[]) as Gestion[]);setBusquedas((r[2].data??[]) as Busqueda[]);setContactos((r[3].data??[]) as Contacto[]);setOfertas((r[4].data??[]) as Oferta[]);setStock((r[5].data??[]) as Oferta[]);setRows((r[0].data??[]) as Detectada[]);
}catch(e){setMensaje(String(e));}finally{setBusy(false);}
}
useEffect(()=>{void cargar();},[]);
async function cambiar(g:Gestion,valor:string){
setBusy(true);setMensaje("");
try{const r=await supabase.from("red_coincidencias").update({estado:valor}).eq("id",g.id).select("id").single();if(r.error)throw Error(r.error.message);await cargar();}catch(e){setMensaje(String(e));setBusy(false);}
}
const items=rows.map(r=>{const b=busquedas.find(b=>b.id===r.busqueda_id);const c=contactos.find(c=>c.id===b?.comprador_contacto_id);const v=r.vehiculo_id?ofertas.find(v=>v.id===r.vehiculo_id):stock.find(v=>String(v.id)===String(r.vehiculo_motocars_id));const g=gestiones.find(g=>clave(g)===clave(r));return {r,b,c,v,g,fuente:r.vehiculo_id?(v?.origen_captacion??r.origen):"MOTOCARS"};}).filter(x=>x.b&&x.c&&x.v);
const filtrados=items.filter(({r,b,c,v,g,fuente})=>(!origen||fuente===origen)&&Number(r.puntaje)>=Number(min)&&(estado==="todos"||(estado==="abiertas"?g?.estado!=="descartada"&&g?.estado!=="gestionada":(g?.estado??"detectada")===estado))&&[b?.marca,b?.modelo,c?.nombre,c?.apellido,v?.marca,v?.modelo].join(" ").toLocaleLowerCase("es-AR").includes(q.toLocaleLowerCase("es-AR"))).sort((a,b)=>Number(b.r.puntaje)-Number(a.r.puntaje));
const grupos=Array.from(new Set(filtrados.map(x=>x.r.busqueda_id))).map(id=>filtrados.filter(x=>x.r.busqueda_id===id));
const totalPaginas=Math.max(1,Math.ceil(grupos.length/10));
const paginaActual=Math.min(pagina,totalPaginas);
const gruposVisibles=grupos.slice((paginaActual-1)*10,paginaActual*10);
return <section className="red-coincidencias"><style jsx global>{` .red-coincidencias h1{font-size:30px;font-weight:750;margin:12px 0 8px}.red-coincidencias input,.red-coincidencias select,.red-coincidencias button{border:1px solid #ccc;border-radius:7px;background:white;padding:9px 12px;font-size:14px}.red-coincidencias button{background:var(--mc-red);color:white;border:0;cursor:pointer}.red-coincidencias article p{margin:4px 0;font-size:14px}.red-coincidencias article strong{font-size:16px}.red-coincidencias article{overflow-wrap:anywhere}`}</style><Link href="/admin/red-comercial">Volver a Red Comercial</Link><h1>Coincidencias comerciales</h1><p>Compatibilidad actual. La cobertura mide criterios evaluables, no la totalidad de los datos. La disponibilidad de unidades MotoCars debe verificarse.</p><div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}><input placeholder="Buscar cliente o vehículo" value={q} onChange={e=>setQ(e.target.value)}/><select value={origen} onChange={e=>setOrigen(e.target.value)}><option value="">Todos los orígenes</option>{["MOTOCARS","ADMIN","REFERIDO","WEB"].map(x=><option key={x}>{x}</option>)}</select><select value={estado} onChange={e=>setEstado(e.target.value)}><option value="abiertas">Abiertas</option><option value="todos">Todos los estados</option>{estados.map(x=><option key={x}>{x}</option>)}</select><select value={min} onChange={e=>setMin(e.target.value)}>{["0","50","75","90","100"].map(x=><option key={x} value={x}>Desde {x}%</option>)}</select><button disabled={busy} onClick={()=>void cargar()}>Actualizar</button></div>{mensaje&&<p role="alert">{mensaje}</p>}{busy?<p>Cargando coincidencias...</p>:<><p>{filtrados.length} coincidencias compatibles</p>{gruposVisibles.map(grupo=><div key={grupo[0].r.busqueda_id} style={{margin:"18px 0",border:"1px solid #ddd",borderRadius:12,padding:14,background:"#fafafa"}}>
<h2 style={{fontSize:19,fontWeight:700,textTransform:"capitalize"}}>{grupo[0].c?.nombre} {grupo[0].c?.apellido} - {grupo[0].c?.whatsapp||grupo[0].c?.telefono||"Sin telefono"}</h2>
<p style={{marginBottom:14}}>Busca: <b>{grupo[0].b?.marca} {grupo[0].b?.modelo}</b> - {grupo.length} ofertas</p>
{grupo.map(({r,b,v,g,fuente})=><article key={clave(r)} style={{background:"#fff",border:"1px solid #ddd",borderRadius:10,padding:14,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><strong>{Number(r.puntaje).toLocaleString("es-AR",{maximumFractionDigits:2})}% de compatibilidad · {fuente}</strong><select aria-label="Estado de gestión" disabled={!g} value={g?.estado==="desactualizada"?"detectada":g?.estado??"detectada"} onChange={e=>g&&void cambiar(g,e.target.value)}>{estados.map(x=><option key={x}>{x}</option>)}</select></div><p style={{fontWeight:700,color:b?.marca&&b?.modelo&&b.marca.trim().toLowerCase()===v?.marca?.trim().toLowerCase()&&b.modelo.trim().toLowerCase()===v?.modelo?.trim().toLowerCase()?"#167047":"#666"}}>
{b?.marca&&b?.modelo&&b.marca.trim().toLowerCase()===v?.marca?.trim().toLowerCase()&&b.modelo.trim().toLowerCase()===v?.modelo?.trim().toLowerCase()?"Marca y modelo solicitados":"Otra opcion compatible"}
</p><p><b>Oferta:</b> {v?.marca} {v?.modelo} {v?.version} · {formato(v)}</p>{v?.propietario_contacto_id&&<p><b>Propietario:</b> {contactos.find(c=>c.id===v.propietario_contacto_id)?.nombre} {contactos.find(c=>c.id===v.propietario_contacto_id)?.apellido} · {contactos.find(c=>c.id===v.propietario_contacto_id)?.whatsapp||contactos.find(c=>c.id===v.propietario_contacto_id)?.telefono||"Sin teléfono visible"}{fuente==="REFERIDO"&&<> · <b>Referido:</b> {referidos.find(p=>p.user_id===v.referido_user_id)?.nombre??"No identificado"}</>}</p>}<p>Cobertura de criterios evaluables: {r.cobertura_informacion==null?"Sin datos":Number(r.cobertura_informacion).toLocaleString("es-AR",{maximumFractionDigits:2})+"%"}</p><p>{r.pendiente_verificacion?"Pendiente de verificar: "+(r.requisitos_pendientes??[]).join(", "):"Sin requisitos pendientes"}</p>{!g&&<p>Esperando registro del motor automático. Actualizá en un minuto.</p>}</article>)}</div>)}
{grupos.length===0&&<p>No hay coincidencias para los filtros seleccionados.</p>}
{totalPaginas>1&&<div style={{display:"flex",alignItems:"center",gap:16,marginTop:20}}>
<button disabled={paginaActual<=1} onClick={()=>setPagina(paginaActual-1)}>Anterior</button>
<span>Pagina {paginaActual} de {totalPaginas}</span>
<button disabled={paginaActual>=totalPaginas} onClick={()=>setPagina(paginaActual+1)}>Siguiente</button>
</div>}
</>}</section>;
}
