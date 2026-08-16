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
  listarPagosCompra,
  type MedioPagoCompra,
  type PagoCompra,
} from "@/lib/service/pagos-compra";

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

function documentoCliente(cliente: Cliente) {
  return cliente.cuit || cliente.dni || "—";
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

function nombreMedioPago(medio: MedioPagoCompra) {
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

function obtenerDetallePago(pago: PagoCompra) {
  const datos: string[] = [];

  if (pago.banco) {
    datos.push(`Banco: ${pago.banco}`);
  }

  if (pago.titular) {
    datos.push(`Titular: ${pago.titular}`);
  }

  if (pago.cuil_cuit) {
    datos.push(`CUIT/CUIL: ${pago.cuil_cuit}`);
  }

  if (pago.tipo_cuenta) {
    datos.push(`Cuenta: ${pago.tipo_cuenta}`);
  }

  if (pago.numero_cuenta) {
    datos.push(`N.º ${pago.numero_cuenta}`);
  }

  if (pago.alias) {
    datos.push(`Alias: ${pago.alias}`);
  }

  if (pago.cbu_cvu) {
    datos.push(`CBU/CVU: ${pago.cbu_cvu}`);
  }

  if (pago.detalle) {
    datos.push(pago.detalle);
  }

  return datos.join(" · ");
}

export default function CompraPage() {
  const params = useParams<{ id: string }>();

  const [operacion, setOperacion] =
    useState<Operacion | null>(null);

  const [cliente, setCliente] =
    useState<Cliente | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

  const [pagos, setPagos] =
    useState<PagoCompra[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const operacionId = Number(params.id);

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
          await obtenerOperacion(operacionId);

        if (
          operacionCargada.tipo_operacion !== "compra"
        ) {
          throw new Error(
            "Esta operación no corresponde a una compra."
          );
        }

        const [
          clienteCargado,
          vehiculoCargado,
          pagosCargados,
        ] = await Promise.all([
          obtenerCliente(
            operacionCargada.cliente_id
          ),
          obtenerVehiculoPorId(
            operacionCargada.vehiculo_id
          ),
          listarPagosCompra(
            operacionId
          ),
        ]);

        if (!vehiculoCargado) {
          throw new Error(
            "No se encontró el vehículo asociado."
          );
        }

        if (!activo) {
          return;
        }

        setOperacion(operacionCargada);
        setCliente(clienteCargado);
        setVehiculo(vehiculoCargado);
        setPagos(pagosCargados);
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el boleto de compra."
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
        Cargando boleto de compra...
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
            "No se pudo cargar el boleto de compra."}
        </p>

        <Link
          href={`/admin/operaciones/${params.id}`}
        >
          Volver a la operación
        </Link>
      </main>
    );
  }

  const valorCompra =
    vehiculo.precio_compra ??
    operacion.precio_vehiculo ??
    0;

  const totalPagos = pagos.reduce(
    (total, pago) =>
      total + Number(pago.importe),
    0
  );

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

        .compra-texto {
          margin-top: 20px;
          font-size: 11.3px;
          line-height: 1.5;
          text-align: justify;
        }

        .compra-texto p {
          margin: 0 0 10px;
        }

        .compra-texto strong {
          font-weight: 800;
        }

        .titulo-seccion-compra {
          margin: 17px 0 9px;
          padding-bottom: 5px;
          border-bottom: 1px solid #d4d4d4;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .grilla-compra {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 6px 24px;
          font-size: 11px;
        }

        .dato-compra {
          display: grid;
          grid-template-columns: 88px 1fr;
          gap: 6px;
        }

        .tabla-pagos {
          width: 100%;
          margin-top: 7px;
          border-collapse: collapse;
          font-size: 10px;
        }

        .tabla-pagos th,
        .tabla-pagos td {
          padding: 7px 8px;
          border: 1px solid #d4d4d4;
          vertical-align: top;
        }

        .tabla-pagos th {
          background: #f3f4f6;
          text-align: left;
          font-weight: 800;
        }

        .tabla-pagos .importe {
          width: 34mm;
          text-align: right;
          white-space: nowrap;
        }

        .total-compra {
          display: flex;
          justify-content: flex-end;
          gap: 20px;
          margin-top: 8px;
          font-size: 12px;
          font-weight: 800;
        }

        .observaciones-compra {
          margin-top: 12px;
          padding: 9px 10px;
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          font-size: 10.5px;
          line-height: 1.45;
          white-space: pre-wrap;
        }

        .firmas-compra {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          margin-top: 125px;
          margin-bottom: 20px;
        }

        .firma-compra {
          padding-top: 8px;
          border-top: 1px solid #737373;
          text-align: center;
          font-size: 10px;
          line-height: 1.45;
        }

        @media print {
          .no-imprimir {
            display: none !important;
          }
        }

        @media screen and (max-width: 850px) {
          .grilla-compra {
            grid-template-columns: 1fr;
          }

          .firmas-compra {
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
          onClick={() => window.print()}
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <MotoCarsDocumentoLayout
        titulo="Boleto de Compra de Automotor"
        numero={
          operacion.numero ||
          operacion.id
        }
        fecha={formatearFecha(
          operacion.created_at
        )}
      >
        <section className="compra-texto">
          <p>
            En la ciudad de Neuquén, a los{" "}
            <strong>
              {formatearFecha(
                operacion.created_at
              )}
            </strong>
            , entre{" "}
            <strong>
              MotoCars Concesionaria
            </strong>
            , con domicilio comercial en
            Primeros Pobladores 1400,
            Neuquén Capital, en adelante{" "}
            <strong>EL COMPRADOR</strong>,
            y{" "}
            <strong>
              {nombreCliente(cliente)}
            </strong>
            , DNI/CUIT{" "}
            <strong>
              {documentoCliente(cliente)}
            </strong>
            , domiciliado en{" "}
            <strong>
              {cliente.direccion || "—"}
            </strong>
            , localidad de{" "}
            <strong>
              {cliente.ciudad || "—"}
            </strong>
            , en adelante{" "}
            <strong>EL VENDEDOR</strong>,
            se celebra el presente Boleto
            de Compra de Automotor.
          </p>

          <h2 className="titulo-seccion-compra">
            Datos del vendedor
          </h2>

          <div className="grilla-compra">
            <div className="dato-compra">
              <strong>Vendedor:</strong>
              <span>
                {nombreCliente(cliente)}
              </span>
            </div>

            <div className="dato-compra">
              <strong>DNI/CUIT:</strong>
              <span>
                {documentoCliente(cliente)}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Teléfono:</strong>
              <span>
                {cliente.whatsapp ||
                  cliente.telefono ||
                  "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Email:</strong>
              <span>
                {cliente.email || "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Domicilio:</strong>
              <span>
                {cliente.direccion || "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Localidad:</strong>
              <span>
                {[
                  cliente.ciudad,
                  cliente.provincia,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
          </div>

          <h2 className="titulo-seccion-compra">
            Vehículo adquirido
          </h2>

          <div className="grilla-compra">
            <div className="dato-compra">
              <strong>Vehículo:</strong>
              <span>
                {nombreVehiculo(vehiculo)}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Año:</strong>
              <span>
                {vehiculo.anio ?? "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Dominio:</strong>
              <span>
                {vehiculo.dominio || "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Color:</strong>
              <span>
                {vehiculo.color || "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Chasis:</strong>
              <span>
                {vehiculo.numero_chasis ||
                  "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Motor:</strong>
              <span>
                {vehiculo.numero_motor ||
                  "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>
                Kilómetros:
              </strong>
              <span>
                {vehiculo.kilometros !==
                null
                  ? new Intl.NumberFormat(
                      "es-AR"
                    ).format(
                      vehiculo.kilometros
                    )
                  : "—"}
              </span>
            </div>

            <div className="dato-compra">
              <strong>Condición:</strong>
              <span>
                {vehiculo.condicion ||
                  vehiculo.estado ||
                  "—"}
              </span>
            </div>
          </div>

          <p style={{ marginTop: 15 }}>
            <strong>Primera.</strong>{" "}
            EL VENDEDOR vende y entrega a
            EL COMPRADOR el vehículo
            individualizado precedentemente,
            por la suma total de{" "}
            <strong>
              {formatearImporte(
                valorCompra
              )}
            </strong>
            .
          </p>

          <p>
            <strong>Segunda.</strong>{" "}
            EL VENDEDOR declara bajo su
            responsabilidad que es titular
            o se encuentra debidamente
            facultado para disponer del
            vehículo y que los datos
            consignados en el presente
            instrumento son correctos.
          </p>

          <p>
            <strong>Tercera.</strong>{" "}
            EL VENDEDOR se obliga a entregar
            la documentación necesaria para
            efectuar la transferencia
            dominial y demás trámites
            correspondientes, respondiendo
            por gravámenes, inhibiciones,
            deudas, multas u otras
            restricciones anteriores a esta
            operación que no hubieran sido
            expresamente informadas.
          </p>

          <h2 className="titulo-seccion-compra">
            Forma de pago
          </h2>

          {pagos.length > 0 ? (
  <>
    <table className="tabla-pagos">
      <thead>
        <tr>
          <th>Medio de pago</th>
          <th>Detalle</th>
          <th className="importe">
            Importe
          </th>
        </tr>
      </thead>

      <tbody>
        {pagos.map((pago, indice) => (
          <tr key={pago.id}>
            <td>
              {indice + 1}.{" "}
              {nombreMedioPago(
                pago.medio_pago
              )}
            </td>

            <td>
              {obtenerDetallePago(
                pago
              ) || "—"}
            </td>

            <td className="importe">
              {formatearImporte(
                pago.importe
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="total-compra">
      <span>
        Total abonado:
      </span>

      <span>
        {formatearImporte(
          totalPagos
        )}
      </span>
    </div>
  </>
) : (
  <p>
    Forma de pago:{" "}
    <strong>
      {operacion.forma_pago ||
        operacion.detalle_pago ||
        "A definir"}
    </strong>
    .
  </p>
)}

<p style={{ marginTop: 14 }}>
  <strong>Cuarta.</strong>{" "}
  EL VENDEDOR declara recibir de
  conformidad los importes y/o medios
  de pago detallados precedentemente,
  de acuerdo con las condiciones
  convenidas entre las partes.
</p>

<p>
  <strong>Quinta.</strong>{" "}
  Las partes constituyen domicilios
  en los indicados en este instrumento
  y se someten a la jurisdicción de
  los Tribunales competentes del
  Departamento Confluencia, Provincia
  del Neuquén, con renuncia a cualquier
  otro fuero o jurisdicción que pudiera
  corresponder.
</p>

{operacion.observaciones && (
  <div className="observaciones-compra">
    <strong>Observaciones:</strong>
    <br />
    {operacion.observaciones}
  </div>
)}

<p style={{ marginTop: 13 }}>
  Se firman dos ejemplares de un mismo
  tenor y a un solo efecto, recibiendo
  cada parte el suyo.
</p>

<div className="firmas-compra">
  <div className="firma-compra">
    EL VENDEDOR
    <br />
    {nombreCliente(cliente)}
    <br />
    DNI/CUIT{" "}
    {documentoCliente(cliente)}
  </div>

  <div className="firma-compra">
    EL COMPRADOR
    <br />
    MotoCars Concesionaria
  </div>
</div>
</section>
</MotoCarsDocumentoLayout>
</>
);
}