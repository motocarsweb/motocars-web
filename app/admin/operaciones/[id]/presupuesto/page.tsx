"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

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
    return cliente.razon_social || "Empresa sin razón social";
  }

  return (
    `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() ||
    "Cliente sin nombre"
  );
}

function nombreVehiculo(vehiculo: VehiculoSupabase) {
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

export default function PresupuestoPage() {
  const params = useParams<{ id: string }>();

  const [operacion, setOperacion] =
    useState<Operacion | null>(null);

  const [cliente, setCliente] =
    useState<Cliente | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let componenteActivo = true;

    async function cargarPresupuesto() {
      const operacionId = Number(params.id);

      if (!Number.isInteger(operacionId) || operacionId <= 0) {
        setError("El identificador de la operación no es válido.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const operacionCargada =
          await obtenerOperacion(operacionId);

        const [clienteCargado, vehiculoCargado] =
          await Promise.all([
            obtenerCliente(operacionCargada.cliente_id),
            obtenerVehiculoPorId(
              operacionCargada.vehiculo_id
            ),
          ]);

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo asociado."
          );
        }

        if (!componenteActivo) {
          return;
        }

        setOperacion(operacionCargada);
        setCliente(clienteCargado);
        setVehiculo(vehiculoCargado);
      } catch (errorDesconocido) {
        if (!componenteActivo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el presupuesto."
        );
      } finally {
        if (componenteActivo) {
          setCargando(false);
        }
      }
    }

    cargarPresupuesto();

    return () => {
      componenteActivo = false;
    };
  }, [params.id]);

  if (cargando) {
    return (
      <main style={{ padding: 32 }}>
        Cargando presupuesto...
      </main>
    );
  }

  if (error || !operacion || !cliente || !vehiculo) {
    return (
      <main style={{ padding: 32 }}>
        <p style={{ color: "#b91c1c" }}>
          {error || "No se pudo cargar el presupuesto."}
        </p>

        <Link href={`/admin/operaciones/${params.id}`}>
          Volver a la operación
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

        .barra-acciones {
          display: flex;
          gap: 10px;
        }

        .boton-presupuesto {
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
          border-color: #1d4ed8;
          background: #1d4ed8;
          color: white;
        }

        .hoja-presupuesto {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 32px;
          background: white;
          padding: 16mm;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .encabezado-presupuesto {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding-bottom: 18px;
          border-bottom: 3px solid #111827;
        }

        .marca-presupuesto {
          font-size: 30px;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .submarca-presupuesto {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .datos-empresa {
          margin-top: 14px;
          font-size: 12px;
          line-height: 1.6;
        }

        .titulo-documento {
          text-align: right;
        }

        .titulo-documento h1 {
          margin: 0;
          font-size: 25px;
          text-transform: uppercase;
        }

        .numero-documento {
          margin-top: 8px;
          font-size: 15px;
          font-weight: 700;
        }

        .fecha-documento {
          margin-top: 6px;
          font-size: 12px;
        }

        .seccion-presupuesto {
          margin-top: 22px;
        }

        .titulo-seccion {
          margin: 0 0 10px;
          padding-bottom: 7px;
          border-bottom: 1px solid #d4d4d4;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .grilla-datos {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px 28px;
          font-size: 13px;
        }

        .dato {
          display: grid;
          grid-template-columns: 105px 1fr;
          gap: 8px;
          min-height: 21px;
        }

        .dato strong {
          font-weight: 700;
        }

        .vehiculo-destacado {
          margin-top: 10px;
          border: 1px solid #d4d4d4;
          border-radius: 10px;
          padding: 16px;
        }

        .vehiculo-nombre {
          margin: 0 0 12px;
          font-size: 21px;
          font-weight: 800;
        }

        .tabla-importes {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .tabla-importes td {
          padding: 10px 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .tabla-importes td:last-child {
          width: 190px;
          text-align: right;
          font-weight: 700;
        }

        .fila-bonificacion td:last-child {
          color: #b91c1c;
        }

        .fila-total td {
          padding-top: 15px;
          padding-bottom: 15px;
          border-top: 2px solid #111827;
          border-bottom: 0;
          background: #f3f4f6;
          font-size: 20px;
          font-weight: 900;
        }

        .observaciones {
          min-height: 72px;
          border: 1px solid #d4d4d4;
          border-radius: 8px;
          padding: 12px;
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .condiciones {
          margin-top: 22px;
          font-size: 11px;
          line-height: 1.6;
          color: #4b5563;
        }

        .firmas {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          margin-top: 55px;
        }

        .firma {
          padding-top: 8px;
          border-top: 1px solid #737373;
          text-align: center;
          font-size: 11px;
        }

        .pie-presupuesto {
          margin-top: 35px;
          padding-top: 12px;
          border-top: 1px solid #d4d4d4;
          text-align: center;
          font-size: 10px;
          color: #525252;
        }

        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          body {
            background: white;
          }

          .no-imprimir {
            display: none !important;
          }

          .hoja-presupuesto {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            box-shadow: none;
          }
        }

        @media screen and (max-width: 850px) {
          .hoja-presupuesto {
            width: calc(100% - 24px);
            min-height: auto;
            padding: 24px;
          }

          .encabezado-presupuesto {
            flex-direction: column;
          }

          .titulo-documento {
            text-align: left;
          }

          .grilla-datos {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="barra-presupuesto no-imprimir">
        <Link
          href={`/admin/operaciones/${operacion.id}`}
          className="boton-presupuesto"
        >
          Volver a la operación
        </Link>

        <div className="barra-acciones">
          <button
            type="button"
            className="boton-presupuesto boton-principal"
            onClick={() => window.print()}
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      <main className="hoja-presupuesto">
        <header className="encabezado-presupuesto">
          <div>
            <div className="marca-presupuesto">
              MotoCars
            </div>

           <Image

  src="/logo/motocars-nuevo.png"
  alt="MotoCars Concesionaria"
  width={230}
  height={95}
  priority
  className="logo-presupuesto"
/>

            <div className="datos-empresa">
              Primeros Pobladores 1400, Neuquén Capital
              <br />
              WhatsApp: +54 9 299 513 3023
              <br />
              motocars.concesionaria@gmail.com
              <br />
              @motocars.concesionaria
            </div>
          </div>

          <div className="titulo-documento">
            <h1>Presupuesto</h1>

            <div className="numero-documento">
              N.º {operacion.numero || operacion.id}
            </div>

            <div className="fecha-documento">
              Fecha: {formatearFecha(operacion.created_at)}
            </div>
          </div>
        </header>

        <section className="seccion-presupuesto">
          <h2 className="titulo-seccion">
            Datos del cliente
          </h2>

          <div className="grilla-datos">
            <div className="dato">
              <strong>Cliente:</strong>
              <span>{nombreCliente(cliente)}</span>
            </div>

            <div className="dato">
              <strong>DNI/CUIT:</strong>
              <span>
                {cliente.dni || cliente.cuit || "—"}
              </span>
            </div>

            <div className="dato">
              <strong>Teléfono:</strong>
              <span>
                {cliente.whatsapp ||
                  cliente.telefono ||
                  "—"}
              </span>
            </div>

            <div className="dato">
              <strong>Email:</strong>
              <span>{cliente.email || "—"}</span>
            </div>

            <div className="dato">
              <strong>Ciudad:</strong>
              <span>{cliente.ciudad || "—"}</span>
            </div>

            <div className="dato">
              <strong>Dirección:</strong>
              <span>{cliente.direccion || "—"}</span>
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
                <span>{vehiculo.anio ?? "—"}</span>
              </div>

              <div className="dato">
                <strong>Condición:</strong>
                <span>
                  {vehiculo.estado ||
                    vehiculo.condicion ||
                    "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Color:</strong>
                <span>{vehiculo.color || "—"}</span>
              </div>

              <div className="dato">
                <strong>Kilómetros:</strong>
                <span>
                  {vehiculo.kilometros !== null
                    ? new Intl.NumberFormat("es-AR").format(
                        vehiculo.kilometros
                      )
                    : "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Combustible:</strong>
                <span>
                  {vehiculo.combustible || "—"}
                </span>
              </div>

              <div className="dato">
                <strong>Transmisión:</strong>
                <span>
                  {vehiculo.transmision || "—"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="seccion-presupuesto">
          <h2 className="titulo-seccion">
            Condiciones comerciales
          </h2>

          <table className="tabla-importes">
            <tbody>
              <tr>
                <td>Precio del vehículo</td>
                <td>
                  {formatearImporte(
                    operacion.precio_vehiculo
                  )}
                </td>
              </tr>

              {operacion.bonificacion > 0 && (
                <tr className="fila-bonificacion">
                  <td>Bonificación</td>
                  <td>
                    −{" "}
                    {formatearImporte(
                      operacion.bonificacion
                    )}
                  </td>
                </tr>
              )}

              {operacion.gastos > 0 && (
                <tr>
                  <td>Gastos</td>
                  <td>
                    + {formatearImporte(operacion.gastos)}
                  </td>
                </tr>
              )}

              <tr className="fila-total">
                <td>Total de la operación</td>
                <td>
                  {formatearImporte(operacion.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="seccion-presupuesto">
          <h2 className="titulo-seccion">
            Observaciones comerciales
          </h2>

          <div className="observaciones">
            {operacion.observaciones ||
              "Sin observaciones adicionales."}
          </div>
        </section>

        <div className="condiciones">
          Este presupuesto tiene una validez de 72 horas y
          está sujeto a disponibilidad de la unidad. Los
          valores, gastos y condiciones informados podrán
          modificarse hasta la confirmación definitiva de la
          operación mediante la documentación correspondiente.
        </div>

        <div className="firmas">
          <div className="firma">
            Firma del cliente
          </div>

          <div className="firma">
            Asesor comercial
          </div>
        </div>

        <footer className="pie-presupuesto">
          MotoCars Concesionaria · +30 años de trayectoria
          <br />
          Tu nueva historia comienza aquí
        </footer>
      </main>
    </>
  );
}