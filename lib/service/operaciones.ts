import { supabase } from "@/lib/supabase";

export type TipoOperacion =
  | "venta"
  | "compra"
  | "consignacion";

  export type MonedaOperacion = "ARS" | "USD";

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
  moneda: MonedaOperacion;
  bonificacion: number;
  gastos: number;
  total: number;

  asesor_comercial: string | null;

  forma_pago: string | null;
  detalle_pago: string | null;
  importe_reserva: number | null;
fecha_reserva: string | null;
reserva_hasta: string | null;
  forma_pago_reserva: string | null;
  detalle_pago_reserva: string | null;
    fecha_pago_consignacion: string | null;
  importe_pago_consignacion: number | null;
  forma_pago_consignacion: string | null;
  detalle_pago_consignacion: string | null;
    clausula_pago_consignacion_1: string | null;
  clausula_pago_consignacion_2: string | null;
  clausula_pago_consignacion_3: string | null;
  clausula_pago_consignacion_4: string | null;
  clausula_pago_consignacion_5: string | null;
  clausula_pago_consignacion_6: string | null;
  clausula_pago_consignacion_7: string | null;
  clausula_compra_1: string | null;
clausula_compra_2: string | null;
clausula_compra_3: string | null;
clausula_compra_4: string | null;
clausula_compra_5: string | null;

  gastos_gestoria: number;
  gastos_gestoria_incluidos: boolean;

  inscripcion_a_cargo_de:
    | "vendedor"
    | "comprador";

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
  moneda: MonedaOperacion;
  bonificacion: string;
  gastos: string;

  asesor_comercial: string;

  forma_pago: string;
  detalle_pago: string;
  importe_reserva: number | null;
fecha_reserva: string;
reserva_hasta: string;
  forma_pago_reserva: string;
  detalle_pago_reserva: string;
    fecha_pago_consignacion: string;
  importe_pago_consignacion: number | null;
  forma_pago_consignacion: string;
  detalle_pago_consignacion: string;

  clausula_pago_consignacion_1: string;
  clausula_pago_consignacion_2: string;
  clausula_pago_consignacion_3: string;
  clausula_pago_consignacion_4: string;
  clausula_pago_consignacion_5: string;
  clausula_pago_consignacion_6: string;
  clausula_pago_consignacion_7: string;
  
  clausula_compra_1: string;
clausula_compra_2: string;
clausula_compra_3: string;
clausula_compra_4: string;
clausula_compra_5: string;

  gastos_gestoria: string;
  gastos_gestoria_incluidos: boolean;

  inscripcion_a_cargo_de:
    | "vendedor"
    | "comprador";

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
  moneda: "ARS",
  bonificacion: "0",
  gastos: "0",

  asesor_comercial: "",

  forma_pago: "",
  detalle_pago: "",
  importe_reserva: null,
fecha_reserva: "",
reserva_hasta: "",
  forma_pago_reserva: "",
  detalle_pago_reserva: "",
    clausula_pago_consignacion_1:
    "EL CONSIGNANTE declara recibir de MotoCars Concesionaria el importe correspondiente al pago de la unidad individualizada precedentemente, mediante la forma de pago y bajo las condiciones detalladas en el presente instrumento.",

  clausula_pago_consignacion_2:
    "EL CONSIGNANTE declara bajo su exclusiva responsabilidad que es titular del vehículo o se encuentra debidamente facultado para disponer del mismo, y que los datos y antecedentes suministrados respecto de la unidad son correctos y veraces.",

  clausula_pago_consignacion_3:
    "EL CONSIGNANTE se obliga a entregar toda la documentación necesaria para efectuar la transferencia dominial del vehículo y los demás trámites que correspondan, debidamente suscripta y certificada cuando resulte exigible.",

  clausula_pago_consignacion_4:
    "EL CONSIGNANTE responde por cualquier gravamen, prenda, inhibición, deuda de patentes, multas, infracciones u otra restricción o deuda originada con anterioridad a la transferencia del vehículo que no hubiera sido expresamente informada y aceptada por MotoCars Concesionaria.",

  clausula_pago_consignacion_5:
    "La recepción del importe consignado en este recibo no libera a EL CONSIGNANTE de las obligaciones documentales, registrales o económicas que se encuentren pendientes respecto de la unidad, quien deberá cumplirlas hasta posibilitar la correcta transferencia dominial del vehículo.",

  clausula_pago_consignacion_6:
    "EL CONSIGNANTE ratifica las declaraciones y obligaciones asumidas en el Contrato de Unidad Automotor en Consignación celebrado respecto del vehículo aquí individualizado, en todo aquello que resulte aplicable y no se encuentre modificado por el presente instrumento.",

  clausula_pago_consignacion_7:
    "Para todos los efectos derivados del presente, las partes constituyen domicilio en los oportunamente denunciados y se someten a la jurisdicción de los Tribunales competentes del Departamento Confluencia, Provincia del Neuquén, con renuncia a cualquier otro fuero o jurisdicción que pudiera corresponder.",
    fecha_pago_consignacion: "",
  importe_pago_consignacion: null,
  forma_pago_consignacion: "",
  detalle_pago_consignacion: "",
  clausula_compra_1: "",
