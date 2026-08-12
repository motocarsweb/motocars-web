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
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";


function obtenerNombreCliente(
  cliente: Cliente
) {
  if (
    cliente.tipo_persona ===
    "juridica"
  ) {
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

  /*
   * Vehículo principal:
   *
   * Venta        → unidad que sale.
   * Compra       → unidad que entra.
   * Consignación → unidad que entra.
   */
  const [
    vehiculo,
    setVehiculo,
  ] =
    useState<VehiculoSupabase | null>(
      null
    );

  /*
   * Ingreso adicional asociado.
   *
   * Principalmente se utiliza para
   * mostrar una permuta dentro
   * de una operación de Venta.
   */
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
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * =========================================================
   * CARGA
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

        /*
         * 1. Operación.
         */

        const operacionCargada =
          await obtenerOperacion(
            operacionId
          );

        /*
         * 2. Cliente +
         * vehículo principal.
         */

        const [
          clienteCargado,
          vehiculoCargado,
        ] =
          await Promise.all([
            obtenerCliente(
              operacionCargada.cliente_id
            ),

            obtenerVehiculoPorId(
              operacionCargada.vehiculo_id
            ),
          ]);

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo principal de la operación."
          );
        }

        /*
         * 3. Buscar ingreso usado
         * relacionado.
         *
         * Para Venta permite detectar
         * una permuta.
         *
         * Para Compra/Consignación
         * usada puede representar
         * información complementaria
         * del mismo vehículo principal.
         */

        const ingreso =
          await obtenerIngresoUsadoPorOperacion(
            operacionId
          );

        let vehiculoIngreso:
          | VehiculoSupabase
          | null = null;

        /*
         * Solo necesitamos cargar
         * un segundo vehículo cuando
         * realmente es distinto
         * del vehículo principal.
         */

        if (
          ingreso &&
          ingreso.vehiculo_id !==
            operacionCargada.vehiculo_id
        ) {
          vehiculoIngreso =
            await obtenerVehiculoPorId(
              ingreso.vehiculo_id
            );
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
   * ESTADOS DE UI
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


  /*
   * =========================================================
   * TEXTOS SEGÚN OPERACIÓN
   * =========================================================
   */

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
   * DOCUMENTOS ESPERADOS
   * =========================================================
   *
   * Por ahora esta sección informa
   * qué documentos corresponden.
   *
   * En el próximo paso conectaremos
   * documentos_operacion y la
   * generación efectiva.
   */

  const documentosEsperados:
    string[] = [];

  if (esVenta) {
    documentosEsperados.push(
      "Presupuesto"
    );

    if (
      vehiculoPrincipalEsUsado
    ) {
      documentosEsperados.push(
        tienePermuta
          ? "Boleto de venta usado con permuta"
          : "Boleto de venta usado"
      );
    } else {
      documentosEsperados.push(
        tienePermuta
          ? "Boleto de venta 0 km con permuta"
          : "Boleto de venta 0 km"
      );
    }

    documentosEsperados.push(
      "Responsabilidad civil"
    );

    /*
     * Usados y 0 km entregados
     * antes de patentamiento podrán
     * llevar constancia de gestoría.
     */

    documentosEsperados.push(
      "Constancia de gestoría, si corresponde"
    );

    if (tienePermuta) {
      documentosEsperados.push(
        "Contrato de consignación de la unidad recibida"
      );
    }
  }


  if (esCompra) {
    documentosEsperados.push(
      "Documentación de compra / ingreso"
    );

    /*
     * Regla MotoCars:
     * toda Compra genera paralelamente
     * contrato de consignación para
     * la unidad que entra al stock,
     * sea 0 km o usada.
     */

    documentosEsperados.push(
      "Contrato de consignación"
    );
  }


  if (esConsignacion) {
    documentosEsperados.push(
      "Contrato de consignación"
    );
  }


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
        descripcion={`${
          obtenerTipoOperacionLegible(
            operacion.tipo_operacion
          )
        } · Creada el ${formatearFecha(
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

          {/* PERSONA */}

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


          {/* VEHÍCULO PRINCIPAL */}

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
                    Plazo de consignación:
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
            DOCUMENTACIÓN PREVISTA
            ================================================= */}

        <section className="rounded-xl border bg-white p-5">
          <div>
            <h2 className="text-xl font-bold">
              Documentación
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Documentos que corresponden según el tipo de operación.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {documentosEsperados.map(
              (documento) => (
                <div
                  key={documento}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4"
                >
                  <span className="font-medium">
                    {documento}
                  </span>

                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                    Pendiente
                  </span>
                </div>
              )
            )}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            En el próximo paso estos documentos se conectarán con el motor documental y con la tabla documentos_operacion.
          </p>
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
            El expediente ya reconoce el tipo de operación. En las próximas etapas conectaremos cada pestaña con sus datos y documentos reales.
          </div>
        </section>
      </div>
    </main>
  );
}