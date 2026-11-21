"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const barraSuperiorRef = useRef<HTMLDivElement>(null);
  const tablaDesplazableRef = useRef<HTMLDivElement>(null);

  function sincronizarDesplazamiento(origen: "superior" | "tabla") {
    const superior = barraSuperiorRef.current;
    const tabla = tablaDesplazableRef.current;
    if (!superior || !tabla) return;
    if (origen === "superior") {
      tabla.scrollLeft = superior.scrollLeft;
    } else {
      superior.scrollLeft = tabla.scrollLeft;
    }
  }

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
    <main className="operaciones-panel-fijo flex h-full min-h-0 flex-col p-6">
      <style jsx global>{`
        @media screen and (min-width: 901px) {
          .admin-main:has(.operaciones-panel-fijo) {
            overflow: hidden !important;
          }
        }
        .operaciones-panel-fijo .tabla-operaciones-scroll {
          min-height: 0;
          flex: 1 1 auto;
          overflow: auto;
        }
        .operaciones-panel-fijo .tabla-operaciones-scroll thead th {
          position: sticky;
          top: 0;
          z-index: 1;
          background: #f9fafb;
          box-shadow: inset 0 -1px 0 #e5e7eb;
        }
      `}</style>
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
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              ref={barraSuperiorRef}
              onScroll={() => sincronizarDesplazamiento("superior")}
              className="mb-2 overflow-x-auto overflow-y-hidden rounded border border-gray-200 bg-gray-50"
              aria-label="Desplazamiento horizontal de operaciones"
              style={{ height: 18 }}
            >
              <div style={{ width: "max(100%, 1080px)", height: 1 }} />
            </div>
            <div
              ref={tablaDesplazableRef}
              onScroll={() => sincronizarDesplazamiento("tabla")}
              className="tabla-operaciones-scroll rounded-xl border bg-white"
            >
            <table className="w-full table-fixed border-collapse" style={{ width: "100%", minWidth: 1080, borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "7%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "6%" }} />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-4 text-left whitespace-nowrap" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                    Operación
                  </th>

                  <th className="px-3 py-4 text-left" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                    Tipo
                  </th>

                  <th className="px-3 py-4 text-left" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                    Cliente / Proveedor
                  </th>

                  <th className="px-3 py-4 text-left" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                    Vehículo
                  </th>

                  <th className="px-3 py-4 text-right" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                    Importe
                  </th>

                  <th className="px-3 py-4 text-left" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                    Estado
                  </th>

                  <th className="px-3 py-4 text-left whitespace-nowrap" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                    Fecha
                  </th>

                  <th className="px-3 py-4 text-center" style={{ padding: "12px 10px", verticalAlign: "middle" }}>
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
                        <td className="px-3 py-4 font-semibold whitespace-nowrap" style={{ padding: "10px", verticalAlign: "middle" }}>
                          {operacion.id}
                        </td>

                        <td className="px-3 py-4 whitespace-nowrap" style={{ padding: "10px", verticalAlign: "middle" }}>
                          {obtenerTextoTipoOperacion(
                            operacion.tipo_operacion
                          )}
                        </td>

                        <td className="px-3 py-4 break-words" style={{ padding: "10px", verticalAlign: "middle" }}>
                          {obtenerNombreCliente(
                            cliente
                          )}
                        </td>

                        <td className="px-3 py-4 break-words" style={{ padding: "10px", verticalAlign: "middle" }}>
                          {obtenerNombreVehiculo(
                            vehiculo
                          )}
                        </td>

                        <td className="px-3 py-4 text-right font-medium whitespace-nowrap" style={{ padding: "10px 18px 10px 8px", verticalAlign: "middle", textAlign: "right", whiteSpace: "nowrap" }}>
                          {formatearImporte(
                            operacion.precio_vehiculo
                          )}
                        </td>

                        <td className="px-3 py-4 break-words" style={{ padding: "10px 10px 10px 20px", verticalAlign: "middle", borderLeft: "1px solid #e5e7eb" }}>
                          {obtenerTextoEstado(
                            operacion.estado
                          )}
                        </td>

                        <td className="px-3 py-4 whitespace-nowrap" style={{ padding: "10px", verticalAlign: "middle" }}>
                          {formatearFecha(
                            operacion.created_at
                          )}
                        </td>

                        <td className="px-3 py-4 text-center" style={{ padding: "10px", verticalAlign: "middle" }}>
                          <Link
                            href={`/admin/operaciones/${operacion.id}`}
                            className="inline-flex whitespace-nowrap rounded-lg border px-2 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
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
          </div>
        )}
    </main>
  );
}