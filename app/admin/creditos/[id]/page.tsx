"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  obtenerCliente,
  type Cliente,
} from "@/lib/service/clientes";

import {
  obtenerCredito,
  listarCuotasCredito,
  listarPagosCredito,
 registrarPagoCredito,
 eliminarPagoCredito,
  type Credito,
  type CuotaCredito,
  type PagoCredito,
} from "@/lib/service/creditos";

function nombreCliente(cliente: Cliente | null) {
  if (!cliente) {
    return "Cargando...";
  }

  if (cliente.tipo_persona === "juridica") {
    return cliente.razon_social || "Empresa sin razón social";
  }

  return (
    `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() ||
    "Cliente sin nombre"
  );
}

function formatearImporte(
  valor: number,
  moneda: Credito["moneda"]
) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number);

  return new Intl.DateTimeFormat("es-AR").format(
    new Date(anio, mes - 1, dia)
  );
}

function textoTipoCredito(tipo: Credito["tipo_credito"]) {
  return tipo === "financiacion_vehiculo"
    ? "Financiación de vehículo"
    : "Préstamo personal";
}

function textoEstadoCuota(estado: CuotaCredito["estado"]) {
  switch (estado) {
    case "pagada":
      return "Pagada";
    case "parcial":
      return "Pago parcial";
    case "vencida":
      return "Vencida";
    default:
      return "Pendiente";
  }
}

export default function DetalleCreditoPage() {
  const params = useParams();

  const creditoId = Number(params.id);

  const [credito, setCredito] = useState<Credito | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [cuotas, setCuotas] = useState<CuotaCredito[]>([]);
  const [pagos, setPagos] = useState<PagoCredito[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
    const [cuotaPago, setCuotaPago] =
    useState<CuotaCredito | null>(null);

  const [fechaPago, setFechaPago] =
    useState("");

  const [importePago, setImportePago] =
    useState("");

  const [formaPago, setFormaPago] =
    useState("");

  const [lugarPago, setLugarPago] =
    useState("");

  const [numeroComprobante, setNumeroComprobante] =
    useState("");

  const [observacionesPago, setObservacionesPago] =
    useState("");

  const [guardandoPago, setGuardandoPago] =
    useState(false);

  const [errorPago, setErrorPago] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargarCredito() {
      if (!Number.isFinite(creditoId) || creditoId <= 0) {
        setError("El crédito solicitado no es válido.");
        setCargando(false);
        return;
      }

      try {
        const creditoCargado = await obtenerCredito(creditoId);

        const [
          clienteCargado,
          cuotasCargadas,
          pagosCargados,
        ] = await Promise.all([
          obtenerCliente(creditoCargado.cliente_id),
          listarCuotasCredito(creditoId),
          listarPagosCredito(creditoId),
        ]);

        if (!activo) {
          return;
        }

        setCredito(creditoCargado);
        setCliente(clienteCargado);
        setCuotas(cuotasCargadas);
        setPagos(pagosCargados);
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el crédito."
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarCredito();

    return () => {
      activo = false;
    };
  }, [creditoId]);

    function abrirRegistroPago(cuota: CuotaCredito) {
    setCuotaPago(cuota);
    setFechaPago(
      new Date().toISOString().slice(0, 10)
    );
    setImportePago(
      String(Number(cuota.saldo_pendiente))
    );
    setFormaPago("");
    setLugarPago("");
    setNumeroComprobante("");
    setObservacionesPago("");
    setErrorPago("");
  }

  function cerrarRegistroPago() {
    setCuotaPago(null);
    setErrorPago("");
  }
    async function guardarPago() {
    if (!cuotaPago) {
      return;
    }

    const importe = Number(importePago);

    if (!fechaPago) {
      setErrorPago("Ingresá la fecha de pago.");
      return;
    }

    if (!Number.isFinite(importe) || importe <= 0) {
      setErrorPago("Ingresá un importe válido.");
      return;
    }

    if (!formaPago) {
      setErrorPago("Seleccioná la forma de pago.");
      return;
    }

    if (!lugarPago.trim()) {
      setErrorPago(
        "Indicá dónde se realizó el pago."
      );
      return;
    }

    setGuardandoPago(true);
    setErrorPago("");

    try {
      await registrarPagoCredito({
        credito_id: creditoId,
        cuota_id: cuotaPago.id,
        fecha_pago: fechaPago,
        importe,
        forma_pago: formaPago,
        lugar_pago: lugarPago,
        numero_comprobante: numeroComprobante,
        observaciones: observacionesPago,
      });

      const [
        cuotasActualizadas,
        pagosActualizados,
      ] = await Promise.all([
        listarCuotasCredito(creditoId),
        listarPagosCredito(creditoId),
      ]);

      setCuotas(cuotasActualizadas);
      setPagos(pagosActualizados);

      setCuotaPago(null);
    } catch (errorDesconocido) {
      setErrorPago(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo registrar el pago."
      );
    } finally {
      setGuardandoPago(false);
    }
  }
  async function eliminarPago(pago: PagoCredito) {
  const confirmar = window.confirm(
    `¿Eliminar el pago de ${formatearImporte(
      Number(pago.importe),
credito?.moneda ?? "ARS"    )}? La cuota será recalculada automáticamente.`
  );

  if (!confirmar) {
    return;
  }

  setErrorPago("");

  try {
    await eliminarPagoCredito(pago.id);

    const [
      cuotasActualizadas,
      pagosActualizados,
    ] = await Promise.all([
      listarCuotasCredito(creditoId),
      listarPagosCredito(creditoId),
    ]);

    setCuotas(cuotasActualizadas);
    setPagos(pagosActualizados);
  } catch (errorDesconocido) {
    setErrorPago(
      errorDesconocido instanceof Error
        ? errorDesconocido.message
        : "No se pudo eliminar el pago."
    );
  }
}
  const resumen = useMemo(() => {
    const totalCuotas = cuotas.reduce(
      (total, cuota) => total + Number(cuota.importe_original),
      0
    );

    const saldoPendiente = cuotas.reduce(
      (total, cuota) => total + Number(cuota.saldo_pendiente),
      0
    );

    const totalPagado = pagos.reduce(
      (total, pago) => total + Number(pago.importe),
      0
    );

    const cuotasPagadas = cuotas.filter(
      (cuota) => cuota.estado === "pagada"
    ).length;

    return {
      totalCuotas,
      saldoPendiente,
      totalPagado,
      cuotasPagadas,
    };
  }, [cuotas, pagos]);

  if (cargando) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Cargando crédito...
        </p>
      </main>
    );
  }

  if (error || !credito) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "No se encontró el crédito."}
        </div>

        <Link
          href="/admin/creditos"
          className="mt-4 inline-flex rounded-lg border bg-white px-4 py-2 font-medium"
        >
          Volver a créditos
        </Link>
      </main>
    );
  }

  return (
    <main className="grid gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/creditos"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Volver a créditos
          </Link>

          <h1 className="mt-2 text-2xl font-bold">
            Crédito CR-{String(credito.id).padStart(6, "0")}
          </h1>

          <p className="mt-1 text-gray-500">
            {nombreCliente(cliente)}
          </p>
        </div>

        <span className="rounded-full border bg-white px-4 py-2 text-sm font-semibold capitalize">
          {credito.estado}
        </span>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Capital financiado
          </p>
          <p className="mt-2 text-xl font-bold">
            {formatearImporte(
              Number(credito.capital_financiado),
              credito.moneda
            )}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total plan de cuotas
          </p>
          <p className="mt-2 text-xl font-bold">
            {formatearImporte(
              resumen.totalCuotas,
              credito.moneda
            )}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total pagado
          </p>
          <p className="mt-2 text-xl font-bold">
            {formatearImporte(
              resumen.totalPagado,
              credito.moneda
            )}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Saldo pendiente
          </p>
          <p className="mt-2 text-xl font-bold">
            {formatearImporte(
              resumen.saldoPendiente,
              credito.moneda
            )}
          </p>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border bg-white p-5 md:grid-cols-3">
        <div>
          <p className="text-sm text-gray-500">
            Tipo
          </p>
          <p className="mt-1 font-semibold">
            {textoTipoCredito(credito.tipo_credito)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Fecha de otorgamiento
          </p>
          <p className="mt-1 font-semibold">
            {formatearFecha(credito.fecha_otorgamiento)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Plan
          </p>
          <p className="mt-1 font-semibold">
            {credito.cantidad_cuotas} cuotas de{" "}
            {formatearImporte(
              Number(credito.importe_cuota),
              credito.moneda
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Cuotas pagadas
          </p>
          <p className="mt-1 font-semibold">
            {resumen.cuotasPagadas} de {credito.cantidad_cuotas}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Primer vencimiento
          </p>
          <p className="mt-1 font-semibold">
            {formatearFecha(credito.fecha_primera_cuota)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Mora mensual
          </p>
          <p className="mt-1 font-semibold">
            {credito.interes_mora_mensual !== null
              ? `${credito.interes_mora_mensual}%`
              : "No informada"}
          </p>
        </div>
      </section>
      {cuotaPago && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                Registrar pago — Cuota {cuotaPago.numero_cuota}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Saldo pendiente:{" "}
                <strong>
                  {formatearImporte(
                    Number(cuotaPago.saldo_pendiente),
                    credito.moneda
                  )}
                </strong>
              </p>
            </div>

            <button
              type="button"
              onClick={cerrarRegistroPago}
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Cerrar
            </button>
          </div>

          {errorPago && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              {errorPago}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-2">
              <span className="font-medium">
                Fecha de pago
              </span>

              <input
                type="date"
                value={fechaPago}
                onChange={(evento) =>
                  setFechaPago(evento.target.value)
                }
                className="rounded-lg border bg-white p-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                Importe pagado
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={importePago}
                onChange={(evento) =>
                  setImportePago(evento.target.value)
                }
                className="rounded-lg border bg-white p-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                Forma de pago
              </span>

              <select
                value={formaPago}
                onChange={(evento) =>
                  setFormaPago(evento.target.value)
                }
                className="rounded-lg border bg-white p-3"
              >
                <option value="">
                  Seleccionar
                </option>
                <option value="Efectivo">
                  Efectivo
                </option>
                <option value="Transferencia">
                  Transferencia
                </option>
                <option value="Deposito">
                  Depósito
                </option>
                <option value="Cheque">
                  Cheque
                </option>
                <option value="Tarjeta">
                  Tarjeta
                </option>
                <option value="Otro">
                  Otro
                </option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                Lugar del pago
              </span>

              <input
                type="text"
                value={lugarPago}
                onChange={(evento) =>
                  setLugarPago(evento.target.value)
                }
                placeholder="Ej.: MotoCars"
                className="rounded-lg border bg-white p-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                N.º de comprobante / referencia
              </span>

              <input
                type="text"
                value={numeroComprobante}
                onChange={(evento) =>
                  setNumeroComprobante(
                    evento.target.value
                  )
                }
                className="rounded-lg border bg-white p-3"
              />
            </label>

            <label className="grid gap-2 lg:col-span-3">
              <span className="font-medium">
                Observaciones
              </span>

              <textarea
                value={observacionesPago}
                onChange={(evento) =>
                  setObservacionesPago(
                    evento.target.value
                  )
                }
                rows={3}
                className="rounded-lg border bg-white p-3"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={cerrarRegistroPago}
              disabled={guardandoPago}
              className="rounded-lg border bg-white px-5 py-3 font-medium"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={guardarPago}
              disabled={guardandoPago}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {guardandoPago
                ? "Registrando..."
                : "Confirmar pago"}
            </button>
          </div>
        </section>
      )}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Cuenta corriente
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Detalle de cuotas y vencimientos del crédito.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-center">
                  Cuota
                </th>
                <th className="p-4 text-left">
                  Vencimiento
                </th>
                <th className="p-4 text-right">
                  Importe
                </th>
                <th className="p-4 text-right">
                  Saldo
                </th>
                <th className="p-4 text-left">
                  Estado
                </th>
                                <th className="p-4 text-center">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {cuotas.map((cuota) => (
                <tr
                  key={cuota.id}
                  className="border-t"
                >
                  <td className="p-4 text-center font-semibold">
                    {cuota.numero_cuota}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {formatearFecha(cuota.fecha_vencimiento)}
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    {formatearImporte(
                      Number(cuota.importe_original),
                      credito.moneda
                    )}
                  </td>

                  <td className="p-4 text-right font-semibold whitespace-nowrap">
                    {formatearImporte(
                      Number(cuota.saldo_pendiente),
                      credito.moneda
                    )}
                  </td>

                  <td className="p-4">
                    {textoEstadoCuota(cuota.estado)}
                  </td>
                                    <td className="p-4 text-center">
                    {cuota.estado !== "pagada" ? (
                      <button
                        type="button"
                        onClick={() =>
                          abrirRegistroPago(cuota)
                        }
                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Registrar pago
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Cancelada
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {cuotas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-gray-500"
                  >
                    Este crédito no tiene cuotas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
            <section className="overflow-hidden rounded-xl border bg-white">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">
            Pagos registrados
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Historial de pagos realizados sobre las cuotas del crédito.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-center">Cuota</th>
                <th className="p-4 text-right">Importe</th>
                <th className="p-4 text-left">Forma</th>
                <th className="p-4 text-left">Lugar</th>
                <th className="p-4 text-left">Comprobante</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {pagos.map((pago) => {
                const cuota = cuotas.find(
                  (item) => item.id === pago.cuota_id
                );

                return (
                  <tr key={pago.id} className="border-t">
                    <td className="p-4 whitespace-nowrap">
                      {formatearFecha(pago.fecha_pago)}
                    </td>

                    <td className="p-4 text-center">
                      {cuota?.numero_cuota ?? "-"}
                    </td>

                    <td className="p-4 text-right font-semibold whitespace-nowrap">
                      {formatearImporte(
                        Number(pago.importe),
                        credito.moneda
                      )}
                    </td>

                    <td className="p-4">
                      {pago.forma_pago || "-"}
                    </td>

                    <td className="p-4">
                      {pago.lugar_pago || "-"}
                    </td>

                    <td className="p-4">
                      {pago.numero_comprobante || "-"}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => eliminarPago(pago)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}

              {pagos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-gray-500"
                  >
                    Todavía no hay pagos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}