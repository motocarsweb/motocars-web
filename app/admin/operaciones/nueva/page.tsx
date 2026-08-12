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
  crearIngresoUsado,
  type TipoIngresoUsado,
} from "@/lib/service/ingresos-usados";

import {
  crearVehiculo,
  obtenerVehiculos,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

import { supabase } from "@/lib/supabase";

type UsadoFormulario = {
  marca: string;
  modelo: string;
  version: string;
  anio: string;
  kilometros: string;
  color: string;

  dominio: string;
  numero_chasis: string;
  numero_motor: string;

  titular_cliente_id: string;

  valor_ingreso: string;
  precio_venta: string;
  precio_base_consignacion: string;
  plazo_consignacion_dias: string;

  observaciones: string;
};

const USADO_FORMULARIO_INICIAL: UsadoFormulario = {
  marca: "",
  modelo: "",
  version: "",
  anio: "",
  kilometros: "",
  color: "",

  dominio: "",
  numero_chasis: "",
  numero_motor: "",

  titular_cliente_id: "",

  valor_ingreso: "",
  precio_venta: "",
  precio_base_consignacion: "",
  plazo_consignacion_dias: "90",

  observaciones: "",
};

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

function numeroOpcional(valor: string) {
  if (!valor.trim()) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
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

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [vehiculos, setVehiculos] =
    useState<VehiculoSupabase[]>([]);

  const [cargandoDatos, setCargandoDatos] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * INGRESO DE USADO
   */

  const [recibeUsado, setRecibeUsado] =
    useState(false);

  const [
    tipoIngresoUsado,
    setTipoIngresoUsado,
  ] = useState<TipoIngresoUsado>("permuta");

  const [usadoForm, setUsadoForm] =
    useState<UsadoFormulario>({
      ...USADO_FORMULARIO_INICIAL,
    });

  /*
   * CARGA INICIAL
   */

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

  /*
   * TOTAL DE LA OPERACIÓN
   */

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

  /*
   * CAMPOS DE OPERACIÓN
   */

  function actualizarCampo(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]: value,
    }));

    /*
     * Si todavía no elegimos titular del usado,
     * usamos por defecto el cliente de la operación.
     */
    if (
      name === "cliente_id" &&
      !usadoForm.titular_cliente_id
    ) {
      setUsadoForm((anterior) => ({
        ...anterior,
        titular_cliente_id: value,
      }));
    }
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

  /*
   * CAMPOS DEL USADO
   */

  function actualizarCampoUsado(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setUsadoForm((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  /*
   * Cuando se ingresa el precio de venta,
   * si todavía no se definió el precio base
   * del contrato de consignación,
   * usamos inicialmente el mismo importe.
   *
   * Luego ambos valores quedan independientes.
   */

  function actualizarPrecioVentaUsado(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    setUsadoForm((anterior) => ({
      ...anterior,

      precio_venta: value,

      precio_base_consignacion:
        anterior.precio_base_consignacion
          ? anterior.precio_base_consignacion
          : value,
    }));
  }

  /*
   * VALIDACIÓN
   */

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

    /*
     * Validaciones del usado.
     */

    if (recibeUsado) {
      if (!usadoForm.marca.trim()) {
        return "Ingresá la marca del vehículo usado.";
      }

      if (!usadoForm.modelo.trim()) {
        return "Ingresá el modelo del vehículo usado.";
      }

      if (!usadoForm.titular_cliente_id) {
        return "Seleccioná el titular del vehículo usado.";
      }

      if (
        convertirNumero(
          usadoForm.precio_venta
        ) <= 0
      ) {
        return "Ingresá el precio de venta del vehículo usado.";
      }

      if (
        convertirNumero(
          usadoForm.precio_base_consignacion
        ) <= 0
      ) {
        return "Ingresá el precio base para el contrato de consignación.";
      }

      if (
        convertirNumero(
          usadoForm.plazo_consignacion_dias
        ) <= 0
      ) {
        return "Ingresá un plazo de consignación válido.";
      }

      if (
        usadoForm.valor_ingreso &&
        convertirNumero(
          usadoForm.valor_ingreso
        ) < 0
      ) {
        return "El valor de ingreso no puede ser negativo.";
      }
    }

    return "";
  }

  /*
   * OBTENER UUID DEL TIPO DE INGRESO
   */

  async function obtenerTipoIngresoId(
    tipoIngreso: TipoIngresoUsado
  ) {
    const { data, error } = await supabase
      .from("tipos_ingreso")
      .select("id")
      .eq("slug", tipoIngreso)
      .eq("activo", true)
      .single();

    if (error || !data) {
      throw new Error(
        error?.message
          ? `No se pudo obtener el tipo de ingreso: ${error.message}`
          : "No se encontró el tipo de ingreso."
      );
    }

    return data.id as string;
  }

  /*
   * CREAR VEHÍCULO USADO
   */

  async function crearVehiculoUsado(
    tipoIngresoId: string
  ) {
    const valorIngreso =
      numeroOpcional(
        usadoForm.valor_ingreso
      );

    const vehiculoCreado =
      await crearVehiculo({
        marca:
          usadoForm.marca.trim(),

        modelo:
          usadoForm.modelo.trim(),

        version:
          usadoForm.version.trim() || null,

        anio:
          numeroOpcional(usadoForm.anio),

        kilometros:
          numeroOpcional(
            usadoForm.kilometros
          ),

        color:
          usadoForm.color.trim() || null,

        dominio:
          usadoForm.dominio
            .trim()
            .toUpperCase() || null,

        numero_chasis:
          usadoForm.numero_chasis.trim() ||
          null,

        numero_motor:
          usadoForm.numero_motor.trim() ||
          null,

        /*
         * Precio actual de venta del stock.
         */
        precio:
          convertirNumero(
            usadoForm.precio_venta
          ),

        /*
         * Valor de compra/toma.
         * Puede no existir en una permuta.
         */
        precio_compra:
          valorIngreso !== null &&
          valorIngreso > 0
            ? valorIngreso
            : null,

        tipo_ingreso_id:
          tipoIngresoId,

        condicion: "usado",

        estado: "disponible",

        destacado: false,

        /*
         * El vehículo entra al stock,
         * pero no se publica automáticamente.
         */
        publicado: false,

        descripcion: null,

        observaciones_internas:
          usadoForm.observaciones.trim() ||
          null,

        imagen_principal: null,

        imagenes: [],
      });

    if (!vehiculoCreado) {
      throw new Error(
        "No se pudo crear el vehículo usado."
      );
    }

    return vehiculoCreado;
  }

  /*
   * GUARDAR OPERACIÓN
   */

  async function guardarOperacion(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (guardando) {
      return;
    }

    const mensajeValidacion =
      validarFormulario();

    if (mensajeValidacion) {
      setError(mensajeValidacion);
      return;
    }

    setGuardando(true);
    setError("");

    try {
      /*
       * Primero creamos la operación principal.
       */

      const operacion =
        await crearOperacion(form);

      /*
       * Si no entra un usado,
       * el proceso termina acá.
       */

      if (!recibeUsado) {
        router.push(
          `/admin/operaciones/${operacion.id}`
        );

        router.refresh();

        return;
      }

      /*
       * Resolver tipo de ingreso:
       * compra / permuta / consignación.
       */

      const tipoIngresoId =
        await obtenerTipoIngresoId(
          tipoIngresoUsado
        );

      /*
       * Crear la unidad que ingresa al stock.
       */

      const vehiculoUsado =
        await crearVehiculoUsado(
          tipoIngresoId
        );

      /*
       * Crear el registro comercial del ingreso.
       */

      await crearIngresoUsado({
        vehiculo_id:
          String(vehiculoUsado.id),

        titular_cliente_id:
          usadoForm.titular_cliente_id,

        operacion_id:
          String(operacion.id),

        tipo_ingreso:
          tipoIngresoUsado,

        /*
         * Puede ser 0.
         * El boleto de venta con permuta
         * no necesariamente asigna un
         * valor individual al usado.
         */
        valor_ingreso:
          usadoForm.valor_ingreso || "0",

        /*
         * Este valor queda registrado
         * para el contrato de consignación.
         */
        precio_base_consignacion:
          usadoForm.precio_base_consignacion,

        plazo_consignacion_dias:
          usadoForm.plazo_consignacion_dias,

        fecha_ingreso:
          new Date()
            .toISOString()
            .slice(0, 10),

        observaciones:
          usadoForm.observaciones,
      });

      router.push(
        `/admin/operaciones/${operacion.id}`
      );

      router.refresh();
    } catch (errorDesconocido) {
      console.error(
        "Error al guardar la operación:",
        errorDesconocido
      );

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
            {/* CLIENTE Y VEHÍCULO VENDIDO */}

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
                      {obtenerNombreCliente(
                        cliente
                      )}
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
                  Vehículo vendido *
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

            {/* INGRESO DE USADO */}

            <section className="rounded-xl border bg-gray-50 p-5">
              <p className="font-semibold">
                ¿Se recibe un vehículo usado?
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Indicá si en esta operación ingresa otra unidad a MotoCars.
              </p>

              <div className="mt-4 flex gap-5">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recibe_usado"
                    checked={!recibeUsado}
                    onChange={() =>
                      setRecibeUsado(false)
                    }
                  />

                  No
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recibe_usado"
                    checked={recibeUsado}
                    onChange={() => {
                      setRecibeUsado(true);

                      if (
                        !usadoForm.titular_cliente_id &&
                        form.cliente_id
                      ) {
                        setUsadoForm(
                          (anterior) => ({
                            ...anterior,

                            titular_cliente_id:
                              form.cliente_id,
                          })
                        );
                      }
                    }}
                  />

                  Sí
                </label>
              </div>
            </section>

            {recibeUsado && (
              <section className="grid gap-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    Vehículo usado que ingresa
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Esta unidad se incorporará al stock de MotoCars.
                  </p>
                </div>

                {/* TIPO DE INGRESO */}

                <div>
                  <p className="mb-3 font-medium">
                    Tipo de ingreso *
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        {
                          valor: "permuta",
                          etiqueta: "Permuta",
                        },
                        {
                          valor: "compra",
                          etiqueta: "Compra",
                        },
                        {
                          valor: "consignacion",
                          etiqueta:
                            "Consignación",
                        },
                      ] as {
                        valor: TipoIngresoUsado;
                        etiqueta: string;
                      }[]
                    ).map((opcion) => (
                      <button
                        key={opcion.valor}
                        type="button"
                        onClick={() =>
                          setTipoIngresoUsado(
                            opcion.valor
                          )
                        }
                        className={`rounded-lg border p-4 text-left font-semibold ${
                          tipoIngresoUsado ===
                          opcion.valor
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "bg-white text-gray-900"
                        }`}
                      >
                        {opcion.etiqueta}
                      </button>
                    ))}
                  </div>
                </div>

                {/* IDENTIFICACIÓN */}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Marca *
                    </span>

                    <input
                      type="text"
                      name="marca"
                      value={usadoForm.marca}
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                      placeholder="Ej. Toyota"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Modelo *
                    </span>

                    <input
                      type="text"
                      name="modelo"
                      value={usadoForm.modelo}
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                      placeholder="Ej. Corolla"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Versión
                    </span>

                    <input
                      type="text"
                      name="version"
                      value={usadoForm.version}
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Año
                    </span>

                    <input
                      type="number"
                      name="anio"
                      min="1900"
                      max="2100"
                      value={usadoForm.anio}
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Kilómetros
                    </span>

                    <input
                      type="number"
                      name="kilometros"
                      min="0"
                      value={
                        usadoForm.kilometros
                      }
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Color
                    </span>

                    <input
                      type="text"
                      name="color"
                      value={usadoForm.color}
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>
                </div>

                {/* IDENTIFICADORES REGISTRALES */}

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Dominio
                    </span>

                    <input
                      type="text"
                      name="dominio"
                      value={usadoForm.dominio}
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3 uppercase"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Nº de chasis
                    </span>

                    <input
                      type="text"
                      name="numero_chasis"
                      value={
                        usadoForm.numero_chasis
                      }
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Nº de motor
                    </span>

                    <input
                      type="text"
                      name="numero_motor"
                      value={
                        usadoForm.numero_motor
                      }
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>
                </div>

                {/* TITULAR */}

                <label className="grid gap-2">
                  <span className="font-medium">
                    Titular del usado *
                  </span>

                  <select
                    name="titular_cliente_id"
                    value={
                      usadoForm.titular_cliente_id
                    }
                    onChange={
                      actualizarCampoUsado
                    }
                    className="rounded-lg border bg-white p-3"
                  >
                    <option value="">
                      Seleccionar titular
                    </option>

                    {clientes.map((cliente) => (
                      <option
                        key={cliente.id}
                        value={cliente.id}
                      >
                        {obtenerNombreCliente(
                          cliente
                        )}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs text-gray-500">
                    Por defecto se utiliza el cliente de la operación. Podés seleccionar otro titular si corresponde.
                  </p>
                </label>

                {/* VALORES */}

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Valor de ingreso
                    </span>

                    <input
                      type="number"
                      name="valor_ingreso"
                      min="0"
                      step="1"
                      value={
                        usadoForm.valor_ingreso
                      }
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                      placeholder="Opcional"
                    />

                    <span className="text-xs text-gray-500">
                      Puede quedar vacío si la permuta no tiene un valor individual determinado.
                    </span>
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Precio de venta *
                    </span>

                    <input
                      type="number"
                      name="precio_venta"
                      min="0"
                      step="1"
                      value={
                        usadoForm.precio_venta
                      }
                      onChange={
                        actualizarPrecioVentaUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />

                    <span className="text-xs text-gray-500">
                      Precio con el que la unidad ingresará al stock.
                    </span>
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Valor contrato consignación *
                    </span>

                    <input
                      type="number"
                      name="precio_base_consignacion"
                      min="0"
                      step="1"
                      value={
                        usadoForm.precio_base_consignacion
                      }
                      onChange={
                        actualizarCampoUsado
                      }
                      className="rounded-lg border bg-white p-3"
                    />

                    <span className="text-xs text-gray-500">
                      Quedará registrado como valor histórico del contrato.
                    </span>
                  </label>
                </div>

                <label className="grid gap-2 md:max-w-xs">
                  <span className="font-medium">
                    Plazo de consignación
                  </span>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="plazo_consignacion_dias"
                      min="1"
                      value={
                        usadoForm.plazo_consignacion_dias
                      }
                      onChange={
                        actualizarCampoUsado
                      }
                      className="w-full rounded-lg border bg-white p-3"
                    />

                    <span className="text-sm">
                      días
                    </span>
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="font-medium">
                    Observaciones del ingreso
                  </span>

                  <textarea
                    name="observaciones"
                    value={
                      usadoForm.observaciones
                    }
                    onChange={
                      actualizarCampoUsado
                    }
                    rows={3}
                    className="rounded-lg border bg-white p-3"
                    placeholder="Observaciones internas del vehículo recibido"
                  />
                </label>
              </section>
            )}

            {/* CONDICIONES DE LA VENTA */}

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
                  value={
                    form.precio_vehiculo
                  }
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

            {/* TOTAL */}

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

            {/* OBSERVACIONES */}

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
                placeholder="Forma de pago, crédito, vehículo recibido en permuta y demás condiciones de la operación"
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
              guardando ||
              cargandoDatos
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