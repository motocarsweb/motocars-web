"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import EmptyState from "@/componentes/admin/EmptyState";
import PageHeader from "@/componentes/admin/PageHeader";
import PrimaryButton from "@/componentes/admin/PrimaryButton";

import {
  listarClientes,
  type Cliente,
} from "@/lib/service/clientes";

import {
  listarOperaciones,
  type Operacion,
  type TipoOperacion,
} from "@/lib/service/operaciones";

import {
  obtenerVehiculos,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";


function obtenerNombreCliente(cliente: Cliente | undefined) {
  if (!cliente) {
    return "Cliente no encontrado";
  }

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


function obtenerTextoTipoOperacion(
  tipo: TipoOperacion
) {
  if (tipo === "venta") {
    return "Venta";
  }

  if (tipo === "compra") {
    return "Compra";
  }

  return "Consignación";
}


function obtenerTextoEstado(
  estado: Operacion["estado"]
) {
  switch (estado) {
    case "borrador":
      return "Borrador";

    case "presupuesto_emitido":
      return "Presupuesto emitido";

    case "aceptada":
      return "Aceptada";

    case "boleto_firmado":
      return "Boleto firmado";

    case "entregada":
      return "Entregada";

    case "cancelada":
      return "Cancelada";

    default:
      return estado;
  }
}


function formatearImporte(
  valor: number | null | undefined
) {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}


function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha));
}


export default function OperacionesPage() {
  const [
    operaciones,
    setOperaciones,
  ] = useState<Operacion[]>([]);

  const [
    clientes,
    setClientes,
  ] = useState<Cliente[]>([]);

  const [
    vehiculos,
    setVehiculos,
  ] = useState<VehiculoSupabase[]>([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    filtroTipo,
    setFiltroTipo,
  ] = useState<
    "todas" | TipoOperacion
  >("todas");


  useEffect(() => {
    let componenteActivo = true;

    async function cargarDatos() {
      setCargando(true);
      setError("");

      try {
        const [
          operacionesCargadas,
          clientesCargados,
          vehiculosCargados,
        ] = await Promise.all([
          listarOperaciones(),
          listarClientes(),
          obtenerVehiculos(),
        ]);

        if (!componenteActivo) {
          return;
        }

        setOperaciones(
          operacionesCargadas
        );

        setClientes(
          clientesCargados
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
            : "No se pudieron cargar las operaciones."
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


  const operacionesFiltradas =
    useMemo(() => {
      if (filtroTipo === "todas") {
        return operaciones;
      }

      return operaciones.filter(
        (operacion) =>
          operacion.tipo_operacion ===
          filtroTipo
      );
    }, [
      operaciones,
      filtroTipo,
    ]);


  function buscarCliente(
    clienteId: number
  ) {
    return clientes.find(
      (cliente) =>
        cliente.id === clienteId
    );
  }


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
        titulo="Operaciones"
        descripcion="Ventas, compras y consignaciones"
        acciones={
          <Link href="/admin/operaciones/nueva">
            <PrimaryButton>
              + Nueva operación
            </PrimaryButton>
          </Link>
        }
      />


      {/* FILTROS */}

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          {
            valor: "todas",
            etiqueta: "Todas",
          },
          {
            valor: "venta",
            etiqueta: "Ventas",
          },
          {
            valor: "compra",
            etiqueta: "Compras",
          },
          {
            valor: "consignacion",
            etiqueta: "Consignaciones",
          },
        ].map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() =>
              setFiltroTipo(
                opcion.valor as
                  | "todas"
                  | TipoOperacion
              )
            }
            className={`rounded-lg border px-4 py-2 text-sm font-medium ${
              filtroTipo ===
              opcion.valor
                ? "border-blue-600 bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>


      {/* CARGANDO */}

      {cargando && (
        <p className="text-gray-500">
          Cargando operaciones...
        </p>
      )}


      {/* ERROR */}

      {!cargando && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      {/* VACÍO */}

      {!cargando &&
        !error &&
        operacionesFiltradas.length === 0 && (
          <EmptyState
            titulo="No hay operaciones"
            descripcion="Cuando registres una operación aparecerá aquí."
          />
        )}


      {/* TABLA */}

      {!cargando &&
        !error &&
        operacionesFiltradas.length > 0 && (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    Operación
                  </th>

                  <th className="p-4 text-left">
                    Tipo
                  </th>

                  <th className="p-4 text-left">
                    Cliente / Proveedor
                  </th>

                  <th className="p-4 text-left">
                    Vehículo
                  </th>

                  <th className="p-4 text-left">
                    Importe
                  </th>

                  <th className="p-4 text-left">
                    Estado
                  </th>

                  <th className="p-4 text-left">
                    Fecha
                  </th>

                  <th className="p-4 text-right">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {operacionesFiltradas.map(
                  (operacion) => {
                    const cliente =
                      buscarCliente(
                        operacion.cliente_id
                      );

                    const vehiculo =
                      buscarVehiculo(
                        operacion.vehiculo_id
                      );

                    return (
                      <tr
                        key={operacion.id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="p-4 font-semibold">
                          {operacion.numero ||
                            `OP-${String(
                              operacion.id
                            ).padStart(
                              6,
                              "0"
                            )}`}
                        </td>

                        <td className="p-4">
                          {obtenerTextoTipoOperacion(
                            operacion.tipo_operacion
                          )}
                        </td>

                        <td className="p-4">
                          {obtenerNombreCliente(
                            cliente
                          )}
                        </td>

                        <td className="p-4">
                          {obtenerNombreVehiculo(
                            vehiculo
                          )}
                        </td>

                        <td className="p-4 font-medium">
                          {formatearImporte(
                            operacion.precio_vehiculo
                          )}
                        </td>

                        <td className="p-4">
                          {obtenerTextoEstado(
                            operacion.estado
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {formatearFecha(
                            operacion.created_at
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <Link
                            href={`/admin/operaciones/${operacion.id}`}
                            className="inline-flex rounded-lg border px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            Ver operación
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