import { supabase } from "@/lib/supabase";

export type TipoCredito =
  | "financiacion_vehiculo"
  | "prestamo_personal";

export type EstadoCredito =
  | "activo"
  | "cancelado"
  | "anulado";

export type EstadoCuotaCredito =
  | "pendiente"
  | "parcial"
  | "pagada"
  | "vencida";

export type MonedaCredito =
  | "ARS"
  | "USD";

export type Credito = {
  id: number;
  cliente_id: number;
  operacion_id: number | null;

  tipo_credito: TipoCredito;
  fecha_otorgamiento: string;

  moneda: MonedaCredito;

  capital_financiado: number;
  cantidad_cuotas: number;
  importe_cuota: number;
  fecha_primera_cuota: string;

  periodicidad: "mensual";

  tasa_interes: number | null;
  interes_mora_mensual: number | null;

  garante_nombre: string | null;
  garante_dni: string | null;
  garante_cuit: string | null;
  garante_domicilio: string | null;
  garante_telefono: string | null;

  observaciones: string | null;

  estado: EstadoCredito;

  created_at: string;
  updated_at: string;
};

export type CuotaCredito = {
  id: number;
  credito_id: number;

  numero_cuota: number;
  fecha_vencimiento: string;

  importe_original: number;
  saldo_pendiente: number;

  estado: EstadoCuotaCredito;

  created_at: string;
  updated_at: string;
};

export type PagoCredito = {
  id: number;
  credito_id: number;
  cuota_id: number | null;

  fecha_pago: string;
  importe: number;

  forma_pago: string | null;
    lugar_pago: string | null;
  numero_comprobante: string | null;
  observaciones: string | null;

  created_at: string;
};

export type CreditoFormulario = {
  cliente_id: string;
  operacion_id: string;

  tipo_credito: TipoCredito;
  fecha_otorgamiento: string;

  moneda: MonedaCredito;

  capital_financiado: string;
  cantidad_cuotas: string;
  importe_cuota: string;
  fecha_primera_cuota: string;

  tasa_interes: string;
  interes_mora_mensual: string;

  garante_nombre: string;
  garante_dni: string;
  garante_cuit: string;
  garante_domicilio: string;
  garante_telefono: string;

  observaciones: string;
};

export const CREDITO_FORMULARIO_INICIAL: CreditoFormulario = {
  cliente_id: "",
  operacion_id: "",

  tipo_credito: "prestamo_personal",
  fecha_otorgamiento: "",

  moneda: "ARS",

  capital_financiado: "",
  cantidad_cuotas: "",
  importe_cuota: "",
  fecha_primera_cuota: "",

  tasa_interes: "",
  interes_mora_mensual: "",

  garante_nombre: "",
  garante_dni: "",
  garante_cuit: "",
  garante_domicilio: "",
  garante_telefono: "",

  observaciones: "",
};

function numeroOpcional(
  valor: string
): number | null {
  if (!valor.trim()) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : null;
}

function textoOpcional(
  valor: string
): string | null {
  const texto = valor.trim();

  return texto || null;
}

function sumarMeses(
  fecha: string,
  meses: number
): string {
  const [anio, mes, dia] =
    fecha.split("-").map(Number);

  const fechaBase =
    new Date(anio, mes - 1 + meses, 1);

  const ultimoDiaMes =
    new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth() + 1,
      0
    ).getDate();

  const diaAjustado =
    Math.min(dia, ultimoDiaMes);

  const fechaFinal =
    new Date(
      fechaBase.getFullYear(),
      fechaBase.getMonth(),
      diaAjustado
    );

  const anioFinal =
    fechaFinal.getFullYear();

  const mesFinal =
    String(
      fechaFinal.getMonth() + 1
    ).padStart(2, "0");

  const diaFinal =
    String(
      fechaFinal.getDate()
    ).padStart(2, "0");

  return `${anioFinal}-${mesFinal}-${diaFinal}`;
}

