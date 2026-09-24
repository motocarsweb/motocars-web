"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import MotoCarsDocumentoLayout from "@/componentes/documentos/MotoCarsDocumentoLayout";

import {
  obtenerPresupuesto,
  type Presupuesto,
} from "@/lib/service/presupuestos";

import {
  obtenerVehiculoPorId,
  type VehiculoSupabase,
} from "@/lib/supabase-vehicles";

function formatearImporte(valor: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatearFecha(fecha: string | null) {
  if (!fecha) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(`${fecha.slice(0, 10)}T00:00:00Z`)
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

export default function PresupuestoDocumentoPage() {
  const params = useParams<{ id: string }>();

  const [presupuesto, setPresupuesto] =
    useState<Presupuesto | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const presupuestoId = Number(params.id);

      if (
        !Number.isInteger(presupuestoId) ||
        presupuestoId <= 0
      ) {
        setError(
          "El identificador del presupuesto no es válido."
        );
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const presupuestoCargado =
          await obtenerPresupuesto(
            presupuestoId
          );

        const vehiculoCargado =
          await obtenerVehiculoPorId(
            presupuestoCargado.vehiculo_id
          );

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo del presupuesto."
          );
        }

        if (!activo) {
          return;
        }

        setPresupuesto(
          presupuestoCargado
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
            : "No se pudo cargar el presupuesto."
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
        Cargando presupuesto...
      </main>
    );
  }

  if (error || !presupuesto || !vehiculo) {
    return (
      <main style={{ padding: 32 }}>
        <p style={{ color: "#b91c1c" }}>
          {error ||
            "No se pudo cargar el presupuesto."}
        </p>

        <Link href="/admin/presupuestos">
          Volver a presupuestos
        </Link>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #eef1f5;
          color: #171717;
          font-family: Arial, Helvetica, sans-serif;
        }

        .barra-presupuesto {
          width: min(210mm, calc(100% - 32px));
          margin: 24px auto 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .boton-presupuesto {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0 16px;
          border: 1px solid #d4d4d4;
          border-radius: 8px;
          background: white;
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

        .seccion-presupuesto {
          margin-top: 18px;
        }

        .titulo-seccion {
          margin: 0 0 9px;
          padding-bottom: 6px;
          border-bottom: 1px solid #cbd5e1;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .grilla-datos {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 7px 24px;
          font-size: 12px;
        }

        .dato {
          display: grid;
          grid-template-columns: 90px 1fr;
          gap: 8px;
          min-height: 20px;
          line-height: 1.4;
        }

        .dato strong {
          font-weight: 600;
        }

        .vehiculo-destacado {
          padding: 13px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
        }

        .vehiculo-nombre {
          margin: 0 0 10px;
          font-size: 19px;
          font-weight: 700;
        }

        .tabla-importes {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .tabla-importes td {
          padding: 8px 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        .tabla-importes td:last-child {
          width: 190px;
          text-align: right;
          font-weight: 600;
        }

        .fila-resta td:last-child {
          color: #991b1b;
        }

        .fila-total td {
          padding-top: 12px;
          padding-bottom: 12px;
          border-top: 2px solid #171717;
          border-bottom: 0;
          background: #f3f4f6;
          font-size: 17px;
          font-weight: 800;
        }

        .texto-condicion {
          min-height: 32px;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          font-size: 12px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .observaciones {
          min-height: 60px;
        }

        .condiciones {
          margin-top: 18px;
          font-size: 10px;
          line-height: 1.5;
          color: #525252;
        }

                .firmas {
          position: absolute;
          left: 14mm;
          right: 14mm;
          bottom: 34mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 65px;
        }
          .firmas-con-permuta {
  position: static;
  margin-top: 40px;
}

        .firma {
          padding-top: 7px;
          border-top: 1px solid #737373;
          text-align: center;
          font-size: 10px;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          aside,
          header,
          .no-imprimir {
            display: none !important;
          }

          body > div,
          body > div > div,
          body > div > div > div {
            display: block !important;
            width: 100% !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          main {
            margin: 0 !important;
          }
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media screen and (max-width: 850px) {
          .grilla-datos {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="barra-presupuesto no-imprimir">
        <Link
          href={`/admin/presupuestos/${presupuesto.id}`}
          className="boton-presupuesto"
        >
          Volver al seguimiento
        </Link>

        <button
          type="button"
          className="boton-presupuesto boton-principal"
          onClick={() => window.print()}
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <MotoCarsDocumentoLayout
        titulo="Presupuesto"
        numero={
          presupuesto.numero ||
          `P-${presupuesto.id}`
        }
        fecha={formatearFecha(
          presupuesto.fecha
        )}
      >
        <section className="seccion-presupuesto">
          <h2 className="titulo-seccion">
            Datos del cliente
          </h2>

          <div className="grilla-datos">
            <div className="dato">
              <strong>Cliente:</strong>
              <span>
                {presupuesto.nombre_cliente ||
                  "—"}
              </span>
            </div>

            <div className="dato">
              <strong>DNI / CUIT:</strong>
              <span>
                {presupuesto.documento || "—"}
              </span>
            </div>

            <div className="dato">
              <strong>Teléfono:</strong>
              <span>
                {presupuesto.telefono || "—"}
              </span>
            </div>

            <div className="dato">
              <strong>Email:</strong>
              <span>
                {presupuesto.email || "—"}
              </span>
            </div>

            <div className="dato">
              <strong>Ciudad:</strong>
              <span>
                {presupuesto.ciudad || "—"}
              </span>
            </div>

            <div className="dato">
              <strong>Dirección:</strong>
              <span>
                {presupuesto.direccion || "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="seccion-presupuesto">
          <h2 className="titulo-seccion">
            Vehículo ofrecido
          </h2>

          <div className="vehiculo-destacado">
            <h3 className="vehiculo-nombre">
              {nombreVehiculo(vehiculo)}
            </h3>

            <div className="grilla-datos">
              <div className="dato">
                <strong>Año:</strong>
                <span>
                  {vehiculo.anio ?? "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Condición:</strong>
                <span>
                  {vehiculo.condicion ||
                    vehiculo.estado ||
                    "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Tipo:</strong>
                <span>
                  {vehiculo.tipo || "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Color:</strong>
                <span>
                  {vehiculo.color || "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Kilómetros:</strong>
                <span>
                  {vehiculo.kilometros !== null
                    ? new Intl.NumberFormat(
                        "es-AR"
                      ).format(
                        vehiculo.kilometros
                      )
                    : "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Combustible:</strong>
                <span>
                  {vehiculo.combustible ||
                    "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Transmisión:</strong>
                <span>
                  {vehiculo.transmision ||
                    "—"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {presupuesto.valor_permuta > 0 && (
          <section className="seccion-presupuesto">
            <h2 className="titulo-seccion">
              Vehículo recibido en permuta
            </h2>

            <div className="vehiculo-destacado">
              <div className="grilla-datos">
                <div className="dato">
                  <strong>Marca:</strong>
                  <span>
                    {presupuesto.permuta_marca ||
                      "—"}
                  </span>
                </div>

                <div className="dato">
                  <strong>Modelo:</strong>
                  <span>
                    {presupuesto.permuta_modelo ||
                      "—"}
                  </span>
                </div>

                <div className="dato">
                  <strong>Año:</strong>
                  <span>
                    {presupuesto.permuta_anio ??
                      "—"}
                  </span>
                </div>

                <div className="dato">
                  <strong>Kilómetros:</strong>
                  <span>
                    {presupuesto.permuta_kilometros !==
                    null
                      ? new Intl.NumberFormat(
                          "es-AR"
                        ).format(
                          presupuesto.permuta_kilometros
                        )
                      : "—"}
                  </span>
                </div>

                <div className="dato">
                  <strong>
                    Valor tomado:
                  </strong>
                  <span>
                    {formatearImporte(
                      presupuesto.valor_permuta
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="seccion-presupuesto">
          <h2 className="titulo-seccion">
            Propuesta comercial
          </h2>

          <table className="tabla-importes">
            <tbody>
              <tr>
                <td>
                  Precio del vehículo
                </td>
                <td>
                  {formatearImporte(
                    presupuesto.precio_vehiculo
                  )}
                </td>
              </tr>

              {presupuesto.bonificacion >
                0 && (
                <tr className="fila-resta">
                  <td>Bonificación</td>
                  <td>
                    -{" "}
                    {formatearImporte(
                      presupuesto.bonificacion
                    )}
                  </td>
                </tr>
              )}

              {presupuesto.gastos > 0 && (
                <tr>
                  <td>
                    Gastos adicionales
                  </td>
                  <td>
                    +{" "}
                    {formatearImporte(
                      presupuesto.gastos
                    )}
                  </td>
                </tr>
              )}

              {presupuesto.valor_permuta >
                0 && (
                <tr className="fila-resta">
                  <td>
                    Vehículo tomado en
                    permuta
                  </td>
                  <td>
                    -{" "}
                    {formatearImporte(
                      presupuesto.valor_permuta
                    )}
                  </td>
                </tr>
              )}

              <tr className="fila-total">
                <td>Saldo / Total</td>
                <td>
                  {formatearImporte(
                    presupuesto.total
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {(presupuesto.forma_pago ||
          presupuesto.financiacion) && (
          <section className="seccion-presupuesto">
            <h2 className="titulo-seccion">
              Condiciones de pago
            </h2>

            {presupuesto.forma_pago && (
              <div
                className="texto-condicion"
                style={{ marginBottom: 8 }}
              >
                <strong>
                  Forma de pago:
                </strong>
                <br />
                {presupuesto.forma_pago}
              </div>
            )}

            {presupuesto.financiacion && (
              <div className="texto-condicion">
                <strong>
                  Financiación:
                </strong>
                <br />
                {presupuesto.financiacion}
              </div>
            )}
          </section>
        )}

        {presupuesto.observaciones && (
          <section className="seccion-presupuesto">
            <h2 className="titulo-seccion">
              Observaciones
            </h2>

            <div className="texto-condicion observaciones">
              {presupuesto.observaciones}
            </div>
          </section>
        )}

        <div className="condiciones">
          Presupuesto sujeto a disponibilidad de
          la unidad al momento de la confirmación.
          Los valores y condiciones comerciales
          indicados tienen vigencia hasta la fecha
          consignada en este documento.
          <br />
          Válido hasta:{" "}
          {formatearFecha(
            presupuesto.valido_hasta
          )}
        </div>

        <div
  className={
    presupuesto.valor_permuta > 0
      ? "firmas firmas-con-permuta"
      : "firmas"
  }
>
          <div className="firma">
            MotoCars Concesionaria
          </div>

          <div className="firma">
            Firma / conformidad del cliente
          </div>
        </div>
      </MotoCarsDocumentoLayout>
    </>
  );
}