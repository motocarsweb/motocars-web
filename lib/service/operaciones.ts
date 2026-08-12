import { supabase } from "@/lib/supabase";

export type TipoOperacion =
  | "venta"
  | "compra"
  | "consignacion";

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

  tipo_operacion: TipoOperacion;

  cliente_id: number;

  /*
   * Vehículo principal de la operación:
   *
   * Venta        → unidad que sale del stock.
   * Compra       → unidad que entra al stock.
   * Consignación → unidad que entra al stock.
   */
  vehiculo_id: number;

  estado: EstadoOperacion;

  precio_vehiculo: number;
  bonificacion: number;
  gastos: number;
  total: number;

  asesor_comercial: string | null;

  forma_pago: string | null;
  detalle_pago: string | null;

  gastos_gestoria: number;

  fecha_entrega: string | null;
  hora_entrega: string | null;

  entrega_sin_patentar: boolean;

  observaciones: string | null;
  observaciones_internas: string | null;

  created_at: string;
  updated_at: string;
};

export type OperacionFormulario = {
  tipo_operacion: TipoOperacion;

  cliente_id: string;

  /*
   * Siempre corresponde al vehículo principal.
   */
  vehiculo_id: string;

  precio_vehiculo: string;
  bonificacion: string;
  gastos: string;

  asesor_comercial: string;

  forma_pago: string;
  detalle_pago: string;

  gastos_gestoria: string;

  fecha_entrega: string;
  hora_entrega: string;

  entrega_sin_patentar: boolean;

  observaciones: string;
  observaciones_internas: string;
};

export const OPERACION_FORMULARIO_INICIAL: OperacionFormulario = {
  tipo_operacion: "venta",

  cliente_id: "",
  vehiculo_id: "",

  precio_vehiculo: "",
  bonificacion: "0",
  gastos: "0",

  asesor_comercial: "",

  forma_pago: "",
  detalle_pago: "",

  gastos_gestoria: "0",

  fecha_entrega: "",
  hora_entrega: "",

  entrega_sin_patentar: false,

  observaciones: "",
  observaciones_internas: "",
};

function convertirImporte(valor: string): number {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function prepararOperacion(
  form: OperacionFormulario
) {
  return {
    tipo_operacion:
      form.tipo_operacion,

    cliente_id:
      Number(form.cliente_id),

    vehiculo_id:
      Number(form.vehiculo_id),

    precio_vehiculo:
      convertirImporte(
        form.precio_vehiculo
      ),

    bonificacion:
      convertirImporte(
        form.bonificacion
      ),

    gastos:
      convertirImporte(
        form.gastos
      ),

    asesor_comercial:
      form.asesor_comercial.trim() ||
      null,

    forma_pago:
      form.forma_pago.trim() ||
      null,

    detalle_pago:
      form.detalle_pago.trim() ||
      null,

    gastos_gestoria:
      convertirImporte(
        form.gastos_gestoria
      ),

    fecha_entrega:
      form.fecha_entrega ||
      null,

    hora_entrega:
      form.hora_entrega ||
      null,

    entrega_sin_patentar:
      form.entrega_sin_patentar,

    observaciones:
      form.observaciones.trim() ||
      null,

    observaciones_internas:
      form.observaciones_internas.trim() ||
      null,
  };
}

export async function crearOperacion(
  form: OperacionFormulario
): Promise<Operacion> {
  const { data, error } = await supabase
    .from("operaciones")
    .insert(
      prepararOperacion(form)
    )
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

export async function listarOperaciones(): Promise<
  Operacion[]
> {
  const { data, error } = await supabase
    .from("operaciones")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

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
    .update(
      prepararOperacion(form)
    )
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