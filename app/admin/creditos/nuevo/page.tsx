"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/componentes/admin/PageHeader";
import PrimaryButton from "@/componentes/admin/PrimaryButton";

import {
  crearCliente,
  listarClientes,
  CLIENTE_FORMULARIO_INICIAL,
  type Cliente,
  type ClienteFormulario,
} from "@/lib/service/clientes";

import {
  listarOperaciones,
  type Operacion,
} from "@/lib/service/operaciones";

import {
  crearCredito,
  CREDITO_FORMULARIO_INICIAL,
  type CreditoFormulario,
} from "@/lib/service/creditos";

function nombreCliente(cliente: Cliente) {
  if (cliente.tipo_persona === "juridica") {
    return (
      cliente.razon_social ||
      "Empresa sin razón social"
    );
  }

  return (
    `${cliente.apellido ?? ""}, ${cliente.nombre ?? ""}`
      .replace(/^,\s*/, "")
      .trim() ||
    "Cliente sin nombre"
  );
}

function numeroOperacion(operacion: Operacion) {
  return (
    operacion.numero ||
    `OP-${String(operacion.id).padStart(6, "0")}`
  );
}

export default function NuevoCreditoPage() {
  const router = useRouter();

  const [form, setForm] =
    useState<CreditoFormulario>({
      ...CREDITO_FORMULARIO_INICIAL,
    });

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [operaciones, setOperaciones] =
    useState<Operacion[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");
      const [mostrarNuevoCliente, setMostrarNuevoCliente] =
    useState(false);

  const [nuevoCliente, setNuevoCliente] =
    useState<ClienteFormulario>({
      ...CLIENTE_FORMULARIO_INICIAL,
    });

  const [guardandoCliente, setGuardandoCliente] =
    useState(false);

  const [errorCliente, setErrorCliente] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        const [
          clientesCargados,
          operacionesCargadas,
        ] = await Promise.all([
          listarClientes(),
          listarOperaciones(),
        ]);

        if (!activo) {
          return;
        }

        setClientes(
          clientesCargados.filter(
            (cliente) => cliente.activo
          )
        );

        setOperaciones(
          operacionesCargadas.filter(
            (operacion) =>
              operacion.tipo_operacion === "venta"
          )
        );
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudieron cargar los datos."
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

  const operacionesCliente =
    useMemo(() => {
      if (!form.cliente_id) {
        return [];
      }

      return operaciones.filter(
        (operacion) =>
          operacion.cliente_id ===
          Number(form.cliente_id)
      );
    }, [
      operaciones,
      form.cliente_id,
    ]);

  function actualizarCampo(
    evento:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const {
      name,
      value,
    } = evento.target;

    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function cambiarCliente(
    evento: React.ChangeEvent<HTMLSelectElement>
  ) {
    setForm((actual) => ({
      ...actual,
      cliente_id: evento.target.value,
      operacion_id: "",
    }));
  }

  function cambiarTipoCredito(
    evento: React.ChangeEvent<HTMLSelectElement>
  ) {
    const tipo =
      evento.target.value as
        CreditoFormulario["tipo_credito"];

    setForm((actual) => ({
      ...actual,
      tipo_credito: tipo,
      operacion_id:
        tipo === "prestamo_personal"
          ? ""
          : actual.operacion_id,
    }));
  }
    function actualizarNuevoCliente(
    evento:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value } = evento.target;

    setNuevoCliente((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  async function guardarNuevoCliente() {
    setErrorCliente("");
    setGuardandoCliente(true);

    try {
      const clienteCreado =
        await crearCliente(nuevoCliente);

      setClientes((actuales) => [
        ...actuales,
        clienteCreado,
      ]);

      setForm((actual) => ({
        ...actual,
        cliente_id: String(clienteCreado.id),
        operacion_id: "",
      }));

      setNuevoCliente({
        ...CLIENTE_FORMULARIO_INICIAL,
      });

      setMostrarNuevoCliente(false);
    } catch (errorDesconocido) {
      setErrorCliente(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo crear el cliente."
      );
    } finally {
      setGuardandoCliente(false);
    }
  }

  async function guardarCredito(
    evento: React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setError("");

    if (!form.cliente_id) {
      setError(
        "Seleccioná el cliente."
      );
      return;
    }

    if (
      form.tipo_credito ===
        "financiacion_vehiculo" &&
      !form.operacion_id
    ) {
      setError(
        "Seleccioná la operación de venta financiada."
      );
      return;
    }

    if (
      !form.capital_financiado ||
      Number(form.capital_financiado) <= 0
    ) {
      setError(
        "Ingresá el capital financiado."
      );
      return;
    }

    if (
      !form.cantidad_cuotas ||
      Number(form.cantidad_cuotas) <= 0
    ) {
      setError(
        "Ingresá la cantidad de cuotas."
      );
      return;
    }

    if (
      !form.importe_cuota ||
      Number(form.importe_cuota) <= 0
    ) {
      setError(
        "Ingresá el importe de la cuota."
      );
      return;
    }

    if (!form.fecha_primera_cuota) {
      setError(
        "Ingresá el vencimiento de la primera cuota."
      );
      return;
    }

    setGuardando(true);

    try {
      const credito =
        await crearCredito(form);

      router.push(
        `/admin/creditos/${credito.id}`
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo crear el crédito."
      );

      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Cargando...
        </p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo="Nuevo crédito"
        descripcion="Alta de préstamo personal o financiación de vehículo"
        acciones={
          <Link
            href="/admin/creditos"
            className="rounded-lg border bg-white px-4 py-2 font-medium"
          >
            Volver
          </Link>
        }
      />

      <form
        onSubmit={guardarCredito}
        className="grid gap-6"
      >
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-5 rounded-xl border bg-white p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold">
              Datos del crédito
            </h2>
          </div>

                    <label className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">
                Cliente
              </span>

              <button
                type="button"
                onClick={() => {
                  setErrorCliente("");
                  setMostrarNuevoCliente(
                    (actual) => !actual
                  );
                }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                {mostrarNuevoCliente
                  ? "Cancelar nuevo cliente"
                  : "+ Nuevo cliente"}
              </button>
            </div>

            <select
              name="cliente_id"
              value={form.cliente_id}
              onChange={cambiarCliente}
              className="rounded-lg border bg-white p-3"
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
                  {nombreCliente(cliente)}
                  {cliente.dni
                    ? ` - DNI ${cliente.dni}`
                    : cliente.cuit
                      ? ` - CUIT ${cliente.cuit}`
                      : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Tipo de crédito
            </span>

            <select
              name="tipo_credito"
              value={form.tipo_credito}
              onChange={cambiarTipoCredito}
              className="rounded-lg border bg-white p-3"
            >
              <option value="prestamo_personal">
                Préstamo personal
              </option>

              <option value="financiacion_vehiculo">
                Financiación de vehículo
              </option>
            </select>
          </label>
          {mostrarNuevoCliente && (
            <div className="grid gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 md:col-span-2 md:grid-cols-2">
              <div className="md:col-span-2">
                <h3 className="font-semibold">
                  Nuevo cliente
                </h3>
                <p className="text-sm text-gray-600">
                  El cliente quedará guardado y seleccionado automáticamente.
                </p>
              </div>

              {errorCliente && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 md:col-span-2">
                  {errorCliente}
                </div>
              )}

              <label className="grid gap-2">
                <span className="font-medium">
                  Tipo de persona
                </span>

                <select
                  name="tipo_persona"
                  value={nuevoCliente.tipo_persona}
                  onChange={actualizarNuevoCliente}
                  className="rounded-lg border bg-white p-3"
                >
                  <option value="fisica">
                    Persona física
                  </option>
                  <option value="juridica">
                    Persona jurídica
                  </option>
                </select>
              </label>

              {nuevoCliente.tipo_persona === "fisica" ? (
                <>
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Nombre
                    </span>
                    <input
                      type="text"
                      name="nombre"
                      value={nuevoCliente.nombre}
                      onChange={actualizarNuevoCliente}
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Apellido
                    </span>
                    <input
                      type="text"
                      name="apellido"
                      value={nuevoCliente.apellido}
                      onChange={actualizarNuevoCliente}
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      DNI
                    </span>
                    <input
                      type="text"
                      name="dni"
                      value={nuevoCliente.dni}
                      onChange={actualizarNuevoCliente}
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>
                </>
              ) : (
                <label className="grid gap-2">
                  <span className="font-medium">
                    Razón social
                  </span>
                  <input
                    type="text"
                    name="razon_social"
                    value={nuevoCliente.razon_social}
                    onChange={actualizarNuevoCliente}
                    className="rounded-lg border bg-white p-3"
                  />
                </label>
              )}

              <label className="grid gap-2">
                <span className="font-medium">
                  CUIT
                </span>
                <input
                  type="text"
                  name="cuit"
                  value={nuevoCliente.cuit}
                  onChange={actualizarNuevoCliente}
                  className="rounded-lg border bg-white p-3"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium">
                  Teléfono
                </span>
                <input
                  type="text"
                  name="telefono"
                  value={nuevoCliente.telefono}
                  onChange={actualizarNuevoCliente}
                  className="rounded-lg border bg-white p-3"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium">
                  WhatsApp
                </span>
                <input
                  type="text"
                  name="whatsapp"
                  value={nuevoCliente.whatsapp}
                  onChange={actualizarNuevoCliente}
                  className="rounded-lg border bg-white p-3"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium">
                  Provincia
                </span>
                <input
                  type="text"
                  name="provincia"
                  value={nuevoCliente.provincia}
                  onChange={actualizarNuevoCliente}
                  className="rounded-lg border bg-white p-3"
                />
              </label>

              <label className="grid gap-2">
                <span className="font-medium">
                  Ciudad
                </span>
                <input
                  type="text"
                  name="ciudad"
                  value={nuevoCliente.ciudad}
                  onChange={actualizarNuevoCliente}
                  className="rounded-lg border bg-white p-3"
                />
              </label>

              <label className="grid gap-2 md:col-span-2">
                <span className="font-medium">
                  Domicilio
                </span>
                <input
                  type="text"
                  name="direccion"
                  value={nuevoCliente.direccion}
                  onChange={actualizarNuevoCliente}
                  className="rounded-lg border bg-white p-3"
                />
              </label>

              <div className="flex justify-end md:col-span-2">
                <button
                  type="button"
                  onClick={guardarNuevoCliente}
                  disabled={guardandoCliente}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {guardandoCliente
                    ? "Guardando cliente..."
                    : "Guardar nuevo cliente"}
                </button>
              </div>
            </div>
          )}
          {form.tipo_credito ===
            "financiacion_vehiculo" && (
            <label className="grid gap-2 md:col-span-2">
              <span className="font-medium">
                Operación de venta
              </span>

              <select
                name="operacion_id"
                value={form.operacion_id}
                onChange={actualizarCampo}
                className="rounded-lg border bg-white p-3"
                required
              >
                <option value="">
                  Seleccionar operación
                </option>

                {operacionesCliente.map(
                  (operacion) => (
                    <option
                      key={operacion.id}
                      value={operacion.id}
                    >
                      {numeroOperacion(
                        operacion
                      )}
                    </option>
                  )
                )}
              </select>

              {form.cliente_id &&
                operacionesCliente.length ===
                  0 && (
                  <span className="text-sm text-gray-500">
                    Este cliente no tiene operaciones de venta registradas.
                  </span>
                )}
            </label>
          )}

          <label className="grid gap-2">
            <span className="font-medium">
              Fecha de otorgamiento
            </span>

            <input
              type="date"
              name="fecha_otorgamiento"
              value={form.fecha_otorgamiento}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Moneda
            </span>

            <select
              name="moneda"
              value={form.moneda}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
            >
              <option value="ARS">
                Pesos argentinos
              </option>

              <option value="USD">
                Dólares estadounidenses
              </option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Capital total financiado
            </span>

            <input
              type="number"
              name="capital_financiado"
              value={form.capital_financiado}
              onChange={actualizarCampo}
              min="0"
              step="0.01"
              placeholder="0"
              className="rounded-lg border bg-white p-3"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Cantidad de cuotas
            </span>

            <input
              type="number"
              name="cantidad_cuotas"
              value={form.cantidad_cuotas}
              onChange={actualizarCampo}
              min="1"
              step="1"
              placeholder="Ej.: 18"
              className="rounded-lg border bg-white p-3"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Importe de cada cuota
            </span>

            <input
              type="number"
              name="importe_cuota"
              value={form.importe_cuota}
              onChange={actualizarCampo}
              min="0"
              step="0.01"
              placeholder="0"
              className="rounded-lg border bg-white p-3"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Vencimiento primera cuota
            </span>

            <input
              type="date"
              name="fecha_primera_cuota"
              value={form.fecha_primera_cuota}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Tasa de interés %
            </span>

            <input
              type="number"
              name="tasa_interes"
              value={form.tasa_interes}
              onChange={actualizarCampo}
              min="0"
              step="0.01"
              placeholder="Opcional"
              className="rounded-lg border bg-white p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Interés por mora mensual %
            </span>

            <input
              type="number"
              name="interes_mora_mensual"
              value={form.interes_mora_mensual}
              onChange={actualizarCampo}
              min="0"
              step="0.01"
              placeholder="Opcional"
              className="rounded-lg border bg-white p-3"
            />
          </label>
        </section>

        <section className="grid gap-5 rounded-xl border bg-white p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold">
              Garante
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Datos opcionales del garante de la operación.
            </p>
          </div>

          <label className="grid gap-2">
            <span className="font-medium">
              Nombre y apellido
            </span>

            <input
              type="text"
              name="garante_nombre"
              value={form.garante_nombre}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              DNI
            </span>

            <input
              type="text"
              name="garante_dni"
              value={form.garante_dni}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              CUIT
            </span>

            <input
              type="text"
              name="garante_cuit"
              value={form.garante_cuit}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Teléfono
            </span>

            <input
              type="text"
              name="garante_telefono"
              value={form.garante_telefono}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="font-medium">
              Domicilio
            </span>

            <input
              type="text"
              name="garante_domicilio"
              value={form.garante_domicilio}
              onChange={actualizarCampo}
              className="rounded-lg border bg-white p-3"
            />
          </label>
        </section>

        <section className="grid gap-4 rounded-xl border bg-white p-5">
          <label className="grid gap-2">
            <span className="font-medium">
              Observaciones
            </span>

            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={actualizarCampo}
              rows={4}
              className="rounded-lg border bg-white p-3"
            />
          </label>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/creditos"
            className="rounded-lg border bg-white px-5 py-3 font-medium"
          >
            Cancelar
          </Link>

          <PrimaryButton
            type="submit"
            disabled={guardando}
          >
            {guardando
              ? "Guardando..."
              : "Crear crédito"}
          </PrimaryButton>
        </div>
      </form>
    </main>
  );
}