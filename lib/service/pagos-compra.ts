import { supabase } from "@/lib/supabase";

export type MedioPagoCompra =
  | "efectivo"
  | "transferencia"
  | "cheque"
  | "otro";

export type PagoCompra = {
  id: number;

  operacion_id: number;

  medio_pago: MedioPagoCompra;

  importe: number;

  banco: string | null;
  titular: string | null;
  cuil_cuit: string | null;
  tipo_cuenta: string | null;
  numero_cuenta: string | null;
  alias: string | null;
  cbu_cvu: string | null;

  detalle: string | null;

  created_at: string;
  updated_at: string;
};

export type PagoCompraFormulario = {
  medio_pago: MedioPagoCompra;

  importe: string;

  banco: string;
  titular: string;
  cuil_cuit: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  alias: string;
  cbu_cvu: string;

  detalle: string;
};

export const PAGO_COMPRA_FORMULARIO_INICIAL: PagoCompraFormulario = {
  medio_pago: "efectivo",

  importe: "",

  banco: "",
  titular: "",
  cuil_cuit: "",
  tipo_cuenta: "",
  numero_cuenta: "",
  alias: "",
  cbu_cvu: "",

  detalle: "",
};

function valorOpcional(
  valor: string
): string | null {
  const limpio =
    valor.trim();

  return limpio
    ? limpio
    : null;
}

function convertirImporte(
  valor: string
): number {
  const numero =
    Number(valor);

  if (
    !Number.isFinite(numero) ||
    numero <= 0
  ) {
    throw new Error(
      "El importe del pago debe ser mayor a cero."
    );
  }

  return numero;
}

function validarPagoCompra(
  pago: PagoCompraFormulario
) {
  convertirImporte(
    pago.importe
  );

  if (
    pago.medio_pago ===
    "transferencia"
  ) {
    if (
      !pago.titular.trim()
    ) {
      throw new Error(
        "Ingresá el titular de la cuenta para la transferencia."
      );
    }

    if (
      !pago.cbu_cvu.trim() &&
      !pago.alias.trim()
    ) {
      throw new Error(
        "Ingresá el CBU/CVU o alias de la transferencia."
      );
    }
  }

  if (
    pago.medio_pago ===
    "cheque" &&
    !pago.detalle.trim()
  ) {
    throw new Error(
      "Ingresá los datos del cheque en el detalle."
    );
  }
}

function prepararPagoCompra(
  operacionId: number,
  pago: PagoCompraFormulario
) {
  validarPagoCompra(
    pago
  );

  return {
    operacion_id:
      operacionId,

    medio_pago:
      pago.medio_pago,

    importe:
      convertirImporte(
        pago.importe
      ),

    banco:
      valorOpcional(
        pago.banco
      ),

    titular:
      valorOpcional(
        pago.titular
      ),

    cuil_cuit:
      valorOpcional(
        pago.cuil_cuit
      ),

    tipo_cuenta:
      valorOpcional(
        pago.tipo_cuenta
      ),

    numero_cuenta:
      valorOpcional(
        pago.numero_cuenta
      ),

    alias:
      valorOpcional(
        pago.alias
      ),

    cbu_cvu:
      valorOpcional(
        pago.cbu_cvu
      ),

    detalle:
      valorOpcional(
        pago.detalle
      ),
  };
}

export async function listarPagosCompra(
  operacionId: number
): Promise<PagoCompra[]> {
  const { data, error } =
    await supabase
      .from("pagos_compra")
      .select("*")
      .eq(
        "operacion_id",
        operacionId
      )
      .order(
        "id",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      `No se pudieron cargar los pagos de la compra: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as PagoCompra[];
}

export async function crearPagoCompra(
  operacionId: number,
  pago: PagoCompraFormulario
): Promise<PagoCompra> {
  const { data, error } =
    await supabase
      .from("pagos_compra")
      .insert(
        prepararPagoCompra(
          operacionId,
          pago
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
        ? `No se pudo guardar el pago de la compra: ${error.message}`
        : "No se pudo guardar el pago de la compra."
    );
  }

  return data as PagoCompra;
}

export async function crearPagosCompra(
  operacionId: number,
  pagos: PagoCompraFormulario[]
): Promise<PagoCompra[]> {
  if (
    pagos.length === 0
  ) {
    return [];
  }

  const registros =
    pagos.map(
      (pago) =>
        prepararPagoCompra(
          operacionId,
          pago
        )
    );

  const { data, error } =
    await supabase
      .from("pagos_compra")
      .insert(
        registros
      )
      .select("*");

  if (error) {
    throw new Error(
      `No se pudieron guardar los pagos de la compra: ${error.message}`
    );
  }

  return (
    data ?? []
  ) as PagoCompra[];
}

export async function eliminarPagosCompra(
  operacionId: number
): Promise<void> {
  const { error } =
    await supabase
      .from("pagos_compra")
      .delete()
      .eq(
        "operacion_id",
        operacionId
      );

  if (error) {
    throw new Error(
      `No se pudieron eliminar los pagos de la compra: ${error.message}`
    );
  }
}

export async function reemplazarPagosCompra(
  operacionId: number,
  pagos: PagoCompraFormulario[]
): Promise<PagoCompra[]> {
  await eliminarPagosCompra(
    operacionId
  );

  if (
    pagos.length === 0
  ) {
    return [];
  }

  return crearPagosCompra(
    operacionId,
    pagos
  );
}

export function obtenerTotalPagosCompraFormulario(
  pagos: PagoCompraFormulario[]
): number {
  return pagos.reduce(
    (
      total,
      pago
    ) => {
      const importe =
        Number(
          pago.importe
        );

      return (
        total +
        (
          Number.isFinite(
            importe
          )
            ? importe
            : 0
        )
      );
    },
    0
  );
}

export function validarTotalPagosCompra(
  pagos: PagoCompraFormulario[],
  valorCompra: number
) {
  const totalPagos =
    obtenerTotalPagosCompraFormulario(
      pagos
    );

  if (
    Math.abs(
      totalPagos -
      valorCompra
    ) >
    0.01
  ) {
    throw new Error(
      `El total de los pagos (${totalPagos}) debe coincidir con el valor de compra (${valorCompra}).`
    );
  }
}