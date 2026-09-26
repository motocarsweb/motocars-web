import { supabase } from "@/lib/supabase";

export type EstadoPresupuesto =
  | "pendiente"
  | "contactado"
  | "negociacion"
  | "vendido"
  | "descartado";

export type Presupuesto = {
  id: number;
  numero: string | null;
  fecha: string;

  vehiculo_id: number;

  nombre_cliente: string;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  direccion: string | null;

  precio_vehiculo: number;
  bonificacion: number;
  gastos: number;

  valor_permuta: number;
  permuta_tipo: string | null;
  permuta_marca: string | null;
  permuta_modelo: string | null;
  permuta_anio: number | null;
  permuta_kilometros: number | null;

  total: number;

  forma_pago: string | null;
  financiacion: string | null;
  observaciones: string | null;

  validez_dias: number;
  valido_hasta: string | null;

  estado: EstadoPresupuesto;
  proximo_seguimiento: string | null;
  observaciones_seguimiento: string | null;

  cliente_id: number | null;
  operacion_id: number | null;
  convertido_operacion: boolean;
  fecha_conversion: string | null;

  created_at: string;
  updated_at: string;
};

export type PresupuestoFormulario = {
  vehiculo_id: number;

  nombre_cliente: string;
  documento: string;
  telefono: string;
  email: string;
  ciudad: string;
  direccion: string;

  precio_vehiculo: number;
  bonificacion: number;
  gastos: number;

  valor_permuta: number;
  permuta_tipo: string;
  permuta_marca: string;
  permuta_modelo: string;
  permuta_anio: number | null;
  permuta_kilometros: number | null;

  total: number;

  forma_pago: string;
  financiacion: string;
  observaciones: string;

  validez_dias: number;
  valido_hasta: string | null;
};

function textoOpcional(valor: string) {
  const texto = valor.trim();
  return texto || null;
}

export async function crearPresupuesto(
  form: PresupuestoFormulario
): Promise<Presupuesto> {
  if (!form.vehiculo_id) {
    throw new Error(
      "El presupuesto debe estar asociado a un vehículo."
    );
  }

  if (!form.nombre_cliente.trim()) {
    throw new Error(
      "Ingresá el nombre del interesado."
    );
  }

  const { data, error } = await supabase
    .from("presupuestos")
    .insert({
      vehiculo_id: form.vehiculo_id,

      nombre_cliente: form.nombre_cliente.trim(),
      documento: textoOpcional(form.documento),
      telefono: textoOpcional(form.telefono),
      email: textoOpcional(form.email),
      ciudad: textoOpcional(form.ciudad),
      direccion: textoOpcional(form.direccion),

      precio_vehiculo: form.precio_vehiculo,
      bonificacion: form.bonificacion,
      gastos: form.gastos,

      valor_permuta: form.valor_permuta,
      permuta_tipo:
  textoOpcional(form.permuta_tipo),
      permuta_marca:
        textoOpcional(form.permuta_marca),
      permuta_modelo:
        textoOpcional(form.permuta_modelo),
      permuta_anio: form.permuta_anio,
      permuta_kilometros:
        form.permuta_kilometros,

      total: form.total,

      forma_pago: textoOpcional(form.forma_pago),
      financiacion:
        textoOpcional(form.financiacion),
      observaciones:
        textoOpcional(form.observaciones),

      validez_dias: form.validez_dias,
      valido_hasta: form.valido_hasta,

      estado: "pendiente",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo guardar el presupuesto: ${error.message}`
        : "No se pudo guardar el presupuesto."
    );
  }

  const numero = `P-${String(data.id).padStart(
    6,
    "0"
  )}`;

  const { data: presupuestoActualizado, error: errorNumero } =
    await supabase
      .from("presupuestos")
      .update({
        numero,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("*")
      .single();

  if (errorNumero || !presupuestoActualizado) {
    throw new Error(
      errorNumero?.message
        ? `El presupuesto fue creado pero no se pudo generar su número: ${errorNumero.message}`
        : "El presupuesto fue creado pero no se pudo generar su número."
    );
  }

  return presupuestoActualizado as Presupuesto;
}

export async function listarPresupuestos(): Promise<
  Presupuesto[]
> {
  const { data, error } = await supabase
    .from("presupuestos")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `No se pudieron cargar los presupuestos: ${error.message}`
    );
  }

  return (data ?? []) as Presupuesto[];
}

export async function obtenerPresupuesto(
  presupuestoId: number
): Promise<Presupuesto> {
  const { data, error } = await supabase
    .from("presupuestos")
    .select("*")
    .eq("id", presupuestoId)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo obtener el presupuesto: ${error.message}`
        : "No se encontró el presupuesto."
    );
  }

  return data as Presupuesto;
}

