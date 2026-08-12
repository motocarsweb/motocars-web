import { supabase } from "@/lib/supabase";

export type EstadoDocumentoOperacion =
  | "generado"
  | "impreso"
  | "enviado"
  | "firmado"
  | "anulado";

export type TipoDocumentoOperacion =
  | "presupuesto"
  | "boleto_0km"
  | "boleto_0km_permuta"
  | "boleto_usado"
  | "boleto_usado_permuta"
    | "boleto_compra"
  | "contrato_consignacion"
  | "constancia_gestoria"
  | "responsabilidad_civil"
  | "boleto_moto"
  | "detalle_pago"
  | "recibo_senia"
  | "recibo_pago"
  | "acta_entrega";

export type DocumentoOperacion = {
  id: number;

  operacion_id: number | null;
  ingreso_usado_id: number | null;

  tipo_documento: TipoDocumentoOperacion;

  numero_version: number;

  estado: EstadoDocumentoOperacion;

  datos_snapshot: Record<string, unknown>;

  archivo_url: string | null;
  observaciones: string | null;

  generado_at: string;
  impreso_at: string | null;
  enviado_at: string | null;
  firmado_at: string | null;

  created_at: string;
};

export type CrearDocumentoOperacionInput = {
  operacion_id?: number | null;
  ingreso_usado_id?: number | null;

  tipo_documento: TipoDocumentoOperacion;

  datos_snapshot?: Record<string, unknown>;

  archivo_url?: string | null;
  observaciones?: string | null;
};

function validarOrigen(
  operacionId?: number | null,
  ingresoUsadoId?: number | null
) {
  if (
    !operacionId &&
    !ingresoUsadoId
  ) {
    throw new Error(
      "El documento debe estar vinculado a una operación o a un ingreso de usado."
    );
  }
}

export async function listarDocumentosOperacion(
  operacionId: number
): Promise<DocumentoOperacion[]> {
  const { data, error } = await supabase
    .from("documentos_operacion")
    .select("*")
    .eq("operacion_id", operacionId)
    .order("generado_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `No se pudieron cargar los documentos de la operación: ${error.message}`
    );
  }

  return (data ?? []) as DocumentoOperacion[];
}

export async function listarDocumentosIngresoUsado(
  ingresoUsadoId: number
): Promise<DocumentoOperacion[]> {
  const { data, error } = await supabase
    .from("documentos_operacion")
    .select("*")
    .eq("ingreso_usado_id", ingresoUsadoId)
    .order("generado_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `No se pudieron cargar los documentos del ingreso usado: ${error.message}`
    );
  }

  return (data ?? []) as DocumentoOperacion[];
}

export async function obtenerDocumentoOperacion(
  documentoId: number
): Promise<DocumentoOperacion> {
  const { data, error } = await supabase
    .from("documentos_operacion")
    .select("*")
    .eq("id", documentoId)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo obtener el documento: ${error.message}`
        : "No se encontró el documento."
    );
  }

  return data as DocumentoOperacion;
}

export async function obtenerUltimaVersionDocumento(
  tipoDocumento: TipoDocumentoOperacion,
  opciones: {
    operacion_id?: number | null;
    ingreso_usado_id?: number | null;
  }
): Promise<DocumentoOperacion | null> {
  validarOrigen(
    opciones.operacion_id,
    opciones.ingreso_usado_id
  );

  let consulta = supabase
    .from("documentos_operacion")
    .select("*")
    .eq(
      "tipo_documento",
      tipoDocumento
    );

  if (opciones.operacion_id) {
    consulta = consulta.eq(
      "operacion_id",
      opciones.operacion_id
    );
  }

  if (opciones.ingreso_usado_id) {
    consulta = consulta.eq(
      "ingreso_usado_id",
      opciones.ingreso_usado_id
    );
  }

  const { data, error } = await consulta
    .order("numero_version", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo obtener la última versión del documento: ${error.message}`
    );
  }

  return data
    ? (data as DocumentoOperacion)
    : null;
}

export async function crearDocumentoOperacion(
  input: CrearDocumentoOperacionInput
): Promise<DocumentoOperacion> {
  validarOrigen(
    input.operacion_id,
    input.ingreso_usado_id
  );

  const ultimaVersion =
    await obtenerUltimaVersionDocumento(
      input.tipo_documento,
      {
        operacion_id:
          input.operacion_id ?? null,

        ingreso_usado_id:
          input.ingreso_usado_id ?? null,
      }
    );

  const numeroVersion =
    ultimaVersion
      ? ultimaVersion.numero_version + 1
      : 1;

  const { data, error } = await supabase
    .from("documentos_operacion")
    .insert({
      operacion_id:
        input.operacion_id ?? null,

      ingreso_usado_id:
        input.ingreso_usado_id ?? null,

      tipo_documento:
        input.tipo_documento,

      numero_version:
        numeroVersion,

      estado:
        "generado",

      datos_snapshot:
        input.datos_snapshot ?? {},

      archivo_url:
        input.archivo_url ?? null,

      observaciones:
        input.observaciones?.trim() ||
        null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo registrar el documento: ${error.message}`
        : "No se pudo registrar el documento."
    );
  }

  return data as DocumentoOperacion;
}

export async function cambiarEstadoDocumentoOperacion(
  documentoId: number,
  estado: EstadoDocumentoOperacion
): Promise<DocumentoOperacion> {
  const cambios: {
    estado: EstadoDocumentoOperacion;
    impreso_at?: string;
    enviado_at?: string;
    firmado_at?: string;
  } = {
    estado,
  };

  const ahora =
    new Date().toISOString();

  if (estado === "impreso") {
    cambios.impreso_at = ahora;
  }

  if (estado === "enviado") {
    cambios.enviado_at = ahora;
  }

  if (estado === "firmado") {
    cambios.firmado_at = ahora;
  }

  const { data, error } = await supabase
    .from("documentos_operacion")
    .update(cambios)
    .eq("id", documentoId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo actualizar el documento: ${error.message}`
        : "No se pudo actualizar el documento."
    );
  }

  return data as DocumentoOperacion;
}

export async function actualizarArchivoDocumentoOperacion(
  documentoId: number,
  archivoUrl: string
): Promise<DocumentoOperacion> {
  const { data, error } = await supabase
    .from("documentos_operacion")
    .update({
      archivo_url:
        archivoUrl.trim() || null,
    })
    .eq("id", documentoId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo guardar el archivo del documento: ${error.message}`
        : "No se pudo guardar el archivo del documento."
    );
  }

  return data as DocumentoOperacion;
}
export type GenerarDocumentacionCompraInput = {
  operacion_id: number;
  ingreso_usado_id?: number | null;
  datos_snapshot: Record<string, unknown>;
};

export type DocumentacionCompraGenerada = {
  boletoCompra: DocumentoOperacion;
  contratoConsignacion: DocumentoOperacion;
};

export async function generarDocumentacionCompra(
  input: GenerarDocumentacionCompraInput
): Promise<DocumentacionCompraGenerada> {
  const boletoCompra =
    await crearDocumentoOperacion({
      operacion_id: input.operacion_id,
      tipo_documento: "boleto_compra",
      datos_snapshot: input.datos_snapshot,
    });

  const contratoConsignacion =
    await crearDocumentoOperacion({
      operacion_id: input.operacion_id,

      ingreso_usado_id:
        input.ingreso_usado_id ?? null,

      tipo_documento:
        "contrato_consignacion",

      datos_snapshot:
        input.datos_snapshot,
    });

  return {
    boletoCompra,
    contratoConsignacion,
  };
}