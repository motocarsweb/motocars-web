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
  type TipoOperacion,
} from "@/lib/service/operaciones";

import {
  crearIngresoUsado,
} from "@/lib/service/ingresos-usados";

import {
  crearPagosCompra,
  PAGO_COMPRA_FORMULARIO_INICIAL,
  obtenerTotalPagosCompraFormulario,
  validarTotalPagosCompra,
  type MedioPagoCompra,
  type PagoCompraFormulario,
} from "@/lib/service/pagos-compra";

import {
  crearVehiculo,
  obtenerVehiculos,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

import { supabase } from "@/lib/supabase";


type CondicionIngreso =
  | "0km"
  | "usado";


type VehiculoIngresoFormulario = {
  condicion: CondicionIngreso;

  marca: string;
  modelo: string;
  version: string;

  anio: string;
  kilometros: string;

  color: string;

  dominio: string;
  numero_chasis: string;
  numero_motor: string;

  valor_ingreso: string;

  precio_venta: string;

  precio_base_consignacion: string;
  plazo_consignacion_dias: string;

  observaciones: string;
};


const VEHICULO_INGRESO_INICIAL: VehiculoIngresoFormulario = {
  condicion: "usado",

  marca: "",
  modelo: "",
  version: "",

  anio: "",
  kilometros: "",

  color: "",

  dominio: "",
  numero_chasis: "",
  numero_motor: "",

  valor_ingreso: "",

  precio_venta: "",

  precio_base_consignacion: "",
  plazo_consignacion_dias: "90",

  observaciones: "",
};


function obtenerNombreCliente(
  cliente: Cliente
) {
  if (
    cliente.tipo_persona === "juridica"
  ) {
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


function convertirNumero(
  valor: string
) {
  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
}


function numeroOpcional(
  valor: string
) {
  if (!valor.trim()) {
    return null;
  }

  const numero =
    Number(valor);

  return Number.isFinite(numero)
    ? numero
    : null;
}


function formatearImporte(
  valor: number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(valor);
}


function obtenerNombreMedioPago(
  medio: MedioPagoCompra
) {
  switch (medio) {
    case "efectivo":
      return "Efectivo";

    case "transferencia":
      return "Transferencia / depósito";

    case "cheque":
      return "Cheque";

    case "otro":
      return "Otro";

    default:
      return medio;
  }
}


function crearPagoVacio(): PagoCompraFormulario {
  return {
    ...PAGO_COMPRA_FORMULARIO_INICIAL,
  };
}


export default function NuevaOperacionPage() {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState<OperacionFormulario>({
      ...OPERACION_FORMULARIO_INICIAL,
    });

  const [
    clientes,
    setClientes,
  ] =
    useState<Cliente[]>([]);

  const [
    vehiculos,
    setVehiculos,
  ] =
    useState<VehiculoSupabase[]>([]);

  const [
    cargandoDatos,
    setCargandoDatos,
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

  const [
    vehiculoIngreso,
    setVehiculoIngreso,
  ] =
    useState<VehiculoIngresoFormulario>({
      ...VEHICULO_INGRESO_INICIAL,
    });

  const [
    ventaConPermuta,
    setVentaConPermuta,
  ] =
    useState(false);

  /*
   * Una Compra comienza con una línea
   * de pago.
   *
   * El usuario puede agregar todas
   * las que necesite.
   */
  const [
    pagosCompra,
    setPagosCompra,
  ] =
    useState<PagoCompraFormulario[]>([
      crearPagoVacio(),
    ]);


  const esVenta =
    form.tipo_operacion ===
    "venta";

  const esCompra =
    form.tipo_operacion ===
    "compra";

  const esConsignacion =
    form.tipo_operacion ===
    "consignacion";

  const operacionHaceIngresarVehiculo =
    esCompra ||
    esConsignacion;

  const hayPermuta =
    esVenta &&
    ventaConPermuta;

  const vehiculoIngresoEsUsado =
    vehiculoIngreso.condicion ===
    "usado";


  /*
   * =========================================================
   * CARGA INICIAL
   * =========================================================
   */

  useEffect(() => {
    let componenteActivo =
      true;

    async function cargarDatos() {
      setCargandoDatos(true);
      setError("");

      try {
        const [
          clientesCargados,
          vehiculosCargados,
        ] =
          await Promise.all([
            listarClientes(),
            obtenerVehiculos(),
          ]);

        if (!componenteActivo) {
          return;
        }

        setClientes(
          clientesCargados.filter(
            (cliente) =>
              cliente.activo
          )
        );

        setVehiculos(
          vehiculosCargados
        );
      } catch (
        errorDesconocido
      ) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof
          Error
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
      componenteActivo =
        false;
    };
  }, []);


  /*
   * =========================================================
   * TOTALES
   * =========================================================
   */

  const totalVenta =
    useMemo(() => {
      if (!esVenta) {
        return 0;
      }

      return (
        convertirNumero(
          form.precio_vehiculo
        ) -
        convertirNumero(
          form.bonificacion
        ) +
        convertirNumero(
          form.gastos
        )
      );
    }, [
      esVenta,
      form.precio_vehiculo,
      form.bonificacion,
      form.gastos,
    ]);


  const valorCompra =
    esCompra
      ? convertirNumero(
          vehiculoIngreso.valor_ingreso
        )
      : 0;


  const totalPagosCompra =
    useMemo(
      () =>
        obtenerTotalPagosCompraFormulario(
          pagosCompra
        ),
      [pagosCompra]
    );


  const diferenciaPagosCompra =
    valorCompra -
    totalPagosCompra;


  const pagosCompraCoinciden =
    esCompra &&
    valorCompra > 0 &&
    Math.abs(
      diferenciaPagosCompra
    ) <= 0.01;


  /*
   * =========================================================
   * TIPO DE OPERACIÓN
   * =========================================================
   */

  function seleccionarTipoOperacion(
    tipo: TipoOperacion
  ) {
    setForm(
      (anterior) => ({
        ...anterior,

        tipo_operacion:
          tipo,

        vehiculo_id:
          tipo === "venta"
            ? anterior.vehiculo_id
            : "",

        precio_vehiculo:
          tipo === "venta"
            ? anterior.precio_vehiculo
            : "0",

        bonificacion:
          tipo === "venta"
            ? anterior.bonificacion
            : "0",

        gastos:
          tipo === "venta"
            ? anterior.gastos
            : "0",
      })
    );

    if (
      tipo !== "venta"
    ) {
      setVentaConPermuta(
        false
      );
    }

    if (
      tipo === "compra" &&
      pagosCompra.length === 0
    ) {
      setPagosCompra([
        crearPagoVacio(),
      ]);
    }
  }


  /*
   * =========================================================
   * CAMPOS OPERACIÓN
   * =========================================================
   */

  function actualizarCampo(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) {
    const target =
      event.target;

    const nombre =
      target.name;

    const valor =
      target instanceof
        HTMLInputElement &&
      target.type === "checkbox"
        ? target.checked
        : target.value;

    setForm(
      (anterior) => ({
        ...anterior,
        [nombre]:
          valor,
      })
    );
  }


  /*
   * =========================================================
   * VEHÍCULO VENDIDO
   * =========================================================
   */

  function seleccionarVehiculoVendido(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const vehiculoId =
      event.target.value;

    const seleccionado =
      vehiculos.find(
        (vehiculo) =>
          String(
            vehiculo.id
          ) ===
          vehiculoId
      );

    setForm(
      (anterior) => ({
        ...anterior,

        vehiculo_id:
          vehiculoId,

        precio_vehiculo:
          seleccionado?.precio !==
            null &&
          seleccionado?.precio !==
            undefined
            ? String(
                seleccionado.precio
              )
            : "",
      })
    );
  }


  /*
   * =========================================================
   * VEHÍCULO QUE INGRESA
   * =========================================================
   */

  function actualizarCampoVehiculoIngreso(
    event: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
    >
  ) {
    const {
      name,
      value,
    } =
      event.target;

    setVehiculoIngreso(
      (anterior) => ({
        ...anterior,
        [name]:
          value,
      })
    );
  }


  function seleccionarCondicionIngreso(
    condicion: CondicionIngreso
  ) {
    setVehiculoIngreso(
      (anterior) => ({
        ...anterior,

        condicion,

        kilometros:
          condicion === "0km"
            ? "0"
            : anterior.kilometros,

        dominio:
          condicion === "0km"
            ? ""
            : anterior.dominio,
      })
    );
  }


  function actualizarPrecioVentaIngreso(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const valor =
      event.target.value;

    setVehiculoIngreso(
      (anterior) => ({
        ...anterior,

        precio_venta:
          valor,

        precio_base_consignacion:
          anterior
            .precio_base_consignacion
            ? anterior
                .precio_base_consignacion
            : valor,
      })
    );
  }


  /*
   * =========================================================
   * PAGOS DE COMPRA
   * =========================================================
   */

  function agregarPagoCompra() {
    setPagosCompra(
      (anteriores) => [
        ...anteriores,
        crearPagoVacio(),
      ]
    );
  }


  function eliminarPagoCompra(
    indice: number
  ) {
    setPagosCompra(
      (anteriores) =>
        anteriores.filter(
          (
            _,
            indiceActual
          ) =>
            indiceActual !==
            indice
        )
    );
  }


  function actualizarMedioPagoCompra(
    indice: number,
    medio: MedioPagoCompra
  ) {
    setPagosCompra(
      (anteriores) =>
        anteriores.map(
          (
            pago,
            indiceActual
          ) => {
            if (
              indiceActual !==
              indice
            ) {
              return pago;
            }

            return {
              ...pago,
              medio_pago:
                medio,
            };
          }
        )
    );
  }


  function actualizarCampoPagoCompra(
    indice: number,
    campo:
      | "importe"
      | "banco"
      | "titular"
      | "cuil_cuit"
      | "tipo_cuenta"
      | "numero_cuenta"
      | "alias"
      | "cbu_cvu"
      | "detalle",
    valor: string
  ) {
    setPagosCompra(
      (anteriores) =>
        anteriores.map(
          (
            pago,
            indiceActual
          ) => {
            if (
              indiceActual !==
              indice
            ) {
              return pago;
            }

            return {
              ...pago,
              [campo]:
                valor,
            };
          }
        )
    );
  }


  /*
   * =========================================================
   * VALIDACIÓN DEL VEHÍCULO
   * =========================================================
   */

  function validarDatosVehiculoIngreso() {
    if (
      !vehiculoIngreso.marca.trim()
    ) {
      return "Ingresá la marca del vehículo.";
    }

    if (
      !vehiculoIngreso.modelo.trim()
    ) {
      return "Ingresá el modelo del vehículo.";
    }

    if (
      convertirNumero(
        vehiculoIngreso.precio_venta
      ) <= 0
    ) {
      return "Ingresá el precio de venta para el stock.";
    }

    if (
      esCompra &&
      convertirNumero(
        vehiculoIngreso.valor_ingreso
      ) <= 0
    ) {
      return "Ingresá el valor de compra del vehículo.";
    }

    if (
      vehiculoIngreso.valor_ingreso &&
      convertirNumero(
        vehiculoIngreso.valor_ingreso
      ) < 0
    ) {
      return "El valor de ingreso no puede ser negativo.";
    }

    if (
      vehiculoIngresoEsUsado &&
      convertirNumero(
        vehiculoIngreso
          .precio_base_consignacion
      ) <= 0
    ) {
      return "Ingresá el valor para el contrato de consignación.";
    }

    if (
      vehiculoIngresoEsUsado &&
      convertirNumero(
        vehiculoIngreso
          .plazo_consignacion_dias
      ) <= 0
    ) {
      return "Ingresá un plazo válido para el contrato.";
    }

    return "";
  }


  /*
   * =========================================================
   * VALIDACIÓN DE PAGOS
   * =========================================================
   */

  function validarPagosDeCompra() {
    if (!esCompra) {
      return "";
    }

    if (
      pagosCompra.length === 0
    ) {
      return "Agregá al menos una forma de pago.";
    }

    for (
      let indice = 0;
      indice <
      pagosCompra.length;
      indice++
    ) {
      const pago =
        pagosCompra[indice];

      const numeroPago =
        indice + 1;

      if (
        convertirNumero(
          pago.importe
        ) <= 0
      ) {
        return `Ingresá un importe válido en el pago ${numeroPago}.`;
      }

      if (
        pago.medio_pago ===
        "transferencia"
      ) {
        if (
          !pago.titular.trim()
        ) {
          return `Ingresá el titular de la cuenta en el pago ${numeroPago}.`;
        }

        if (
          !pago.cbu_cvu.trim() &&
          !pago.alias.trim()
        ) {
          return `Ingresá el CBU/CVU o alias en el pago ${numeroPago}.`;
        }
      }

      if (
        pago.medio_pago ===
          "cheque" &&
        !pago.detalle.trim()
      ) {
        return `Ingresá los datos del cheque en el pago ${numeroPago}.`;
      }

      if (
        pago.medio_pago ===
          "otro" &&
        !pago.detalle.trim()
      ) {
        return `Describí la forma de pago en el pago ${numeroPago}.`;
      }
    }

    try {
      validarTotalPagosCompra(
        pagosCompra,
        valorCompra
      );
    } catch (
      errorDesconocido
    ) {
      return errorDesconocido instanceof
        Error
        ? errorDesconocido.message
        : "El total de pagos no coincide con el valor de compra.";
    }

    return "";
  }


  /*
   * =========================================================
   * VALIDACIÓN GENERAL
   * =========================================================
   */

  function validarFormulario() {
    if (
      !form.cliente_id
    ) {
      if (esVenta) {
        return "Seleccioná el cliente comprador.";
      }

      if (esCompra) {
        return "Seleccioná el vendedor o proveedor.";
      }

      return "Seleccioná el consignante o proveedor.";
    }

    if (esVenta) {
      if (
        !form.vehiculo_id
      ) {
        return "Seleccioná el vehículo vendido.";
      }

      if (
        convertirNumero(
          form.precio_vehiculo
        ) <= 0
      ) {
        return "Ingresá un precio de venta válido.";
      }

      if (
        convertirNumero(
          form.bonificacion
        ) < 0 ||
        convertirNumero(
          form.gastos
        ) < 0
      ) {
        return "Los importes no pueden ser negativos.";
      }

      if (
        totalVenta < 0
      ) {
        return "El total de la operación no puede ser negativo.";
      }

      if (
        hayPermuta
      ) {
        return validarDatosVehiculoIngreso();
      }

      return "";
    }

    if (
      operacionHaceIngresarVehiculo
    ) {
      const errorVehiculo =
        validarDatosVehiculoIngreso();

      if (
        errorVehiculo
      ) {
        return errorVehiculo;
      }
    }

    if (esCompra) {
      const errorPagos =
        validarPagosDeCompra();

      if (
        errorPagos
      ) {
        return errorPagos;
      }
    }

    return "";
  }


  /*
   * =========================================================
   * TIPO DE INGRESO
   * =========================================================
   */

  async function obtenerTipoIngresoId(
    slug:
      | "compra"
      | "permuta"
      | "consignacion"
  ) {
    const {
      data,
      error: errorSupabase,
    } =
      await supabase
        .from(
          "tipos_ingreso"
        )
        .select("id")
        .eq(
          "slug",
          slug
        )
        .eq(
          "activo",
          true
        )
        .single();

    if (
      errorSupabase ||
      !data
    ) {
      throw new Error(
        errorSupabase?.message
          ? `No se pudo obtener el tipo de ingreso: ${errorSupabase.message}`
          : "No se encontró el tipo de ingreso."
      );
    }

    return data.id as string;
  }


  /*
   * =========================================================
   * CREAR VEHÍCULO DE INGRESO
   * =========================================================
   */

  async function crearVehiculoDeIngreso(
    tipoIngresoId: string
  ) {
    const valorIngreso =
      numeroOpcional(
        vehiculoIngreso.valor_ingreso
      );

    const resultado =
      await crearVehiculo({
        marca:
          vehiculoIngreso.marca.trim(),

        modelo:
          vehiculoIngreso.modelo.trim(),

        version:
          vehiculoIngreso.version.trim() ||
          null,

        anio:
          numeroOpcional(
            vehiculoIngreso.anio
          ),

        kilometros:
          vehiculoIngreso.condicion ===
          "0km"
            ? 0
            : numeroOpcional(
                vehiculoIngreso.kilometros
              ),

        color:
          vehiculoIngreso.color.trim() ||
          null,

        dominio:
          vehiculoIngreso.condicion ===
          "0km"
            ? null
            : (
                vehiculoIngreso.dominio
                  .trim()
                  .toUpperCase() ||
                null
              ),

        numero_chasis:
          vehiculoIngreso.numero_chasis
            .trim() ||
          null,

        numero_motor:
          vehiculoIngreso.numero_motor
            .trim() ||
          null,

        precio:
          convertirNumero(
            vehiculoIngreso.precio_venta
          ),

        precio_compra:
          valorIngreso !== null &&
          valorIngreso > 0
            ? valorIngreso
            : null,

        tipo_ingreso_id:
          tipoIngresoId,

        condicion:
          vehiculoIngreso.condicion,

        estado:
          "disponible",

        destacado:
          false,

        publicado:
          false,

        descripcion:
          null,

        observaciones_internas:
          vehiculoIngreso.observaciones
            .trim() ||
          null,

        imagen_principal:
          null,

        imagenes:
          [],
      });

    if (
      !resultado
    ) {
      throw new Error(
        "No se pudo crear el vehículo que ingresa al stock."
      );
    }

    return resultado;
  }


  /*
   * =========================================================
   * REGISTRAR INGRESO USADO
   * =========================================================
   */

  async function registrarIngresoUsado(
    vehiculoId: number,
    operacionId: number,
    tipo:
      | "compra"
      | "permuta"
      | "consignacion"
  ) {
    if (
      !vehiculoIngresoEsUsado
    ) {
      return;
    }

    await crearIngresoUsado({
      vehiculo_id:
        String(
          vehiculoId
        ),

      titular_cliente_id:
        form.cliente_id,

      operacion_id:
        String(
          operacionId
        ),

      tipo_ingreso:
        tipo,

      valor_ingreso:
        vehiculoIngreso.valor_ingreso ||
        "0",

      precio_base_consignacion:
        vehiculoIngreso
          .precio_base_consignacion,

      plazo_consignacion_dias:
        vehiculoIngreso
          .plazo_consignacion_dias,

      fecha_ingreso:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),

      observaciones:
        vehiculoIngreso.observaciones,
    });
  }


  /*
   * =========================================================
   * GUARDAR VENTA
   * =========================================================
   */

  async function guardarVenta() {
    const operacion =
      await crearOperacion(
        form
      );

    if (
      !hayPermuta
    ) {
      return operacion;
    }

    const tipoIngresoId =
      await obtenerTipoIngresoId(
        "permuta"
      );

    const vehiculoPermuta =
      await crearVehiculoDeIngreso(
        tipoIngresoId
      );

    await registrarIngresoUsado(
      vehiculoPermuta.id,
      operacion.id,
      "permuta"
    );

    return operacion;
  }


  /*
   * =========================================================
   * GUARDAR COMPRA / CONSIGNACIÓN
   * =========================================================
   */

  async function guardarIngresoPrincipal() {
    const tipoIngreso =
      esCompra
        ? "compra"
        : "consignacion";

    const tipoIngresoId =
      await obtenerTipoIngresoId(
        tipoIngreso
      );

    const vehiculoCreado =
      await crearVehiculoDeIngreso(
        tipoIngresoId
      );

    /*
     * En Compra generamos además una descripción
     * resumida de los medios de pago.
     */
    const resumenPagos =
      esCompra
        ? pagosCompra
            .map(
              (pago) =>
                `${obtenerNombreMedioPago(
                  pago.medio_pago
                )}: ${formatearImporte(
                  convertirNumero(
                    pago.importe
                  )
                )}`
            )
            .join(" + ")
        : form.forma_pago;

    const formOperacion: OperacionFormulario = {
      ...form,

      vehiculo_id:
        String(
          vehiculoCreado.id
        ),

      precio_vehiculo:
        vehiculoIngreso.precio_venta,

      bonificacion:
        "0",

      gastos:
        "0",

      forma_pago:
        esCompra
          ? resumenPagos
          : form.forma_pago,
    };

    const operacion =
      await crearOperacion(
        formOperacion
      );

    await registrarIngresoUsado(
      vehiculoCreado.id,
      operacion.id,
      tipoIngreso
    );

    /*
     * Los pagos estructurados solo existen
     * para Compra.
     */
    if (esCompra) {
      await crearPagosCompra(
        operacion.id,
        pagosCompra
      );
    }

    return operacion;
  }


  /*
   * =========================================================
   * GUARDAR
   * =========================================================
   */

  async function guardarOperacion(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      guardando
    ) {
      return;
    }

    const mensajeValidacion =
      validarFormulario();

    if (
      mensajeValidacion
    ) {
      setError(
        mensajeValidacion
      );

      return;
    }

    setGuardando(
      true
    );

    setError("");

    try {
      const operacion =
        esVenta
          ? await guardarVenta()
          : await guardarIngresoPrincipal();

      router.push(
        `/admin/operaciones/${operacion.id}`
      );

      router.refresh();
    } catch (
      errorDesconocido
    ) {
      console.error(
        "Error al guardar la operación:",
        errorDesconocido
      );

      setError(
        errorDesconocido instanceof
        Error
          ? errorDesconocido.message
          : "No se pudo guardar la operación."
      );
    } finally {
      setGuardando(
        false
      );
    }
  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <main className="p-6">
      <PageHeader
        titulo="Nueva operación"
        descripcion="Registrá una venta, compra o consignación"
      />

      <form
        onSubmit={
          guardarOperacion
        }
        className="mx-auto grid max-w-4xl gap-6 rounded-xl border bg-white p-6"
      >
        {cargandoDatos ? (
          <p className="text-gray-500">
            Cargando datos...
          </p>
        ) : (
          <>

            {/* TIPO DE OPERACIÓN */}

            <section>
              <h2 className="text-lg font-semibold">
                Tipo de operación
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Seleccioná el movimiento principal de la unidad.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    valor:
                      "venta" as TipoOperacion,

                    titulo:
                      "Venta",

                    descripcion:
                      "Sale una unidad del stock.",
                  },

                  {
                    valor:
                      "compra" as TipoOperacion,

                    titulo:
                      "Compra",

                    descripcion:
                      "MotoCars compra una unidad que ingresa al stock.",
                  },

                  {
                    valor:
                      "consignacion" as TipoOperacion,

                    titulo:
                      "Consignación",

                    descripcion:
                      "Ingresa una unidad de un tercero o proveedor.",
                  },
                ].map(
                  (
                    opcion
                  ) => (
                    <button
                      key={
                        opcion.valor
                      }
                      type="button"
                      onClick={() =>
                        seleccionarTipoOperacion(
                          opcion.valor
                        )
                      }
                      className={`rounded-xl border p-4 text-left ${
                        form.tipo_operacion ===
                        opcion.valor
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <strong className="block">
                        {
                          opcion.titulo
                        }
                      </strong>

                      <span
                        className={`mt-1 block text-xs ${
                          form.tipo_operacion ===
                          opcion.valor
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {
                          opcion.descripcion
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>


            {/* CLIENTE / PROVEEDOR */}

            <section className="grid gap-3 rounded-xl border p-5">
              <label className="grid gap-2">
                <span className="font-medium">
                  {esVenta
                    ? "Cliente comprador *"
                    : esCompra
                      ? "Vendedor / proveedor *"
                      : "Consignante / proveedor *"}
                </span>

                <select
                  name="cliente_id"
                  value={
                    form.cliente_id
                  }
                  onChange={
                    actualizarCampo
                  }
                  className="rounded-lg border p-3"
                  required
                >
                  <option value="">
                    Seleccionar
                  </option>

                  {clientes.map(
                    (
                      cliente
                    ) => (
                      <option
                        key={
                          cliente.id
                        }
                        value={
                          cliente.id
                        }
                      >
                        {obtenerNombreCliente(
                          cliente
                        )}
                      </option>
                    )
                  )}
                </select>

                <Link
                  href="/admin/clientes/nuevo"
                  className="text-sm font-medium text-blue-600"
                >
                  + Crear cliente nuevo
                </Link>
              </label>
            </section>


            {/* VENTA */}

            {esVenta && (
              <>
                <section className="grid gap-5 rounded-xl border p-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Vehículo que sale del stock *
                    </span>

                    <select
                      name="vehiculo_id"
                      value={
                        form.vehiculo_id
                      }
                      onChange={
                        seleccionarVehiculoVendido
                      }
                      className="rounded-lg border p-3"
                      required
                    >
                      <option value="">
                        Seleccionar vehículo
                      </option>

                      {vehiculos.map(
                        (
                          vehiculo
                        ) => (
                          <option
                            key={
                              vehiculo.id
                            }
                            value={
                              vehiculo.id
                            }
                          >
                            {obtenerNombreVehiculo(
                              vehiculo
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="font-medium">
                      Precio de venta *
                    </span>

                    <input
                      type="number"
                      name="precio_vehiculo"
                      min="0"
                      step="1"
                      value={
                        form.precio_vehiculo
                      }
                      onChange={
                        actualizarCampo
                      }
                      className="rounded-lg border p-3"
                      required
                    />
                  </label>
                </section>


                <section className="rounded-xl border bg-gray-50 p-5">
                  <p className="font-semibold">
                    ¿Se recibe un vehículo en permuta?
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    La permuta forma parte de la venta y la unidad recibida ingresará al stock.
                  </p>

                  <div className="mt-4 flex gap-5">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="venta_permuta"
                        checked={
                          !ventaConPermuta
                        }
                        onChange={() =>
                          setVentaConPermuta(
                            false
                          )
                        }
                      />

                      No
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="venta_permuta"
                        checked={
                          ventaConPermuta
                        }
                        onChange={() => {
                          setVentaConPermuta(
                            true
                          );

                          seleccionarCondicionIngreso(
                            "usado"
                          );
                        }}
                      />

                      Sí
                    </label>
                  </div>
                </section>
              </>
            )}


            {/* CONDICIÓN VEHÍCULO QUE INGRESA */}

            {operacionHaceIngresarVehiculo && (
              <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <h2 className="text-lg font-semibold">
                  Vehículo que ingresa al stock
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Puede tratarse de una unidad 0 km o usada.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      seleccionarCondicionIngreso(
                        "0km"
                      )
                    }
                    className={`rounded-lg border p-4 text-left font-semibold ${
                      vehiculoIngreso.condicion ===
                      "0km"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    0 km
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      seleccionarCondicionIngreso(
                        "usado"
                      )
                    }
                    className={`rounded-lg border p-4 text-left font-semibold ${
                      vehiculoIngreso.condicion ===
                      "usado"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    Usado
                  </button>
                </div>
              </section>
            )}


            {/* VEHÍCULO QUE INGRESA */}

            {(operacionHaceIngresarVehiculo ||
              hayPermuta) && (
              <section className="grid gap-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    {hayPermuta
                      ? "Unidad recibida en permuta"
                      : esCompra
                        ? "Unidad comprada por MotoCars"
                        : "Unidad recibida en consignación"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Esta unidad se incorporará al stock administrativo.
                  </p>
                </div>


                {hayPermuta && (
                  <div className="rounded-lg border border-blue-200 bg-white p-3 text-sm">
                    Condición:{" "}
                    <strong>
                      Usado
                    </strong>
                  </div>
                )}


                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Marca *
                    </span>

                    <input
                      type="text"
                      name="marca"
                      value={
                        vehiculoIngreso.marca
                      }
                      onChange={
                        actualizarCampoVehiculoIngreso
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>


                  <label className="grid gap-2">
                    <span className="font-medium">
                      Modelo *
                    </span>

                    <input
                      type="text"
                      name="modelo"
                      value={
                        vehiculoIngreso.modelo
                      }
                      onChange={
                        actualizarCampoVehiculoIngreso
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>


                  <label className="grid gap-2">
                    <span className="font-medium">
                      Versión
                    </span>

                    <input
                      type="text"
                      name="version"
                      value={
                        vehiculoIngreso.version
                      }
                      onChange={
                        actualizarCampoVehiculoIngreso
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
                      value={
                        vehiculoIngreso.anio
                      }
                      onChange={
                        actualizarCampoVehiculoIngreso
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>


                  {vehiculoIngresoEsUsado && (
                    <label className="grid gap-2">
                      <span className="font-medium">
                        Kilómetros
                      </span>

                      <input
                        type="number"
                        name="kilometros"
                        min="0"
                        value={
                          vehiculoIngreso.kilometros
                        }
                        onChange={
                          actualizarCampoVehiculoIngreso
                        }
                        className="rounded-lg border bg-white p-3"
                      />
                    </label>
                  )}


                  <label className="grid gap-2">
                    <span className="font-medium">
                      Color
                    </span>

                    <input
                      type="text"
                      name="color"
                      value={
                        vehiculoIngreso.color
                      }
                      onChange={
                        actualizarCampoVehiculoIngreso
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>
                </div>


                <div className="grid gap-4 md:grid-cols-3">
                  {vehiculoIngresoEsUsado && (
                    <label className="grid gap-2">
                      <span className="font-medium">
                        Dominio
                      </span>

                      <input
                        type="text"
                        name="dominio"
                        value={
                          vehiculoIngreso.dominio
                        }
                        onChange={
                          actualizarCampoVehiculoIngreso
                        }
                        className="rounded-lg border bg-white p-3 uppercase"
                      />
                    </label>
                  )}


                  <label className="grid gap-2">
                    <span className="font-medium">
                      Nº de chasis
                    </span>

                    <input
                      type="text"
                      name="numero_chasis"
                      value={
                        vehiculoIngreso.numero_chasis
                      }
                      onChange={
                        actualizarCampoVehiculoIngreso
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
                        vehiculoIngreso.numero_motor
                      }
                      onChange={
                        actualizarCampoVehiculoIngreso
                      }
                      className="rounded-lg border bg-white p-3"
                    />
                  </label>
                </div>


                <div className="grid gap-4 md:grid-cols-2">
                  {(esCompra ||
                    hayPermuta) && (
                    <label className="grid gap-2">
                      <span className="font-medium">
                        {esCompra
                          ? "Valor de compra *"
                          : "Valor de ingreso"}
                      </span>

                      <input
                        type="number"
                        name="valor_ingreso"
                        min="0"
                        step="1"
                        value={
                          vehiculoIngreso.valor_ingreso
                        }
                        onChange={
                          actualizarCampoVehiculoIngreso
                        }
                        className="rounded-lg border bg-white p-3"
                      />

                      {hayPermuta && (
                        <span className="text-xs text-gray-500">
                          Puede quedar vacío si la permuta no tiene un valor individual asignado.
                        </span>
                      )}
                    </label>
                  )}


                  <label className="grid gap-2">
                    <span className="font-medium">
                      Precio de venta del stock *
                    </span>

                    <input
                      type="number"
                      name="precio_venta"
                      min="0"
                      step="1"
                      value={
                        vehiculoIngreso.precio_venta
                      }
                      onChange={
                        actualizarPrecioVentaIngreso
                      }
                      className="rounded-lg border bg-white p-3"
                    />

                    <span className="text-xs text-gray-500">
                      Será el precio comercial inicial de la unidad en stock.
                    </span>
                  </label>
                </div>


                {vehiculoIngresoEsUsado && (
                  <section className="grid gap-4 rounded-lg border border-blue-200 bg-white p-4">
                    <div>
                      <h3 className="font-semibold">
                        Contrato de consignación
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        La unidad queda preparada para emitir el contrato de consignación correspondiente.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="font-medium">
                          Valor del contrato *
                        </span>

                        <input
                          type="number"
                          name="precio_base_consignacion"
                          min="0"
                          step="1"
                          value={
                            vehiculoIngreso
                              .precio_base_consignacion
                          }
                          onChange={
                            actualizarCampoVehiculoIngreso
                          }
                          className="rounded-lg border p-3"
                        />
                      </label>


                      <label className="grid gap-2">
                        <span className="font-medium">
                          Plazo
                        </span>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name="plazo_consignacion_dias"
                            min="1"
                            value={
                              vehiculoIngreso
                                .plazo_consignacion_dias
                            }
                            onChange={
                              actualizarCampoVehiculoIngreso
                            }
                            className="w-full rounded-lg border p-3"
                          />

                          <span className="text-sm">
                            días
                          </span>
                        </div>
                      </label>
                    </div>
                  </section>
                )}


                <label className="grid gap-2">
                  <span className="font-medium">
                    Observaciones del ingreso
                  </span>

                  <textarea
                    name="observaciones"
                    value={
                      vehiculoIngreso.observaciones
                    }
                    onChange={
                      actualizarCampoVehiculoIngreso
                    }
                    rows={3}
                    className="rounded-lg border bg-white p-3"
                  />
                </label>
              </section>
            )}


            {/* PAGOS DE COMPRA */}

            {esCompra && (
              <section className="grid gap-5 rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Detalle de pago de la compra
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      Podés combinar efectivo, transferencia, cheque u otras formas de pago.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      agregarPagoCompra
                    }
                    className="rounded-lg border border-green-700 bg-white px-4 py-2 text-sm font-semibold text-green-700"
                  >
                    + Agregar pago
                  </button>
                </div>


                <div className="grid gap-4">
                  {pagosCompra.map(
                    (
                      pago,
                      indice
                    ) => (
                      <article
                        key={
                          indice
                        }
                        className="grid gap-4 rounded-xl border bg-white p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="font-semibold">
                            Pago{" "}
                            {
                              indice +
                              1
                            }
                          </h3>

                          {pagosCompra.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                eliminarPagoCompra(
                                  indice
                                )
                              }
                              className="text-sm font-semibold text-red-600"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>


                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="grid gap-2">
                            <span className="font-medium">
                              Medio de pago *
                            </span>

                            <select
                              value={
                                pago.medio_pago
                              }
                              onChange={
                                (
                                  event
                                ) =>
                                  actualizarMedioPagoCompra(
                                    indice,
                                    event
                                      .target
                                      .value as MedioPagoCompra
                                  )
                              }
                              className="rounded-lg border p-3"
                            >
                              <option value="efectivo">
                                Efectivo
                              </option>

                              <option value="transferencia">
                                Transferencia / depósito
                              </option>

                              <option value="cheque">
                                Cheque
                              </option>

                              <option value="otro">
                                Otro
                              </option>
                            </select>
                          </label>


                          <label className="grid gap-2">
                            <span className="font-medium">
                              Importe *
                            </span>

                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                pago.importe
                              }
                              onChange={
                                (
                                  event
                                ) =>
                                  actualizarCampoPagoCompra(
                                    indice,
                                    "importe",
                                    event
                                      .target
                                      .value
                                  )
                              }
                              className="rounded-lg border p-3"
                            />
                          </label>
                        </div>


                        {pago.medio_pago ===
                          "transferencia" && (
                          <div className="grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-2">
                            <label className="grid gap-2">
                              <span className="font-medium">
                                Banco
                              </span>

                              <input
                                type="text"
                                value={
                                  pago.banco
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    actualizarCampoPagoCompra(
                                      indice,
                                      "banco",
                                      event
                                        .target
                                        .value
                                    )
                                }
                                className="rounded-lg border bg-white p-3"
                              />
                            </label>


                            <label className="grid gap-2">
                              <span className="font-medium">
                                Titular *
                              </span>

                              <input
                                type="text"
                                value={
                                  pago.titular
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    actualizarCampoPagoCompra(
                                      indice,
                                      "titular",
                                      event
                                        .target
                                        .value
                                    )
                                }
                                className="rounded-lg border bg-white p-3"
                              />
                            </label>


                            <label className="grid gap-2">
                              <span className="font-medium">
                                CUIT / CUIL
                              </span>

                              <input
                                type="text"
                                value={
                                  pago.cuil_cuit
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    actualizarCampoPagoCompra(
                                      indice,
                                      "cuil_cuit",
                                      event
                                        .target
                                        .value
                                    )
                                }
                                className="rounded-lg border bg-white p-3"
                              />
                            </label>


                            <label className="grid gap-2">
                              <span className="font-medium">
                                Tipo de cuenta
                              </span>

                              <input
                                type="text"
                                value={
                                  pago.tipo_cuenta
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    actualizarCampoPagoCompra(
                                      indice,
                                      "tipo_cuenta",
                                      event
                                        .target
                                        .value
                                    )
                                }
                                placeholder="Ej. Caja de ahorro $"
                                className="rounded-lg border bg-white p-3"
                              />
                            </label>


                            <label className="grid gap-2">
                              <span className="font-medium">
                                Nº de cuenta
                              </span>

                              <input
                                type="text"
                                value={
                                  pago.numero_cuenta
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    actualizarCampoPagoCompra(
                                      indice,
                                      "numero_cuenta",
                                      event
                                        .target
                                        .value
                                    )
                                }
                                className="rounded-lg border bg-white p-3"
                              />
                            </label>


                            <label className="grid gap-2">
                              <span className="font-medium">
                                Alias
                              </span>

                              <input
                                type="text"
                                value={
                                  pago.alias
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    actualizarCampoPagoCompra(
                                      indice,
                                      "alias",
                                      event
                                        .target
                                        .value
                                    )
                                }
                                className="rounded-lg border bg-white p-3"
                              />
                            </label>


                            <label className="grid gap-2 md:col-span-2">
                              <span className="font-medium">
                                CBU / CVU
                              </span>

                              <input
                                type="text"
                                value={
                                  pago.cbu_cvu
                                }
                                onChange={
                                  (
                                    event
                                  ) =>
                                    actualizarCampoPagoCompra(
                                      indice,
                                      "cbu_cvu",
                                      event
                                        .target
                                        .value
                                    )
                                }
                                className="rounded-lg border bg-white p-3"
                              />
                            </label>
                          </div>
                        )}


                        {(pago.medio_pago ===
                          "cheque" ||
                          pago.medio_pago ===
                            "otro") && (
                          <label className="grid gap-2">
                            <span className="font-medium">
                              Detalle *
                            </span>

                            <textarea
                              value={
                                pago.detalle
                              }
                              onChange={
                                (
                                  event
                                ) =>
                                  actualizarCampoPagoCompra(
                                    indice,
                                    "detalle",
                                    event
                                      .target
                                      .value
                                  )
                              }
                              rows={3}
                              placeholder={
                                pago.medio_pago ===
                                "cheque"
                                  ? "Banco, número de cheque, fecha, titular, etc."
                                  : "Describí la forma de pago."
                              }
                              className="rounded-lg border p-3"
                            />
                          </label>
                        )}


                        {pago.medio_pago ===
                          "efectivo" && (
                          <p className="text-sm text-gray-500">
                            No se requieren datos adicionales para el pago en efectivo.
                          </p>
                        )}
                      </article>
                    )
                  )}
                </div>


                <section className="rounded-xl border bg-white p-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        Valor de compra
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {formatearImporte(
                          valorCompra
                        )}
                      </p>
                    </div>


                    <div>
                      <p className="text-sm text-gray-500">
                        Total de pagos
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {formatearImporte(
                          totalPagosCompra
                        )}
                      </p>
                    </div>


                    <div>
                      <p className="text-sm text-gray-500">
                        Diferencia
                      </p>

                      <p
                        className={`mt-1 text-xl font-bold ${
                          pagosCompraCoinciden
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {formatearImporte(
                          diferenciaPagosCompra
                        )}
                      </p>
                    </div>
                  </div>


                  {pagosCompraCoinciden ? (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                      ✓ El detalle de pagos coincide con el valor de compra.
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      El total de los pagos debe coincidir exactamente con el valor de compra antes de guardar.
                    </div>
                  )}
                </section>
              </section>
            )}


            {/* CONDICIONES DE VENTA */}

            {esVenta && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Bonificación
                    </span>

                    <input
                      type="number"
                      name="bonificacion"
                      min="0"
                      step="1"
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
                      step="1"
                      value={
                        form.gastos
                      }
                      onChange={
                        actualizarCampo
                      }
                      className="rounded-lg border p-3"
                    />
                  </label>
                </div>


                <section className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Total de la operación
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {formatearImporte(
                      totalVenta
                    )}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Precio − bonificación + gastos
                  </p>
                </section>
              </>
            )}


            {/* DATOS COMERCIALES */}

            <section className="grid gap-5 rounded-xl border p-5">
              <h2 className="text-lg font-semibold">
                Datos comerciales
              </h2>


              <div className="grid gap-4 md:grid-cols-2">
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
                    Gastos de gestoría
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
              </div>


              {!esCompra && (
                <label className="grid gap-2">
                  <span className="font-medium">
                    Forma de pago / condiciones
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
                    className="rounded-lg border p-3"
                    placeholder={
                      esVenta
                        ? "Ej. transferencia + crédito + vehículo en permuta"
                        : "Ej. condiciones pactadas con consignante/proveedor"
                    }
                  />
                </label>
              )}


              <label className="grid gap-2">
                <span className="font-medium">
                  {esCompra
                    ? "Observaciones sobre el pago"
                    : "Detalle"}
                </span>

                <textarea
                  name="detalle_pago"
                  value={
                    form.detalle_pago
                  }
                  onChange={
                    actualizarCampo
                  }
                  rows={3}
                  className="rounded-lg border p-3"
                />
              </label>


              <label className="grid gap-2">
                <span className="font-medium">
                  Observaciones comerciales
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
                    form.observaciones_internas
                  }
                  onChange={
                    actualizarCampo
                  }
                  rows={3}
                  className="rounded-lg border p-3"
                />
              </label>
            </section>
          </>
        )}


        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}


        <div className="flex justify-end gap-3">
          <Link
            href="/admin/operaciones"
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