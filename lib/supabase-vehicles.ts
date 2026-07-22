import { supabase } from "./supabase";

export type VehiculoSupabase = {
  id: number;
  created_at: string;
  marca: string;
  modelo: string;
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
};

export async function obtenerVehiculos(): Promise<VehiculoSupabase[]> {
  const { data, error } = await supabase
    .from("vehiculos")
    .select("*")
    .order("destacado", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener vehículos:", error);
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
    console.error("Error al obtener el vehículo:", error);
    return null;
  }

  return data;
}