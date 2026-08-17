import { supabase } from "@/lib/supabase";

export type TipoIngresoUsado =
  | "compra"
  | "permuta"
  | "consignacion";

export type IngresoUsado = {
  id: number;
  vehiculo_id: number;
  titular_cliente_id: number;
  operacion_id: number | null;
  tipo_ingreso: TipoIngresoUsado;
  valor_ingreso: number;
  precio_base_consignacion: number;
  plazo_consignacion_dias: number;
  fecha_ingreso: string;
  contrato_consignacion_emitido: boolean;
  fecha_contrato_consignacion: string | null;
  observaciones: string | null;

  doc_titulo_propiedad: boolean;
  doc_cat: boolean;
  doc_cedula: boolean;
  doc_cedulas_adicionales: boolean;
  doc_formulario_08: boolean;
  doc_verificacion_policial: boolean;
  doc_libre_deuda_patentes: boolean;
  doc_libre_deuda_infracciones: boolean;
  doc_informe_dominio: boolean;
  doc_manuales: boolean;
  doc_duplicado_llave: boolean;
  doc_prenda_03: boolean;
  doc_otros: boolean;
  doc_otros_detalle: string | null;

  created_at: string;
  updated_at: string;
};

export type IngresoUsadoFormulario = {
  vehiculo_id: string;
  titular_cliente_id: string;
  operacion_id: string;
  tipo_ingreso: TipoIngresoUsado;
  valor_ingreso: string;
  precio_base_consignacion: string;
  plazo_consignacion_dias: string;
  fecha_ingreso: string;
  observaciones: string;

  doc_titulo_propiedad: boolean;
  doc_cat: boolean;
  doc_cedula: boolean;
  doc_cedulas_adicionales: boolean;
  doc_formulario_08: boolean;
  doc_verificacion_policial: boolean;
  doc_libre_deuda_patentes: boolean;
  doc_libre_deuda_infracciones: boolean;
  doc_informe_dominio: boolean;
  doc_manuales: boolean;
  doc_duplicado_llave: boolean;
  doc_prenda_03: boolean;
  doc_otros: boolean;
  doc_otros_detalle: string;
};

export const INGRESO_USADO_FORMULARIO_INICIAL: IngresoUsadoFormulario = {
  vehiculo_id: "",
  titular_cliente_id: "",
  operacion_id: "",
  tipo_ingreso: "permuta",
  valor_ingreso: "0",
  precio_base_consignacion: "0",
  plazo_consignacion_dias: "90",
  fecha_ingreso: new Date().toISOString().slice(0, 10),
  observaciones: "",

  doc_titulo_propiedad: false,
  doc_cat: false,
  doc_cedula: false,
  doc_cedulas_adicionales: false,
  doc_formulario_08: false,
  doc_verificacion_policial: false,
  doc_libre_deuda_patentes: false,
  doc_libre_deuda_infracciones: false,
  doc_informe_dominio: false,
  doc_manuales: false,
  doc_duplicado_llave: false,
  doc_prenda_03: false,
  doc_otros: false,
  doc_otros_detalle: "",
};

function convertirNumero(valor: string): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function prepararIngresoUsado(
  form: IngresoUsadoFormulario
) {
  return {
    vehiculo_id: Number(form.vehiculo_id),
    titular_cliente_id: Number(form.titular_cliente_id),
    operacion_id:
      form.operacion_id.trim() !== ""
        ? Number(form.operacion_id)
        : null,
    tipo_ingreso: form.tipo_ingreso,
    valor_ingreso: convertirNumero(form.valor_ingreso),
    precio_base_consignacion: convertirNumero(
      form.precio_base_consignacion
    ),
    plazo_consignacion_dias: Math.max(
      1,
      Math.trunc(
        convertirNumero(form.plazo_consignacion_dias)
      )
    ),
    fecha_ingreso:
      form.fecha_ingreso ||
      new Date().toISOString().slice(0, 10),
    observaciones: form.observaciones.trim() || null,

    doc_titulo_propiedad: form.doc_titulo_propiedad,
    doc_cat: form.doc_cat,
    doc_cedula: form.doc_cedula,
    doc_cedulas_adicionales: form.doc_cedulas_adicionales,
    doc_formulario_08: form.doc_formulario_08,
    doc_verificacion_policial: form.doc_verificacion_policial,
    doc_libre_deuda_patentes: form.doc_libre_deuda_patentes,
    doc_libre_deuda_infracciones:
      form.doc_libre_deuda_infracciones,
    doc_informe_dominio: form.doc_informe_dominio,
    doc_manuales: form.doc_manuales,
    doc_duplicado_llave: form.doc_duplicado_llave,
    doc_prenda_03: form.doc_prenda_03,
    doc_otros: form.doc_otros,
    doc_otros_detalle:
      form.doc_otros
        ? form.doc_otros_detalle.trim() || null
        : null,
  };
}

export async function crearIngresoUsado(
  form: IngresoUsadoFormulario
): Promise<IngresoUsado> {
  const { data, error } = await supabase
    .from("ingresos_usados")
    .insert(prepararIngresoUsado(form))
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo crear el ingreso del usado: ${error.message}`
        : "No se pudo crear el ingreso del usado."
    );
  }

  return data as IngresoUsado;
}

export async function obtenerIngresoUsado(
  ingresoId: number
): Promise<IngresoUsado> {
  const { data, error } = await supabase
    .from("ingresos_usados")
    .select("*")
    .eq("id", ingresoId)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo obtener el ingreso del usado: ${error.message}`
        : "No se encontró el ingreso del usado."
    );
  }

  return data as IngresoUsado;
}

export async function obtenerIngresoUsadoPorOperacion(
  operacionId: number
): Promise<IngresoUsado | null> {
  const { data, error } = await supabase
    .from("ingresos_usados")
    .select("*")
    .eq("operacion_id", operacionId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo obtener el ingreso asociado a la operación: ${error.message}`
    );
  }

  return data ? (data as IngresoUsado) : null;
}

export async function listarIngresosUsados(): Promise<
  IngresoUsado[]
> {
  const { data, error } = await supabase
    .from("ingresos_usados")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `No se pudieron cargar los ingresos de usados: ${error.message}`
    );
  }

  return (data ?? []) as IngresoUsado[];
}

export async function actualizarIngresoUsado(
  ingresoId: number,
  form: IngresoUsadoFormulario
): Promise<IngresoUsado> {
  const { data, error } = await supabase
    .from("ingresos_usados")
    .update(prepararIngresoUsado(form))
    .eq("id", ingresoId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo actualizar el ingreso del usado: ${error.message}`
        : "No se pudo actualizar el ingreso del usado."
    );
  }

  return data as IngresoUsado;
}

export async function marcarContratoConsignacionEmitido(
  ingresoId: number
): Promise<void> {
  const { error } = await supabase
    .from("ingresos_usados")
    .update({
      contrato_consignacion_emitido: true,
      fecha_contrato_consignacion: new Date().toISOString(),
    })
    .eq("id", ingresoId);

  if (error) {
    throw new Error(
      `No se pudo registrar la emisión del contrato de consignación: ${error.message}`
    );
  }
}
