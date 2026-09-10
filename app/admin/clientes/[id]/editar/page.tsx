"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import PageHeader from "@/componentes/admin/PageHeader";

import {
  actualizarCliente,
  obtenerCliente,
  type ClienteFormulario,
} from "@/lib/service/clientes";

export default function EditarClientePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] =
    useState<ClienteFormulario | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const cliente =
          await obtenerCliente(
            Number(params.id)
          );

        setForm({
          tipo_persona:
            cliente.tipo_persona,

          nombre:
            cliente.nombre ?? "",

          apellido:
            cliente.apellido ?? "",

          razon_social:
            cliente.razon_social ?? "",

          dni:
            cliente.dni ?? "",

          cuit:
            cliente.cuit ?? "",

          telefono:
            cliente.telefono ?? "",

          whatsapp:
            cliente.whatsapp ?? "",

          email:
            cliente.email ?? "",

          provincia:
            cliente.provincia ?? "",

          ciudad:
            cliente.ciudad ?? "",

          direccion:
            cliente.direccion ?? "",

          fecha_nacimiento:
            cliente.fecha_nacimiento ?? "",

          profesion:
            cliente.profesion ?? "",

          estado_civil:
            cliente.estado_civil ?? "",

          conyuge_nombre:
            cliente.conyuge_nombre ?? "",

          conyuge_dni:
            cliente.conyuge_dni ?? "",

          observaciones:
            cliente.observaciones ?? "",

          activo:
            cliente.activo,
        });
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "No se pudo cargar el cliente."
        );
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [params.id]);

  function actualizarCampo(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) {
    const { name, value } =
      event.target;

    setForm((anterior) =>
      anterior
        ? {
            ...anterior,
            [name]: value,
          }
        : anterior
    );
  }

  async function guardar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form) return;

    setGuardando(true);
    setError("");

    try {
      await actualizarCliente(
        Number(params.id),
        form
      );

      router.push("/admin/clientes");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo actualizar el cliente."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="p-6">
        Cargando cliente...
      </main>
    );
  }

  if (!form) {
    return (
      <main className="p-6">
        {error || "Cliente no encontrado."}
      </main>
    );
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo="Editar cliente"
        descripcion="Actualizá los datos del cliente"
      />

      <form
        onSubmit={guardar}
        className="mx-auto grid max-w-3xl gap-5 rounded-xl border bg-white p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">

          <Campo
            titulo="Nombre"
            nombre="nombre"
            valor={form.nombre}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Apellido"
            nombre="apellido"
            valor={form.apellido}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="DNI"
            nombre="dni"
            valor={form.dni}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="CUIT"
            nombre="cuit"
            valor={form.cuit}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Teléfono"
            nombre="telefono"
            valor={form.telefono}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="WhatsApp"
            nombre="whatsapp"
            valor={form.whatsapp}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Email"
            nombre="email"
            valor={form.email}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Domicilio"
            nombre="direccion"
            valor={form.direccion}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Ciudad"
            nombre="ciudad"
            valor={form.ciudad}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Provincia"
            nombre="provincia"
            valor={form.provincia}
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Fecha de nacimiento"
            nombre="fecha_nacimiento"
            valor={form.fecha_nacimiento}
            tipo="date"
            onChange={actualizarCampo}
          />

          <Campo
            titulo="Profesión"
            nombre="profesion"
            valor={form.profesion}
            onChange={actualizarCampo}
          />

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
              <option value="">
                Seleccionar
              </option>
              <option value="Soltero/a">
                Soltero/a
              </option>
              <option value="Casado/a">
                Casado/a
              </option>
              <option value="Divorciado/a">
                Divorciado/a
              </option>
              <option value="Viudo/a">
                Viudo/a
              </option>
              <option value="Unión convivencial">
                Unión convivencial
              </option>
            </select>
          </label>
        </div>

        {form.estado_civil ===
          "Casado/a" && (
          <div className="grid gap-5 md:grid-cols-2">
            <Campo
              titulo="Nombre del cónyuge"
              nombre="conyuge_nombre"
              valor={form.conyuge_nombre}
              onChange={actualizarCampo}
            />

            <Campo
              titulo="DNI del cónyuge"
              nombre="conyuge_dni"
              valor={form.conyuge_dni}
              onChange={actualizarCampo}
            />
          </div>
        )}

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
              : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}

type CampoProps = {
  titulo: string;
  nombre: string;
  valor: string;
  tipo?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

function Campo({
  titulo,
  nombre,
  valor,
  tipo = "text",
  onChange,
}: CampoProps) {
  return (
    <label className="grid gap-2">
      <span className="font-medium">
        {titulo}
      </span>

      <input
        type={tipo}
        name={nombre}
        value={valor}
        onChange={onChange}
        className="rounded-lg border p-3"
      />
    </label>
  );
}