clausula_compra_2: "",
clausula_compra_3: "",
clausula_compra_4: "",
clausula_compra_5: "",

  gastos_gestoria: "0",
  gastos_gestoria_incluidos: false,

  inscripcion_a_cargo_de:
    "vendedor",

  fecha_entrega: "",
  hora_entrega: "",

  entrega_sin_patentar: false,

  observaciones: "",
  observaciones_internas: "",
};

function convertirImporte(
  valor: string
): number {
  const numero =
    Number(valor);

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
moneda:
  form.moneda,

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
    importe_reserva:
      form.importe_reserva ?? null,

    fecha_reserva:
      form.fecha_reserva || null,

    reserva_hasta:
      form.reserva_hasta || null,

          forma_pago_reserva:
      form.forma_pago_reserva || null,

    detalle_pago_reserva:
      form.detalle_pago_reserva || null,
          fecha_pago_consignacion:
      form.fecha_pago_consignacion || null,

    importe_pago_consignacion:
      form.importe_pago_consignacion ?? null,

    forma_pago_consignacion:
      form.forma_pago_consignacion.trim() || null,

    detalle_pago_consignacion:
      form.detalle_pago_consignacion.trim() || null,
          clausula_pago_consignacion_1:
      form.clausula_pago_consignacion_1.trim() || null,

    clausula_pago_consignacion_2:
      form.clausula_pago_consignacion_2.trim() || null,

    clausula_pago_consignacion_3:
      form.clausula_pago_consignacion_3.trim() || null,

    clausula_pago_consignacion_4:
      form.clausula_pago_consignacion_4.trim() || null,

    clausula_pago_consignacion_5:
      form.clausula_pago_consignacion_5.trim() || null,

    clausula_pago_consignacion_6:
      form.clausula_pago_consignacion_6.trim() || null,

    clausula_pago_consignacion_7:
      form.clausula_pago_consignacion_7.trim() || null,

      clausula_compra_1:
  form.clausula_compra_1 || null,

clausula_compra_2:
  form.clausula_compra_2 || null,

clausula_compra_3:
  form.clausula_compra_3 || null,

clausula_compra_4:
  form.clausula_compra_4 || null,

clausula_compra_5:
  form.clausula_compra_5 || null,

    gastos_gestoria:
      convertirImporte(
        form.gastos_gestoria
      ),
      gastos_gestoria_incluidos:
  form.gastos_gestoria_incluidos,

    inscripcion_a_cargo_de:
      form.inscripcion_a_cargo_de,

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
  const {
    data,
    error,
  } =
    await supabase
      .from("operaciones")
      .insert(
        prepararOperacion(
          form
        )
      )
      .select("*")
      .single();

  if (
    error ||
    !data
  ) {
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
  const {
    data,
    error,
  } =
    await supabase
      .from("operaciones")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throw new Error(
      `No se pudieron cargar las operaciones: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as Operacion[];
}

export async function obtenerOperacion(
  operacionId: number
): Promise<Operacion> {
  const {
    data,
    error,
  } =
    await supabase
      .from("operaciones")
      .select("*")
      .eq(
        "id",
        operacionId
      )
      .single();

  if (
    error ||
    !data
  ) {
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
  const {
    data,
    error,
  } =
    await supabase
      .from("operaciones")
      .update(
        prepararOperacion(
          form
        )
      )
      .eq(
        "id",
        operacionId
      )
      .select("*")
      .single();

  if (
    error ||
    !data
  ) {
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
  const {
    error,
  } =
    await supabase
      .from("operaciones")
      .update({
        estado,
      })
      .eq(
        "id",
        operacionId
      );

  if (error) {
    throw new Error(
      `No se pudo cambiar el estado: ${error.message}`
    );
  }
}

/*
 * ===========================================================
 * ELIMINAR OPERACIÓN COMPLETA
 * ===========================================================
 *
 * La eliminación real se ejecuta dentro de PostgreSQL mediante
 * public.eliminar_operacion_completa().
 *
 * La función SQL aplica las reglas de stock:
 *
 * Venta simple
 *   → elimina la operación.
 *   → NO elimina el vehículo vendido.
 *
 * Compra / Consignación
 *   → elimina la operación.
 *   → elimina el ingreso asociado.
 *   → elimina el vehículo incorporado por esa operación.
 *
 * Venta con permuta
 *   → elimina la operación.
 *   → NO elimina el vehículo vendido.
 *   → elimina la unidad recibida en permuta.
 *
 * documentos_operacion y pagos_compra se eliminan por las
 * relaciones ON DELETE CASCADE existentes en Supabase.
 */

export async function eliminarOperacionCompleta(
  operacionId: number
): Promise<void> {
  if (
    !Number.isInteger(
      operacionId
    ) ||
    operacionId <= 0
  ) {
    throw new Error(
      "El identificador de la operación no es válido."
    );
  }

  const {
    error,
  } =
    await supabase.rpc(
      "eliminar_operacion_completa",
      {
        p_operacion_id:
          operacionId,
      }
    );

  if (error) {
    throw new Error(
      `No se pudo eliminar la operación: ${error.message}`
    );
  }
}