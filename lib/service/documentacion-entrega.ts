
export type DocumentacionEntrega = {
  cedula_identificacion: boolean;
  seguro_provisorio: boolean;
  copia_titulo: boolean;
  duplicado_llaves: boolean;
  manuales: boolean;
  verificacion_vehicular: boolean;
  detalle_servicios: boolean;
  observaciones: string;
};

export const DOCUMENTACION_INICIAL: DocumentacionEntrega = {
  cedula_identificacion: false,
  seguro_provisorio: false,
  copia_titulo: false,
  duplicado_llaves: false,
  manuales: false,
  verificacion_vehicular: false,
  detalle_servicios: false,
  observaciones: "",
};

export const OPCIONES_DOCUMENTACION = [
  {
    campo: "cedula_identificacion",
    nombre: "Cédula de identificación del titular anterior",
  },
  {
    campo: "seguro_provisorio",
    nombre: "Seguro provisorio",
  },
  {
    campo: "copia_titulo",
    nombre: "Copia del título de propiedad",
  },
  {
    campo: "duplicado_llaves",
    nombre: "Duplicado de llaves",
  },
  {
    campo: "manuales",
    nombre: "Manuales",
  },
  {
    campo: "verificacion_vehicular",
    nombre: "Verificación vehicular",
  },
  {
    campo: "detalle_servicios",
    nombre: "Detalle de servicios",
  },
] as const;

export type CampoDocumentacion =
  (typeof OPCIONES_DOCUMENTACION)[number]["campo"];

export async function obtenerDocumentacionEntrega(
  operacionId: number
): Promise<DocumentacionEntrega> {
  const respuesta = await fetch(
    `/api/admin/documentacion-entrega?operacion_id=${operacionId}`,
    { cache: "no-store" }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar la documentación.");
  }

  const resultado = await respuesta.json();

  if (!resultado.data) {
    return { ...DOCUMENTACION_INICIAL };
  }

  const datos = resultado.data;

  return {
    cedula_identificacion: datos.cedula_identificacion,
    seguro_provisorio: datos.seguro_provisorio,
    copia_titulo: datos.copia_titulo,
    duplicado_llaves: datos.duplicado_llaves,
    manuales: datos.manuales,
    verificacion_vehicular: datos.verificacion_vehicular,
    detalle_servicios: datos.detalle_servicios,
    observaciones: datos.observaciones ?? "",
  };
}

export async function guardarDocumentacionEntrega(
  operacionId: number,
  documentacion: DocumentacionEntrega
): Promise<void> {
  const respuesta = await fetch(
    "/api/admin/documentacion-entrega",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operacion_id: operacionId,
        ...documentacion,
      }),
    }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo guardar la documentación.");
  }
}
