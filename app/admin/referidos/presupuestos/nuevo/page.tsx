import { redirect } from "next/navigation";
import { obtenerPerfilAcceso } from "@/lib/permisos-acceso";

export default async function NuevoPresupuestoReferido() {
  const perfil = await obtenerPerfilAcceso();
  if (!perfil) redirect("/admin/login");
  if (perfil.rol !== "vendedor" || !perfil.puedePresupuestos) redirect("/admin/referidos");
  return <section><h1>Nuevo presupuesto</h1><p>Formulario en preparación.</p></section>;
}
