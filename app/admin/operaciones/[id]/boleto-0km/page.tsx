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
  obtenerIngresoUsadoPorOperacion,
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

export default function Boleto0KmPage() {
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
          "0km"
        ) {
          throw new Error(
            "El vehículo vendido no corresponde a un 0 km."
          );
        }

        if (
          ingresoCargado?.tipo_ingreso ===
          "permuta"
        ) {
          throw new Error(
            "Esta venta posee una unidad recibida en permuta. Corresponde utilizar el boleto 0 km con permuta."
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
            : "No se pudo cargar el boleto de venta 0 km."
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
        Cargando boleto de venta 0 km...
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
            "No se pudo cargar el boleto de venta 0 km."}
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

        .boleto-0km-texto {
          margin-top: 16px;

          font-size: 12.5px;
          line-height: 1.42;

          text-align: justify;
        }

        .boleto-0km-texto p {
          margin: 0 0 9px;
        }

        .boleto-0km-texto strong {
          font-weight: 800;
        }

        .titulo-seccion-0km {
          margin: 12px 0 6px;

          padding-bottom: 4px;

          border-bottom:
            1px solid #d4d4d4;

          font-size: 11.5px;
          font-weight: 800;

          letter-spacing: 0.6px;

          text-transform: uppercase;
        }

        .datos-0km {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 4px 20px;

          font-size: 11.5px;
        }

        .dato-0km {
          display: grid;

          grid-template-columns:
            88px 1fr;

          gap: 5px;
        }

        .condiciones-pago {
          margin-top: 6px;

          padding: 8px 10px;

          border: 1px solid #d4d4d4;
          border-radius: 6px;

          font-size: 11.5px;

          white-space: pre-wrap;
        }

        .firmas-0km {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 70px;

          margin-top: 100px;
          margin-bottom: 10px;
        }

        .firma-0km {
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

        @media screen and (max-width: 850px) {
          .datos-0km {
            grid-template-columns: 1fr;
          }

          .firmas-0km {
            gap: 30px;
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
        titulo="Contrato de Compra-Venta de Automotores"
        numero={
          operacion.numero ||
          operacion.id
        }
        fecha={formatearFecha(
          operacion.created_at
        )}
      >
        <section className="boleto-0km-texto">
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
  automotor 0 km.
</p>

          <h2 className="titulo-seccion-0km">
  Datos del comprador
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4px 20px",
    fontSize: "11.5px",
  }}
>
  {/* COLUMNA IZQUIERDA */}
  <div
    style={{
      display: "grid",
      alignContent: "start",
      gap: "4px",
    }}
  >
    <div className="dato-0km">
      <strong>
        Comprador:
      </strong>

      <span>
        {nombreCliente(cliente)}
      </span>
    </div>

    <div className="dato-0km">
      <strong>
        Fecha nac.:
      </strong>

      <span>
        {cliente.fecha_nacimiento
          ? formatearFecha(
              cliente.fecha_nacimiento
            )
          : "—"}
      </span>
    </div>

    <div className="dato-0km">
      <strong>
        Estado civil:
      </strong>

      <span>
        {cliente.estado_civil || "—"}
      </span>
    </div>

    <div className="dato-0km">
      <strong>
        Domicilio:
      </strong>

      <span>
        {cliente.direccion || "—"}
      </span>
    </div>

    <div className="dato-0km">
      <strong>
        Teléfono:
      </strong>

      <span>
        {cliente.whatsapp ||
          cliente.telefono ||
          "—"}
      </span>
    </div>
  </div>

  {/* COLUMNA DERECHA */}
  <div
    style={{
      display: "grid",
      alignContent: "start",
      gap: "4px",
    }}
  >
    <div className="dato-0km">
      <strong>
        DNI/CUIT:
      </strong>

      <span>
        {documentoCliente(cliente)}
      </span>
    </div>

    <div className="dato-0km">
      <strong>
        Profesión:
      </strong>

      <span>
        {cliente.profesion || "—"}
      </span>
    </div>

    {cliente.estado_civil === "Casado/a" && (
      <>
        <div className="dato-0km">
          <strong>
            Cónyuge:
          </strong>

          <span>
            {cliente.conyuge_nombre || "—"}
          </span>
        </div>

        <div className="dato-0km">
          <strong>
            DNI cónyuge:
          </strong>

          <span>
            {cliente.conyuge_dni || "—"}
          </span>
        </div>
      </>
    )}

    <div className="dato-0km">
      <strong>
        Localidad:
      </strong>

      <span>
        {[
          cliente.ciudad,
          cliente.provincia,
        ]
          .filter(Boolean)
          .join(", ") || "—"}
      </span>
    </div>

    <div className="dato-0km">
      <strong>
        Email:
      </strong>

      <span>
        {cliente.email || "—"}
      </span>
    </div>
  </div>
</div>

          <h2 className="titulo-seccion-0km">
            Forma de pago
          </h2>

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
                {
                  operacion.detalle_pago
                }
              </>
            )}
          </div>

          <p
            style={{
              marginTop: 10,
            }}
          >
            <strong>
              2)
            </strong>{" "}
            Una vez inscripta la unidad
            0 km se entregará a EL
            COMPRADOR, según corresponda,
            la siguiente documentación y
            elementos: a) Constancia de
            Cédula de identificación del
            titular digital; b) CAT o
            Título digital; c) Manuales;
            d) Duplicado de llave.
          </p>

          <p>
            <strong>
              3)
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
              4)
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

          <div className="firmas-0km">
            <div className="firma-0km">
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

            <div className="firma-0km">
              EL VENDEDOR
              <br />

              MotoCars Concesionaria
            </div>
          </div>
        </section>
      </MotoCarsDocumentoLayout>
    </>
  );
}
