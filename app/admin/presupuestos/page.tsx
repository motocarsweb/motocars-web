"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import EmptyState from "@/componentes/admin/EmptyState";
import PageHeader from "@/componentes/admin/PageHeader";

import {
  listarPresupuestos,
  type EstadoPresupuesto,
  type Presupuesto,
} from "@/lib/service/presupuestos";

import {
  obtenerVehiculos,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

function nombreVehiculo(
  vehiculo: VehiculoSupabase | undefined
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
  }).format(new Date(`${fecha.slice(0, 10)}T00:00:00Z`));
}

function textoEstado(
  estado: EstadoPresupuesto
) {
  switch (estado) {
    case "pendiente":
      return "Pendiente";

    case "contactado":
      return "Contactado";

    case "negociacion":
      return "En negociación";

    case "vendido":
      return "Vendido";

    case "descartado":
      return "Descartado";

    default:
      return estado;
  }
}

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] =
    useState<Presupuesto[]>([]);

  const [vehiculos, setVehiculos] =
    useState<VehiculoSupabase[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [filtroEstado, setFiltroEstado] =
    useState<"todos" | EstadoPresupuesto>(
      "todos"
    );

  useEffect(() => {
    let componenteActivo = true;

    async function cargarDatos() {
      setCargando(true);
      setError("");

      try {
        const [
          presupuestosCargados,
          vehiculosCargados,
        ] = await Promise.all([
          listarPresupuestos(),
          obtenerVehiculos(),
        ]);

        if (!componenteActivo) {
          return;
        }

        setPresupuestos(
          presupuestosCargados
        );

        setVehiculos(
          vehiculosCargados
        );
      } catch (errorDesconocido) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar los presupuestos."
        );
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const presupuestosFiltrados =
    useMemo(() => {
      if (filtroEstado === "todos") {
        return presupuestos;
      }

      return presupuestos.filter(
        (presupuesto) =>
          presupuesto.estado ===
          filtroEstado
      );
    }, [
      presupuestos,
      filtroEstado,
    ]);

  function buscarVehiculo(
    vehiculoId: number
  ) {
    return vehiculos.find(
      (vehiculo) =>
        vehiculo.id === vehiculoId
    );
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo="Presupuestos"
        descripcion="Presupuestos emitidos y seguimiento comercial"
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          {
            valor: "todos",
            etiqueta: "Todos",
          },
          {
            valor: "pendiente",
            etiqueta: "Pendientes",
          },
          {
            valor: "contactado",
            etiqueta: "Contactados",
          },
          {
            valor: "negociacion",
            etiqueta: "En negociación",
          },
          {
            valor: "vendido",
            etiqueta: "Vendidos",
          },
          {
            valor: "descartado",
            etiqueta: "Descartados",
          },
        ].map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() =>
              setFiltroEstado(
                opcion.valor as
                  | "todos"
                  | EstadoPresupuesto
              )
            }
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              filtroEstado === opcion.valor
                ? "border-blue-600 bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {cargando && (
        <p className="text-gray-500">
          Cargando presupuestos...
        </p>
      )}

      {!cargando && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!cargando &&
        !error &&
        presupuestosFiltrados.length === 0 && (
          <EmptyState
            titulo="No hay presupuestos"
            descripcion="Los presupuestos guardados aparecerán aquí."
          />
        )}

      {!cargando &&
        !error &&
        presupuestosFiltrados.length > 0 && (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    Presupuesto
                  </th>

                  <th className="p-4 text-left">
                    Fecha
                  </th>

                  <th className="p-4 text-left">
                    Interesado
                  </th>

                  <th className="p-4 text-left">
                    Teléfono
                  </th>

                  <th className="p-4 text-left">
                    Vehículo
                  </th>

                  <th className="p-4 text-right">
                    Total
                  </th>

                  <th className="p-4 text-left">
                    Estado
                  </th>

                  <th className="p-4 text-left">
                    Próximo seguimiento
                  </th>

                  <th className="p-4 text-center">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {presupuestosFiltrados.map(
                  (presupuesto) => {
                    const vehiculo =
                      buscarVehiculo(
                        presupuesto.vehiculo_id
                      );

                    return (
                      <tr
                        key={presupuesto.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-4 font-semibold whitespace-nowrap">
                          {presupuesto.numero ||
                            presupuesto.id}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {formatearFecha(
                            presupuesto.fecha
                          )}
                        </td>

                        <td className="p-4 font-medium">
                          {
                            presupuesto.nombre_cliente
                          }
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {presupuesto.telefono ||
                            "—"}
                        </td>

                        <td className="p-4">
                          {nombreVehiculo(
                            vehiculo
                          )}
                        </td>

                        <td className="p-4 text-right font-medium whitespace-nowrap">
                          {formatearImporte(
                            presupuesto.total
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {textoEstado(
                            presupuesto.estado
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {formatearFecha(
                            presupuesto.proximo_seguimiento
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <Link
                            href={`/admin/presupuestos/${presupuesto.id}`}
                            className="inline-flex rounded-lg border px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
    </main>
  );
}