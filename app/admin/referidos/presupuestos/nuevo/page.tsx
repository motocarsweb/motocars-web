import { redirect } from "next/navigation";
import { obtenerPerfilAcceso } from "@/lib/permisos-acceso";
import { supabaseAdmin } from "@/lib/supabase-admin";
import FormularioPresupuestoReferido from "./FormularioPresupuestoReferido";

export default async function NuevoPresupuestoReferido() {
  const perfil = await obtenerPerfilAcceso();
  if (!perfil) redirect("/admin/login");
  if (perfil.rol !== "vendedor" || !perfil.puedePresupuestos) redirect("/admin/referidos");
  const { data, error } = await supabaseAdmin.from("vehiculos")
    .select("id, marca, modelo, version, anio, precio")
    .eq("publicado", true).eq("en_stock", true).order("marca");
  if (error) return <p>No se pudo cargar el catálogo de vehículos.</p>;
  const vehiculos = (data ?? []).map((v) => ({
    id: Number(v.id),
    nombre: [v.marca, v.modelo, v.version, v.anio].filter(Boolean).join(" "),
    precio: Number(v.precio),
  })).filter((v) => Number.isFinite(v.precio));
  return <FormularioPresupuestoReferido vehiculos={vehiculos} />;
}