export async function crearCredito(
  form: CreditoFormulario
): Promise<Credito> {
  const capital =
    Number(form.capital_financiado);

  const cantidadCuotas =
    Number(form.cantidad_cuotas);

  const importeCuota =
    Number(form.importe_cuota);

  if (
    !form.cliente_id ||
    !Number.isFinite(capital) ||
    capital <= 0 ||
    !Number.isInteger(cantidadCuotas) ||
    cantidadCuotas <= 0 ||
    !Number.isFinite(importeCuota) ||
    importeCuota <= 0 ||
    !form.fecha_primera_cuota
  ) {
    throw new Error(
      "Los datos del crédito son incompletos o inválidos."
    );
  }

  const { data, error } =
    await supabase
      .from("creditos")
      .insert({
        cliente_id:
          Number(form.cliente_id),

        operacion_id:
          form.operacion_id
            ? Number(form.operacion_id)
            : null,

        tipo_credito:
          form.tipo_credito,

        fecha_otorgamiento:
          form.fecha_otorgamiento ||
          new Date()
            .toISOString()
            .slice(0, 10),

        moneda:
          form.moneda,

        capital_financiado:
          capital,

        cantidad_cuotas:
          cantidadCuotas,

        importe_cuota:
          importeCuota,

        fecha_primera_cuota:
          form.fecha_primera_cuota,

        periodicidad:
          "mensual",

        tasa_interes:
          numeroOpcional(
            form.tasa_interes
          ),

        interes_mora_mensual:
          numeroOpcional(
            form.interes_mora_mensual
          ),

        garante_nombre:
          textoOpcional(
            form.garante_nombre
          ),

        garante_dni:
          textoOpcional(
            form.garante_dni
          ),

        garante_cuit:
          textoOpcional(
            form.garante_cuit
          ),

        garante_domicilio:
          textoOpcional(
            form.garante_domicilio
          ),

        garante_telefono:
          textoOpcional(
            form.garante_telefono
          ),

        observaciones:
          textoOpcional(
            form.observaciones
          ),

        estado:
          "activo",
      })
      .select("*")
      .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo crear el crédito: ${error.message}`
        : "No se pudo crear el crédito."
    );
  }

  const credito =
    data as Credito;

  const cuotas =
    Array.from(
      { length: cantidadCuotas },
      (_, indice) => ({
        credito_id:
          credito.id,

        numero_cuota:
          indice + 1,

        fecha_vencimiento:
          sumarMeses(
            form.fecha_primera_cuota,
            indice
          ),

        importe_original:
          importeCuota,

        saldo_pendiente:
          importeCuota,

        estado:
          "pendiente" as const,
      })
    );

  const {
    error: errorCuotas,
  } =
    await supabase
      .from("cuotas_credito")
      .insert(cuotas);

  if (errorCuotas) {
    await supabase
      .from("creditos")
      .delete()
      .eq("id", credito.id);

    throw new Error(
      `No se pudieron generar las cuotas: ${errorCuotas.message}`
    );
  }

  return credito;
}

export async function listarCreditos(): Promise<
  Credito[]
> {
  const { data, error } =
    await supabase
      .from("creditos")
      .select("*")
      .order(
        "created_at",
        { ascending: false }
      );

  if (error) {
    throw new Error(
      `No se pudieron cargar los créditos: ${error.message}`
    );
  }

  return (data ?? []) as Credito[];
}

export async function obtenerCredito(
  creditoId: number
): Promise<Credito> {
  const { data, error } =
    await supabase
      .from("creditos")
      .select("*")
      .eq("id", creditoId)
      .single();

  if (error || !data) {
    throw new Error(
      error?.message
        ? `No se pudo obtener el crédito: ${error.message}`
        : "No se encontró el crédito."
    );
  }

  return data as Credito;
}

export async function listarCuotasCredito(
  creditoId: number
): Promise<CuotaCredito[]> {
  const { data, error } =
    await supabase
      .from("cuotas_credito")
      .select("*")
      .eq(
        "credito_id",
        creditoId
      )
      .order(
        "numero_cuota",
        { ascending: true }
      );

  if (error) {
    throw new Error(
      `No se pudieron cargar las cuotas: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as CuotaCredito[];
}

