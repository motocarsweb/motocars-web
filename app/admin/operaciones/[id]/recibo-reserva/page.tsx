"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MotoCarsDocumentoLayout from "@/componentes/documentos/MotoCarsDocumentoLayout";

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
    }`.trim() || "Cliente sin nombre"
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


function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${fecha}T12:00:00`));
}


export default function ReciboReservaPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const [
    operacion,
    setOperacion,
  ] =
    useState<Operacion | null>(null);

  const [
    cliente,
    setCliente,
  ] =
    useState<Cliente | null>(null);

  const [
    vehiculo,
    setVehiculo,
  ] =
    useState<VehiculoSupabase | null>(null);

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
            "El Recibo de Reserva corresponde a una operación de venta."
          );
        }

        const [
          clienteCargado,
          vehiculoCargado,
        ] =
          await Promise.all([
            obtenerCliente(
              operacionCargada.cliente_id
            ),

            obtenerVehiculoPorId(
              operacionCargada.vehiculo_id
            ),
          ]);

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró la unidad reservada."
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
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el Recibo de Reserva."
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
      <main style={{ padding: 32 }}>
        Cargando Recibo de Reserva...
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
            "No se pudo cargar el Recibo de Reserva."}
        </p>

        <Link
          href={`/admin/operaciones/${params.id}`}
        >
          Volver a la operación
        </Link>
      </main>
    );
  }


  const importeReserva =
    operacion.importe_reserva ?? 0;

  const fechaReserva =
    operacion.fecha_reserva ||
    operacion.created_at.slice(0, 10);


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

        .reserva-contenido {
          margin-top: 24px;

          font-size: 13px;
          line-height: 1.55;
        }

        .reserva-contenido p {
          margin: 0 0 14px;
        }

        .titulo-seccion-reserva {
          margin: 20px 0 8px;

          padding-bottom: 5px;

          border-bottom:
            1px solid #d4d4d4;

          font-size: 11.5px;
          font-weight: 800;

          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .datos-reserva {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 6px 22px;

          font-size: 12px;
        }

        .dato-reserva {
          display: grid;

          grid-template-columns:
            95px 1fr;

          gap: 6px;
        }

        .importe-reserva {
          margin-top: 22px;

          padding: 15px;

          border: 1px solid #bdbdbd;
          border-radius: 7px;

          font-size: 13px;
          line-height: 1.5;
        }

        .importe-reserva strong {
          font-weight: 800;
        }

        .forma-pago-reserva {
          margin-top: 12px;

          padding: 12px;

          border: 1px solid #d4d4d4;
          border-radius: 6px;

          white-space: pre-wrap;
        }

        .firmas-reserva {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 70px;

          margin-top: 110px;
          margin-bottom: 10px;
        }

        .firma-reserva {
          padding-top: 7px;

          border-top:
            1px solid #737373;

          text-align: center;

          font-size: 10.5px;
          line-height: 1.35;
        }

        @media print {
          .no-imprimir {
            display: none !important;
          }
        }
      `}</style>

      <div className="barra-documento no-imprimir">
        <Link
          href={`/admin/operaciones/${operacion.id}`}
          className="boton-documento"
        >
          Volver a la operación
        </Link>

        <button
          type="button"
          className="boton-documento boton-principal"
          onClick={() => window.print()}
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <MotoCarsDocumentoLayout
        titulo="RECIBO DE RESERVA"
        numero={
          operacion.numero ||
          operacion.id
        }
        fecha={formatearFecha(
          fechaReserva
        )}
      >
        <section className="reserva-contenido">
          <p>
            Recibimos de{" "}
            <strong>
              {nombreCliente(cliente)}
            </strong>
            , DNI/CUIT{" "}
            <strong>
              {documentoCliente(cliente)}
            </strong>
            , la suma de{" "}
            <strong>
              {formatearImporteCompleto(
                importeReserva,
                operacion.moneda
              )}
            </strong>
            , en concepto de{" "}
            <strong>
              RESERVA Y ANTICIPO DEL
              PRECIO DE COMPRA
            </strong>{" "}
            de la unidad que se detalla
            a continuación.
          </p>

          <div className="titulo-seccion-reserva">
            Datos del comprador
          </div>

          <div className="datos-reserva">
            <div className="dato-reserva">
              <strong>Nombre</strong>
              <span>
                {nombreCliente(cliente)}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>DNI/CUIT</strong>
              <span>
                {documentoCliente(cliente)}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>Domicilio</strong>
              <span>
                {cliente.direccion || "—"}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>Localidad</strong>
              <span>
                {cliente.ciudad || "—"}
              </span>
            </div>
          </div>

          <div className="titulo-seccion-reserva">
            Unidad reservada
          </div>

          <div className="datos-reserva">
            <div className="dato-reserva">
              <strong>Vehículo</strong>
              <span>
                {nombreVehiculo(vehiculo)}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>Año</strong>
              <span>
                {vehiculo.anio || "—"}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>Color</strong>
              <span>
                {vehiculo.color || "—"}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>Dominio</strong>
              <span>
                {vehiculo.dominio || "—"}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>Chasis</strong>
              <span>
                {vehiculo.numero_chasis || "—"}
              </span>
            </div>

            <div className="dato-reserva">
              <strong>Motor</strong>
              <span>
                {vehiculo.numero_motor || "—"}
              </span>
            </div>
          </div>

          <div className="importe-reserva">
            <strong>
              Importe recibido:{" "}
            </strong>

            {formatearImporteCompleto(
              importeReserva,
              operacion.moneda
            )}
          </div>

          <div className="titulo-seccion-reserva">
            Forma de entrega de la reserva
          </div>

          <div className="forma-pago-reserva">
            <strong>
              {operacion.forma_pago_reserva ||
                "No especificada"}
            </strong>

            {operacion.detalle_pago_reserva
              ? `\n${operacion.detalle_pago_reserva}`
              : ""}
          </div>

          {operacion.reserva_hasta && (
            <p
              style={{
                marginTop: 16,
              }}
            >
              La presente reserva se
              mantiene vigente hasta el{" "}
              <strong>
                {formatearFecha(
                  operacion.reserva_hasta
                )}
              </strong>
              .
            </p>
          )}

          <p
            style={{
              marginTop: 18,
            }}
          >
            El importe recibido será
            imputado al precio de compra
            de la unidad al formalizarse
            la operación mediante la
            documentación correspondiente.
          </p>

          <div className="firmas-reserva">
            <div className="firma-reserva">
              Firma del comprador
              <br />
              {nombreCliente(cliente)}
              <br />
              DNI/CUIT:{" "}
              {documentoCliente(cliente)}
            </div>

            <div className="firma-reserva">
              MotoCars Concesionaria
              <br />
              Firma y aclaración
            </div>
          </div>
        </section>
      </MotoCarsDocumentoLayout>
    </>
  );
}