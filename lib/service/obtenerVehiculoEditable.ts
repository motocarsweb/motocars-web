import { supabase } from "@/lib/supabase";

export async function obtenerVehiculoEditable(
  vehiculoId: number
) {
  const { data, error } = await supabase
    .from("vehiculos")
    .select("*")
    .eq("id", vehiculoId)
    .single();

  if (error) {
    throw new Error(
      `No se pudo obtener el vehículo: ${error.message}`
    );
  }

  return data;
}