export async function actualizarSeguimientoPresupuesto(
  presupuestoId: number,
  datos: {
    estado: EstadoPresupuesto;
    proximo_seguimiento: string | null;
    observaciones_seguimiento: string;
  }
): Promise<Presupuesto> {
  const { data, error } = await supabase
    .from("presupuestos")
    .update({
      estado: datos.estado,
      proximo_seguimiento:
        datos.proximo_seguimiento || null,
      observaciones_seguimiento:
        textoOpcional(
          datos.observaciones_seguimiento
        ),
      updated_at: new Date().toISOString(),
    })
    .eq("id", presupuestoId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo actualizar el seguimiento: ${error.message}`
        : "No se pudo actualizar el seguimiento."
    );
  }

  return data as Presupuesto;
}
export async function actualizarPresupuesto(
  presupuestoId: number,
  form: PresupuestoFormulario
): Promise<Presupuesto> {
  if (!presupuestoId) {
    throw new Error(
      "El presupuesto no es válido."
    );
  }

  if (!form.nombre_cliente.trim()) {
    throw new Error(
      "Ingresá el nombre del interesado."
    );
  }

  const { data, error } = await supabase
    .from("presupuestos")
    .update({
      vehiculo_id: form.vehiculo_id,

      nombre_cliente:
        form.nombre_cliente.trim(),

      documento:
        textoOpcional(form.documento),

      telefono:
        textoOpcional(form.telefono),

      email:
        textoOpcional(form.email),

      ciudad:
        textoOpcional(form.ciudad),

      direccion:
        textoOpcional(form.direccion),

      precio_vehiculo:
        form.precio_vehiculo,

      bonificacion:
        form.bonificacion,

      gastos:
        form.gastos,

      valor_permuta:
        form.valor_permuta,

      permuta_marca:
        textoOpcional(
          form.permuta_marca
        ),

      permuta_modelo:
        textoOpcional(
          form.permuta_modelo
        ),

      permuta_anio:
        form.permuta_anio,

      permuta_kilometros:
        form.permuta_kilometros,

      total:
        form.total,

      forma_pago:
        textoOpcional(
          form.forma_pago
        ),

      financiacion:
        textoOpcional(
          form.financiacion
        ),

      observaciones:
        textoOpcional(
          form.observaciones
        ),

      validez_dias:
        form.validez_dias,

      valido_hasta:
        form.valido_hasta,

      updated_at:
        new Date().toISOString(),
    })
    .eq("id", presupuestoId)
    .eq("convertido_operacion", false)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo actualizar el presupuesto: ${error.message}`
        : "No se pudo actualizar el presupuesto."
    );
  }

  return data as Presupuesto;
}
export async function marcarPresupuestoConvertido(
  presupuestoId: number,
  operacionId: number,
  clienteId: number
): Promise<void> {
  const { error } = await supabase
    .from("presupuestos")
    .update({
      estado: "vendido",
      convertido_operacion: true,
      operacion_id: operacionId,
      cliente_id: clienteId,
      fecha_conversion:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", presupuestoId)
    .eq("convertido_operacion", false);

  if (error) {
    throw new Error(
      `La operación fue creada, pero no se pudo marcar el presupuesto como convertido: ${error.message}`
    );
  }
}