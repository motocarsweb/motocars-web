"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import PageHeader from "@/componentes/admin/PageHeader";

import {
  actualizarSeguimientoPresupuesto,
  obtenerPresupuesto,
  type EstadoPresupuesto,
  type Presupuesto,
} from "@/lib/service/presupuestos";

import {
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

function formatearImporte(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearFecha(fecha: string | null) {
  if (!fecha) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(`${fecha.slice(0, 10)}T00:00:00Z`)
  );
}

function nombreVehiculo(
  vehiculo: VehiculoSupabase | null
) {
  if (!vehiculo) {
    return "Vehículo no encontrado";
  }

  return [
    vehiculo.marca,
    vehiculo.modelo,
    vehiculo.version,
    vehiculo.anio,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function PresupuestoDetallePage() {
  const params = useParams();

  const presupuestoId = Number(params.id);

  const [presupuesto, setPresupuesto] =
    useState<Presupuesto | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

  const [estado, setEstado] =
    useState<EstadoPresupuesto>("pendiente");

  const [
    proximoSeguimiento,
    setProximoSeguimiento,
  ] = useState("");

  const [
    observacionesSeguimiento,
    setObservacionesSeguimiento,
  ] = useState("");

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [guardado, setGuardado] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarDatos() {
      setCargando(true);
      setError("");

      try {
        const presupuestoCargado =
          await obtenerPresupuesto(
            presupuestoId
          );

        const vehiculoCargado =
          await obtenerVehiculoPorId(
            presupuestoCargado.vehiculo_id
          );

        if (!componenteActivo) {
          return;
        }

        setPresupuesto(
          presupuestoCargado
        );

        setVehiculo(
          vehiculoCargado
        );

        setEstado(
          presupuestoCargado.estado
        );

        setProximoSeguimiento(
          presupuestoCargado.proximo_seguimiento ??
            ""
        );

        setObservacionesSeguimiento(
          presupuestoCargado.observaciones_seguimiento ??
            ""
        );
      } catch (errorDesconocido) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el presupuesto."
        );
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    if (
      Number.isFinite(presupuestoId) &&
      presupuestoId > 0
    ) {
      cargarDatos();
    } else {
      setError(
        "El número de presupuesto no es válido."
      );
      setCargando(false);
    }

    return () => {
      componenteActivo = false;
    };
  }, [presupuestoId]);

  async function guardarSeguimiento() {
    if (!presupuesto) {
      return;
    }

    setGuardando(true);
    setGuardado(false);
    setError("");

    try {
      const actualizado =
        await actualizarSeguimientoPresupuesto(
          presupuesto.id,
          {
            estado,
            proximo_seguimiento:
              proximoSeguimiento || null,
            observaciones_seguimiento:
              observacionesSeguimiento,
          }
        );

      setPresupuesto(actualizado);
      setGuardado(true);
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo guardar el seguimiento."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Cargando presupuesto...
        </p>
      </main>
    );
  }

  if (error && !presupuesto) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  if (!presupuesto) {
    return null;
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo={
          presupuesto.numero
            ? `Presupuesto ${presupuesto.numero}`
            : `Presupuesto ${presupuesto.id}`
        }
        descripcion="Detalle y seguimiento comercial"
        acciones={
          <Link
            href="/admin/presupuestos"
            className="inline-flex rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50"
          >
            Volver
          </Link>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* DATOS DEL PRESUPUESTO */}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-xl font-semibold">
            Presupuesto emitido
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Fecha
              </p>
              <p className="font-medium">
                {formatearFecha(
                  presupuesto.fecha
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Válido hasta
              </p>
              <p className="font-medium">
                {formatearFecha(
                  presupuesto.valido_hasta
                )}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">
                Interesado
              </p>
              <p className="font-medium">
                {presupuesto.nombre_cliente}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Documento
              </p>
              <p className="font-medium">
                {presupuesto.documento || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Teléfono
              </p>
              <p className="font-medium">
                {presupuesto.telefono || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>
              <p className="font-medium">
                {presupuesto.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Ciudad
              </p>
              <p className="font-medium">
                {presupuesto.ciudad || "—"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">
                Vehículo
              </p>
              <p className="font-semibold">
                {nombreVehiculo(vehiculo)}
              </p>
            </div>
          </div>

          <div className="my-6 border-t" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Precio vehículo
              </p>
              <p className="font-medium">
                {formatearImporte(
                  presupuesto.precio_vehiculo
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Bonificación
              </p>
              <p className="font-medium">
                {formatearImporte(
                  presupuesto.bonificacion
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Gastos
              </p>
              <p className="font-medium">
                {formatearImporte(
                  presupuesto.gastos
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Valor permuta
              </p>
              <p className="font-medium">
                {formatearImporte(
                  presupuesto.valor_permuta
                )}
              </p>
            </div>

            <div className="sm:col-span-2 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Total
              </p>
              <p className="text-2xl font-bold">
                {formatearImporte(
                  presupuesto.total
                )}
              </p>
            </div>
          </div>

          {presupuesto.valor_permuta > 0 && (
            <>
              <div className="my-6 border-t" />

              <div>
                <p className="mb-2 font-semibold">
                  Vehículo en permuta
                </p>

                <p>
                  {[
                    presupuesto.permuta_marca,
                    presupuesto.permuta_modelo,
                    presupuesto.permuta_anio,
                  ]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>

                {presupuesto.permuta_kilometros !==
                  null && (
                  <p className="mt-1 text-sm text-gray-500">
                    {
                      presupuesto.permuta_kilometros
                    }{" "}
                    km
                  </p>
                )}
              </div>
            </>
          )}

          <div className="my-6 border-t" />

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Forma de pago
              </p>
              <p>
                {presupuesto.forma_pago ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Financiación
              </p>
              <p className="whitespace-pre-wrap">
                {presupuesto.financiacion ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Observaciones
              </p>
              <p className="whitespace-pre-wrap">
                {presupuesto.observaciones ||
                  "—"}
              </p>
            </div>
          </div>
        </section>

        {/* SEGUIMIENTO */}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-5 text-xl font-semibold">
            Seguimiento comercial
          </h2>

          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="font-medium">
                Estado
              </span>

              <select
                value={estado}
                onChange={(event) => {
                  setEstado(
                    event.target
                      .value as EstadoPresupuesto
                  );
                  setGuardado(false);
                }}
                className="rounded-lg border p-3"
              >
                <option value="pendiente">
                  Pendiente
                </option>

                <option value="contactado">
                  Contactado
                </option>

                <option value="negociacion">
                  En negociación
                </option>

                <option value="vendido">
                  Vendido
                </option>

                <option value="descartado">
                  Descartado
                </option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                Próximo seguimiento
              </span>

              <input
                type="date"
                value={proximoSeguimiento}
                onChange={(event) => {
                  setProximoSeguimiento(
                    event.target.value
                  );
                  setGuardado(false);
                }}
                className="rounded-lg border p-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                Observaciones de seguimiento
              </span>

              <textarea
                value={
                  observacionesSeguimiento
                }
                onChange={(event) => {
                  setObservacionesSeguimiento(
                    event.target.value
                  );
                  setGuardado(false);
                }}
                rows={7}
                className="rounded-lg border p-3"
                placeholder="Llamadas, mensajes, condiciones conversadas, interés del cliente..."
              />
            </label>
<Link
  href={`/admin/presupuestos/${presupuesto.id}/editar`}
  className="inline-flex justify-center rounded-lg border border-blue-600 px-4 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
>
  Editar presupuesto
</Link>
<Link
  href={`/admin/presupuestos/${presupuesto.id}/documento`}
  className="inline-flex justify-center rounded-lg border px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
>
  Ver presupuesto
</Link>
{!presupuesto.convertido_operacion && (
  <Link
    href={`/admin/operaciones/nueva?presupuesto=${presupuesto.id}`}
    className="inline-flex justify-center rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
  >
    Generar operación
  </Link>
)}
            <button
              type="button"
              onClick={guardarSeguimiento}
              disabled={guardando}
              className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {guardando
                ? "Guardando..."
                : "Guardar seguimiento"}
            </button>

            {guardado && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                Seguimiento guardado correctamente.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}