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

import {
  crearDocumentoOperacion,
} from "@/lib/service/documentos-operacion";

type CondicionIngreso =
  | "0km"
  | "usado";

type VehiculoIngresoFormulario = {
  condicion: CondicionIngreso;
  tipo: string;
tipo_vehiculo_id: string;

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

  doc_titulo_propiedad: boolean;
  doc_cat: boolean;
  doc_cedula: boolean;
  doc_cedulas_adicionales: boolean;
  doc_formulario_08: boolean;
  doc_verificacion_policial: boolean;
  doc_libre_deuda_patentes: boolean;
  doc_libre_deuda_infracciones: boolean;
  doc_informe_dominio: boolean;
  doc_manuales: boolean;
  doc_duplicado_llave: boolean;
  doc_prenda_03: boolean;
  doc_otros: boolean;
  doc_otros_detalle: string;
};

const VEHICULO_INGRESO_INICIAL: VehiculoIngresoFormulario = {
  condicion: "usado",
  tipo: "",
tipo_vehiculo_id: "",

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

  doc_titulo_propiedad: false,
  doc_cat: false,
  doc_cedula: false,
  doc_cedulas_adicionales: false,
  doc_formulario_08: false,
  doc_verificacion_policial: false,
  doc_libre_deuda_patentes: false,
  doc_libre_deuda_infracciones: false,
  doc_informe_dominio: false,
  doc_manuales: false,
  doc_duplicado_llave: false,
  doc_prenda_03: false,
  doc_otros: false,
  doc_otros_detalle: "",
};

function obtenerNombreCliente(
  cliente: Cliente
) {
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

const DOCUMENTOS_PERMUTA = [
  {
    nombre: "doc_titulo_propiedad",
    etiqueta: "Título de Propiedad",
  },
  {
    nombre: "doc_cat",
    etiqueta: "CAT",
  },
  {
    nombre: "doc_cedula",
    etiqueta: "Cédula de identificación",
  },
  {
    nombre: "doc_cedulas_adicionales",
    etiqueta: "Cédulas adicionales",
  },
  {
    nombre: "doc_formulario_08",
    etiqueta: "Formulario 08 firmado/certificado",
  },
  {
    nombre: "doc_verificacion_policial",
    etiqueta: "Verificación policial / Formulario 12",
  },
  {
    nombre: "doc_libre_deuda_patentes",
    etiqueta: "Libre deuda de patentes",
  },
  {
    nombre: "doc_libre_deuda_infracciones",
    etiqueta: "Libre deuda de infracciones",
  },
  {
    nombre: "doc_informe_dominio",
    etiqueta: "Informe de dominio",
  },
  {
    nombre: "doc_manuales",
    etiqueta: "Manuales",
  },
  {
    nombre: "doc_duplicado_llave",
    etiqueta: "Duplicado de llave",
  },
  {
    nombre: "doc_prenda_03",
    etiqueta: "Prenda 03",
  },
  {
    nombre: "doc_otros",
    etiqueta: "Otros",
  },
] as const;

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

  const [
    pagosCompra,
    setPagosCompra,
  ] =
    useState<PagoCompraFormulario[]>([
      crearPagoVacio(),
    ]);

    const [busquedaCliente, setBusquedaCliente] =
  useState("");
    const [busquedaVehiculo, setBusquedaVehiculo] =
  useState("");

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

        if (
          !componenteActivo
        ) {
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
        if (
          !componenteActivo
        ) {
          return;
        }

        setError(
          errorDesconocido instanceof
          Error
            ? errorDesconocido.message
            : "No se pudieron cargar los datos."
        );
      } finally {
        if (
          componenteActivo
        ) {
          setCargandoDatos(
            false
          );
        }
      }
    }

    cargarDatos();

    return () => {
      componenteActivo =
        false;
    };
  }, []);

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
      [
        pagosCompra,
      ]
    );

  const diferenciaPagosCompra =
  valorCompra -
  totalPagosCompra;

  const clientesFiltrados = useMemo(() => {
  const busqueda = busquedaCliente
    .trim()
    .toLowerCase();

  const lista = clientes.filter((cliente) => {
    if (!busqueda) {
      return true;
    }

    const texto = [
      obtenerNombreCliente(cliente),
      cliente.dni,
      cliente.cuit,
      cliente.telefono,
      cliente.whatsapp,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda);
  });

  return [...lista].sort((a, b) =>
    obtenerNombreCliente(a).localeCompare(
      obtenerNombreCliente(b),
      "es",
      { sensitivity: "base" }
    )
  );
}, [clientes, busquedaCliente]);

