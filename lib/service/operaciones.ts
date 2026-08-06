import { supabase } from "@/lib/supabase";

export type EstadoOperacion =
  | "borrador"
  | "presupuesto_emitido"
  | "aceptada"
  | "boleto_firmado"
  | "entregada"
  | "cancelada";

export type Operacion = {
  id: number;
  numero: string | null;

  cliente_id: number;
  vehiculo_id: number;

  estado: EstadoOperacion;

  precio_vehiculo: number;
  bonificacion: number;
  gastos: number;
  total: number;

  observaciones: string | null;

  created_at: string;
  updated_at: string;
};

export type OperacionFormulario = {
  cliente_id: string;
  vehiculo_id: string;

  precio_vehiculo: string;
  bonificacion: string;
  gastos: string;

  observaciones: string;
};

export const OPERACION_FORMULARIO_INICIAL: OperacionFormulario = {
  cliente_id: "",
  vehiculo_id: "",

  precio_vehiculo: "",
  bonificacion: "0",
  gastos: "0",

  observaciones: "",
};

function convertirImporte(valor: string): number {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
}

function prepararOperacion(form: OperacionFormulario) {
  return {
    cliente_id: Number(form.cliente_id),
    vehiculo_id: Number(form.vehiculo_id),

    precio_vehiculo: convertirImporte(form.precio_vehiculo),
    bonificacion: convertirImporte(form.bonificacion),
    gastos: convertirImporte(form.gastos),

    observaciones: form.observaciones.trim() || null,
  };
}

export async function crearOperacion(
  form: OperacionFormulario
): Promise<Operacion> {
  const { data, error } = await supabase
    .from("operaciones")
    .insert(prepararOperacion(form))
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo crear la operación: ${error.message}`
        : "No se pudo crear la operación."
    );
  }

  return data as Operacion;
}

export async function listarOperaciones(): Promise<Operacion[]> {
  const { data, error } = await supabase
    .from("operaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `No se pudieron cargar las operaciones: ${error.message}`
    );
  }

  return (data ?? []) as Operacion[];
}

export async function obtenerOperacion(
  operacionId: number
): Promise<Operacion> {
  const { data, error } = await supabase
    .from("operaciones")
    .select("*")
    .eq("id", operacionId)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo obtener la operación: ${error.message}`
        : "No se encontró la operación."
    );
  }

  return data as Operacion;
}

export async function actualizarOperacion(
  operacionId: number,
  form: OperacionFormulario
): Promise<Operacion> {
  const { data, error } = await supabase
    .from("operaciones")
    .update(prepararOperacion(form))
    .eq("id", operacionId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo actualizar la operación: ${error.message}`
        : "No se pudo actualizar la operación."
    );
  }

  return data as Operacion;
}

export async function cambiarEstadoOperacion(
  operacionId: number,
  estado: EstadoOperacion
): Promise<void> {
  const { error } = await supabase
    .from("operaciones")
    .update({ estado })
    .eq("id", operacionId);

  if (error) {
    throw new Error(
      `No se pudo cambiar el estado: ${error.message}`
    );
  }
}