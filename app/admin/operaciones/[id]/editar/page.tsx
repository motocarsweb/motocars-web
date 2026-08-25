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
  type Cliente,
  type ClienteFormulario,
} from "@/lib/service/clientes";

import {
  actualizarOperacion,
  obtenerOperacion,
  type Operacion,
  type OperacionFormulario,
} from "@/lib/service/operaciones";

import {
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";


function nombreCliente(
  cliente: Cliente | null
) {
  if (!cliente) {
    return "Cargando...";
  }

  if (
    cliente.tipo_persona ===
    "juridica"
  ) {
    return (
      cliente.razon_social ||
      "Empresa sin razón social"
    );
  }

  return (
    `${cliente.nombre ?? ""} ${
      cliente.apellido ?? ""
    }`.trim() ||
    "Cliente sin nombre"
  );
}


function nombreVehiculo(
  vehiculo: VehiculoSupabase | null
) {
  if (!vehiculo) {
    return "Cargando...";
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


function nombreTipoOperacion(
  tipo: Operacion["tipo_operacion"]
) {
  if (tipo === "venta") {
    return "Venta";
  }

  if (tipo === "compra") {
    return "Compra";
  }

  return "Consignación";
}


function crearFormularioDesdeOperacion(
  operacion: Operacion
): OperacionFormulario {
  return {
    tipo_operacion:
      operacion.tipo_operacion,

    cliente_id:
      String(operacion.cliente_id),

    vehiculo_id:
      String(operacion.vehiculo_id),

    precio_vehiculo:
      String(
        operacion.precio_vehiculo ??
          0
      ),

    moneda:
      operacion.moneda ?? "ARS",

    bonificacion:
      String(
        operacion.bonificacion ??
          0
      ),

    gastos:
      String(
        operacion.gastos ?? 0
      ),

    asesor_comercial:
      operacion.asesor_comercial ??
      "",

    forma_pago:
      operacion.forma_pago ?? "",

    detalle_pago:
      operacion.detalle_pago ?? "",

    gastos_gestoria:
      String(
        operacion.gastos_gestoria ??
          0
      ),

    gastos_gestoria_incluidos:
      Boolean(
        operacion
          .gastos_gestoria_incluidos
      ),

    fecha_entrega:
      operacion.fecha_entrega ?? "",

    hora_entrega:
      operacion.hora_entrega ?? "",

    entrega_sin_patentar:
      Boolean(
        operacion
          .entrega_sin_patentar
      ),

    observaciones:
      operacion.observaciones ?? "",

    observaciones_internas:
      operacion
        .observaciones_internas ??
      "",
  };
}


function crearFormularioCliente(
  cliente: Cliente
): ClienteFormulario {
  return {
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
  };
}


export default function EditarOperacionPage() {
  const params =
    useParams<{ id: string }>();

  const router =
    useRouter();

  const [
    operacion,
    setOperacion,
  ] =
    useState<Operacion | null>(
      null
    );

  const [
    cliente,
    setCliente,
  ] =
    useState<Cliente | null>(
      null
    );

  const [
    vehiculo,
    setVehiculo,
  ] =
    useState<VehiculoSupabase | null>(
      null
    );

  const [
    form,
    setForm,
  ] =
    useState<OperacionFormulario | null>(
      null
    );

  const [
    formCliente,
    setFormCliente,
  ] =
    useState<ClienteFormulario | null>(
      null
    );

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    guardando,
    setGuardando,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {
    let activo = true;


    async function cargar() {
      const operacionId =
        Number(params.id);


      if (
        !Number.isInteger(
          operacionId
        ) ||
        operacionId <= 0
      ) {
        setError(
          "El identificador de la operación no es válido."
        );

        setCargando(false);

        return;
      }


      try {
        setCargando(true);
        setError("");


        const operacionCargada =
          await obtenerOperacion(
            operacionId
          );


        const [
          clienteCargado,
          vehiculoCargado,
        ] =
          await Promise.all([
            obtenerCliente(
              operacionCargada
                .cliente_id
            ),

            obtenerVehiculoPorId(
              operacionCargada
                .vehiculo_id
            ),
          ]);


        if (!activo) {
          return;
        }


        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo de la operación."
          );
        }


        setOperacion(
          operacionCargada
        );

        setCliente(
          clienteCargado
        );

        setVehiculo(
          vehiculoCargado
        );

        setForm(
          crearFormularioDesdeOperacion(
            operacionCargada
          )
        );

        setFormCliente(
          crearFormularioCliente(
            clienteCargado
          )
        );
      } catch (e) {
        if (!activo) {
          return;
        }

        setError(
          e instanceof Error
            ? e.message
            : "No se pudo cargar la operación."
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
  }, [params.id]);


  function actualizarCampo(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) {
    const target =
      event.target;

    const valor =
      target instanceof
        HTMLInputElement &&
      target.type === "checkbox"
        ? target.checked
        : target.value;


    setForm((anterior) =>
      anterior
        ? {
            ...anterior,
            [target.name]:
              valor,
          }
        : anterior
    );
  }


  function actualizarCampoCliente(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
    } =
      event.target;


    setFormCliente(
      (anterior) => {
        if (!anterior) {
          return anterior;
        }


        if (
          name ===
          "estado_civil"
        ) {
          return {
            ...anterior,

            estado_civil:
              value,

            conyuge_nombre:
              value ===
              "Casado/a"
                ? anterior
                    .conyuge_nombre
                : "",

            conyuge_dni:
              value ===
              "Casado/a"
                ? anterior
                    .conyuge_dni
                : "",
          };
        }


        return {
          ...anterior,
          [name]: value,
        };
      }
    );
  }


  async function guardar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (
      !operacion ||
      !form ||
      !cliente ||
      !formCliente ||
      guardando
    ) {
      return;
    }


    if (
      Number(
        form.precio_vehiculo
      ) < 0
    ) {
      setError(
        "El precio del vehículo no puede ser negativo."
      );

      return;
    }


    if (
      Number(
        form.gastos_gestoria
      ) < 0
    ) {
      setError(
        "Los gastos de gestoría no pueden ser negativos."
      );

      return;
    }


    if (
      Number(
        form.bonificacion
      ) < 0
    ) {
      setError(
        "La bonificación no puede ser negativa."
      );

      return;
    }


    if (
      Number(form.gastos) < 0
    ) {
      setError(
        "Los otros gastos no pueden ser negativos."
      );

      return;
    }


    if (
      formCliente.tipo_persona ===
        "fisica" &&
      !formCliente.nombre.trim()
    ) {
      setError(
        "Ingresá el nombre del cliente."
      );

      return;
    }


    if (
      formCliente.tipo_persona ===
        "juridica" &&
      !formCliente.razon_social.trim()
    ) {
      setError(
        "Ingresá la razón social."
      );

      return;
    }


    try {
      setGuardando(true);
      setError("");


      const clienteActualizado =
        await actualizarCliente(
          cliente.id,
          formCliente
        );


      await actualizarOperacion(
        operacion.id,
        form
      );


      setCliente(
        clienteActualizado
      );


      router.push(
        `/admin/operaciones/${operacion.id}`
      );

      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo actualizar la operación."
      );
    } finally {
      setGuardando(false);
    }
  }


  if (cargando) {
    return (
      <main className="p-6 text-gray-500">
        Cargando operación...
      </main>
    );
  }


  if (
    !operacion ||
    !form ||
    !cliente ||
    !formCliente ||
    !vehiculo
  ) {
    return (
      <main className="p-6">
        <p className="text-red-600">
          {error ||
            "No se pudo cargar la operación."}
        </p>

        <Link
          href="/admin/operaciones"
          className="mt-4 inline-block font-medium text-blue-600"
        >
          ← Volver a operaciones
        </Link>
      </main>
    );
  }


  return (
    <main className="p-6">
      <PageHeader
        titulo={`Editar operación ${
          operacion.numero ??
          `#${operacion.id}`
        }`}
        descripcion="Completá o corregí los datos administrativos de la operación"
      />


      <form
        onSubmit={guardar}
        className="mx-auto grid max-w-4xl gap-6 rounded-xl border bg-white p-6"
      >

        {/* RESUMEN */}

        <section className="grid gap-4 rounded-xl border bg-gray-50 p-5 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Tipo
            </p>

            <p className="mt-1 font-semibold">
              {nombreTipoOperacion(
                operacion.tipo_operacion
              )}
            </p>
          </div>


          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Cliente / titular
            </p>

            <p className="mt-1 font-semibold">
              {nombreCliente(
                cliente
              )}
            </p>
          </div>


          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Vehículo
            </p>

            <p className="mt-1 font-semibold">
              {nombreVehiculo(
                vehiculo
              )}
            </p>
          </div>
        </section>


        {/* DATOS DEL CLIENTE */}

        <section className="grid gap-6 rounded-xl border p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold">
              Datos del cliente
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Estos cambios también actualizan la ficha general del cliente.
            </p>
          </div>


          {formCliente.tipo_persona ===
          "fisica" ? (
            <>
              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  Nombre
                </span>

                <input
                  type="text"
                  name="nombre"
                  value={
                    formCliente.nombre
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                  required
                />
              </label>


              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  Apellido
                </span>

                <input
                  type="text"
                  name="apellido"
                  value={
                    formCliente.apellido
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                />
              </label>


              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  DNI
                </span>

                <input
                  type="text"
                  name="dni"
                  value={
                    formCliente.dni
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                />
              </label>


              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  CUIT
                </span>

                <input
                  type="text"
                  name="cuit"
                  value={
                    formCliente.cuit
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                />
              </label>


              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  Fecha de nacimiento
                </span>

                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={
                    formCliente
                      .fecha_nacimiento
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                />
              </label>


              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  Profesión
                </span>

                <input
                  type="text"
                  name="profesion"
                  value={
                    formCliente
                      .profesion
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                />
              </label>


              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  Estado civil
                </span>

                <select
                  name="estado_civil"
                  value={
                    formCliente
                      .estado_civil
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border bg-white p-3"
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


              {formCliente.estado_civil ===
                "Casado/a" && (
                <>
                  <label className="grid min-w-0 gap-2">
                    <span className="font-medium">
                      Nombre y apellido
                      del cónyuge
                    </span>

                    <input
                      type="text"
                      name="conyuge_nombre"
                      value={
                        formCliente
                          .conyuge_nombre
                      }
                      onChange={
                        actualizarCampoCliente
                      }
                      className="w-full rounded-lg border p-3"
                    />
                  </label>


                  <label className="grid min-w-0 gap-2">
                    <span className="font-medium">
                      DNI del cónyuge
                    </span>

                    <input
                      type="text"
                      name="conyuge_dni"
                      value={
                        formCliente
                          .conyuge_dni
                      }
                      onChange={
                        actualizarCampoCliente
                      }
                      className="w-full rounded-lg border p-3"
                    />
                  </label>
                </>
              )}
            </>
          ) : (
            <>
              <label className="grid gap-2 md:col-span-2">
                <span className="font-medium">
                  Razón social
                </span>

                <input
                  type="text"
                  name="razon_social"
                  value={
                    formCliente
                      .razon_social
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                  required
                />
              </label>


              <label className="grid min-w-0 gap-2">
                <span className="font-medium">
                  CUIT
                </span>

                <input
                  type="text"
                  name="cuit"
                  value={
                    formCliente.cuit
                  }
                  onChange={
                    actualizarCampoCliente
                  }
                  className="w-full rounded-lg border p-3"
                />
              </label>
            </>
          )}


          <label className="grid min-w-0 gap-2">
            <span className="font-medium">
              Teléfono
            </span>

            <input
              type="text"
              name="telefono"
              value={
                formCliente.telefono
              }
              onChange={
                actualizarCampoCliente
              }
              className="w-full rounded-lg border p-3"
            />
          </label>


          <label className="grid min-w-0 gap-2">
            <span className="font-medium">
              WhatsApp
            </span>

            <input
              type="text"
              name="whatsapp"
              value={
                formCliente.whatsapp
              }
              onChange={
                actualizarCampoCliente
              }
              className="w-full rounded-lg border p-3"
            />
          </label>


          <label className="grid min-w-0 gap-2">
            <span className="font-medium">
              Email
            </span>

            <input
              type="email"
              name="email"
              value={
                formCliente.email
              }
              onChange={
                actualizarCampoCliente
              }
              className="w-full rounded-lg border p-3"
            />
          </label>


          <label className="grid min-w-0 gap-2">
            <span className="font-medium">
              Provincia
            </span>

            <input
              type="text"
              name="provincia"
              value={
                formCliente.provincia
              }
              onChange={
                actualizarCampoCliente
              }
              className="w-full rounded-lg border p-3"
            />
          </label>


          <label className="grid min-w-0 gap-2">
            <span className="font-medium">
              Ciudad
            </span>

            <input
              type="text"
              name="ciudad"
              value={
                formCliente.ciudad
              }
              onChange={
                actualizarCampoCliente
              }
              className="w-full rounded-lg border p-3"
            />
          </label>


          <label className="grid min-w-0 gap-2">
            <span className="font-medium">
              Dirección
            </span>

            <input
              type="text"
              name="direccion"
              value={
                formCliente.direccion
              }
              onChange={
                actualizarCampoCliente
              }
              className="w-full rounded-lg border p-3"
            />
          </label>


          <label className="grid gap-2 md:col-span-2">
            <span className="font-medium">
              Observaciones del cliente
            </span>

            <textarea
              name="observaciones"
              value={
                formCliente
                  .observaciones
              }
              onChange={
                actualizarCampoCliente
              }
              rows={3}
              className="w-full rounded-lg border p-3"
            />
          </label>
        </section>


        {/* VALORES */}

        <section className="grid gap-5 rounded-xl border p-5 md:grid-cols-2">
          <div className="grid gap-2">
            <span className="font-medium">
              Precio del vehículo
            </span>

            <div className="grid grid-cols-[140px_1fr] gap-2">
              <select
                name="moneda"
                value={form.moneda}
                onChange={
                  actualizarCampo
                }
                className="rounded-lg border bg-white p-3"
              >
                <option value="ARS">
                  ARS - Pesos
                </option>

                <option value="USD">
                  USD - Dólares
                </option>
              </select>


              <input
                type="number"
                name="precio_vehiculo"
                min="0"
                step="0.01"
                value={
                  form.precio_vehiculo
                }
                onChange={
                  actualizarCampo
                }
                className="rounded-lg border p-3"
              />
            </div>
          </div>


          <label className="grid gap-2">
            <span className="font-medium">
              Gastos de gestoría
              (ARS)
            </span>

            <input
              type="number"
              name="gastos_gestoria"
              min="0"
              step="1"
              value={
                form.gastos_gestoria
              }
              onChange={
                actualizarCampo
              }
              className="rounded-lg border p-3"
            />
          </label>


          <label className="flex items-center gap-3 rounded-lg border p-4">
            <input
              type="checkbox"
              name="gastos_gestoria_incluidos"
              checked={
                form
                  .gastos_gestoria_incluidos
              }
              onChange={
                actualizarCampo
              }
            />

            <span className="font-medium">
              Gastos de gestoría
              incluidos en la operación
            </span>
          </label>


          <label className="grid gap-2">
            <span className="font-medium">
              Bonificación
            </span>

            <input
              type="number"
              name="bonificacion"
              min="0"
              step="0.01"
              value={
                form.bonificacion
              }
              onChange={
                actualizarCampo
              }
              className="rounded-lg border p-3"
            />
          </label>


          <label className="grid gap-2">
            <span className="font-medium">
              Otros gastos
            </span>

            <input
              type="number"
              name="gastos"
              min="0"
              step="0.01"
              value={form.gastos}
              onChange={
                actualizarCampo
              }
              className="rounded-lg border p-3"
            />
          </label>
        </section>


        {/* PAGO */}

        <section className="grid gap-5 rounded-xl border p-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-medium">
              Asesor comercial
            </span>

            <input
              type="text"
              name="asesor_comercial"
              value={
                form.asesor_comercial
              }
              onChange={
                actualizarCampo
              }
              className="rounded-lg border p-3"
            />
          </label>


          <label className="grid gap-2">
            <span className="font-medium">
              Forma de pago
            </span>

            <input
              type="text"
              name="forma_pago"
              value={
                form.forma_pago
              }
              onChange={
                actualizarCampo
              }
              placeholder="Ej. Contado / Transferencia / Crédito prendario"
              className="rounded-lg border p-3"
            />
          </label>


          <label className="grid gap-2 md:col-span-2">
            <span className="font-medium">
              Detalle de pago
            </span>

            <textarea
              name="detalle_pago"
              value={
                form.detalle_pago
              }
              onChange={
                actualizarCampo
              }
              rows={4}
              placeholder="Ej. Transferencia $10.000.000; saldo mediante crédito prendario..."
              className="rounded-lg border p-3"
            />
          </label>
        </section>


        {/* ENTREGA */}

        <section className="grid gap-5 rounded-xl border p-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="font-medium">
              Fecha de entrega
            </span>

            <input
              type="date"
              name="fecha_entrega"
              value={
                form.fecha_entrega
              }
              onChange={
                actualizarCampo
              }
              className="rounded-lg border p-3"
            />
          </label>


          <label className="grid gap-2">
            <span className="font-medium">
              Hora de entrega
            </span>

            <input
              type="time"
              name="hora_entrega"
              value={
                form.hora_entrega
              }
              onChange={
                actualizarCampo
              }
              className="rounded-lg border p-3"
            />
          </label>


          <label className="flex items-center gap-3 rounded-lg border p-4 md:col-span-2">
            <input
              type="checkbox"
              name="entrega_sin_patentar"
              checked={
                form
                  .entrega_sin_patentar
              }
              onChange={
                actualizarCampo
              }
            />

            <span className="font-medium">
              Entrega sin patentar
            </span>
          </label>
        </section>


        {/* OBSERVACIONES OPERACIÓN */}

        <section className="grid gap-5 rounded-xl border p-5">
          <label className="grid gap-2">
            <span className="font-medium">
              Observaciones de la
              operación
            </span>

            <textarea
              name="observaciones"
              value={
                form.observaciones
              }
              onChange={
                actualizarCampo
              }
              rows={4}
              className="rounded-lg border p-3"
            />
          </label>


          <label className="grid gap-2">
            <span className="font-medium">
              Observaciones internas
            </span>

            <textarea
              name="observaciones_internas"
              value={
                form
                  .observaciones_internas
              }
              onChange={
                actualizarCampo
              }
              rows={4}
              className="rounded-lg border p-3"
            />
          </label>
        </section>


        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}


        <div className="flex flex-wrap justify-between gap-3">
          <Link
            href={`/admin/operaciones/${operacion.id}`}
            className="rounded-lg border px-5 py-3 font-medium"
          >
            Cancelar
          </Link>


          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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