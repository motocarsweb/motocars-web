"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PageHeader from "@/componentes/admin/PageHeader";

import {
  obtenerCliente,
  type Cliente,
} from "@/lib/service/clientes";

import {
  obtenerOperacion,
  type Operacion,
} from "@/lib/service/operaciones";

import {
  obtenerIngresoUsadoPorOperacion,
  type IngresoUsado,
} from "@/lib/service/ingresos-usados";

import {
  generarDocumentacionCompra,
  listarDocumentosIngresoUsado,
  listarDocumentosOperacion,
  type DocumentoOperacion,
  type EstadoDocumentoOperacion,
  type TipoDocumentoOperacion,
} from "@/lib/service/documentos-operacion";

import {
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

type DocumentoEsperado = {
  tipo: TipoDocumentoOperacion;
  nombre: string;
  origen: "operacion" | "ingreso";
  aclaracion?: string;
};

function obtenerNombreCliente(cliente: Cliente) {
  if (cliente.tipo_persona === "juridica") {
    return (
      cliente.razon_social ||
      "Empresa sin razón social"
    );
  }

  return (
    `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() ||
    "Cliente sin nombre"
  );
}

function obtenerNombreVehiculo(
  vehiculo: VehiculoSupabase
) {
  return [
    vehiculo.marca,
    vehiculo.modelo,
    vehiculo.version,
    vehiculo.anio,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatearImporte(
  valor: number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(valor);
}

function formatearFecha(
  fecha: string
) {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(
    new Date(fecha)
  );
}

function obtenerEstadoLegible(
  estado: Operacion["estado"]
) {
  const estados = {
    borrador:
      "Borrador",

    presupuesto_emitido:
      "Presupuesto emitido",

    aceptada:
      "Aceptada",

    boleto_firmado:
      "Boleto firmado",

    entregada:
      "Entregada",

    cancelada:
      "Cancelada",
  };

  return estados[estado];
}

function obtenerEstadoDocumentoLegible(
  estado: EstadoDocumentoOperacion
) {
  const estados = {
    generado:
      "Generado",

    impreso:
      "Impreso",

    enviado:
      "Enviado",

    firmado:
      "Firmado",

    anulado:
      "Anulado",
  };

  return estados[estado];
}

function obtenerClasesEstadoDocumento(
  estado: EstadoDocumentoOperacion
) {
  switch (estado) {
    case "firmado":
      return "bg-green-100 text-green-700";

    case "enviado":
      return "bg-blue-100 text-blue-700";

    case "impreso":
      return "bg-purple-100 text-purple-700";

    case "anulado":
      return "bg-red-100 text-red-700";

    case "generado":
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function obtenerTipoOperacionLegible(
  tipo: Operacion["tipo_operacion"]
) {
  switch (tipo) {
    case "venta":
      return "Venta";

    case "compra":
      return "Compra";

    case "consignacion":
      return "Consignación";

    default:
      return tipo;
  }
}

function obtenerCondicionVehiculo(
  vehiculo: VehiculoSupabase
) {
  if (
    vehiculo.condicion === "0km"
  ) {
    return "0 km";
  }

  if (
    vehiculo.condicion === "usado"
  ) {
    return "Usado";
  }

  return (
    vehiculo.condicion ||
    "Sin especificar"
  );
}

function obtenerUltimoDocumento(
  documentos: DocumentoOperacion[],
  tipo: TipoDocumentoOperacion
) {
  return (
    documentos
      .filter(
        (documento) =>
          documento.tipo_documento ===
          tipo
      )
      .sort(
        (a, b) =>
          b.numero_version -
          a.numero_version
      )[0] ?? null
  );
}

function obtenerDocumentosUnicos(
  documentos: DocumentoOperacion[]
) {
  const mapa =
    new Map<
      number,
      DocumentoOperacion
    >();

  documentos.forEach(
    (documento) => {
      mapa.set(
        documento.id,
        documento
      );
    }
  );

  return Array.from(
    mapa.values()
  );
}

export default function OperacionPage() {
  const params =
    useParams<{ id: string }>();

  const [
    operacion,
    setOperacion,
  ] =
    useState<Operacion | null>(
      null
    );

  const [
    cliente,
    setCliente,
  ] =
    useState<Cliente | null>(
      null
    );

  const [
    vehiculo,
    setVehiculo,
  ] =
    useState<VehiculoSupabase | null>(
      null
    );

  const [
    ingresoUsado,
    setIngresoUsado,
  ] =
    useState<IngresoUsado | null>(
      null
    );

  const [
    vehiculoIngresado,
    setVehiculoIngresado,
  ] =
    useState<VehiculoSupabase | null>(
      null
    );

  const [
    documentosOperacion,
    setDocumentosOperacion,
  ] =
    useState<DocumentoOperacion[]>(
      []
    );

  const [
    documentosIngreso,
    setDocumentosIngreso,
  ] =
    useState<DocumentoOperacion[]>(
      []
    );

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    generandoDocumentacion,
    setGenerandoDocumentacion,
  ] =
    useState(false);

  const [
    mensajeDocumentacion,
    setMensajeDocumentacion,
  ] =
    useState("");

  const [
    errorDocumentacion,
    setErrorDocumentacion,
  ] =
    useState("");

  /*
   * =========================================================
   * CARGA GENERAL DEL EXPEDIENTE
   * =========================================================
   */

  useEffect(() => {
    let componenteActivo = true;

    async function cargarOperacion() {
      const operacionId =
        Number(params.id);

      if (
        !Number.isInteger(
          operacionId
        ) ||
        operacionId <= 0
      ) {
        setError(
          "El identificador de la operación no es válido."
        );

        setCargando(false);

        return;
      }

      try {
        setCargando(true);
        setError("");

        const operacionCargada =
          await obtenerOperacion(
            operacionId
          );

        const [
          clienteCargado,
          vehiculoCargado,
          documentosOperacionCargados,
        ] =
          await Promise.all([
            obtenerCliente(
              operacionCargada.cliente_id
            ),

            obtenerVehiculoPorId(
              operacionCargada.vehiculo_id
            ),

            listarDocumentosOperacion(
              operacionId
            ),
          ]);

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo principal de la operación."
          );
        }

        const ingreso =
          await obtenerIngresoUsadoPorOperacion(
            operacionId
          );

        let vehiculoIngreso:
          | VehiculoSupabase
          | null = null;

        let documentosIngresoCargados:
          DocumentoOperacion[] = [];

        if (ingreso) {
          documentosIngresoCargados =
            await listarDocumentosIngresoUsado(
              ingreso.id
            );

          if (
            ingreso.vehiculo_id !==
            operacionCargada.vehiculo_id
          ) {
            vehiculoIngreso =
              await obtenerVehiculoPorId(
                ingreso.vehiculo_id
              );
          }
        }

        if (!componenteActivo) {
          return;
        }

        setOperacion(
          operacionCargada
        );

        setCliente(
          clienteCargado
        );

        setVehiculo(
          vehiculoCargado
        );

        setIngresoUsado(
          ingreso
        );

        setVehiculoIngresado(
          vehiculoIngreso
        );

        setDocumentosOperacion(
          documentosOperacionCargados
        );

        setDocumentosIngreso(
          documentosIngresoCargados
        );
      } catch (
        errorDesconocido
      ) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof
          Error
            ? errorDesconocido.message
            : "No se pudo cargar la operación."
        );
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarOperacion();

    return () => {
      componenteActivo = false;
    };
  }, [params.id]);

  /*
   * =========================================================
   * CARGANDO / ERROR GENERAL
   * =========================================================
   */

  if (cargando) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Cargando operación...
        </p>
      </main>
    );
  }

  if (
    error ||
    !operacion ||
    !cliente ||
    !vehiculo
  ) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error ||
            "No se pudo cargar la operación."}
        </div>

        <Link
          href="/admin/operaciones"
          className="mt-5 inline-block rounded-lg border px-4 py-2 font-medium"
        >
          Volver a operaciones
        </Link>
      </main>
    );
  }

  /*
   * =========================================================
   * REGLAS DE OPERACIÓN
   * =========================================================
   */

  const esVenta =
    operacion.tipo_operacion ===
    "venta";

  const esCompra =
    operacion.tipo_operacion ===
    "compra";

  const esConsignacion =
    operacion.tipo_operacion ===
    "consignacion";

  const tienePermuta =
    esVenta &&
    ingresoUsado?.tipo_ingreso ===
      "permuta" &&
    vehiculoIngresado !== null;

  const vehiculoPrincipalEsUsado =
    vehiculo.condicion ===
    "usado";

  const tituloPersona =
    esVenta
      ? "Cliente comprador"
      : esCompra
        ? "Vendedor / proveedor"
        : "Consignante / proveedor";

  const tituloVehiculo =
    esVenta
      ? "Vehículo vendido"
      : esCompra
        ? "Vehículo comprado"
        : "Vehículo en consignación";

  /*
   * =========================================================
   * DOCUMENTOS QUE CORRESPONDEN
   * =========================================================
   */

  const documentosEsperados:
    DocumentoEsperado[] = [];

  /*
   * VENTA
   */

  if (esVenta) {
    documentosEsperados.push({
      tipo:
        "presupuesto",

      nombre:
        "Presupuesto",

      origen:
        "operacion",
    });

    if (
      vehiculoPrincipalEsUsado
    ) {
      documentosEsperados.push({
        tipo:
          tienePermuta
            ? "boleto_usado_permuta"
            : "boleto_usado",

        nombre:
          tienePermuta
            ? "Boleto de venta usado con permuta"
            : "Boleto de venta usado",

        origen:
          "operacion",
      });
    } else {
      documentosEsperados.push({
        tipo:
          tienePermuta
            ? "boleto_0km_permuta"
            : "boleto_0km",

        nombre:
          tienePermuta
            ? "Boleto de venta 0 km con permuta"
            : "Boleto de venta 0 km",

        origen:
          "operacion",
      });
    }

    documentosEsperados.push({
      tipo:
        "responsabilidad_civil",

      nombre:
        "Responsabilidad civil",

      origen:
        "operacion",
    });

    documentosEsperados.push({
      tipo:
        "constancia_gestoria",

      nombre:
        "Constancia de gestoría",

      origen:
        "operacion",

      aclaracion:
        "Corresponde a usados y a 0 km entregados antes del patentamiento.",
    });

    if (
      tienePermuta &&
      ingresoUsado
    ) {
      documentosEsperados.push({
        tipo:
          "contrato_consignacion",

        nombre:
          "Contrato de consignación de la unidad recibida",

        origen:
          "ingreso",

        aclaracion:
          "Documento asociado al vehículo recibido en permuta.",
      });
    }
  }

  /*
   * COMPRA
   */

  if (esCompra) {
    documentosEsperados.push({
      tipo:
        "boleto_compra",

      nombre:
        "Boleto de compra",

      origen:
        "operacion",

      aclaracion:
        "Aplica tanto a vehículos 0 km como usados.",
    });

    documentosEsperados.push({
      tipo:
        "contrato_consignacion",

      nombre:
        "Contrato de consignación",

      origen:
        ingresoUsado
          ? "ingreso"
          : "operacion",

      aclaracion:
        "Se genera paralelamente al boleto de compra.",
    });
  }

  /*
   * CONSIGNACIÓN
   */

  if (esConsignacion) {
    documentosEsperados.push({
      tipo:
        "contrato_consignacion",

      nombre:
        "Contrato de consignación",

      origen:
        ingresoUsado
          ? "ingreso"
          : "operacion",

      aclaracion:
        "Documento principal de la operación.",
    });
  }

  /*
   * =========================================================
   * GENERAR DOCUMENTACIÓN DE COMPRA
   * =========================================================
   */

  async function generarDocumentosCompra() {
    if (
      !operacion ||
      !cliente ||
      !vehiculo ||
      operacion.tipo_operacion !==
        "compra"
    ) {
      return;
    }

    if (generandoDocumentacion) {
      return;
    }

    setGenerandoDocumentacion(
      true
    );

    setMensajeDocumentacion(
      ""
    );

    setErrorDocumentacion(
      ""
    );

    try {
      /*
       * SNAPSHOT
       *
       * Congelamos los datos utilizados
       * en el momento de emitir los
       * documentos.
       */

      const snapshot: Record<
        string,
        unknown
      > = {
        operacion: {
          id:
            operacion.id,

          numero:
            operacion.numero,

          tipo_operacion:
            operacion.tipo_operacion,

          estado:
            operacion.estado,

          precio_vehiculo:
            operacion.precio_vehiculo,

          bonificacion:
            operacion.bonificacion,

          gastos:
            operacion.gastos,

          total:
            operacion.total,

          forma_pago:
            operacion.forma_pago,

          detalle_pago:
            operacion.detalle_pago,

          asesor_comercial:
            operacion.asesor_comercial,

          gastos_gestoria:
            operacion.gastos_gestoria,

          observaciones:
            operacion.observaciones,

          observaciones_internas:
            operacion.observaciones_internas,

          created_at:
            operacion.created_at,
        },

        cliente: {
          id:
            cliente.id,

          tipo_persona:
            cliente.tipo_persona,

          nombre:
            cliente.nombre,

          apellido:
            cliente.apellido,

          razon_social:
            cliente.razon_social,

          dni:
            cliente.dni,

          cuit:
            cliente.cuit,

          telefono:
            cliente.telefono,

          whatsapp:
            cliente.whatsapp,

          email:
            cliente.email,

          provincia:
            cliente.provincia,

          ciudad:
            cliente.ciudad,

          direccion:
            cliente.direccion,

          fecha_nacimiento:
            cliente.fecha_nacimiento,

          estado_civil:
            cliente.estado_civil,

          conyuge_nombre:
            cliente.conyuge_nombre,

          conyuge_dni:
            cliente.conyuge_dni,
        },

        vehiculo: {
          id:
            vehiculo.id,

          marca:
            vehiculo.marca,

          modelo:
            vehiculo.modelo,

          version:
            vehiculo.version,

          anio:
            vehiculo.anio,

          condicion:
            vehiculo.condicion,

          kilometros:
            vehiculo.kilometros,

          color:
            vehiculo.color,

          dominio:
            vehiculo.dominio,

          numero_chasis:
            vehiculo.numero_chasis,

          numero_motor:
            vehiculo.numero_motor,

          combustible:
            vehiculo.combustible,

          transmision:
            vehiculo.transmision,

          precio_compra:
            vehiculo.precio_compra,

          precio_venta:
            vehiculo.precio,
        },

        ingreso:
          ingresoUsado
            ? {
                id:
                  ingresoUsado.id,

                tipo_ingreso:
                  ingresoUsado.tipo_ingreso,

                valor_ingreso:
                  ingresoUsado.valor_ingreso,

                precio_base_consignacion:
                  ingresoUsado.precio_base_consignacion,

                plazo_consignacion_dias:
                  ingresoUsado.plazo_consignacion_dias,

                fecha_ingreso:
                  ingresoUsado.fecha_ingreso,

                observaciones:
                  ingresoUsado.observaciones,
              }
            : null,

        snapshot_generado_at:
          new Date().toISOString(),
      };

      /*
       * Genera:
       *
       * 1. boleto_compra
       * 2. contrato_consignacion
       */

      await generarDocumentacionCompra({
        operacion_id:
          operacion.id,

        ingreso_usado_id:
          ingresoUsado?.id ??
          null,

        datos_snapshot:
          snapshot,
      });

      /*
       * Recargar documentos reales.
       */

      const documentosOperacionActualizados =
        await listarDocumentosOperacion(
          operacion.id
        );

      let documentosIngresoActualizados:
        DocumentoOperacion[] = [];

      if (ingresoUsado) {
        documentosIngresoActualizados =
          await listarDocumentosIngresoUsado(
            ingresoUsado.id
          );
      }

      setDocumentosOperacion(
        documentosOperacionActualizados
      );

      setDocumentosIngreso(
        documentosIngresoActualizados
      );

      setMensajeDocumentacion(
        "Documentación de compra generada correctamente."
      );
    } catch (
      errorDesconocido
    ) {
      setErrorDocumentacion(
        errorDesconocido instanceof
        Error
          ? errorDesconocido.message
          : "No se pudo generar la documentación de compra."
      );
    } finally {
      setGenerandoDocumentacion(
        false
      );
    }
  }

  /*
   * =========================================================
   * DOCUMENTOS ÚNICOS PARA HISTORIAL
   * =========================================================
   *
   * Un contrato puede estar relacionado
   * tanto con operacion_id como con
   * ingreso_usado_id.
   *
   * Evitamos mostrarlo dos veces.
   */

  const documentosHistoricos =
    obtenerDocumentosUnicos([
      ...documentosOperacion,
      ...documentosIngreso,
    ]).sort(
      (a, b) =>
        new Date(
          b.generado_at
        ).getTime() -
        new Date(
          a.generado_at
        ).getTime()
    );

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main className="p-6">
      <PageHeader
        titulo={
          operacion.numero ||
          `Operación ${operacion.id}`
        }
        descripcion={`${obtenerTipoOperacionLegible(
          operacion.tipo_operacion
        )} · Creada el ${formatearFecha(
          operacion.created_at
        )}`}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {obtenerTipoOperacionLegible(
                operacion.tipo_operacion
              )}
            </span>

            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
              {obtenerEstadoLegible(
                operacion.estado
              )}
            </span>
          </div>
        }
      />

      <div className="mx-auto grid max-w-5xl gap-6">

        {/* =================================================
            PERSONA + VEHÍCULO PRINCIPAL
            ================================================= */}

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
              {tituloPersona}
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {obtenerNombreCliente(
                cliente
              )}
            </h2>

            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <strong>
                  Documento:
                </strong>{" "}
                {cliente.dni ||
                  cliente.cuit ||
                  "—"}
              </p>

              <p>
                <strong>
                  Teléfono:
                </strong>{" "}
                {cliente.whatsapp ||
                  cliente.telefono ||
                  "—"}
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {cliente.email ||
                  "—"}
              </p>

              <p>
                <strong>
                  Ciudad:
                </strong>{" "}
                {cliente.ciudad ||
                  "—"}
              </p>
            </div>
          </article>

          <article className="rounded-xl border bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {tituloVehiculo}
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {obtenerNombreVehiculo(
                    vehiculo
                  )}
                </h2>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                {obtenerCondicionVehiculo(
                  vehiculo
                )}
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <strong>
                  Color:
                </strong>{" "}
                {vehiculo.color ||
                  "—"}
              </p>

              <p>
                <strong>
                  Kilómetros:
                </strong>{" "}
                {vehiculo.kilometros ??
                  "—"}
              </p>

              <p>
                <strong>
                  Dominio:
                </strong>{" "}
                {vehiculo.dominio ||
                  "—"}
              </p>

              <p>
                <strong>
                  Chasis:
                </strong>{" "}
                {vehiculo.numero_chasis ||
                  "—"}
              </p>

              <p>
                <strong>
                  Motor:
                </strong>{" "}
                {vehiculo.numero_motor ||
                  "—"}
              </p>
            </div>
          </article>
        </section>

        {/* =================================================
            PERMUTA
            ================================================= */}

        {tienePermuta &&
          vehiculoIngresado &&
          ingresoUsado && (
            <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    VEHÍCULO RECIBIDO EN PERMUTA
                  </p>

                  <h2 className="mt-2 text-xl font-bold">
                    {obtenerNombreVehiculo(
                      vehiculoIngresado
                    )}
                  </h2>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                  Ingresa al stock
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Valor de ingreso
                  </p>

                  <p className="mt-1 font-semibold">
                    {ingresoUsado.valor_ingreso >
                    0
                      ? formatearImporte(
                          ingresoUsado.valor_ingreso
                        )
                      : "Sin valor individual asignado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Precio de venta en stock
                  </p>

                  <p className="mt-1 font-semibold">
                    {vehiculoIngresado.precio !==
                    null
                      ? formatearImporte(
                          vehiculoIngresado.precio
                        )
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Valor contrato consignación
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatearImporte(
                      ingresoUsado.precio_base_consignacion
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <p>
                  <strong>
                    Dominio:
                  </strong>{" "}
                  {vehiculoIngresado.dominio ||
                    "—"}
                </p>

                <p>
                  <strong>
                    Plazo:
                  </strong>{" "}
                  {
                    ingresoUsado.plazo_consignacion_dias
                  }{" "}
                  días
                </p>
              </div>
            </section>
          )}

        {/* =================================================
            CONDICIONES COMERCIALES
            ================================================= */}

        <section className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-bold">
            {esVenta
              ? "Condiciones de venta"
              : esCompra
                ? "Condiciones de compra"
                : "Condiciones de consignación"}
          </h2>

          {esVenta && (
            <>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Precio del vehículo
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {formatearImporte(
                      operacion.precio_vehiculo
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Bonificación
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    -{" "}
                    {formatearImporte(
                      operacion.bonificacion
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Gastos
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    +{" "}
                    {formatearImporte(
                      operacion.gastos
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t pt-5">
                <p className="text-sm font-medium text-gray-500">
                  Total
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {formatearImporte(
                    operacion.total
                  )}
                </p>
              </div>
            </>
          )}

          {esCompra && (
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">
                  Precio inicial de stock
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {vehiculo.precio !==
                  null
                    ? formatearImporte(
                        vehiculo.precio
                      )
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Valor de compra
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {vehiculo.precio_compra !==
                  null
                    ? formatearImporte(
                        vehiculo.precio_compra
                      )
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Condición
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {obtenerCondicionVehiculo(
                    vehiculo
                  )}
                </p>
              </div>
            </div>
          )}

          {esConsignacion && (
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">
                  Precio inicial de stock
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {vehiculo.precio !==
                  null
                    ? formatearImporte(
                        vehiculo.precio
                      )
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Condición
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {obtenerCondicionVehiculo(
                    vehiculo
                  )}
                </p>
              </div>

              {ingresoUsado && (
                <div>
                  <p className="text-sm text-gray-500">
                    Plazo
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {
                      ingresoUsado.plazo_consignacion_dias
                    }{" "}
                    días
                  </p>
                </div>
              )}
            </div>
          )}

          {(operacion.forma_pago ||
            operacion.detalle_pago ||
            operacion.asesor_comercial ||
            operacion.gastos_gestoria >
              0) && (
            <div className="mt-6 grid gap-4 border-t pt-5 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Asesor comercial
                </p>

                <p className="mt-1 font-medium">
                  {operacion.asesor_comercial ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Gastos de gestoría
                </p>

                <p className="mt-1 font-medium">
                  {formatearImporte(
                    operacion.gastos_gestoria
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Forma de pago / condiciones
                </p>

                <p className="mt-1 whitespace-pre-wrap font-medium">
                  {operacion.forma_pago ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Detalle
                </p>

                <p className="mt-1 whitespace-pre-wrap font-medium">
                  {operacion.detalle_pago ||
                    "—"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            DOCUMENTACIÓN
            ================================================= */}

        <section className="rounded-xl border bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Documentación
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Estado documental real de esta operación.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {
                documentosHistoricos.length
              }{" "}
              documento(s) registrado(s)
            </div>
          </div>

          {/* GENERACIÓN DOCUMENTACIÓN DE COMPRA */}

          {esCompra && (
            <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    Documentación de compra
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Genera en conjunto el Boleto de Compra y el Contrato de Consignación.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    generarDocumentosCompra
                  }
                  disabled={
                    generandoDocumentacion
                  }
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generandoDocumentacion
                    ? "Generando..."
                    : "Generar documentación de compra"}
                </button>
              </div>

              {mensajeDocumentacion && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                  {
                    mensajeDocumentacion
                  }
                </div>
              )}

              {errorDocumentacion && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {
                    errorDocumentacion
                  }
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTOS ESPERADOS */}

          <div className="mt-5 grid gap-4">
            {documentosEsperados.map(
              (
                documentoEsperado
              ) => {
                const origenDocumentos =
                  documentoEsperado.origen ===
                  "ingreso"
                    ? documentosIngreso
                    : documentosOperacion;

                const documentoReal =
                  obtenerUltimoDocumento(
                    origenDocumentos,
                    documentoEsperado.tipo
                  );

                return (
                  <article
                    key={`${documentoEsperado.origen}-${documentoEsperado.tipo}`}
                    className="rounded-xl border bg-gray-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">
                          {
                            documentoEsperado.nombre
                          }
                        </h3>

                        {documentoEsperado.aclaracion && (
                          <p className="mt-1 text-xs text-gray-500">
                            {
                              documentoEsperado.aclaracion
                            }
                          </p>
                        )}
                      </div>

                      {!documentoReal ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          Pendiente
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${obtenerClasesEstadoDocumento(
                            documentoReal.estado
                          )}`}
                        >
                          {obtenerEstadoDocumentoLegible(
                            documentoReal.estado
                          )}
                        </span>
                      )}
                    </div>

                    {documentoReal && (
                      <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-gray-500">
                            Versión
                          </p>

                          <p className="mt-1 font-semibold">
                            v
                            {
                              documentoReal.numero_version
                            }
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Generado
                          </p>

                          <p className="mt-1 font-medium">
                            {formatearFecha(
                              documentoReal.generado_at
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Origen
                          </p>

                          <p className="mt-1 font-medium">
                            {documentoEsperado.origen ===
                            "ingreso"
                              ? "Vehículo ingresado"
                              : "Operación"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Archivo
                          </p>

                          {documentoReal.archivo_url ? (
                            <a
                              href={
                                documentoReal.archivo_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block font-semibold text-blue-600"
                            >
                              Ver archivo
                            </a>
                          ) : (
                            <p className="mt-1 text-gray-500">
                              Sin archivo
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>

          {/* HISTORIAL */}

          {documentosHistoricos.length >
            0 && (
            <details className="mt-5 rounded-lg border">
              <summary className="cursor-pointer p-4 font-semibold">
                Ver historial de documentos
              </summary>

              <div className="border-t">
                {documentosHistoricos.map(
                  (documento) => (
                    <div
                      key={
                        documento.id
                      }
                      className="grid gap-2 border-b p-4 text-sm last:border-b-0 md:grid-cols-5"
                    >
                      <div className="font-medium">
                        {
                          documento.tipo_documento
                        }
                      </div>

                      <div>
                        v
                        {
                          documento.numero_version
                        }
                      </div>

                      <div>
                        {obtenerEstadoDocumentoLegible(
                          documento.estado
                        )}
                      </div>

                      <div>
                        {documento.ingreso_usado_id
                          ? "Vehículo ingresado"
                          : "Operación"}
                      </div>

                      <div>
                        {formatearFecha(
                          documento.generado_at
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </details>
          )}
        </section>

        {/* =================================================
            OBSERVACIONES
            ================================================= */}

        <section className="grid gap-5 rounded-xl border bg-white p-5">
          <div>
            <h2 className="text-xl font-bold">
              Observaciones comerciales
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-gray-700">
              {operacion.observaciones ||
                "Sin observaciones."}
            </p>
          </div>

          {operacion.observaciones_internas && (
            <div className="border-t pt-5">
              <h3 className="font-semibold">
                Observaciones internas
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-gray-700">
                {
                  operacion.observaciones_internas
                }
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            ACCIONES
            ================================================= */}

        <div className="flex flex-wrap justify-between gap-3">
          <Link
            href="/admin/operaciones"
            className="rounded-lg border px-4 py-2 font-medium"
          >
            ← Volver a operaciones
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/operaciones/nueva"
              className="rounded-lg border px-4 py-2 font-medium"
            >
              Nueva operación
            </Link>

            {esVenta && (
              <Link
                href={`/admin/operaciones/${operacion.id}/presupuesto`}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white"
              >
                Generar presupuesto
              </Link>
            )}
          </div>
        </div>

        {/* =================================================
            EXPEDIENTE
            ================================================= */}

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Expediente de la operación
          </h2>

          <div className="mb-6 border-b border-gray-200">
            <nav className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-t-lg bg-red-600 px-4 py-2 font-medium text-white"
              >
                Resumen
              </button>

              <button
                type="button"
                className="rounded-t-lg px-4 py-2 hover:bg-gray-100"
              >
                Vehículos
              </button>

              <button
                type="button"
                className="rounded-t-lg px-4 py-2 hover:bg-gray-100"
              >
                Pagos
              </button>

              <button
                type="button"
                className="rounded-t-lg px-4 py-2 hover:bg-gray-100"
              >
                Documentos
              </button>

              <button
                type="button"
                className="rounded-t-lg px-4 py-2 hover:bg-gray-100"
              >
                Gestoría
              </button>

              <button
                type="button"
                className="rounded-t-lg px-4 py-2 hover:bg-gray-100"
              >
                Historial
              </button>
            </nav>
          </div>

          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            El expediente está conectado al motor documental. Las próximas etapas incorporarán las plantillas, impresión, descarga, envío y firma.
          </div>
        </section>
      </div>
    </main>
  );
}