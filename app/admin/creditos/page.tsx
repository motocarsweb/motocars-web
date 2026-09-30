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
  listarCreditos,
  type Credito,
} from "@/lib/service/creditos";

function obtenerNombreCliente(
  cliente: Cliente | undefined
) {
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
  const [anio, mes, dia] =
    fecha.split("-").map(Number);

  return new Intl.DateTimeFormat("es-AR").format(
    new Date(anio, mes - 1, dia)
  );
}

function textoTipoCredito(
  tipo: Credito["tipo_credito"]
) {
  return tipo === "financiacion_vehiculo"
    ? "Financiación de vehículo"
    : "Préstamo personal";
}

export default function CreditosPage() {
  const [creditos, setCreditos] =
    useState<Credito[]>([]);

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      setCargando(true);
      setError("");

      try {
        const [
          creditosCargados,
          clientesCargados,
        ] = await Promise.all([
          listarCreditos(),
          listarClientes(),
        ]);

        if (!activo) {
          return;
        }

        setCreditos(creditosCargados);
        setClientes(clientesCargados);
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar los créditos."
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  const clientesPorId =
    useMemo(
      () =>
        new Map(
          clientes.map((cliente) => [
            cliente.id,
            cliente,
          ])
        ),
      [clientes]
    );

  return (
    <main className="p-6">
      <PageHeader
        titulo="Créditos"
        descripcion="Préstamos personales y financiaciones de clientes"
        acciones={
          <Link href="/admin/creditos/nuevo">
            <PrimaryButton>
              + Nuevo crédito
            </PrimaryButton>
          </Link>
        }
      />

      {cargando && (
        <p className="text-gray-500">
          Cargando créditos...
        </p>
      )}

      {!cargando && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!cargando &&
        !error &&
        creditos.length === 0 && (
          <EmptyState
            titulo="No hay créditos registrados"
            descripcion="Cuando generes un préstamo o financiación aparecerá aquí."
          />
        )}

      {!cargando &&
        !error &&
        creditos.length > 0 && (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    Crédito
                  </th>

                  <th className="p-4 text-left">
                    Cliente
                  </th>

                  <th className="p-4 text-left">
                    Tipo
                  </th>

                  <th className="p-4 text-right">
                    Capital
                  </th>

                  <th className="p-4 text-center">
                    Cuotas
                  </th>

                  <th className="p-4 text-right">
                    Cuota
                  </th>

                  <th className="p-4 text-left">
                    Primer vencimiento
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
                {creditos.map((credito) => {
                  const cliente =
                    clientesPorId.get(
                      credito.cliente_id
                    );

                  return (
                    <tr
                      key={credito.id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold">
                        CR-{String(
                          credito.id
                        ).padStart(6, "0")}
                      </td>

                      <td className="p-4">
                        {obtenerNombreCliente(
                          cliente
                        )}
                      </td>

                      <td className="p-4">
                        {textoTipoCredito(
                          credito.tipo_credito
                        )}
                      </td>

                      <td className="p-4 text-right font-medium whitespace-nowrap">
                        {formatearImporte(
                          credito.capital_financiado,
                          credito.moneda
                        )}
                      </td>

                      <td className="p-4 text-center">
                        {credito.cantidad_cuotas}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        {formatearImporte(
                          credito.importe_cuota,
                          credito.moneda
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {formatearFecha(
                          credito.fecha_primera_cuota
                        )}
                      </td>

                      <td className="p-4 capitalize">
                        {credito.estado}
                      </td>

                      <td className="p-4 text-center">
                        <Link
                          href={`/admin/creditos/${credito.id}`}
                          className="inline-flex rounded-lg border px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </main>
  );
}