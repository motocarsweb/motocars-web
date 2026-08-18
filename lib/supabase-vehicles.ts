import { supabase } from "./supabase";

export type VehiculoSupabase = {
  id: number;
  created_at: string;
  updated_at: string | null;

  // Campos actuales, mantenidos para no romper la web
  marca: string | null;
  modelo: string | null;
  version: string | null;
  combustible: string | null;
  transmision: string | null;
  tipo: string | null;

  // Nuevas relaciones del ERP
  marca_id: string | null;
  modelo_id: string | null;
  version_id: string | null;
  tipo_vehiculo_id: string | null;
  estilo_moto_id: string | null;
  combustible_id: string | null;
  transmision_id: string | null;
  traccion_id: string | null;
  tipo_ingreso_id: string | null;

  anio: number | null;
  precio: number | null;
  precio_compra: number | null;
  kilometros: number | null;

  color: string | null;
  estado: string | null;
  condicion: string | null;

  dominio: string | null;
  numero_chasis: string | null;
  numero_motor: string | null;

  destacado: boolean | null;
  publicado: boolean;

  descripcion: string | null;
  observaciones_internas: string | null;

  imagen_principal: string | null;
  imagenes: string[] | null;
};

export type NuevoVehiculo = Partial<
  Omit<VehiculoSupabase, "id" | "created_at" | "updated_at">
> & {
  marca: string;
  modelo: string;
};

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
  const { data, error } = await supabase
    .from("vehiculos")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("ERROR COMPLETO AL ELIMINAR VEHÍCULO:");
    console.error(error);

    alert(JSON.stringify(error, null, 2));

    return false;
  }

  console.log("Filas eliminadas:", data);

  if (!data || data.length === 0) {
    alert(
      "Supabase no eliminó ninguna fila. Probablemente una política RLS está bloqueando el DELETE."
    );
    return false;
  }

  return true;
}