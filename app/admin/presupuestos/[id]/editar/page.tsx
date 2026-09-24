"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import PageHeader from "@/componentes/admin/PageHeader";

import {
  actualizarPresupuesto,
  obtenerPresupuesto,
  type Presupuesto,
} from "@/lib/service/presupuestos";

function numeroDesdeInput(valor: string) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

function fechaLocalMasDias(
  fechaBase: string,
  dias: number
) {
  const [anio, mes, dia] = fechaBase
    .slice(0, 10)
    .split("-")
    .map(Number);

  const fecha = new Date(
    anio,
    mes - 1,
    dia
  );

  fecha.setDate(
    fecha.getDate() + Math.max(0, dias)
  );

  const anioResultado =
    fecha.getFullYear();

  const mesResultado = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const diaResultado = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${anioResultado}-${mesResultado}-${diaResultado}`;
}

export default function EditarPresupuestoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const presupuestoId = Number(params.id);

  const [
    presupuesto,
    setPresupuesto,
  ] = useState<Presupuesto | null>(null);

  const [cliente, setCliente] =
    useState("");

  const [documento, setDocumento] =
    useState("");

  const [telefono, setTelefono] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [ciudad, setCiudad] =
    useState("");

  const [direccion, setDireccion] =
    useState("");

  const [precio, setPrecio] =
    useState("0");

  const [
    bonificacion,
    setBonificacion,
  ] = useState("0");

  const [gastos, setGastos] =
    useState("0");

  const [permuta, setPermuta] =
    useState("0");

  const [
    permutaMarca,
    setPermutaMarca,
  ] = useState("");

  const [
    permutaModelo,
    setPermutaModelo,
  ] = useState("");

  const [
    permutaAnio,
    setPermutaAnio,
  ] = useState("");

  const [
    permutaKilometros,
    setPermutaKilometros,
  ] = useState("");

  const [
    formaPago,
    setFormaPago,
  ] = useState("");

  const [
    financiacion,
    setFinanciacion,
  ] = useState("");

  const [
    observaciones,
    setObservaciones,
  ] = useState("");

  const [
    validezDias,
    setValidezDias,
  ] = useState("5");

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (
        !Number.isInteger(presupuestoId) ||
        presupuestoId <= 0
      ) {
        setError(
          "El identificador del presupuesto no es válido."
        );
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const cargado =
          await obtenerPresupuesto(
            presupuestoId
          );

        if (!activo) {
          return;
        }

        setPresupuesto(cargado);

        setCliente(
          cargado.nombre_cliente ?? ""
        );

        setDocumento(
          cargado.documento ?? ""
        );

        setTelefono(
          cargado.telefono ?? ""
        );

        setEmail(
          cargado.email ?? ""
        );

        setCiudad(
          cargado.ciudad ?? ""
        );

        setDireccion(
          cargado.direccion ?? ""
        );

        setPrecio(
          String(
            cargado.precio_vehiculo ?? 0
          )
        );

        setBonificacion(
          String(
            cargado.bonificacion ?? 0
          )
        );

        setGastos(
          String(cargado.gastos ?? 0)
        );

        setPermuta(
          String(
            cargado.valor_permuta ?? 0
          )
        );

        setPermutaMarca(
          cargado.permuta_marca ?? ""
        );

        setPermutaModelo(
          cargado.permuta_modelo ?? ""
        );

        setPermutaAnio(
          cargado.permuta_anio !== null
            ? String(
                cargado.permuta_anio
              )
            : ""
        );

        setPermutaKilometros(
          cargado.permuta_kilometros !==
            null
            ? String(
                cargado.permuta_kilometros
              )
            : ""
        );

        setFormaPago(
          cargado.forma_pago ?? ""
        );

        setFinanciacion(
          cargado.financiacion ?? ""
        );

        setObservaciones(
          cargado.observaciones ?? ""
        );

        setValidezDias(
          String(
            cargado.validez_dias ?? 5
          )
        );
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el presupuesto."
        );
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [presupuestoId]);

  const total = useMemo(() => {
    return (
      numeroDesdeInput(precio) -
      numeroDesdeInput(bonificacion) +
      numeroDesdeInput(gastos) -
      numeroDesdeInput(permuta)
    );
  }, [
    precio,
    bonificacion,
    gastos,
    permuta,
  ]);

  async function guardar() {
    if (!presupuesto) {
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const dias =
        numeroDesdeInput(validezDias);

      await actualizarPresupuesto(
        presupuesto.id,
        {
          vehiculo_id:
            presupuesto.vehiculo_id,

          nombre_cliente: cliente,
          documento,
          telefono,
          email,
          ciudad,
          direccion,

          precio_vehiculo:
            numeroDesdeInput(precio),

          bonificacion:
            numeroDesdeInput(
              bonificacion
            ),

          gastos:
            numeroDesdeInput(gastos),

          valor_permuta:
            numeroDesdeInput(permuta),

          permuta_marca:
            permutaMarca,

          permuta_modelo:
            permutaModelo,

          permuta_anio:
            permutaAnio
              ? numeroDesdeInput(
                  permutaAnio
                )
              : null,

          permuta_kilometros:
            permutaKilometros
              ? numeroDesdeInput(
                  permutaKilometros
                )
              : null,

          total,

          forma_pago: formaPago,
          financiacion,
          observaciones,

          validez_dias: dias,

          valido_hasta:
            fechaLocalMasDias(
              presupuesto.fecha,
              dias
            ),
        }
      );

      router.push(
        `/admin/presupuestos/${presupuesto.id}`
      );

      router.refresh();
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar el presupuesto."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Cargando presupuesto...
        </p>
      </main>
    );
  }

  if (error && !presupuesto) {
    return (
      <main className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  if (!presupuesto) {
    return null;
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo={`Editar ${
          presupuesto.numero ||
          `presupuesto ${presupuesto.id}`
        }`}
        descripcion="Modificar condiciones comerciales del presupuesto"
        acciones={
          <Link
            href={`/admin/presupuestos/${presupuesto.id}`}
            className="inline-flex rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50"
          >
            Cancelar
          </Link>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border bg-white p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-medium">
              Interesado
            </span>

            <input
              value={cliente}
              onChange={(event) =>
                setCliente(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              DNI / CUIT
            </span>

            <input
              value={documento}
              onChange={(event) =>
                setDocumento(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Teléfono / WhatsApp
            </span>

            <input
              value={telefono}
              onChange={(event) =>
                setTelefono(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Email
            </span>

            <input
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Ciudad
            </span>

            <input
              value={ciudad}
              onChange={(event) =>
                setCiudad(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Dirección
            </span>

            <input
              value={direccion}
              onChange={(event) =>
                setDireccion(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>
        </div>

        <div className="my-7 border-t" />

        <h2 className="mb-4 text-xl font-semibold">
          Propuesta comercial
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-medium">
              Precio vehículo
            </span>

            <input
              type="number"
              value={precio}
              onChange={(event) =>
                setPrecio(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Bonificación
            </span>

            <input
              type="number"
              value={bonificacion}
              onChange={(event) =>
                setBonificacion(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Gastos adicionales
            </span>

            <input
              type="number"
              value={gastos}
              onChange={(event) =>
                setGastos(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Validez (días)
            </span>

            <input
              type="number"
              min="0"
              value={validezDias}
              onChange={(event) =>
                setValidezDias(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>
        </div>

        <div className="my-7 border-t" />

        <h2 className="mb-4 text-xl font-semibold">
          Vehículo en permuta
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-medium">
              Marca
            </span>

            <input
              value={permutaMarca}
              onChange={(event) =>
                setPermutaMarca(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Modelo
            </span>

            <input
              value={permutaModelo}
              onChange={(event) =>
                setPermutaModelo(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Año
            </span>

            <input
              type="number"
              value={permutaAnio}
              onChange={(event) =>
                setPermutaAnio(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Kilómetros
            </span>

            <input
              type="number"
              value={permutaKilometros}
              onChange={(event) =>
                setPermutaKilometros(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="font-medium">
              Valor tomado en permuta
            </span>

            <input
              type="number"
              value={permuta}
              onChange={(event) =>
                setPermuta(
                  event.target.value
                )
              }
              className="rounded-lg border p-3"
            />
          </label>
        </div>

        <div className="my-7 border-t" />

        <div className="grid gap-5">
          <label className="grid gap-2">
            <span className="font-medium">
              Forma de pago
            </span>

            <textarea
              value={formaPago}
              onChange={(event) =>
                setFormaPago(
                  event.target.value
                )
              }
              rows={3}
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Financiación
            </span>

            <textarea
              value={financiacion}
              onChange={(event) =>
                setFinanciacion(
                  event.target.value
                )
              }
              rows={3}
              className="rounded-lg border p-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="font-medium">
              Observaciones
            </span>

            <textarea
              value={observaciones}
              onChange={(event) =>
                setObservaciones(
                  event.target.value
                )
              }
              rows={4}
              className="rounded-lg border p-3"
            />
          </label>
        </div>

        <div className="mt-7 flex items-center justify-between rounded-xl bg-gray-50 p-4">
          <div>
            <p className="text-sm text-gray-500">
              Saldo / Total
            </p>

            <p className="text-2xl font-bold">
              {new Intl.NumberFormat(
                "es-AR",
                {
                  style: "currency",
                  currency: "ARS",
                  maximumFractionDigits: 0,
                }
              ).format(total)}
            </p>
          </div>

          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {guardando
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </section>
    </main>
  );
}