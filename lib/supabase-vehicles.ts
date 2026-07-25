import { supabase } from "./supabase";

export type VehiculoSupabase = {
  id: number;
  created_at: string;
  marca: string | null;
  modelo: string | null;
  version: string | null;
  anio: number | null;
  precio: number | null;
  kilometros: number | null;
  combustible: string | null;
  transmision: string | null;
  color: string | null;
  tipo: string | null;
  estado: string | null;
  destacado: boolean | null;
  descripcion: string | null;
  imagen_principal: string | null;
  imagenes: string[] | null;
};

export type NuevoVehiculo = Omit<
  VehiculoSupabase,
  "id" | "created_at"
>;

export type ActualizarVehiculo = Partial<NuevoVehiculo>;

export async function obtenerVehiculos(): Promise<VehiculoSupabase[]> {
  const { data, error } = await supabase
    .from("vehiculos")
    .select("*")
    .order("destacado", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener vehículos:", error.message);
    return [];
  }

  return data ?? [];
}

export async function obtenerVehiculoPorId(
  id: number
): Promise<VehiculoSupabase | null> {
  const { data, error } = await supabase
    .from("vehiculos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener el vehículo:", error.message);
    return null;
  }

  return data;
}

export async function crearVehiculo(
  vehiculo: NuevoVehiculo
): Promise<VehiculoSupabase | null> {
  const { data, error } = await supabase
    .from("vehiculos")
    .insert(vehiculo)
    .select("*")
    .single();

 if (error) {
  console.error("ERROR COMPLETO SUPABASE:");
  console.error(error);

  alert(
    JSON.stringify(error, null, 2)
  );

  return null;
  }

  return data;
}

export async function actualizarVehiculo(
  id: number,
  cambios: ActualizarVehiculo
): Promise<VehiculoSupabase | null> {
  const { data, error } = await supabase
    .from("vehiculos")
    .update(cambios)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error al actualizar el vehículo:", error.message);
    return null;
  }

  return data;
}

export async function eliminarVehiculo(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("vehiculos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar el vehículo:", error.message);
    return false;
  }

  return true;
}