"use client";

import { useEffect, useState } from "react";

import EmptyState from "@/componentes/admin/EmptyState";
import PageHeader from "@/componentes/admin/PageHeader";
import PrimaryButton from "@/componentes/admin/PrimaryButton";
import Link from "next/link";

import {
  listarClientes,
  type Cliente,
} from "@/lib/service/clientes";

function obtenerNombreCliente(cliente: Cliente) {
  if (cliente.tipo_persona === "juridica") {
    return cliente.razon_social || "Empresa sin razón social";
  }

  return (
    `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() ||
    "Cliente sin nombre"
  );
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarClientes() {
      setCargando(true);
      setError("");

      try {
        const clientesCargados = await listarClientes();

        if (componenteActivo) {
          setClientes(clientesCargados);
        }
      } catch (errorDesconocido) {
        if (componenteActivo) {
          setError(
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : "No se pudieron cargar los clientes."
          );
        }
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarClientes();

    return () => {
      componenteActivo = false;
    };
  }, []);

  return (
    <main className="p-6">
      <PageHeader
        titulo="Clientes"
        descripcion="Administración de clientes"
        acciones={
          <Link href="/admin/clientes/nuevo">
  <PrimaryButton>
    + Nuevo Cliente
  </PrimaryButton>
</Link>
        }
      />

      {cargando && (
        <p className="text-gray-500">
          Cargando clientes...
        </p>
      )}

      {!cargando && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!cargando && !error && clientes.length === 0 && (
        <EmptyState
          titulo="No hay clientes"
          descripcion="Cuando registres el primer cliente aparecerá aquí."
        />
      )}

      {!cargando && !error && clientes.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">
                  Cliente
                </th>

                <th className="p-4 text-left">
                  Documento
                </th>

                <th className="p-4 text-left">
                  Teléfono
                </th>

                <th className="p-4 text-left">
                  Ciudad
                </th>

                <th className="p-4 text-left">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-t"
                >
                  <td className="p-4 font-medium">
                    {obtenerNombreCliente(cliente)}
                  </td>

                  <td className="p-4">
                    {cliente.tipo_persona === "juridica"
                      ? cliente.cuit || "—"
                      : cliente.dni || cliente.cuit || "—"}
                  </td>

                  <td className="p-4">
                    {cliente.whatsapp ||
                      cliente.telefono ||
                      "—"}
                  </td>

                  <td className="p-4">
                    {cliente.ciudad || "—"}
                  </td>

                  <td className="p-4">
                    {cliente.activo
                      ? "Activo"
                      : "Inactivo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}