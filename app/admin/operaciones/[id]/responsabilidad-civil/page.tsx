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

function nombreCliente(cliente: Cliente) {
  if (cliente.tipo_persona === "juridica") {
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

function tipoVehiculo(
  vehiculo: VehiculoSupabase
) {
  const vehiculoConTipo =
    vehiculo as VehiculoSupabase & {
      tipo?: string | null;
    };

  return (
    vehiculoConTipo.tipo ||
    "Automotor"
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
      month: "2-digit",
      year: "numeric",
    }
  ).format(
    new Date(
      fechaNormalizada
    )
  );
}

function formatearHora(
  hora: string | null
) {
  if (!hora) {
    return "—";
  }

  return hora.slice(0, 5);
}

export default function ResponsabilidadCivilPage() {
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
            "La Responsabilidad Civil corresponde a una operación de venta."
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
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar la Responsabilidad Civil."
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
        Cargando Responsabilidad Civil...
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
            "No se pudo cargar la Responsabilidad Civil."}
        </p>

        <Link
          href={`/admin/operaciones/${params.id}`}
        >
          Volver a la operación
        </Link>
      </main>
    );
  }

  const fechaResponsabilidad =
    operacion.fecha_entrega ||
    operacion.created_at;

  const horaResponsabilidad =
    operacion.hora_entrega;

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          background: #eef1f5;
        }

        .barra-documento {
          width: min(210mm, calc(100% - 32px));
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

        .responsabilidad-texto {
          margin-top: 24px;
          font-size: 11.6px;
          line-height: 1.65;
          text-align: justify;
        }

        .responsabilidad-texto p {
          margin: 0 0 14px;
        }

        .responsabilidad-texto strong {
          font-weight: 800;
        }

        .datos-responsabilidad {
          margin: 18px 0;
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 7px 24px;
          font-size: 11px;
        }

        .dato-responsabilidad {
          display: grid;
          grid-template-columns: 92px 1fr;
          gap: 6px;
        }

        .momento-entrega {
          margin: 18px 0;
          padding: 12px;
          border: 1px solid #cfcfcf;
          border-radius: 6px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .observaciones-responsabilidad {
          margin-top: 18px;
          min-height: 58px;
          padding: 10px 12px;
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          font-size: 10.5px;
          white-space: pre-wrap;
        }

        .firma-responsabilidad {
          width: 75mm;
          margin: 145px auto 22px;
          padding-top: 8px;
          border-top: 1px solid #737373;
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
          .datos-responsabilidad {
            grid-template-columns: 1fr;
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
        titulo="Responsabilidad Civil"
        numero={
          operacion.numero ||
          operacion.id
        }
        fecha={formatearFecha(
          fechaResponsabilidad
        )}
      >
        <section className="responsabilidad-texto">
          <p>
            Recibí conforme de{" "}
            <strong>
              MOTOCARS CONCESIONARIA
            </strong>{" "}
            el vehículo individualizado a continuación, en el estado en
            que se encuentra y a mi entera conformidad.
          </p>

          <div className="datos-responsabilidad">
            <div className="dato-responsabilidad">
              <strong>Marca:</strong>
              <span>
                {vehiculo.marca || "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>Modelo:</strong>
              <span>
                {[
                  vehiculo.modelo,
                  vehiculo.version,
                ]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>Tipo:</strong>
              <span>
                {tipoVehiculo(
                  vehiculo
                )}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>Dominio:</strong>
              <span>
                {vehiculo.dominio ||
                  (vehiculo.condicion === "0km"
                    ? "0 KM"
                    : "—")}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>Chasis:</strong>
              <span>
                {vehiculo.numero_chasis ||
                  "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>Motor:</strong>
              <span>
                {vehiculo.numero_motor ||
                  "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>Año:</strong>
              <span>
                {vehiculo.anio ?? "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>Vehículo:</strong>
              <span>
                {nombreVehiculo(
                  vehiculo
                )}
              </span>
            </div>
          </div>

          <p>
            Declaro tener pleno conocimiento del Régimen Jurídico del
            Automotor y de la obligación de efectuar la inscripción
            dominial correspondiente ante el Registro Nacional de la
            Propiedad del Automotor.
          </p>

          <p>
            Me hago responsable civil y penalmente, a partir de la fecha
            y hora indicadas en el presente documento, por cualquier
            accidente, daño o perjuicio que pudiera ocasionar con el
            vehículo, así como por las multas e infracciones que pudieran
            generarse con motivo de su utilización, asumiendo las
            consecuencias que correspondan mientras la unidad no se
            encuentre inscripta a mi nombre.
          </p>

          <div className="momento-entrega">
            Desde el día{" "}
            {formatearFecha(
              fechaResponsabilidad
            )}{" "}
            a las{" "}
            {formatearHora(
              horaResponsabilidad
            )}{" "}
            horas.
          </div>

          <div className="datos-responsabilidad">
            <div className="dato-responsabilidad">
              <strong>
                Nombre:
              </strong>

              <span>
                {nombreCliente(
                  cliente
                )}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>
                DNI/CUIT:
              </strong>

              <span>
                {documentoCliente(
                  cliente
                )}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>
                Domicilio:
              </strong>

              <span>
                {cliente.direccion ||
                  "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>
                Localidad:
              </strong>

              <span>
                {[
                  cliente.ciudad,
                  cliente.provincia,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                  "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>
                Teléfono:
              </strong>

              <span>
                {cliente.whatsapp ||
                  cliente.telefono ||
                  "—"}
              </span>
            </div>

            <div className="dato-responsabilidad">
              <strong>
                Email:
              </strong>

              <span>
                {cliente.email ||
                  "—"}
              </span>
            </div>
          </div>

          <div className="observaciones-responsabilidad">
            <strong>
              Observaciones:
            </strong>

            <br />

            {operacion.observaciones ||
              ""}
          </div>

          <div className="firma-responsabilidad">
            FIRMA DEL COMPRADOR
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
        </section>
      </MotoCarsDocumentoLayout>
    </>
  );
}
