"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/componentes/admin/PageHeader";

import {
  listarClientes,
  type Cliente,
} from "@/lib/service/clientes";

import {
  crearOperacion,
  OPERACION_FORMULARIO_INICIAL,
  type OperacionFormulario,
} from "@/lib/service/operaciones";

import {
  obtenerVehiculos,
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

function convertirNumero(valor: string) {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
}

function formatearImporte(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function NuevaOperacionPage() {
  const router = useRouter();

  const [form, setForm] =
    useState<OperacionFormulario>({
      ...OPERACION_FORMULARIO_INICIAL,
    });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<
    VehiculoSupabase[]
  >([]);

  const [cargandoDatos, setCargandoDatos] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarDatos() {
      setCargandoDatos(true);
      setError("");

      try {
        const [
          clientesCargados,
          vehiculosCargados,
        ] = await Promise.all([
          listarClientes(),
          obtenerVehiculos(),
        ]);

        if (!componenteActivo) {
          return;
        }

        setClientes(
          clientesCargados.filter(
            (cliente) => cliente.activo
          )
        );

        setVehiculos(vehiculosCargados);
      } catch (errorDesconocido) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar los datos."
        );
      } finally {
        if (componenteActivo) {
          setCargandoDatos(false);
        }
      }
    }

    cargarDatos();

    return () => {
      componenteActivo = false;
    };
  }, []);

  const total = useMemo(() => {
    return (
      convertirNumero(form.precio_vehiculo) -
      convertirNumero(form.bonificacion) +
      convertirNumero(form.gastos)
    );
  }, [
    form.precio_vehiculo,
    form.bonificacion,
    form.gastos,
  ]);

  function actualizarCampo(
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));
  }

  function seleccionarVehiculo(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const vehiculoId = event.target.value;

    const vehiculoSeleccionado =
      vehiculos.find(
        (vehiculo) =>
          String(vehiculo.id) === vehiculoId
      );

    setForm((formAnterior) => ({
      ...formAnterior,
      vehiculo_id: vehiculoId,
      precio_vehiculo:
        vehiculoSeleccionado?.precio !== null &&
        vehiculoSeleccionado?.precio !== undefined
          ? String(vehiculoSeleccionado.precio)
          : "",
    }));
  }

  function validarFormulario() {
    if (!form.cliente_id) {
      return "Seleccioná un cliente.";
    }

    if (!form.vehiculo_id) {
      return "Seleccioná un vehículo.";
    }

    if (
      convertirNumero(form.precio_vehiculo) <= 0
    ) {
      return "Ingresá un precio válido.";
    }

    if (
      convertirNumero(form.bonificacion) < 0 ||
      convertirNumero(form.gastos) < 0
    ) {
      return "Los importes no pueden ser negativos.";
    }

    if (total < 0) {
      return "El total de la operación no puede ser negativo.";
    }

    return "";
  }

  async function guardarOperacion(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const mensajeValidacion =
      validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const operacion = await crearOperacion(form);

      router.push(
        `/admin/operaciones/${operacion.id}`
      );

      router.refresh();
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo guardar la operación."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo="Nueva operación"
        descripcion="Seleccioná el cliente, el vehículo y las condiciones comerciales"
      />

      <form
        onSubmit={guardarOperacion}
        className="mx-auto grid max-w-4xl gap-6 rounded-xl border bg-white p-6"
      >
        {cargandoDatos ? (
          <p className="text-gray-500">
            Cargando clientes y vehículos...
          </p>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="font-medium">
                  Cliente *
                </span>

                <select
                  name="cliente_id"
                  value={form.cliente_id}
                  onChange={actualizarCampo}
                  className="rounded-lg border p-3"
                  required
                >
                  <option value="">
                    Seleccionar cliente
                  </option>

                  {clientes.map((cliente) => (
                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >
                      {obtenerNombreCliente(cliente)}
                    </option>
                  ))}
                </select>

                <Link
                  href="/admin/clientes/nuevo"
                  className="text-sm font-medium text-blue-600"
                >
                  + Crear cliente nuevo
                </Link>
              </label>

              <label className="grid gap-2">
                <span className="font-medium">
                  Vehículo *
                </span>

                <select
                  name="vehiculo_id"
                  value={form.vehiculo_id}
                  onChange={seleccionarVehiculo}
                  className="rounded-lg border p-3"
                  required
                >
                  <option value="">
                    Seleccionar vehículo
                  </option>

                  {vehiculos.map((vehiculo) => (
                    <option
                      key={vehiculo.id}
                      value={vehiculo.id}
                    >
                      {obtenerNombreVehiculo(
                        vehiculo
                      )}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <label className="grid gap-2">
                <span className="font-medium">
                  Precio del vehículo *
                </span>

                <input
                  type="number"
                  name="precio_vehiculo"
                  min="0"
                  step="1"
                  value={form.precio_vehiculo}
                  onChange={actualizarCampo}
                  className="rounded-lg border p-3"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium">
                  Bonificación
                </span>

                <input
                  type="number"
                  name="bonificacion"
                  min="0"
                  step="1"
                  value={form.bonificacion}
                  onChange={actualizarCampo}
                  className="rounded-lg border p-3"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium">
                  Gastos
                </span>

                <input
                  type="number"
                  name="gastos"
                  min="0"
                  step="1"
                  value={form.gastos}
                  onChange={actualizarCampo}
                  className="rounded-lg border p-3"
                />
              </label>
            </div>

            <section className="rounded-xl bg-gray-50 p-5">
              <p className="text-sm font-medium text-gray-500">
                Total de la operación
              </p>

              <p className="mt-1 text-3xl font-bold">
                {formatearImporte(total)}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Precio − bonificación + gastos
              </p>
            </section>

            <label className="grid gap-2">
              <span className="font-medium">
                Observaciones comerciales
              </span>

              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={actualizarCampo}
                rows={5}
                className="rounded-lg border p-3"
                placeholder="Condiciones especiales, diferencias con otro vehículo o cualquier anotación adicional"
              />
            </label>
          </>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/dashboard"
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={
              guardando || cargandoDatos
            }
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white disabled:opacity-60"
          >
            {guardando
              ? "Guardando..."
              : "Guardar borrador"}
          </button>
        </div>
      </form>
    </main>
  );
}