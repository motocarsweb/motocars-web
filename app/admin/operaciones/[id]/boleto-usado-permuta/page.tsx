"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MotoCarsDocumentoLayout from "@/componentes/documentos/MotoCarsDocumentoLayout";
import DetallePagoOperacion from "@/componentes/documentos/DetallePagoOperacion";
import {
  obtenerCliente,
  type Cliente,
} from "@/lib/service/clientes";

import {
  obtenerIngresoUsadoPorOperacion,
  type IngresoUsado,
} from "@/lib/service/ingresos-usados";

import {
  obtenerOperacion,
  type Operacion,
} from "@/lib/service/operaciones";

import {
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

import {
  formatearImporteCompleto,
} from "@/lib/utils/numero-a-letras";
import {
  type DocumentacionEntrega,
  DOCUMENTACION_INICIAL,
  OPCIONES_DOCUMENTACION,
  obtenerDocumentacionEntrega,
  guardarDocumentacionEntrega,
} from "@/lib/service/documentacion-entrega";

function nombreCliente(
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

function documentoCliente(
  cliente: Cliente
) {
  return (
    cliente.cuit ||
    cliente.dni ||
    "—"
  );
}

function nombreVehiculo(
  vehiculo: VehiculoSupabase
) {
  return [
    vehiculo.marca,
    vehiculo.modelo,
    vehiculo.version,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatearFecha(
  fecha: string
) {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(fecha)
  );
}

function formatearKilometros(
  kilometros:
    | number
    | null
) {
  if (
    kilometros === null
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "es-AR"
  ).format(
    kilometros
  );
}

function CasilleroDocumento({
  marcado,
  texto,
}: {
  marcado: boolean;
  texto: string;
}) {
  return (
    <div className="item-documentacion">
      <span className="casillero-documentacion">
        {marcado
          ? "☑"
          : "☐"}
      </span>

      <span>
        {texto}
      </span>
    </div>
  );
}

export default function BoletoUsadoPermutaPage() {
  const [mostrarDetallePago, setMostrarDetallePago] = useState(false);
  const params =
    useParams<{
      id: string;
    }>();

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
    ingresoUsado,
    setIngresoUsado,
  ] =
    useState<IngresoUsado | null>(
      null
    );

  const [
    vehiculoPermuta,
    setVehiculoPermuta,
  ] =
    useState<VehiculoSupabase | null>(
      null
    );

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");
const [
  documentacion,
  setDocumentacion,
] = useState<DocumentacionEntrega>(
  DOCUMENTACION_INICIAL
);

const [
  guardandoDocumentacion,
  setGuardandoDocumentacion,
] = useState(false);
const [
  documentacionGuardada,
  setDocumentacionGuardada,
] = useState(false);

const [
  errorDocumentacion,
  setErrorDocumentacion,
] = useState("");

async function guardarDocumentacion() {
  const operacionId = Number(params.id);

  if (!Number.isInteger(operacionId) || operacionId <= 0) {
    setErrorDocumentacion("La operación no es válida.");
    return;
  }

  try {
    setGuardandoDocumentacion(true);
    setErrorDocumentacion("");
    setDocumentacionGuardada(false);

    await guardarDocumentacionEntrega(
      operacionId,
      documentacion
    );

    setDocumentacionGuardada(true);
  } catch (error) {
    setErrorDocumentacion(
      error instanceof Error
        ? error.message
        : "No se pudo guardar la documentación."
    );
  } finally {
    setGuardandoDocumentacion(false);
  }
}
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

        if (
          operacionCargada.tipo_operacion !==
          "venta"
        ) {
          throw new Error(
            "Esta operación no corresponde a una venta."
          );
        }

        const [
          clienteCargado,
          vehiculoCargado,
          ingresoCargado,
        ] =
          await Promise.all([
            obtenerCliente(
              operacionCargada.cliente_id
            ),

            obtenerVehiculoPorId(
              operacionCargada.vehiculo_id
            ),

            obtenerIngresoUsadoPorOperacion(
              operacionId
            ),
          ]);

        if (
          !vehiculoCargado
        ) {
          throw new Error(
            "No se encontró el vehículo vendido."
          );
        }

        if (
          vehiculoCargado.condicion !==
          "usado"
        ) {
          throw new Error(
            "El vehículo vendido no corresponde a un usado."
          );
        }

        if (
          !ingresoCargado ||
          ingresoCargado.tipo_ingreso !==
            "permuta"
        ) {
          throw new Error(
            "Esta venta no tiene una unidad usada recibida en permuta."
          );
        }

        const permutaCargada =
          await obtenerVehiculoPorId(
            ingresoCargado.vehiculo_id
          );

        if (
          !permutaCargada
        ) {
          throw new Error(
            "No se encontró el vehículo recibido en permuta."
          );
        }

        if (!activo) {
          return;
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

        setIngresoUsado(
          ingresoCargado
        );

        setVehiculoPermuta(
          permutaCargada
        );
        const documentacionCargada =
  await obtenerDocumentacionEntrega(
    operacionId
  );

if (activo) {
  setDocumentacion(
    documentacionCargada
  );
}
      } catch (
        errorDesconocido
      ) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof
          Error
            ? errorDesconocido.message
            : "No se pudo cargar el boleto de venta con permuta."
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

  if (cargando) {
    return (
      <main
        style={{
          padding: 32,
        }}
      >
        Cargando boleto de venta con permuta...
      </main>
    );
  }

  if (
    error ||
    !operacion ||
    !cliente ||
    !vehiculo ||
    !ingresoUsado ||
    !vehiculoPermuta
  ) {
    return (
      <main
        style={{
          padding: 32,
        }}
      >
        <p
          style={{
            color: "#b91c1c",
          }}
        >
          {error ||
            "No se pudo cargar el boleto de venta con permuta."}
        </p>

        <Link
          href={`/admin/operaciones/${params.id}`}
        >
          Volver a la operación
        </Link>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          background: #eef1f5;
        }

        .barra-documento {
          width: min(
            210mm,
            calc(100% - 32px)
          );

          margin: 24px auto 12px;

          display: flex;
          justify-content: space-between;

          gap: 12px;
        }

        .boton-documento {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-height: 42px;

          border: 1px solid #d4d4d4;
          border-radius: 8px;

          background: white;

          padding: 0 16px;

          color: #171717;

          font-size: 14px;
          font-weight: 700;

          text-decoration: none;

          cursor: pointer;
        }

        .boton-principal {
          border-color: #111827;
          background: #111827;
          color: white;
        }

        .boleto-usado-texto {
          margin-top: 16px;

          font-size: 12.5px;
          line-height: 1.38;

          text-align: justify;
        }

        .boleto-usado-texto p {
          margin: 0 0 8px;
        }

        .boleto-usado-texto strong {
          font-weight: 800;
        }

        .titulo-seccion-usado {
          margin: 11px 0 6px;

          padding-bottom: 4px;

          border-bottom:
            1px solid #d4d4d4;

          font-size: 11.5px;
          font-weight: 800;

          letter-spacing: 0.6px;

          text-transform: uppercase;
        }

        .datos-usado {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px 12px;
  font-size: 11.5px;
}

        .dato-usado {
  display: flex;
  align-items: baseline;
  gap: 5px;
  min-width: 0;
}

.dato-usado strong {
  flex-shrink: 0;
  white-space: nowrap;
}

.dato-usado span {
  min-width: 0;
  overflow-wrap: anywhere;
}

        .condiciones-pago {
          margin-top: 6px;

          padding: 8px 10px;

          border: 1px solid #d4d4d4;
          border-radius: 6px;

          font-size: 11.5px;

          white-space: normal;
        }

        .bloque-permuta {
          margin: 8px 0 10px;

          padding: 9px 10px;

          border: 1px solid #d4d4d4;
          border-radius: 6px;

          background: #fafafa;
        }

        .documentacion-permuta {
          margin: 6px 0 10px;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          column-gap: 22px;
          row-gap: 3px;

          padding: 8px 10px;

          border: 1px solid #d4d4d4;
          border-radius: 6px;

          font-size: 11.2px;
          line-height: 1.25;
        }

        .item-documentacion {
          display: flex;
          align-items: flex-start;

          gap: 6px;

          min-width: 0;
        }

        .casillero-documentacion {
          flex: 0 0 auto;

          font-size: 13px;
          line-height: 1;
        }

        .firmas-usado {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 70px;

          margin-top: 90px;
          margin-bottom: 10px;
        }

        .firma-usado {
          padding-top: 7px;

          border-top:
            1px solid #737373;

          text-align: center;

          font-size: 10.5px;
          line-height: 1.35;
        }

        /* Pie exclusivo de este boleto: cuatro columnas simétricas en pantalla e impresión. */
        .documento-motocars .documento-pie {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          column-gap: 2mm !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          font-size: 7.5px !important;
          line-height: 1.25 !important;
        }
        .documento-motocars .pie-item,
        .documento-motocars .pie-item-izquierda,
        .documento-motocars .pie-item-derecha {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: left !important;
          min-width: 0 !important;
          gap: 4px !important;
        }
        .documento-motocars .pie-item svg {
          width: 10px !important;
          height: 10px !important;
          flex: 0 0 10px !important;
        }
        .documento-motocars .pie-item span {
          min-width: 0 !important;
          overflow-wrap: anywhere !important;
        }

        @media print {
  .no-imprimir {
    display: none !important;
  }
  /* El documento ocupa la hoja completa, sin desplazamiento horizontal. */
  @page { size: A4; margin: 0; }
  html, body { width: 100% !important; }
  .documento-motocars .documento-pie {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    column-gap: 2mm !important;
    font-size: 7.5px !important;
    line-height: 1.25 !important;
  }
  .documento-motocars .pie-item {
    min-width: 0 !important;
    gap: 3px !important;
    justify-content: center !important;
    text-align: left !important;
  }
  .documento-motocars .pie-item svg {
    width: 10px !important;
    height: 10px !important;
    flex: 0 0 10px !important;
  }
  .documento-motocars .pie-item span {
    min-width: 0 !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
  }

  /* Una única geometría A4, sin posicionamiento absoluto del pie. */
  .documento-motocars {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    max-width: 210mm !important;
    min-height: 297mm !important;
    height: auto !important;
    margin: 0 auto !important;
    padding: 12mm 12mm 10mm !important;
    box-sizing: border-box !important;
    overflow: visible !important;
  }

  .documento-contenido {
    flex: 0 0 auto !important;
    min-height: 0 !important;
  }

  .documento-pie {
    position: relative !important;
    top: auto !important;
    bottom: auto !important;
    left: auto !important;
    right: auto !important;
    margin-top: auto !important;
    padding-top: 2mm !important;
    flex-shrink: 0 !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .boleto-usado-texto {
    margin-top: 8px;
    font-size: 10.5px;
    line-height: 1.22;
    text-align: left !important;
  }

  .boleto-usado-texto p {
    margin-bottom: 4px;
  }

  .pendientes-permuta {
    white-space: pre-wrap;
    break-inside: avoid;
  }

  .titulo-seccion-usado {
    margin: 6px 0 3px;
    padding-bottom: 2px;
    font-size: 10px;
  }

  .datos-usado {
    gap: 2px 16px;
    font-size: 10px;
  }

  .dato-usado {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

  .condiciones-pago {
    margin-top: 3px;
    padding: 5px 8px;
    font-size: 10px;
  }

  .bloque-permuta {
    margin: 4px 0 5px;
    padding: 5px 8px;
  }

  .documentacion-permuta {
    margin: 3px 0 5px;
    padding: 5px 8px;
    row-gap: 1px;
    font-size: 9.8px;
    line-height: 1.15;
  }

  .casillero-documentacion {
    font-size: 11px;
  }

  .firmas-usado {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 40px !important;

  margin-top: 22mm !important;
  margin-bottom: 0 !important;

  break-inside: avoid !important;
  page-break-inside: avoid !important;
}

.firma-usado {
  padding-top: 4px;
  font-size: 9.5px;
  line-height: 1.2;
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
}

        @media screen and (max-width: 850px) {
          .datos-usado,
          .documentacion-permuta {
            grid-template-columns: 1fr;
          }

          .firmas-usado {
            gap: 30px;
          }
        }
      `}</style>

      <div className="barra-documento no-imprimir">
        <button
  type="button"
  className="boton-documento"
  onClick={() => setMostrarDetallePago((anterior) => !anterior)}
>
  {mostrarDetallePago
    ? "Quitar detalle de pago"
    : "Agregar detalle de pago"}
</button>
        <Link
          href={`/admin/operaciones/${operacion.id}`}
          className="boton-documento"
        >
          Volver a la operación
        </Link>

        <button
          type="button"
          className="boton-documento boton-principal"
          onClick={() =>
            window.print()
          }
        >
          Imprimir / Guardar PDF
        </button>
      </div>
<div
  className="no-imprimir"
  style={{
    maxWidth: 850,
    margin: "20px auto",
    padding: 20,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
  }}
>
  <h3>Documentación pendiente de la unidad recibida en permuta</h3>
  <p style={{ fontSize: 13, color: "#555" }}>
    Indicá únicamente los documentos o elementos que el cliente se compromete a entregar.
    No se consideran pendientes automáticamente los casilleros sin marcar.
  </p>
  <textarea
    aria-label="Documentación pendiente de permuta"
    value={documentacion.documentacion_pendiente_permuta}
    maxLength={2000}
    onChange={(evento) => {
      setDocumentacion((anterior) => ({
        ...anterior,
        documentacion_pendiente_permuta: evento.target.value,
      }));
      setDocumentacionGuardada(false);
    }}
    rows={3}
    style={{ width: "100%", boxSizing: "border-box", padding: 8 }}
    placeholder="Ej.: Formulario 08 certificado, duplicado de llave..."
  />

  <h3>Documentación entregada al comprador</h3>

  <div style={{ display: "grid", gap: 10 }}>
    {OPCIONES_DOCUMENTACION.map((opcion) => (
      <label key={opcion.campo}>
        <input
          type="checkbox"
          checked={documentacion[opcion.campo]}
          onChange={(evento) => {
            setDocumentacion((anterior) => ({
              ...anterior,
              [opcion.campo]: evento.target.checked,
            }));
            setDocumentacionGuardada(false);
          }}
        />{" "}
        {opcion.nombre}
      </label>
    ))}
  </div>

  <label style={{ display: "block", marginTop: 16 }}>
    Observaciones
    <textarea
      value={documentacion.observaciones}
      maxLength={2000}
      onChange={(evento) => {
        setDocumentacion((anterior) => ({
          ...anterior,
          observaciones: evento.target.value,
        }));
        setDocumentacionGuardada(false);
      }}
      rows={3}
      style={{
        display: "block",
        width: "100%",
        boxSizing: "border-box",
        marginTop: 6,
        padding: 8,
      }}
    />
  </label>

  <button
  type="button"
  onClick={guardarDocumentacion}
  disabled={guardandoDocumentacion}
  style={{
    marginTop: 16,
    padding: "12px 22px",
    backgroundColor: guardandoDocumentacion ? "#9ca3af" : "#c8102e",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: guardandoDocumentacion ? "not-allowed" : "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  }}
>
  {guardandoDocumentacion
    ? "Guardando..."
    : "Guardar documentación"}
</button>

  {documentacionGuardada && (
    <p style={{ color: "green" }}>
      Documentación guardada correctamente.
    </p>
  )}

  {errorDocumentacion && (
    <p style={{ color: "red" }}>
      {errorDocumentacion}
    </p>
  )}
</div>
      <MotoCarsDocumentoLayout
        titulo="Contrato de Compra-Venta de Automotores"
        numero={
          operacion.numero ||
          operacion.id
        }
        fecha={formatearFecha(
          operacion.created_at
        )}
      >
        <section className="boleto-usado-texto">
          <p>
  Entre{" "}
  <strong>
    MotoCars Concesionaria
  </strong>
  , con domicilio en Primeros
  Pobladores 1400 de la ciudad
  de Neuquén, por una parte,
  en adelante denominada{" "}
  <strong>
    EL VENDEDOR
  </strong>
  , y por la otra{" "}
  <strong>
    {nombreCliente(cliente)}
  </strong>
  , DNI/CUIT{" "}
  <strong>
    {documentoCliente(cliente)}
  </strong>
  , en adelante denominado{" "}
  <strong>
    EL COMPRADOR
  </strong>
  , se celebra el presente
  contrato de compraventa de
  automotor usado con permuta.
</p>

          <h2 className="titulo-seccion-usado">
  Datos del comprador
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.05fr) minmax(0, 1.55fr)",
    columnGap: "8px",
    rowGap: "2px",
    fontSize: "11.5px",
    lineHeight: 1.2,
  }}
>
  {[
    ["Comprador:", nombreCliente(cliente)],
    ["DNI/CUIT:", documentoCliente(cliente)],
    ["Fecha nac.:", cliente.fecha_nacimiento
      ? formatearFecha(cliente.fecha_nacimiento)
      : "—"],
    ["Estado civil:", cliente.estado_civil || "—"],
    ["Profesión:", cliente.profesion || "—"],
    ["Domicilio:", cliente.direccion || "—"],
    ["Localidad:", [cliente.ciudad, cliente.provincia]
      .filter(Boolean)
      .join(", ") || "—"],
    ["Teléfono:", cliente.whatsapp || cliente.telefono || "—"],
    ["Email:", cliente.email || "—"],
    ...(cliente.estado_civil === "Casado/a"
      ? [
          ["Cónyuge:", cliente.conyuge_nombre || "—"],
          ["DNI cónyuge:", cliente.conyuge_dni || "—"],
        ]
      : []),
  ].map(([etiqueta, valor], indice) => (
    <div
      key={indice}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "4px",
        minWidth: 0,
        textAlign: "left",
      }}
    >
      <strong style={{ flexShrink: 0 }}>
        {etiqueta}
      </strong>
      <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
        {valor}
      </span>
    </div>
  ))}
</div>

          <h2 className="titulo-seccion-usado">
            Vehículo vendido
          </h2>

          <div
  style={{
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1.15fr) minmax(0, 1.25fr)",
    columnGap: "8px",
    rowGap: "2px",
    fontSize: "11.5px",
    lineHeight: 1.2,
  }}
>
  {[
    ["Vehículo:", nombreVehiculo(vehiculo)],
    ["Año:", vehiculo.anio ?? "—"],
    ["Dominio:", operacion.dominio || vehiculo.dominio || "—"],
    ["Color:", vehiculo.color || "—"],
    ["Chasis:", operacion.numero_chasis || vehiculo.numero_chasis || "—"],
    ["Motor:", operacion.numero_motor || vehiculo.numero_motor || "—"],
    ["Kilómetros:", formatearKilometros(vehiculo.kilometros)],
    ["Condición:", "Usado"],
  ].map(([etiqueta, valor], indice) => (
    <div
      key={indice}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "4px",
        minWidth: 0,
        textAlign: "left",
      }}
    >
      <strong style={{ flexShrink: 0 }}>
        {etiqueta}
      </strong>
      <span
        style={{
          minWidth: 0,
          overflowWrap: "anywhere",
        }}
      >
        {valor}
      </span>
    </div>
  ))}
</div>

          <p
            style={{
              marginTop: 12,
            }}
          >
            <strong>
              1)
            </strong>{" "}
            EL VENDEDOR vende a EL
            COMPRADOR el vehículo usado
            individualizado
            precedentemente, el cual ha
            sido examinado, probado y
            verificado por el adquirente,
            quien manifiesta conocer su
            estado general de uso y
            conservación.
          </p>

          <p>
            El precio total de la
            operación se establece en la
            suma de{" "}
            <strong>
              {formatearImporteCompleto(
                operacion.total,
                operacion.moneda
              )}
            </strong>
            .
          </p>

          <h2 className="titulo-seccion-usado">
            Forma de pago
          </h2>

          <div className="condiciones-pago">
  <div>
    <strong>Forma de pago:</strong>{" "}
    {operacion.forma_pago || "A definir"}
  </div>

  {operacion.detalle_pago && (
    <div style={{ marginTop: 3 }}>
      <strong>Detalle:</strong>{" "}
      {operacion.detalle_pago}
    </div>
  )}

  <div style={{ marginTop: 3 }}>
    <strong>Unidad recibida en permuta:</strong>{" "}
    Ver detalle en el punto 3.
  </div>
</div>

          <p
            style={{
              marginTop: 10,
            }}
          >
            <strong>
              2)
            </strong>{" "}
            EL COMPRADOR declara que la
            unidad entregada en permuta,
            individualizada en el punto
            siguiente, es de su entera
            propiedad y que, salvo lo
            expresamente informado en el
            presente contrato, no registra
            embargos, inhibiciones ni
            deudas que impidan su
            transferencia.
          </p>

          <p>
            <strong>
              3)
            </strong>{" "}
            La unidad entregada en
            permuta se individualiza con
            los siguientes datos:
          </p>

          <div className="bloque-permuta">
            <div className="datos-usado">
              <div className="dato-usado">
                <strong>
                  Vehículo:
                </strong>

                <span>
                  {nombreVehiculo(
                    vehiculoPermuta
                  )}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Año:
                </strong>

                <span>
                  {vehiculoPermuta.anio ??
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Dominio:
                </strong>

                <span>
                  {vehiculoPermuta.dominio ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Color:
                </strong>

                <span>
                  {vehiculoPermuta.color ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Chasis:
                </strong>

                <span>
                  {vehiculoPermuta.numero_chasis ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Motor:
                </strong>

                <span>
                  {vehiculoPermuta.numero_motor ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Kilómetros:
                </strong>

                <span>
                  {formatearKilometros(
                    vehiculoPermuta.kilometros
                  )}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Valor:
                </strong>

                <span>
                  {ingresoUsado.valor_ingreso >
                  0
                    ? formatearImporteCompleto(
                        ingresoUsado.valor_ingreso,
                        "ARS"
                      )
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <p>
            <strong>
              4)
            </strong>{" "}
            DOCUMENTACIÓN Y ELEMENTOS
            RECIBIDOS DE LA UNIDAD
            ENTREGADA EN PERMUTA:
          </p>

          <div className="documentacion-permuta">
  {ingresoUsado.doc_titulo_propiedad && (
    <CasilleroDocumento
      marcado={true}
      texto="Título de Propiedad"
    />
  )}

  {ingresoUsado.doc_cat && (
    <CasilleroDocumento
      marcado={true}
      texto="CAT"
    />
  )}

  {ingresoUsado.doc_cedula && (
    <CasilleroDocumento
      marcado={true}
      texto="Cédula de identificación"
    />
  )}

  {ingresoUsado.doc_cedulas_adicionales && (
    <CasilleroDocumento
      marcado={true}
      texto="Cédulas adicionales"
    />
  )}

  {ingresoUsado.doc_formulario_08 && (
    <CasilleroDocumento
      marcado={true}
      texto="Formulario 08 firmado/certificado"
    />
  )}

  {ingresoUsado.doc_verificacion_policial && (
    <CasilleroDocumento
      marcado={true}
      texto="Verificación policial / Formulario 12"
    />
  )}

  {ingresoUsado.doc_libre_deuda_patentes && (
    <CasilleroDocumento
      marcado={true}
      texto="Libre deuda de patentes"
    />
  )}

  {ingresoUsado.doc_libre_deuda_infracciones && (
    <CasilleroDocumento
      marcado={true}
      texto="Libre deuda de infracciones"
    />
  )}

  {ingresoUsado.doc_informe_dominio && (
    <CasilleroDocumento
      marcado={true}
      texto="Informe de dominio"
    />
  )}

  {ingresoUsado.doc_manuales && (
    <CasilleroDocumento
      marcado={true}
      texto="Manuales"
    />
  )}

  {ingresoUsado.doc_duplicado_llave && (
    <CasilleroDocumento
      marcado={true}
      texto="Duplicado de llave"
    />
  )}

  {ingresoUsado.doc_prenda_03 && (
    <CasilleroDocumento
      marcado={true}
      texto="Prenda 03"
    />
  )}

  {ingresoUsado.doc_otros && (
    <CasilleroDocumento
      marcado={true}
      texto={
        ingresoUsado.doc_otros_detalle
          ? `Otros: ${ingresoUsado.doc_otros_detalle}`
          : "Otros"
      }
    />
  )}
</div>
{documentacion.documentacion_pendiente_permuta.trim() && (
  <p className="pendientes-permuta">
    <strong>DOCUMENTACIÓN PENDIENTE DE ENTREGA POR EL COMPRADOR: </strong>
    {documentacion.documentacion_pendiente_permuta.trim()}
  </p>
)}
        <p>
  <strong>5)</strong>{" "}
  En este acto se entrega al COMPRADOR
  la siguiente documentación y elementos:
</p>

<div className="documentacion-permuta">
  {OPCIONES_DOCUMENTACION
    .filter((opcion) => documentacion[opcion.campo])
    .map((opcion) => (
      <CasilleroDocumento
        key={opcion.campo}
        marcado={true}
        texto={opcion.nombre}
      />
    ))}
</div>

{documentacion.observaciones?.trim() && (
  <p>
    <strong>Observaciones sobre la documentación entregada: </strong>
    {documentacion.observaciones.trim()}
  </p>
)}

          <p>
            <strong>
              6)
            </strong>{" "}
            Los gastos de gestoría
            correspondientes a la
            inscripción de la unidad
            adquirida por EL COMPRADOR
            serán gestionados por la
            Gestoría de la Concesionaria y
            se componen de aranceles
            registrales, formularios,
            sellados provinciales, carpeta
            prendaria —si correspondiera—
            y honorarios.
          </p>

          {operacion.gastos_gestoria_incluidos ? (
            <p>
              <strong>
                GASTOS DE GESTORÍA
                INCLUIDOS EN LA OPERACIÓN.
              </strong>
            </p>
          ) : (
            operacion.gastos_gestoria >
              0 && (
              <p>
                La cotización
                correspondiente asciende a
                la suma de{" "}
                <strong>
                  {formatearImporteCompleto(
                    operacion.gastos_gestoria,
                    "ARS"
                  )}
                </strong>
                , pagaderos conforme
                indique EL VENDEDOR,
                pudiendo comprender pagos
                en efectivo y/o en las
                cuentas correspondientes a
                la Concesionaria, Rentas y
                Registro Automotor.
              </p>
            )
          )}

          <p>
            <strong>
              7)
            </strong>{" "}
            A todos los efectos legales,
            las partes constituyen
            domicilios en los indicados
            precedentemente y se someten a
            la jurisdicción de los
            Tribunales competentes del
            Departamento Confluencia,
            Provincia del Neuquén, con
            renuncia a cualquier otro
            fuero o jurisdicción.
          </p>

          {operacion.observaciones && (
            <div className="condiciones-pago">
              <strong>
                Observaciones:
              </strong>

              <br />

              {
                operacion.observaciones
              }
            </div>
          )}

          <p
            style={{
              marginTop: 10,
            }}
          >
            Se firman dos ejemplares de un
            mismo tenor y a un solo efecto
            en la ciudad de Neuquén, a los{" "}
            <strong>
              {formatearFecha(
                operacion.created_at
              )}
            </strong>
            .
          </p>

          <div className="firmas-usado">
            <div className="firma-usado">
              EL COMPRADOR
              <br />

              {nombreCliente(
                cliente
              )}

              <br />

              DNI/CUIT{" "}
              {documentoCliente(
                cliente
              )}
            </div>

            <div className="firma-usado">
              EL VENDEDOR
              <br />

              MotoCars Concesionaria
            </div>
          </div>
        </section>
      </MotoCarsDocumentoLayout>
            <DetallePagoOperacion
        numero={operacion.numero || operacion.id}
        fecha={formatearFecha(operacion.created_at)}
        mostrar={mostrarDetallePago}
        onToggle={() => setMostrarDetallePago((anterior) => !anterior)}
      />
    </>
  );
}
