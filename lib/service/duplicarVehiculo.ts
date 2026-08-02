import {
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

export type DatosVehiculoDuplicado = Omit<
  VehiculoSupabase,
  "id" | "created_at" | "updated_at"
>;

export async function obtenerDatosParaDuplicar(
  vehiculoId: number
): Promise<DatosVehiculoDuplicado | null> {
  if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
    return null;
  }

  const vehiculoOriginal =
    await obtenerVehiculoPorId(vehiculoId);

  if (!vehiculoOriginal) {
    return null;
  }

  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...datosOriginales
  } = vehiculoOriginal;

  return {
    ...datosOriginales,

    // Datos únicos que nunca deben copiarse
    dominio: null,
    numero_chasis: null,
    numero_motor: null,

    // La nueva unidad comienza oculta y sin destacar
    publicado: false,
    destacado: false,

    // Conservamos imágenes y demás datos como base editable
    imagen_principal:
      datosOriginales.imagen_principal ?? null,
    imagenes: datosOriginales.imagenes ?? [],
  };
}