"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import MotoCarsDocumentoLayout from "@/componentes/documentos/MotoCarsDocumentoLayout";

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

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

function numeroDesdeInput(valor: string) {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
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

export default function PresupuestoVehiculoPage() {
  const params = useParams<{ id: string }>();

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [cliente, setCliente] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");

  const [precio, setPrecio] = useState("");
  const [bonificacion, setBonificacion] = useState("0");
  const [gastos, setGastos] = useState("0");
  const [permuta, setPermuta] = useState("0");

  const [formaPago, setFormaPago] = useState("");
  const [financiacion, setFinanciacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [validezDias, setValidezDias] = useState("5");

  const [permutaMarca, setPermutaMarca] = useState("");
const [permutaModelo, setPermutaModelo] = useState("");
const [permutaAnio, setPermutaAnio] = useState("");
const [permutaKilometros, setPermutaKilometros] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const vehiculoId = Number(params.id);

      if (
        !Number.isInteger(vehiculoId) ||
        vehiculoId <= 0
      ) {
        setError(
          "El identificador del vehículo no es válido."
        );
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const vehiculoCargado =
          await obtenerVehiculoPorId(vehiculoId);

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo."
          );
        }

        if (!activo) {
          return;
        }

        setVehiculo(vehiculoCargado);

        if (vehiculoCargado.precio !== null) {
          setPrecio(
            String(vehiculoCargado.precio)
          );
        }
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

  const total = useMemo(() => {
    return (
      numeroDesdeInput(precio) -
      numeroDesdeInput(bonificacion) +
      numeroDesdeInput(gastos) -
      numeroDesdeInput(permuta)
    );
  }, [
    precio,
    bonificacion,
    gastos,
    permuta,
  ]);

  const fechaActual = useMemo(
    () => new Date(),
    []
  );

  const fechaVencimiento = useMemo(() => {
    const fecha = new Date(fechaActual);

    fecha.setDate(
      fecha.getDate() +
        Math.max(
          0,
          numeroDesdeInput(validezDias)
        )
    );

    return fecha;
  }, [fechaActual, validezDias]);

  if (cargando) {
    return (
      <main style={{ padding: 32 }}>
        Cargando presupuesto...
      </main>
    );
  }

  if (error || !vehiculo) {
    return (
      <main style={{ padding: 32 }}>
        <p style={{ color: "#b91c1c" }}>
          {error ||
            "No se pudo cargar el presupuesto."}
        </p>

        <Link href="/admin/vehiculos">
          Volver a vehículos
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

        .editor-presupuesto {
          width: min(210mm, calc(100% - 32px));
          margin: 0 auto 18px;
          padding: 18px;
          border: 1px solid #d8dee7;
          border-radius: 10px;
          background: white;
        }

        .editor-titulo {
          margin: 0 0 14px;
          font-size: 16px;
          font-weight: 800;
        }

        .editor-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .campo {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .campo-ancho {
          grid-column: 1 / -1;
        }

        .campo label {
          font-size: 12px;
          font-weight: 700;
        }

        .campo input,
        .campo textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          padding: 9px 10px;
          background: white;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 13px;
        }

        .campo textarea {
          min-height: 72px;
          resize: vertical;
        }

        .hoja-presupuesto {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 32px;
          padding: 14mm;
          background: white;
          box-shadow:
            0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .encabezado-presupuesto {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #171717;
        }

        .logo-presupuesto {
          width: 210px;
          height: auto;
          object-fit: contain;
        }

        .datos-empresa {
          margin-top: 8px;
          font-size: 11px;
          line-height: 1.55;
        }

        .titulo-documento {
          text-align: right;
        }

        .titulo-documento h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .numero-documento {
          margin-top: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .fecha-documento {
          margin-top: 5px;
          font-size: 11px;
          line-height: 1.5;
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 65px;
          margin-top: 40px;
        }

        .firma {
          padding-top: 7px;
          border-top: 1px solid #737373;
          text-align: center;
          font-size: 10px;
        }

        .pie-presupuesto {
          margin-top: 28px;
          padding-top: 10px;
          border-top: 1px solid #d4d4d4;
          text-align: center;
          font-size: 9.5px;
          line-height: 1.45;
          color: #525252;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          aside,
          header:not(.encabezado-presupuesto),
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

          .hoja-presupuesto {
            position: relative !important;
            display: block !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 14mm !important;
            background: white !important;
            box-shadow: none !important;
          }
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media screen and (max-width: 850px) {
          .editor-grid,
          .grilla-datos {
            grid-template-columns: 1fr;
          }

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
        }
      `}</style>

      <div className="barra-presupuesto no-imprimir">
        <Link
          href={`/admin/vehiculos/${vehiculo.id}`}
          className="boton-presupuesto"
        >
          Volver al vehículo
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

      <section className="editor-presupuesto no-imprimir">
        <h2 className="editor-titulo">
          Completar presupuesto
        </h2>

        <div className="editor-grid">
          <div className="campo">
            <label>Cliente</label>
            <input
              value={cliente}
              onChange={(event) =>
                setCliente(event.target.value)
              }
              placeholder="Nombre y apellido / Razón social"
            />
          </div>

          <div className="campo">
            <label>DNI / CUIT</label>
            <input
              value={documento}
              onChange={(event) =>
                setDocumento(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Teléfono / WhatsApp</label>
            <input
              value={telefono}
              onChange={(event) =>
                setTelefono(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Email</label>
            <input
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Ciudad</label>
            <input
              value={ciudad}
              onChange={(event) =>
                setCiudad(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Dirección</label>
            <input
              value={direccion}
              onChange={(event) =>
                setDireccion(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Precio vehículo</label>
            <input
              type="number"
              value={precio}
              onChange={(event) =>
                setPrecio(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Bonificación</label>
            <input
              type="number"
              value={bonificacion}
              onChange={(event) =>
                setBonificacion(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Gastos adicionales</label>
            <input
              type="number"
              value={gastos}
              onChange={(event) =>
                setGastos(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Valor de permuta</label>
            <div className="campo">
  <label>Marca permuta</label>
  <input
    value={permutaMarca}
    onChange={(event) =>
      setPermutaMarca(event.target.value)
    }
    placeholder="Ej.: Toyota"
  />
</div>

<div className="campo">
  <label>Modelo permuta</label>
  <input
    value={permutaModelo}
    onChange={(event) =>
      setPermutaModelo(event.target.value)
    }
    placeholder="Ej.: Hilux SRV"
  />
</div>

<div className="campo">
  <label>Año permuta</label>
  <input
    type="number"
    value={permutaAnio}
    onChange={(event) =>
      setPermutaAnio(event.target.value)
    }
    placeholder="Ej.: 2018"
  />
</div>

<div className="campo">
  <label>Kilómetros permuta</label>
  <input
    type="number"
    value={permutaKilometros}
    onChange={(event) =>
      setPermutaKilometros(event.target.value)
    }
    placeholder="Ej.: 145000"
  />
</div>
            <input
              type="number"
              value={permuta}
              onChange={(event) =>
                setPermuta(event.target.value)
              }
            />
          </div>

          <div className="campo">
            <label>Validez del presupuesto (días)</label>
            <input
              type="number"
              min="0"
              value={validezDias}
              onChange={(event) =>
                setValidezDias(event.target.value)
              }
            />
          </div>

          <div className="campo campo-ancho">
            <label>Forma de pago</label>
            <textarea
              value={formaPago}
              onChange={(event) =>
                setFormaPago(event.target.value)
              }
              placeholder="Ej.: contado, transferencia, anticipo y saldo..."
            />
          </div>

          <div className="campo campo-ancho">
            <label>Financiación</label>
            <textarea
              value={financiacion}
              onChange={(event) =>
                setFinanciacion(event.target.value)
              }
              placeholder="Ej.: entrega y saldo financiado, cantidad de cuotas, entidad financiera..."
            />
          </div>

          <div className="campo campo-ancho">
            <label>Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(event) =>
                setObservaciones(event.target.value)
              }
            />
          </div>
        </div>
      </section>

      <MotoCarsDocumentoLayout
  titulo="Presupuesto"
  numero={`VEH-${vehiculo.id}`}
  fecha={formatearFecha(fechaActual)}
>
  <section className="seccion-presupuesto">
    <h2 className="titulo-seccion">
      Datos del cliente
    </h2>

    <div className="grilla-datos">
      <div className="dato">
        <strong>Cliente:</strong>
        <span>{cliente || "—"}</span>
      </div>

      <div className="dato">
        <strong>DNI / CUIT:</strong>
        <span>{documento || "—"}</span>
      </div>

      <div className="dato">
        <strong>Teléfono:</strong>
        <span>{telefono || "—"}</span>
      </div>

      <div className="dato">
        <strong>Email:</strong>
        <span>{email || "—"}</span>
      </div>

      <div className="dato">
        <strong>Ciudad:</strong>
        <span>{ciudad || "—"}</span>
      </div>

      <div className="dato">
        <strong>Dirección:</strong>
        <span>{direccion || "—"}</span>
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
            {vehiculo.condicion ||
              vehiculo.estado ||
              "—"}
          </span>
        </div>

        <div className="dato">
          <strong>Tipo:</strong>
          <span>{vehiculo.tipo || "—"}</span>
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
      {numeroDesdeInput(permuta) > 0 && (
  <section className="seccion-presupuesto">
    <h2 className="titulo-seccion">
      Vehículo recibido en permuta
    </h2>

    <div className="vehiculo-destacado">
      <div className="grilla-datos">
        <div className="dato">
          <strong>Marca:</strong>
          <span>{permutaMarca || "—"}</span>
        </div>

        <div className="dato">
          <strong>Modelo:</strong>
          <span>{permutaModelo || "—"}</span>
        </div>

        <div className="dato">
          <strong>Año:</strong>
          <span>{permutaAnio || "—"}</span>
        </div>

        <div className="dato">
          <strong>Kilómetros:</strong>
          <span>
            {permutaKilometros
              ? new Intl.NumberFormat("es-AR").format(
                  Number(permutaKilometros)
                )
              : "—"}
          </span>
        </div>

        <div className="dato">
          <strong>Valor tomado:</strong>
          <span>
            {formatearImporte(
              numeroDesdeInput(permuta)
            )}
          </span>
        </div>
      </div>
    </div>
  </section>
)}
      Propuesta comercial
    </h2>

    <table className="tabla-importes">
      <tbody>
        <tr>
          <td>Precio del vehículo</td>
          <td>
            {formatearImporte(
              numeroDesdeInput(precio)
            )}
          </td>
        </tr>

        {numeroDesdeInput(bonificacion) > 0 && (
          <tr className="fila-resta">
            <td>Bonificación</td>
            <td>
              -{" "}
              {formatearImporte(
                numeroDesdeInput(bonificacion)
              )}
            </td>
          </tr>
        )}

        {numeroDesdeInput(gastos) > 0 && (
          <tr>
            <td>Gastos adicionales</td>
            <td>
              +{" "}
              {formatearImporte(
                numeroDesdeInput(gastos)
              )}
            </td>
          </tr>
        )}

        {numeroDesdeInput(permuta) > 0 && (
          <tr className="fila-resta">
            <td>Vehículo tomado en permuta</td>
            <td>
              -{" "}
              {formatearImporte(
                numeroDesdeInput(permuta)
              )}
            </td>
          </tr>
        )}

        <tr className="fila-total">
          <td>Saldo / Total</td>
          <td>{formatearImporte(total)}</td>
        </tr>
      </tbody>
    </table>
  </section>

  {(formaPago || financiacion) && (
    <section className="seccion-presupuesto">
      <h2 className="titulo-seccion">
        Condiciones de pago
      </h2>

      {formaPago && (
        <div
          className="texto-condicion"
          style={{ marginBottom: 8 }}
        >
          <strong>Forma de pago:</strong>
          <br />
          {formaPago}
        </div>
      )}

      {financiacion && (
        <div className="texto-condicion">
          <strong>Financiación:</strong>
          <br />
          {financiacion}
        </div>
      )}
    </section>
  )}

  {observaciones && (
    <section className="seccion-presupuesto">
      <h2 className="titulo-seccion">
        Observaciones
      </h2>

      <div className="texto-condicion observaciones">
        {observaciones}
      </div>
    </section>
  )}

  <div className="condiciones">
    Presupuesto sujeto a disponibilidad de la unidad
    al momento de la confirmación. Los valores y
    condiciones comerciales indicados tienen vigencia
    hasta la fecha consignada en este documento.
    <br />
    Válido hasta: {formatearFecha(fechaVencimiento)}
  </div>

  <div className="firmas">
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