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

function formatearFecha(
  fecha: string | null
) {
  if (!fecha) {
    return "—";
  }

  const fechaNormalizada =
    fecha.includes("T")
      ? fecha
      : `${fecha}T12:00:00`;

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      fechaNormalizada
    )
  );
}

export default function ConstanciaGestoriaPage() {
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
    cargando,
    setCargando,
  ] =
    useState(true);

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

        if (
          operacionCargada.tipo_operacion !==
          "venta"
        ) {
          throw new Error(
            "La Constancia de Gestoría en Trámite corresponde a una operación de venta."
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
            "No se encontró el vehículo asociado a la operación."
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
            : "No se pudo cargar la Constancia de Gestoría en Trámite."
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
        Cargando constancia...
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
            "No se pudo cargar la constancia."}
        </p>

        <Link
          href={`/admin/operaciones/${params.id}`}
        >
          Volver a la operación
        </Link>
      </main>
    );
  }

  const fechaConstancia =
    operacion.fecha_entrega ||
    operacion.created_at;

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

        .constancia-texto {
          margin-top: 28px;

          font-size: 12px;
          line-height: 1.75;

          text-align: justify;
        }

        .constancia-texto p {
          margin: 0 0 18px;
        }

        .constancia-texto strong {
          font-weight: 800;
        }

        .datos-constancia {
          margin: 22px 0;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 8px 26px;

          font-size: 11.2px;
        }

        .dato-constancia {
          display: grid;

          grid-template-columns:
            95px 1fr;

          gap: 6px;
        }

        .destacado-constancia {
          margin: 22px 0;

          padding: 14px 16px;

          border:
            1px solid #d4d4d4;

          border-radius: 6px;

          text-align: center;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 0.4px;
        }

        .fecha-constancia {
          margin-top: 28px;

          text-align: right;

          font-size: 11.5px;
          font-weight: 700;
        }

        .firma-gestoria {
          width: 78mm;

          margin:
            155px auto 22px;

          padding-top: 8px;

          border-top:
            1px solid #737373;

          text-align: center;

          font-size: 10px;
          line-height: 1.5;
        }

        @media print {
          .no-imprimir {
            display: none !important;
          }
        }

        @media screen and (max-width: 850px) {
          .datos-constancia {
            grid-template-columns:
              1fr;
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
          onClick={() =>
            window.print()
          }
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <MotoCarsDocumentoLayout
        titulo="Constancia de Gestoría en Trámite"
        numero={
          operacion.numero ||
          operacion.id
        }
        fecha={formatearFecha(
          fechaConstancia
        )}
      >
        <section className="constancia-texto">
          <p>
            Por medio de la presente,{" "}
            <strong>
              Gestoría MotoCars Concesionaria
            </strong>{" "}
            deja constancia de que ha recibido la documentación
            correspondiente al Sr./Sra.{" "}
            <strong>
              {nombreCliente(
                cliente
              )}
            </strong>
            , DNI/CUIT{" "}
            <strong>
              {documentoCliente(
                cliente
              )}
            </strong>
            , con domicilio en{" "}
            <strong>
              {cliente.direccion ||
                "—"}
            </strong>
            {cliente.ciudad && (
              <>
                ,{" "}
                <strong>
                  {cliente.ciudad}
                </strong>
              </>
            )}
            {cliente.provincia && (
              <>
                {" "}
                (
                <strong>
                  {cliente.provincia}
                </strong>
                )
              </>
            )}
            .
          </p>

          <div className="datos-constancia">
            <div className="dato-constancia">
              <strong>
                Marca:
              </strong>

              <span>
                {vehiculo.marca ||
                  "—"}
              </span>
            </div>

            <div className="dato-constancia">
              <strong>
                Modelo:
              </strong>

              <span>
                {[
                  vehiculo.modelo,
                  vehiculo.version,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                  "—"}
              </span>
            </div>

            <div className="dato-constancia">
              <strong>
                Dominio:
              </strong>

              <span>
                {vehiculo.dominio ||
                  (vehiculo.condicion ===
                  "0km"
                    ? "0 KM"
                    : "—")}
              </span>
            </div>

            <div className="dato-constancia">
              <strong>
                Año:
              </strong>

              <span>
                {vehiculo.anio ??
                  "—"}
              </span>
            </div>

            <div className="dato-constancia">
              <strong>
                Chasis:
              </strong>

              <span>
                {vehiculo.numero_chasis ||
                  "—"}
              </span>
            </div>

            <div className="dato-constancia">
              <strong>
                Motor:
              </strong>

              <span>
                {vehiculo.numero_motor ||
                  "—"}
              </span>
            </div>
          </div>

          <p>
            La documentación ha sido recibida con destino al{" "}
            <strong>
              Registro de la Propiedad Automotor
            </strong>{" "}
            correspondiente, para la realización del trámite de{" "}
            <strong>
              TRANSFERENCIA REGISTRAL DE DOMINIO
            </strong>
            .
          </p>

          <div className="destacado-constancia">
            Se extiende la presente CONSTANCIA DE TRANSFERENCIA EN
            TRÁMITE para ser presentada ante quien corresponda.
          </div>

          <p>
            La unidad cuenta con su Seguro Automotor vigente y copia
            de la documentación correspondiente.
          </p>

          <div className="fecha-constancia">
            Neuquén,{" "}
            {formatearFecha(
              fechaConstancia
            )}
          </div>

          <div className="firma-gestoria">
            GESTORÍA MOTOCARS CONCESIONARIA
            <br />
            Firma y sello
          </div>
        </section>
      </MotoCarsDocumentoLayout>
    </>
  );
}
