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
    return cliente.razon_social || "Empresa sin razón social";
  }

  return (
    `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() ||
    "Cliente sin nombre"
  );
}

function identificacionCliente(cliente: Cliente) {
  return cliente.cuit || cliente.dni || "—";
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

export default function ConsignacionPage() {
  const params = useParams<{ id: string }>();

  const [operacion, setOperacion] =
    useState<Operacion | null>(null);

  const [cliente, setCliente] =
    useState<Cliente | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

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
        const operacionCargada =
          await obtenerOperacion(operacionId);

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
            "No se encontró el vehículo asociado."
          );
        }

        if (!activo) {
          return;
        }

        setOperacion(operacionCargada);
        setCliente(clienteCargado);
        setVehiculo(vehiculoCargado);
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el contrato."
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
        Cargando contrato...
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
            "No se pudo cargar el contrato."}
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
          background: #111827;
          border-color: #111827;
          color: white;
        }

        .contrato-texto {
          margin-top: 22px;
          font-size: 11.5px;
          line-height: 1.55;
          text-align: justify;
        }

        .contrato-texto p {
          margin: 0 0 11px;
        }

        .contrato-texto strong {
          font-weight: 800;
        }

        .firmas-contrato {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          margin-top: 180px;
  margin-bottom: 20px;
        }

        .firma-contrato {
          padding-top: 8px;
          border-top: 1px solid #737373;
          text-align: center;
          font-size: 10.5px;
        }

        @media print {
          body {
            background: white;
          }

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
        titulo="Contrato de Unidad Automotor en Consignación"
        numero={
          operacion.numero ||
          operacion.id
        }
        fecha={formatearFecha(
          operacion.created_at
        )}
      >
        <section className="contrato-texto">
          <p>
            En la ciudad de Neuquén, a los{" "}
            {formatearFecha(
              operacion.created_at
            )}
            , entre{" "}
            <strong>
              {nombreCliente(cliente)}
            </strong>
            , identificado con DNI/CUIT{" "}
            <strong>
              {identificacionCliente(
                cliente
              )}
            </strong>
            , domiciliado en{" "}
            <strong>
              {cliente.direccion || "—"}
            </strong>
            , localidad de{" "}
            <strong>
              {cliente.ciudad || "—"}
            </strong>
            , teléfono{" "}
            <strong>
              {cliente.whatsapp ||
                cliente.telefono ||
                "—"}
            </strong>
            , en adelante denominado{" "}
            <strong>
              EL CONSIGNANTE
            </strong>
            , y MotoCars Concesionaria,
            domiciliada en Primeros
            Pobladores 1400, Neuquén
            Capital, en adelante denominada{" "}
            <strong>
              EL CONSIGNATARIO
            </strong>
            , se conviene celebrar el
            presente contrato de
            consignación sujeto a las
            siguientes cláusulas:
          </p>

          <p>
            <strong>Primera.</strong>{" "}
            EL CONSIGNANTE deja en
            consignación para su venta el
            vehículo de su propiedad Marca{" "}
            <strong>
              {vehiculo.marca || "—"}
            </strong>
            , Modelo{" "}
            <strong>
              {vehiculo.modelo || "—"}
            </strong>
            , Año{" "}
            <strong>
              {vehiculo.anio || "—"}
            </strong>
            , Color{" "}
            <strong>
              {vehiculo.color || "—"}
            </strong>
            , Dominio{" "}
            <strong>
              {vehiculo.dominio || "—"}
            </strong>
            , al CONSIGNATARIO, quien lo
            recibe en este acto.
          </p>

          <p>
            <strong>Segunda.</strong>{" "}
            El precio base sobre el que se
            efectuará la venta se establece
            en la suma de{" "}
            <strong>
              {formatearImporte(
                operacion.precio_vehiculo
              )}
            </strong>
            , pagaderos en la siguiente
            forma:{" "}
            <strong>
              {operacion.forma_pago ||
                operacion.detalle_pago ||
                "A definir"}
            </strong>
            . Cualquier monto mayor al
            precio pactado quedará en
            beneficio exclusivo del
            CONSIGNATARIO.
          </p>

          <p>
            <strong>Tercera.</strong>{" "}
            El plazo del presente contrato
            se conviene en{" "}
            <strong>90 días</strong> a
            partir de la fecha. A su
            vencimiento, salvo renovación,
            EL CONSIGNANTE retirará la
            unidad.
          </p>

          <p>
            <strong>Cuarta.</strong>{" "}
            El vehículo permanecerá durante
            la vigencia del presente
            contrato depositado en MotoCars
            Concesionaria, Primeros
            Pobladores 1400, Neuquén
            Capital. Queda prohibido su uso
            salvo el necesario para
            exhibición, prueba o
            demostración de funcionamiento,
            debiendo ser conducido por el
            CONSIGNATARIO o personal
            autorizado.
          </p>

          <p>
            <strong>Quinta.</strong>{" "}
            EL CONSIGNATARIO se
            responsabiliza de los daños que
            pudiera ocasionar a la unidad o
            a terceros durante la vigencia
            del presente contrato y hasta
            la devolución del vehículo a
            satisfacción del propietario.
          </p>

          <p>
            <strong>Sexta.</strong>{" "}
            EL CONSIGNANTE manifiesta que
            el vehículo no registra
            gravámenes de ninguna especie,
            ni deudas impositivas o multas,
            responsabilizándose por
            evicción y vicios redhibitorios.
          </p>

          <p>
            <strong>Séptima.</strong>{" "}
            Para todos los efectos
            judiciales o extrajudiciales
            emergentes del presente
            contrato, las partes constituyen
            domicilio en los indicados y se
            someten a la jurisdicción de los
            Tribunales del Departamento
            Confluencia de Neuquén, con
            renuncia a cualquier otro fuero
            o jurisdicción.
          </p>

          <p>
            Se firman dos ejemplares de un
            mismo tenor y a un solo efecto,
            recibiendo cada parte el suyo.
          </p>

          <div className="firmas-contrato">
            <div className="firma-contrato">
              EL CONSIGNANTE
              <br />
              {nombreCliente(cliente)}
            </div>

            <div className="firma-contrato">
              EL CONSIGNATARIO
              <br />
              MotoCars Concesionaria
            </div>
          </div>
        </section>
      </MotoCarsDocumentoLayout>
    </>
  );
}