const vehiculosFiltrados = useMemo(() => {
  const busqueda = busquedaVehiculo
    .trim()
    .toLowerCase();

  if (!busqueda) {
    return vehiculos;
  }

  return vehiculos.filter((vehiculo) => {
    const texto = [
      vehiculo.marca,
      vehiculo.modelo,
      vehiculo.version,
      vehiculo.anio,
      vehiculo.dominio,
      vehiculo.numero_chasis,
      vehiculo.numero_motor,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda);
  });
}, [vehiculos, busquedaVehiculo]);

const pagosCompraCoinciden =
  esCompra &&
  valorCompra > 0 &&
  Math.abs(
    diferenciaPagosCompra
  ) <= 0.01;

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
      target.type ===
        "checkbox"
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

  function actualizarCampoVehiculoIngreso(
    event: React.ChangeEvent<
      | HTMLInputElement
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
      target.type ===
        "checkbox"
        ? target.checked
        : target.value;

    setVehiculoIngreso(
      (anterior) => ({
        ...anterior,
        [nombre]:
          valor,
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
          condicion ===
          "0km"
            ? "0"
            : anterior.kilometros,

        dominio:
          condicion ===
          "0km"
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
      (anteriores) => {
        const nuevos =
          anteriores.filter(
            (
              _,
              indiceActual
            ) =>
              indiceActual !==
              indice
          );

        return nuevos.length >
          0
          ? nuevos
          : [
              crearPagoVacio(),
            ];
      }
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
        (
          pago.medio_pago ===
            "cheque" ||
          pago.medio_pago ===
            "otro"
        ) &&
        !pago.detalle.trim()
      ) {
        return `Ingresá el detalle del pago ${numeroPago}.`;
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
          valorIngreso !==
            null &&
          valorIngreso > 0
            ? valorIngreso
            : null,

            tipo:
  vehiculoIngreso.tipo,
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

    return await crearIngresoUsado({
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

      doc_titulo_propiedad:
        vehiculoIngreso.doc_titulo_propiedad,

      doc_cat:
        vehiculoIngreso.doc_cat,

      doc_cedula:
        vehiculoIngreso.doc_cedula,

      doc_cedulas_adicionales:
        vehiculoIngreso.doc_cedulas_adicionales,

      doc_formulario_08:
        vehiculoIngreso.doc_formulario_08,

      doc_verificacion_policial:
        vehiculoIngreso.doc_verificacion_policial,

      doc_libre_deuda_patentes:
        vehiculoIngreso.doc_libre_deuda_patentes,

      doc_libre_deuda_infracciones:
        vehiculoIngreso.doc_libre_deuda_infracciones,

      doc_informe_dominio:
        vehiculoIngreso.doc_informe_dominio,

      doc_manuales:
        vehiculoIngreso.doc_manuales,

      doc_duplicado_llave:
        vehiculoIngreso.doc_duplicado_llave,

      doc_prenda_03:
        vehiculoIngreso.doc_prenda_03,

      doc_otros:
        vehiculoIngreso.doc_otros,

      doc_otros_detalle:
        vehiculoIngreso.doc_otros_detalle,
    });
  }

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

    const ingresoPermuta =
  await registrarIngresoUsado(
    vehiculoPermuta.id,
    operacion.id,
    "permuta"
  );

if (ingresoPermuta) {
  await crearDocumentoOperacion({
    ingreso_usado_id:
      ingresoPermuta.id,

    tipo_documento:
      "contrato_consignacion",

    datos_snapshot: {
      operacion_id:
        operacion.id,

      vehiculo_id:
        vehiculoPermuta.id,

      valor_ingreso:
        ingresoPermuta.valor_ingreso,

      precio_base_consignacion:
        ingresoPermuta.precio_base_consignacion,

      plazo_consignacion_dias:
        ingresoPermuta.plazo_consignacion_dias,
    },
  });
}

 return operacion;
  }

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

    if (esCompra) {
      await crearPagosCompra(
        operacion.id,
        pagosCompra
      );
    }

    return operacion;
  }

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
            <section>
              <h2 className="text-lg font-semibold">
                Tipo de operación
              </h2>

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

                      <span className="mt-1 block text-xs">
                        {
                          opcion.descripcion
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </section>

            <section className="grid gap-3 rounded-xl border p-5">
              <label className="grid gap-2">
                <span className="font-medium">
                  {esVenta
                    ? "Cliente comprador *"
                    : esCompra
                      ? "Vendedor / proveedor *"
                      : "Consignante / proveedor *"}
                </span>

<input
  type="text"
  value={busquedaCliente}
  onChange={(event) =>
    setBusquedaCliente(event.target.value)
  }
  placeholder="Buscar por nombre, apellido, DNI, CUIT o teléfono..."
  className="rounded-lg border p-3"
/>
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

                  {clientesFiltrados.map(
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

            {esVenta && (
              <>
                <section className="grid gap-5 rounded-xl border p-5 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="font-medium">
                      Vehículo que sale del stock *
                    </span>
                    <input
  type="text"
  value={busquedaVehiculo}
  onChange={(event) =>
    setBusquedaVehiculo(event.target.value)
  }
  placeholder="Buscar por marca, modelo, versión, año, dominio, chasis o motor..."
  className="rounded-lg border p-3"
/>

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

                      {vehiculosFiltrados.map(
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

                  <div className="grid gap-2">
                    <span className="font-medium">
                      Precio de venta *
                    </span>

                    <div className="grid grid-cols-[130px_1fr] gap-2">
                      <select
                        name="moneda"
                        value={
                          form.moneda
                        }
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
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border bg-gray-50 p-5">
                  <p className="font-semibold">
                    ¿Se recibe un vehículo en permuta?
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

            {operacionHaceIngresarVehiculo && (
              <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                <h2 className="text-lg font-semibold">
                  Vehículo que ingresa al stock
                </h2>

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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
  <span className="font-medium">
    Tipo de vehículo *
  </span>

  <select
    value={vehiculoIngreso.tipo}
    onChange={(event) =>
      setVehiculoIngreso(
        (anterior) => ({
          ...anterior,
          tipo: event.target.value,
        })
      )
    }
    className="rounded-lg border bg-white p-3"
  >
    <option value="">
      Seleccionar tipo
    </option>
    <option value="Auto">Auto</option>
    <option value="Hatchback">Hatchback</option>
    <option value="SUV">SUV</option>
    <option value="Pickup">Pickup</option>
    <option value="Utilitario">Utilitario</option>
    <option value="Moto">Moto</option>
  </select>
</label>
                  {[
                    [
                      "marca",
                      "Marca *",
                      "text",
                    ],
                    [
                      "modelo",
                      "Modelo *",
                      "text",
                    ],
                    [
                      "version",
                      "Versión",
                      "text",
                    ],
                    [
                      "anio",
                      "Año",
                      "number",
                    ],
                    [
                      "color",
                      "Color",
                      "text",
                    ],
                  ].map(
                    ([
                      nombre,
                      etiqueta,
                      tipo,
                    ]) => (
                      <label
                        key={
                          nombre
                        }
                        className="grid gap-2"
                      >
                        <span className="font-medium">
                          {
                            etiqueta
                          }
                        </span>

                        <input
                          type={
                            tipo
                          }
                          name={
                            nombre
                          }
                          value={
                            String(
                              vehiculoIngreso[
                                nombre as keyof VehiculoIngresoFormulario
                              ] ?? ""
                            )
                          }
                          onChange={
                            actualizarCampoVehiculoIngreso
                          }
                          className="rounded-lg border bg-white p-3"
                        />
                      </label>
                    )
                  )}

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
                  </label>
                </div>

                {vehiculoIngresoEsUsado && (
                  <>
                    <section className="grid gap-4 rounded-lg border border-blue-200 bg-white p-4">
                      <div>
                        <h3 className="font-semibold">
                          Contrato de consignación
                        </h3>
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
                            className="rounded-lg border p-3"
                          />
                        </label>
                      </div>
                    </section>

                    <section className="grid gap-4 rounded-lg border border-blue-200 bg-white p-4">
                      <div>
                        <h3 className="font-semibold">
                          Documentación recibida
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Marcá únicamente la documentación y elementos efectivamente entregados con la unidad.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {DOCUMENTOS_PERMUTA.map(
                          (
                            documento
                          ) => (
                            <label
                              key={
                                documento.nombre
                              }
                              className="flex items-center gap-3 rounded-lg border p-3"
                            >
                              <input
                                type="checkbox"
                                name={
                                  documento.nombre
                                }
                                checked={
                                  Boolean(
                                    vehiculoIngreso[
                                      documento.nombre
                                    ]
                                  )
                                }
                                onChange={
                                  actualizarCampoVehiculoIngreso
                                }
                              />

                              <span className="text-sm font-medium">
                                {
                                  documento.etiqueta
                                }
                              </span>
                            </label>
                          )
                        )}
                      </div>

                      {vehiculoIngreso.doc_otros && (
                        <label className="grid gap-2">
                          <span className="font-medium">
                            Detalle de otros documentos / elementos
                          </span>

                          <input
                            type="text"
                            name="doc_otros_detalle"
                            value={
                              vehiculoIngreso.doc_otros_detalle
                            }
                            onChange={
                              actualizarCampoVehiculoIngreso
                            }
                            className="rounded-lg border p-3"
                          />
                        </label>
                      )}
                    </section>
                  </>
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

            {esCompra && (
              <section className="grid gap-5 rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Detalle de pago de la compra
                    </h2>
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
                        <div className="flex justify-between gap-3">
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
                            {[
                              [
                                "banco",
                                "Banco",
                              ],
                              [
                                "titular",
                                "Titular *",
                              ],
                              [
                                "cuil_cuit",
                                "CUIT / CUIL",
                              ],
                              [
                                "tipo_cuenta",
                                "Tipo de cuenta",
                              ],
                              [
                                "numero_cuenta",
                                "Nº de cuenta",
                              ],
                              [
                                "alias",
                                "Alias",
                              ],
                              [
                                "cbu_cvu",
                                "CBU / CVU",
                              ],
                            ].map(
                              ([
                                campo,
                                etiqueta,
                              ]) => (
                                <label
                                  key={
                                    campo
                                  }
                                  className="grid gap-2"
                                >
                                  <span className="font-medium">
                                    {
                                      etiqueta
                                    }
                                  </span>

                                  <input
                                    type="text"
                                    value={
                                      String(
                                        pago[
                                          campo as keyof PagoCompraFormulario
                                        ] ??
                                          ""
                                      )
                                    }
                                    onChange={
                                      (
                                        event
                                      ) =>
                                        actualizarCampoPagoCompra(
                                          indice,
                                          campo as
                                            | "banco"
                                            | "titular"
                                            | "cuil_cuit"
                                            | "tipo_cuenta"
                                            | "numero_cuenta"
                                            | "alias"
                                            | "cbu_cvu",
                                          event
                                            .target
                                            .value
                                        )
                                    }
                                    className="rounded-lg border bg-white p-3"
                                  />
                                </label>
                              )
                            )}
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
                              className="rounded-lg border p-3"
                            />
                          </label>
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
                </section>
              </section>
            )}

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
                </section>
              </>
            )}

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

              <label className="flex items-center gap-3 rounded-lg border p-4">
                <input
                  type="checkbox"
                  name="gastos_gestoria_incluidos"
                  checked={
                    form.gastos_gestoria_incluidos
                  }
                  onChange={
                    actualizarCampo
                  }
                />

                <span className="font-medium">
                  Gastos de gestoría incluidos en la operación
                </span>
              </label>

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