export async function listarPagosCredito(
  creditoId: number
): Promise<PagoCredito[]> {
  const { data, error } =
    await supabase
      .from("pagos_credito")
      .select("*")
      .eq(
        "credito_id",
        creditoId
      )
      .order(
        "fecha_pago",
        { ascending: false }
      )
      .order(
        "created_at",
        { ascending: false }
      );

  if (error) {
    throw new Error(
      `No se pudieron cargar los pagos: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as PagoCredito[];
}
export type RegistrarPagoCredito = {
  credito_id: number;
  cuota_id: number;
  fecha_pago: string;
  importe: number;
  forma_pago: string;
  lugar_pago: string;
  numero_comprobante?: string;
  observaciones?: string;
};

export async function registrarPagoCredito(
  pago: RegistrarPagoCredito
): Promise<PagoCredito> {
  if (pago.importe <= 0) {
    throw new Error(
      "El importe del pago debe ser mayor a cero."
    );
  }

  const { data: cuota, error: errorCuota } =
    await supabase
      .from("cuotas_credito")
      .select("*")
      .eq("id", pago.cuota_id)
      .eq("credito_id", pago.credito_id)
      .single();

  if (errorCuota || !cuota) {
    throw new Error(
      "No se pudo obtener la cuota."
    );
  }

  const saldoActual =
    Number(cuota.saldo_pendiente);

  if (pago.importe > saldoActual) {
    throw new Error(
      "El importe pagado no puede superar el saldo pendiente de la cuota."
    );
  }

  const nuevoSaldo =
    saldoActual - pago.importe;

  const nuevoEstado: EstadoCuotaCredito =
    nuevoSaldo <= 0
      ? "pagada"
      : "parcial";

  const { data: pagoCreado, error: errorPago } =
    await supabase
      .from("pagos_credito")
      .insert({
        credito_id: pago.credito_id,
        cuota_id: pago.cuota_id,
        fecha_pago: pago.fecha_pago,
        importe: pago.importe,
        forma_pago:
          pago.forma_pago.trim() || null,
        lugar_pago:
          pago.lugar_pago.trim() || null,
        numero_comprobante:
          pago.numero_comprobante?.trim() || null,
        observaciones:
          pago.observaciones?.trim() || null,
      })
      .select("*")
      .single();

  if (errorPago || !pagoCreado) {
    throw new Error(
      errorPago?.message
        ? `No se pudo registrar el pago: ${errorPago.message}`
        : "No se pudo registrar el pago."
    );
  }

  const { error: errorActualizarCuota } =
    await supabase
      .from("cuotas_credito")
      .update({
        saldo_pendiente: nuevoSaldo,
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pago.cuota_id);

  if (errorActualizarCuota) {
    // Evita dejar registrado un pago si no pudo actualizarse la cuota.
    await supabase
      .from("pagos_credito")
      .delete()
      .eq("id", pagoCreado.id);

    throw new Error(
      `No se pudo actualizar la cuota: ${errorActualizarCuota.message}`
    );
  }

  return pagoCreado as PagoCredito;
}
export async function eliminarPagoCredito(
  pagoId: number
): Promise<void> {
  const { data: pago, error: errorPago } =
    await supabase
      .from("pagos_credito")
      .select("*")
      .eq("id", pagoId)
      .single();

  if (errorPago || !pago) {
    throw new Error(
      "No se pudo obtener el pago."
    );
  }

  const { data: cuota, error: errorCuota } =
    await supabase
      .from("cuotas_credito")
      .select("*")
      .eq("id", pago.cuota_id)
      .single();

  if (errorCuota || !cuota) {
    throw new Error(
      "No se pudo obtener la cuota."
    );
  }

  const { error: errorEliminar } =
    await supabase
      .from("pagos_credito")
      .delete()
      .eq("id", pagoId);

  if (errorEliminar) {
    throw new Error(
      `No se pudo eliminar el pago: ${errorEliminar.message}`
    );
  }

  const { data: pagosRestantes, error: errorPagos } =
    await supabase
      .from("pagos_credito")
      .select("importe")
      .eq("cuota_id", pago.cuota_id);

  if (errorPagos) {
    throw new Error(
      `No se pudieron recalcular los pagos: ${errorPagos.message}`
    );
  }

  const totalPagado = (pagosRestantes ?? []).reduce(
    (total, item) => total + Number(item.importe),
    0
  );

const importeCuota = Number(cuota.importe_original);
const nuevoSaldo = Math.max(
    importeCuota - totalPagado,
    0
  );

  const nuevoEstado: EstadoCuotaCredito =
    nuevoSaldo <= 0
      ? "pagada"
      : totalPagado > 0
        ? "parcial"
        : "pendiente";

  const { error: errorActualizar } =
    await supabase
      .from("cuotas_credito")
      .update({
        saldo_pendiente: nuevoSaldo,
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pago.cuota_id);

  if (errorActualizar) {
    throw new Error(
      `El pago fue eliminado, pero no se pudo recalcular la cuota: ${errorActualizar.message}`
    );
  }
}
export type EditarPagoCredito = {
  fecha_pago: string;
  importe: number;
  forma_pago: string;
  lugar_pago: string;
  numero_comprobante?: string;
  observaciones?: string;
};

export async function editarPagoCredito(
  pagoId: number,
  cambios: EditarPagoCredito
): Promise<PagoCredito> {
  if (!cambios.fecha_pago) {
    throw new Error("Ingresá la fecha de pago.");
  }

  if (
    !Number.isFinite(cambios.importe) ||
    cambios.importe <= 0
  ) {
    throw new Error(
      "El importe del pago debe ser mayor a cero."
    );
  }

  const { data: pagoActual, error: errorPago } =
    await supabase
      .from("pagos_credito")
      .select("*")
      .eq("id", pagoId)
      .single();

  if (errorPago || !pagoActual) {
    throw new Error("No se pudo obtener el pago.");
  }

  if (!pagoActual.cuota_id) {
    throw new Error(
      "El pago no está asociado a una cuota."
    );
  }

  const { data: cuota, error: errorCuota } =
    await supabase
      .from("cuotas_credito")
      .select("*")
      .eq("id", pagoActual.cuota_id)
      .single();

  if (errorCuota || !cuota) {
    throw new Error("No se pudo obtener la cuota.");
  }

  const { data: otrosPagos, error: errorOtrosPagos } =
    await supabase
      .from("pagos_credito")
      .select("importe")
      .eq("cuota_id", pagoActual.cuota_id)
      .neq("id", pagoId);

  if (errorOtrosPagos) {
    throw new Error(
      `No se pudieron verificar los pagos de la cuota: ${errorOtrosPagos.message}`
    );
  }

  const totalOtrosPagos = (otrosPagos ?? []).reduce(
    (total, pago) => total + Number(pago.importe),
    0
  );

  const importeCuota = Number(cuota.importe_original);
  const totalPagado =
    totalOtrosPagos + cambios.importe;

  if (totalPagado > importeCuota) {
    throw new Error(
      "El total pagado no puede superar el importe original de la cuota."
    );
  }

  const nuevoSaldo = Math.max(
    importeCuota - totalPagado,
    0
  );

  const nuevoEstado: EstadoCuotaCredito =
    nuevoSaldo <= 0
      ? "pagada"
      : totalPagado > 0
        ? "parcial"
        : "pendiente";

  const { data: pagoEditado, error: errorEditar } =
    await supabase
      .from("pagos_credito")
      .update({
        fecha_pago: cambios.fecha_pago,
        importe: cambios.importe,
        forma_pago:
          cambios.forma_pago.trim() || null,
        lugar_pago:
          cambios.lugar_pago.trim() || null,
        numero_comprobante:
          cambios.numero_comprobante?.trim() || null,
        observaciones:
          cambios.observaciones?.trim() || null,
      })
      .eq("id", pagoId)
      .select("*")
      .single();

  if (errorEditar || !pagoEditado) {
    throw new Error(
      errorEditar?.message
        ? `No se pudo editar el pago: ${errorEditar.message}`
        : "No se pudo editar el pago."
    );
  }

  const { error: errorActualizarCuota } =
    await supabase
      .from("cuotas_credito")
      .update({
        saldo_pendiente: nuevoSaldo,
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pagoActual.cuota_id);

  if (errorActualizarCuota) {
    throw new Error(
      `El pago fue editado, pero no se pudo recalcular la cuota: ${errorActualizarCuota.message}`
    );
  }

  return pagoEditado as PagoCredito;
}