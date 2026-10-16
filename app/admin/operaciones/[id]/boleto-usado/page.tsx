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
  DOCUMENTACION_INICIAL,
  OPCIONES_DOCUMENTACION,
  obtenerDocumentacionEntrega,
  guardarDocumentacionEntrega,
  type DocumentacionEntrega,
} from "@/lib/service/documentacion-entrega";


function nombreCliente(cliente: Cliente) {
  if (cliente.tipo_persona === "juridica") {
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

function documentoCliente(cliente: Cliente) {
  return cliente.cuit || cliente.dni || "—";
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

function formatearImporte(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha));
}

export default function BoletoUsadoPage() {
  
const [documentacion, setDocumentacion] =
  useState<DocumentacionEntrega>({
    ...DOCUMENTACION_INICIAL,
  });

const [guardandoDocumentacion, setGuardandoDocumentacion] =
  useState(false);

const [errorDocumentacion, setErrorDocumentacion] =
  useState("");

const [documentacionGuardada, setDocumentacionGuardada] =
  useState(false);

  const [mostrarDetallePago, setMostrarDetallePago] = useState(false);
  const params =
    useParams<{
      id: string;
    }>();

  const [operacion, setOperacion] =
    useState<Operacion | null>(null);

  const [cliente, setCliente] =
    useState<Cliente | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(
      null
    );

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const operacionId =
        Number(params.id);

      if (
        !Number.isInteger(operacionId) ||
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
  documentacionCargada,
] = await Promise.all([
  obtenerCliente(
    operacionCargada.cliente_id
  ),

  obtenerVehiculoPorId(
    operacionCargada.vehiculo_id
  ),

  obtenerDocumentacionEntrega(
    operacionId
  ),
]);


        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo vendido."
          );
        }

        if (
          vehiculoCargado.condicion !==
          "usado"
        ) {
          throw new Error(
            "El vehículo de esta operación no corresponde a un usado."
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
        setDocumentacion(documentacionCargada);
setDocumentacionGuardada(true);
      } catch (
        errorDesconocido
      ) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el boleto de venta."
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
  
async function guardarDocumentacion() {
  const operacionId = Number(params.id);

  if (!Number.isSafeInteger(operacionId) || operacionId <= 0) {
    setErrorDocumentacion("Operación inválida.");
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


  if (cargando) {
    return (
      <main style={{ padding: 32 }}>
        Cargando boleto de venta...
      </main>
    );
  }

  if (
    error ||
    !operacion ||
    !cliente ||
    !vehiculo
  ) {
    return (
      <main style={{ padding: 32 }}>
        <p style={{ color: "#b91c1c" }}>
          {error ||
            "No se pudo cargar el boleto de venta."}
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
          margin-top: 5px;

          font-size: 11.2px;
          line-height: 1.35;

          text-align: justify;
        }

        .boleto-usado-texto p {
          margin: 0 0 2px;
        }

        .boleto-usado-texto strong {
          font-weight: 800;
        }

        .titulo-seccion-usado {
          margin: 6px 0 4px;

          padding-bottom: 5px;

          border-bottom:
            1px solid #d4d4d4;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.8px;

          text-transform: uppercase;
        }

        .datos-usado {
          display: grid;

          grid-template-columns:
  repeat(3, minmax(0, 1fr));

          gap: 2px 24px;

          font-size: 10.8px;
        }

        .dato-usado {
          display: grid;

          grid-template-columns:
            auto minmax(0, 1fr);

          gap: 6px;
        }

        .condiciones-pago {
  margin-top: 4px;
  padding: 5px 12px;
  border: 1px solid #d4d4d4;
  border-radius: 6px;
  font-size: 10.8px;
  line-height: 1.25;
  white-space: pre-wrap;
}

        .firmas-usado {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 70px;

          margin-top: 40px;
          margin-bottom: 20px;
        }

        .firma-usado {
          padding-top: 8px;

          border-top:
            1px solid #737373;

          text-align: center;

          font-size: 10px;
          line-height: 1.45;
        }

        @media print {
  .no-imprimir {
    display: none !important;
  }
    .documento-pie {
  position: relative !important;
  top: 0 !important;
  margin-top: 0 !important;
}

  .documento-motocars {
    display: flex !important;
    min-height: 297mm !important;
    height: auto !important;
  }

  .documento-contenido {
    flex: 1 !important;
  }
        }

        @media screen and (max-width: 850px) {
          .datos-usado {
            grid-template-columns: 1fr;
          }

          .firmas-usado {
            gap: 30px;
          }
        }
      `}</style>

<div
  className="no-imprimir"
  style={{
    maxWidth: 794,
    margin: "16px auto",
    padding: 20,
    background: "#fff",
    border: "1px solid #d4d4d4",
    borderRadius: 8,
  }}
>
  <h3 style={{ marginTop: 0 }}>
    Documentación y elementos entregados al comprador
  </h3>

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
    className="boton-documento boton-principal"
    onClick={guardarDocumentacion}
    disabled={guardandoDocumentacion}
    style={{ marginTop: 16 }}
  >
    {guardandoDocumentacion
      ? "Guardando..."
      : "Guardar documentación"}
  </button>

  {documentacionGuardada && (
    <p style={{ color: "#166534" }}>
      Documentación guardada.
    </p>
  )}

  {errorDocumentacion && (
    <p style={{ color: "#b91c1c" }}>
      {errorDocumentacion}
    </p>
  )}
</div>

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
  automotor usado.
</p>

         <h2 className="titulo-seccion-usado">
  Datos del comprador
</h2>


<div
  style={{
    display: "grid",
    gridTemplateColumns: "1.3fr 1.2fr 0.9fr",
    gap: "4px 12px",
    fontSize: "11.5px",
  }}
>
  <div className="dato-usado">
    <strong>Comprador:</strong>
    <span>{nombreCliente(cliente)}</span>
  </div>

  <div className="dato-usado">
    <strong>DNI/CUIT:</strong>
    <span>{documentoCliente(cliente)}</span>
  </div>

  <div className="dato-usado">
    <strong>Fecha nac.:</strong>
    <span>
      {cliente.fecha_nacimiento
        ? formatearFecha(cliente.fecha_nacimiento)
        : "—"}
    </span>
  </div>

  <div className="dato-usado">
    <strong>Estado civil:</strong>
    <span>{cliente.estado_civil || "—"}</span>
  </div>

  <div className="dato-usado">
    <strong>Profesión:</strong>
    <span>{cliente.profesion || "—"}</span>
  </div>

  <div className="dato-usado">
    <strong>Teléfono:</strong>
    <span>{cliente.whatsapp || cliente.telefono || "—"}</span>
  </div>

  <div className="dato-usado">
    <strong>Domicilio:</strong>
    <span>{cliente.direccion || "—"}</span>
  </div>

  <div className="dato-usado">
  <strong>Localidad:</strong>
<span style={{ textAlign: "left" }}>
  {cliente.ciudad || "—"}
</span>
</div>

<div className="dato-usado">
  <strong>Provincia:</strong>
  <span>{cliente.provincia || "—"}</span>
</div>

  <div
  className="dato-usado"
  style={{
    gridColumn: "1 / -1",
    gridTemplateColumns: "auto 1fr",
    justifySelf: "start",
  }}
>
  <strong>Email:</strong>
  <span>{cliente.email || "—"}</span>
</div>

  {cliente.estado_civil === "Casado/a" && (
    <>
      <div className="dato-usado">
        <strong>Cónyuge:</strong>
        <span>{cliente.conyuge_nombre || "—"}</span>
      </div>

      <div className="dato-usado">
        <strong>DNI cónyuge:</strong>
        <span>{cliente.conyuge_dni || "—"}</span>
      </div>
    </>
  )}
</div>

          <h2 className="titulo-seccion-usado">
            Vehículo vendido
          </h2>

          <div className="datos-usado">
            <div className="dato-usado">
              <strong>
                Vehículo:
              </strong>

              <span>
                {nombreVehiculo(
                  vehiculo
                )}
              </span>
            </div>

            <div className="dato-usado">
              <strong>Año:</strong>

              <span>
                {vehiculo.anio ??
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Dominio:
              </strong>

              <span>
                {vehiculo.dominio ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Color:
              </strong>

              <span>
                {vehiculo.color ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Chasis:
              </strong>

              <span>
                {vehiculo.numero_chasis ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Motor:
              </strong>

              <span>
                {vehiculo.numero_motor ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Kilómetros:
              </strong>

              <span>
                {vehiculo.kilometros != null
  ? new Intl.NumberFormat("es-AR").format(vehiculo.kilometros)
  : "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Condición:
              </strong>

              <span>
                Usado
              </span>
            </div>
          </div>

          <p style={{ marginTop: 15 }}>
  <strong>1)</strong>{" "}
  EL VENDEDOR vende a EL COMPRADOR el vehículo usado
  individualizado precedentemente, el cual ha sido examinado,
  probado y verificado por el adquirente, quien manifiesta conocer
  su estado general de uso y conservación.
</p>

<p>
  El precio total de la operación se establece en la suma de{" "}
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
          {operacion.importe_reserva !== null &&
            operacion.importe_reserva > 0 && (
              <div className="condiciones-pago">
                <strong>Precio total de venta:</strong>{" "}
                {formatearImporteCompleto(
                  operacion.precio_vehiculo,
                  "ARS"
                )}

                <br />

                <strong>Reserva abonada:</strong>{" "}
                {formatearImporteCompleto(
                  operacion.importe_reserva,
                  "ARS"
                )}

                <br />

                <strong>Saldo pendiente:</strong>{" "}
                {formatearImporteCompleto(
                  Math.max(
                    0,
                    operacion.precio_vehiculo -
                      operacion.importe_reserva
                  ),
                  "ARS"
                )}
              </div>
            )}
<div className="condiciones-pago">
  <strong>
    Forma de pago:
  </strong>{" "}
  {operacion.forma_pago ||
    "A definir"}

  {operacion.detalle_pago && (
    <>
      <br />
      <br />

      <strong>
        Detalle:
      </strong>{" "}
      {operacion.detalle_pago}
    </>
  )}
</div>


<p style={{ marginTop: 14 }}>
  <strong>2)</strong>{" "}
  En este acto se entrega al COMPRADOR la siguiente
  documentación y elementos:{" "}
  {OPCIONES_DOCUMENTACION
    .filter((opcion) => documentacion[opcion.campo])
    .map((opcion, indice) =>
      `${String.fromCharCode(97 + indice)}) ${opcion.nombre}`
    )
    .join("; ") || "Ninguno declarado"}
  .

  {documentacion.observaciones.trim() && (
    <>
      {" "}
      <strong>Observaciones:</strong>{" "}
      {documentacion.observaciones.trim()}
    </>
  )}
</p>


<p>
  <strong>3)</strong>{" "}
  Los gastos de gestoría correspondientes a la inscripción de la
  unidad adquirida por EL COMPRADOR serán gestionados por la
  Gestoría de la Concesionaria y se componen de aranceles
  registrales, formularios, sellados provinciales, carpeta prendaria
  —si correspondiera— y honorarios.
</p>

{operacion.gastos_gestoria_incluidos ? (
  <p>
    <strong>
      GASTOS DE GESTORÍA INCLUIDOS EN LA OPERACIÓN.
    </strong>
  </p>
) : (
  operacion.gastos_gestoria > 0 && (
    <p>
      La cotización correspondiente asciende a la suma de{" "}
      <strong>
        {formatearImporteCompleto(
          operacion.gastos_gestoria,
          "ARS"
        )}
      </strong>
      , pagaderos conforme indique EL VENDEDOR, pudiendo comprender
      pagos en efectivo y/o en las cuentas correspondientes a la
      Concesionaria, Rentas y Registro Automotor.
    </p>
  )
)}

<p>
  <strong>4)</strong>{" "}
  EL COMPRADOR suscribirá, antes del retiro de la unidad, la
  correspondiente Responsabilidad Civil, haciéndose responsable
  desde la entrega del vehículo por los daños que pudiera ocasionar
  con la unidad, así como por las multas e infracciones que pudieran
  generarse a partir de dicho momento.
</p>

<p>
  <strong>5)</strong>{" "}
  EL COMPRADOR declara haber sido informado de que la transferencia
  dominial de la unidad se encuentra en inicio de trámite y se le
  emite la respectiva Constancia de Transferencia en Trámite para ser
  presentada a quien corresponda.
</p>

<p>
  <strong>6)</strong>{" "}
  A todos los efectos legales, las partes constituyen domicilios en
  los indicados precedentemente y se someten a la jurisdicción de
  los Tribunales competentes del Departamento Confluencia, Provincia
  del Neuquén, con renuncia a cualquier otro fuero o jurisdicción.
</p>

{operacion.observaciones && (
  <div className="condiciones-pago">
    <strong>
      Observaciones:
    </strong>
    <br />

    {operacion.observaciones}
  </div>
)}

<p style={{ marginTop: 13 }}>
  Se firman dos ejemplares de un mismo tenor y a un solo efecto en
  la ciudad de Neuquén, a los{" "}
  <strong>
    {formatearFecha(
      operacion.created_at
    )}
  </strong>
  .
</p>
          <div className="firmas-usado" style={{ transform: "translateY(25px)" }}>
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
