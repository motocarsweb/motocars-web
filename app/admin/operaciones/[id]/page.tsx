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
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

function obtenerNombreCliente(cliente: Cliente) {
  if (cliente.tipo_persona === "juridica") {
    return cliente.razon_social || "Empresa sin razón social";
  }

  return (
    `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() ||
    "Cliente sin nombre"
  );
}

function obtenerNombreVehiculo(vehiculo: VehiculoSupabase) {
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

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha));
}

function obtenerEstadoLegible(estado: Operacion["estado"]) {
  const estados = {
    borrador: "Borrador",
    presupuesto_emitido: "Presupuesto emitido",
    aceptada: "Aceptada",
    boleto_firmado: "Boleto firmado",
    entregada: "Entregada",
    cancelada: "Cancelada",
  };

  return estados[estado];
}

export default function OperacionPage() {
  const params = useParams<{ id: string }>();

  const [operacion, setOperacion] =
    useState<Operacion | null>(null);

  const [cliente, setCliente] =
    useState<Cliente | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarOperacion() {
      const operacionId = Number(params.id);

      if (!Number.isInteger(operacionId) || operacionId <= 0) {
        setError("El identificador de la operación no es válido.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const operacionCargada =
          await obtenerOperacion(operacionId);

        const [clienteCargado, vehiculoCargado] =
          await Promise.all([
            obtenerCliente(operacionCargada.cliente_id),
            obtenerVehiculoPorId(
              operacionCargada.vehiculo_id
            ),
          ]);

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo de la operación."
          );
        }

        if (!componenteActivo) {
          return;
        }

        setOperacion(operacionCargada);
        setCliente(clienteCargado);
        setVehiculo(vehiculoCargado);
      } catch (errorDesconocido) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
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

  if (cargando) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Cargando operación...
        </p>
      </main>
    );
  }

  if (error || !operacion || !cliente || !vehiculo) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "No se pudo cargar la operación."}
        </div>

        <Link
          href="/admin/operaciones/nueva"
          className="mt-5 inline-block rounded-lg border px-4 py-2 font-medium"
        >
          Nueva operación
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo={operacion.numero || `Operación ${operacion.id}`}
        descripcion={`Creada el ${formatearFecha(
          operacion.created_at
        )}`}
        acciones={
          <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold">
            {obtenerEstadoLegible(operacion.estado)}
          </span>
        }
      />

      <div className="mx-auto grid max-w-5xl gap-6">
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
              Cliente
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {obtenerNombreCliente(cliente)}
            </h2>

            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <strong>Documento:</strong>{" "}
                {cliente.dni || cliente.cuit || "—"}
              </p>

              <p>
                <strong>Teléfono:</strong>{" "}
                {cliente.whatsapp ||
                  cliente.telefono ||
                  "—"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {cliente.email || "—"}
              </p>

              <p>
                <strong>Ciudad:</strong>{" "}
                {cliente.ciudad || "—"}
              </p>
            </div>
          </article>

          <article className="rounded-xl border bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
              Vehículo
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {obtenerNombreVehiculo(vehiculo)}
            </h2>

            <div className="mt-4 grid gap-2 text-sm">
              <p>
                <strong>Color:</strong>{" "}
                {vehiculo.color || "—"}
              </p>

              <p>
                <strong>Kilómetros:</strong>{" "}
                {vehiculo.kilometros ?? "—"}
              </p>

              <p>
                <strong>Combustible:</strong>{" "}
                {vehiculo.combustible || "—"}
              </p>

              <p>
                <strong>Transmisión:</strong>{" "}
                {vehiculo.transmision || "—"}
              </p>
            </div>
          </article>
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-bold">
            Condiciones comerciales
          </h2>

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
                - {formatearImporte(operacion.bonificacion)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Gastos
              </p>

              <p className="mt-1 text-lg font-semibold">
                + {formatearImporte(operacion.gastos)}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-5">
            <p className="text-sm font-medium text-gray-500">
              Total
            </p>

            <p className="mt-1 text-3xl font-bold">
              {formatearImporte(operacion.total)}
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="text-xl font-bold">
            Observaciones comerciales
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-gray-700">
            {operacion.observaciones ||
              "Sin observaciones."}
          </p>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href="/admin/operaciones/nueva"
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Nueva operación
          </Link>

          <button
            type="button"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white"
          >
            Generar presupuesto
          </button>
        </div>
      </div>
    </main>
  );
}