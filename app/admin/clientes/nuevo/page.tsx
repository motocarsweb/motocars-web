"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import PageHeader from "@/componentes/admin/PageHeader";
import {
  CLIENTE_FORMULARIO_INICIAL,
  crearCliente,
  type ClienteFormulario,
} from "@/lib/service/clientes";

export default function NuevoClientePage() {
  const router = useRouter();

  const [form, setForm] = useState<ClienteFormulario>({
    ...CLIENTE_FORMULARIO_INICIAL,
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function actualizarCampo(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));
  }

  function cambiarTipoPersona(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const tipoPersona = event.target.value as
      | "fisica"
      | "juridica";

    setForm((formAnterior) => ({
      ...formAnterior,
      tipo_persona: tipoPersona,

      nombre:
        tipoPersona === "fisica"
          ? formAnterior.nombre
          : "",

      apellido:
        tipoPersona === "fisica"
          ? formAnterior.apellido
          : "",

      dni:
        tipoPersona === "fisica"
          ? formAnterior.dni
          : "",

      razon_social:
        tipoPersona === "juridica"
          ? formAnterior.razon_social
          : "",
    }));
  }

  function validarFormulario() {
    if (
      form.tipo_persona === "fisica" &&
      !form.nombre.trim()
    ) {
      return "Ingresá el nombre del cliente.";
    }

    if (
      form.tipo_persona === "juridica" &&
      !form.razon_social.trim()
    ) {
      return "Ingresá la razón social.";
    }

    if (!form.telefono.trim() && !form.whatsapp.trim()) {
      return "Ingresá al menos un teléfono o WhatsApp.";
    }

    return "";
  }

  async function guardar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const mensajeValidacion = validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setGuardando(true);
    setError("");

    try {
      await crearCliente(form);
      router.push("/admin/clientes");
      router.refresh();
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo guardar el cliente."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo="Nuevo cliente"
        descripcion="Registrá los datos básicos del cliente"
      />

      <form
        onSubmit={guardar}
        className="mx-auto grid max-w-3xl gap-5 rounded-xl border bg-white p-6"
      >
        <label className="grid gap-2">
          <span className="font-medium">
            Tipo de cliente
          </span>

          <select
            name="tipo_persona"
            value={form.tipo_persona}
            onChange={cambiarTipoPersona}
            className="rounded-lg border p-3"
          >
            <option value="fisica">
              Persona
            </option>

            <option value="juridica">
              Empresa
            </option>
          </select>
        </label>

        {form.tipo_persona === "fisica" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-medium">
                Nombre *
              </span>

              <input
                name="nombre"
                value={form.nombre}
                onChange={actualizarCampo}
                className="rounded-lg border p-3"
                required
              />
            </label>
            <label className="grid gap-2">
  <span className="font-medium">
    Profesión
  </span>

  <input
    name="profesion"
    value={form.profesion}
    onChange={actualizarCampo}
    className="rounded-lg border p-3"
  />
</label>

<label className="grid gap-2">
  <span className="font-medium">
    Estado civil
  </span>

  <select
    name="estado_civil"
    value={form.estado_civil}
    onChange={actualizarCampo}
    className="rounded-lg border p-3"
  >
    <option value="">Seleccionar</option>
    <option value="Soltero/a">Soltero/a</option>
    <option value="Casado/a">Casado/a</option>
    <option value="Divorciado/a">Divorciado/a</option>
    <option value="Viudo/a">Viudo/a</option>
    <option value="Unión convivencial">
      Unión convivencial
    </option>
  </select>
</label>

{form.estado_civil === "Casado/a" && (
  <>
    <label className="grid gap-2">
      <span className="font-medium">
        Nombre y apellido del cónyuge
      </span>

      <input
        name="conyuge_nombre"
        value={form.conyuge_nombre}
        onChange={actualizarCampo}
        className="rounded-lg border p-3"
      />
    </label>

    <label className="grid gap-2">
      <span className="font-medium">
        DNI del cónyuge
      </span>

      <input
        name="conyuge_dni"
        value={form.conyuge_dni}
        onChange={actualizarCampo}
        className="rounded-lg border p-3"
      />
    </label>
  </>
)}

            <label className="grid gap-2">
              <span className="font-medium">
                Apellido
              </span>

              <input
                name="apellido"
                value={form.apellido}
                onChange={actualizarCampo}
                className="rounded-lg border p-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                DNI
              </span>

              <input
                name="dni"
                value={form.dni}
                onChange={actualizarCampo}
                className="rounded-lg border p-3"
              />
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                CUIT
              </span>

              <input
                name="cuit"
                value={form.cuit}
                onChange={actualizarCampo}
                className="rounded-lg border p-3"
              />
            </label>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 md:col-span-2">
              <span className="font-medium">
                Razón social *
              </span>

              <input
                name="razon_social"
                value={form.razon_social}
                onChange={actualizarCampo}
                className="rounded-lg border p-3"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="font-medium">
                CUIT
              </span>

              <input
                name="cuit"
                value={form.cuit}
                onChange={actualizarCampo}
                className="rounded-lg border p-3"
              />
            </label>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-medium">
              Teléfono
            </span>

            <input
              name="telefono"
              value={form.telefono}
              onChange={actualizarCampo}
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              WhatsApp
            </span>

            <input
              name="whatsapp"
              value={form.whatsapp}
              onChange={actualizarCampo}
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Email
            </span>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={actualizarCampo}
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Ciudad
            </span>

            <input
              name="ciudad"
              value={form.ciudad}
              onChange={actualizarCampo}
              className="rounded-lg border p-3"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="font-medium">
            Observaciones
          </span>

          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={actualizarCampo}
            rows={4}
            className="rounded-lg border p-3"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/clientes"
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {guardando
              ? "Guardando..."
              : "Guardar cliente"}
          </button>
        </div>
      </form>
    </main>
  );
}