import "server-only";
import { crearSupabaseServer } from "@/lib/supabase-server";

export type PerfilAcceso = {
  userId: string;
  nombre: string;
  rol: "administrador" | "vendedor";
  codigoReferido: string | null;
  puedePresupuestos: boolean;
  puedeOperaciones: boolean;
};

export async function obtenerPerfilAcceso(): Promise<PerfilAcceso | null> {
  const supabase = await crearSupabaseServer();
  const { data: { user }, error: errorUsuario } = await supabase.auth.getUser();

  if (errorUsuario || !user) return null;

  const { data, error } = await supabase
    .from("usuarios_permisos")
    .select("nombre, rol, codigo_referido, puede_presupuestos, puede_operaciones, activo")
    .eq("user_id", user.id)
    .eq("activo", true)
    .maybeSingle();

  if (error || !data) return null;
  if (data.rol !== "administrador" && data.rol !== "vendedor") return null;

  return {
    userId: user.id,
    nombre: data.nombre,
    rol: data.rol,
    codigoReferido: data.codigo_referido,
    puedePresupuestos: data.puede_presupuestos === true,
    puedeOperaciones: data.puede_operaciones === true,
  };
}

export async function esAdministradorActivo(): Promise<boolean> {
  const perfil = await obtenerPerfilAcceso();
  return perfil?.rol === "administrador";
}
