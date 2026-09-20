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
  obtenerIngresoUsadoPorOperacion,
  type IngresoUsado,
} from "@/lib/service/ingresos-usados";

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

function formatearFecha(fecha: string | null) {
  if (!fecha) {
    return "—";
  }

  const [anio, mes, dia] = fecha.split("-");

  if (anio && mes && dia) {
    return `${dia}/${mes}/${anio}`;
  }

  return fecha;
}

export default function ReciboPagoConsignacionPage() {
  const params = useParams<{ id: string }>();

  const [operacion, setOperacion] =
    useState<Operacion | null>(null);

  const [cliente, setCliente] =
    useState<Cliente | null>(null);

  const [vehiculo, setVehiculo] =
    useState<VehiculoSupabase | null>(null);

  const [ingresoUsado, setIngresoUsado] =
    useState<IngresoUsado | null>(null);

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

        if (
          operacionCargada.tipo_operacion !==
          "consignacion"
        ) {
          throw new Error(
            "Este recibo solamente corresponde a operaciones de consignación."
          );
        }

        const ingresoCargado =
          await obtenerIngresoUsadoPorOperacion(
            operacionId
          );

        const [
          clienteCargado,
          vehiculoCargado,
        ] = await Promise.all([
          obtenerCliente(
            ingresoCargado?.titular_cliente_id ??
              operacionCargada.cliente_id
          ),

          obtenerVehiculoPorId(
            ingresoCargado?.vehiculo_id ??
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
        setIngresoUsado(ingresoCargado);
      } catch (errorDesconocido) {
        if (!activo) {
          return;
        }

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el recibo."
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
        Cargando recibo...
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
          {error || "No se pudo cargar el recibo."}
        </p>

        <Link
          href={`/admin/operaciones/${params.id}`}
        >
          Volver a la operación
        </Link>
      </main>
    );
  }

  const importePagado =
    operacion.importe_pago_consignacion ?? 0;

  const precioBase =
    ingresoUsado?.precio_base_consignacion ??
    operacion.precio_vehiculo;

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
          background: #111827;
          border-color: #111827;
          color: white;
        }

        .datos-recibo {
          margin-top: 20px;
          border: 1px solid #d4d4d4;
          border-radius: 8px;
          overflow: hidden;
          font-size: 11px;
        }

        .fila-recibo {
          display: grid;
          grid-template-columns: 155px 1fr;
          border-bottom: 1px solid #e5e5e5;
        }

        .fila-recibo:last-child {
          border-bottom: 0;
        }

        .etiqueta-recibo {
          padding: 7px 10px;
          background: #f5f5f5;
          font-weight: 800;
        }

        .valor-recibo {
          padding: 7px 10px;
        }

        .importe-destacado {
          font-size: 15px;
          font-weight: 800;
        }

        .clausulas-recibo {
          margin-top: 22px;
          font-size: 11px;
          line-height: 1.5;
          text-align: justify;
        }

        .clausulas-recibo p {
          margin: 0 0 10px;
        }

        .firmas-recibo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          margin-top: 100px;
          margin-bottom: 20px;
        }

        .firma-recibo {
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
        titulo="Recibo de Pago de Unidad en Consignación"
        numero={operacion.numero || operacion.id}
        fecha={formatearFecha(
          operacion.fecha_pago_consignacion
        )}
      >
        <section className="datos-recibo">
          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Consignante
            </div>
            <div className="valor-recibo">
              {nombreCliente(cliente)}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              DNI / CUIT
            </div>
            <div className="valor-recibo">
              {identificacionCliente(cliente)}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Domicilio
            </div>
            <div className="valor-recibo">
              {cliente.direccion || "—"}
              {cliente.ciudad
                ? ` - ${cliente.ciudad}`
                : ""}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Vehículo
            </div>
            <div className="valor-recibo">
              {[
                vehiculo.marca,
                vehiculo.modelo,
                vehiculo.version,
                vehiculo.anio,
              ]
                .filter(Boolean)
                .join(" ")}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Dominio
            </div>
            <div className="valor-recibo">
              {vehiculo.dominio || "—"}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Chasis
            </div>
            <div className="valor-recibo">
              {vehiculo.numero_chasis || "—"}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Motor
            </div>
            <div className="valor-recibo">
              {vehiculo.numero_motor || "—"}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Precio consignado
            </div>
            <div className="valor-recibo">
              {formatearImporte(precioBase)}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Importe pagado
            </div>
            <div className="valor-recibo importe-destacado">
              {formatearImporte(importePagado)}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Fecha de pago
            </div>
            <div className="valor-recibo">
              {formatearFecha(
                operacion.fecha_pago_consignacion
              )}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Forma de pago
            </div>
            <div className="valor-recibo">
              {operacion.forma_pago_consignacion ||
                "—"}
            </div>
          </div>

          <div className="fila-recibo">
            <div className="etiqueta-recibo">
              Detalle del pago
            </div>
            <div className="valor-recibo">
              {operacion.detalle_pago_consignacion ||
                "—"}
            </div>
          </div>
        </section>

        <section className="clausulas-recibo">
          <p>
  <strong>Primera.</strong>{" "}
  {operacion.clausula_pago_consignacion_1}
</p>

          <p>
  <strong>Segunda.</strong>{" "}
  {operacion.clausula_pago_consignacion_2}
</p>

         <p>
  <strong>Tercera.</strong>{" "}
  {operacion.clausula_pago_consignacion_3}
</p>

          <p>
  <strong>Cuarta.</strong>{" "}
  {operacion.clausula_pago_consignacion_4}
</p>

          <p>
  <strong>Quinta.</strong>{" "}
  {operacion.clausula_pago_consignacion_5}
</p>

          <p>
  <strong>Sexta.</strong>{" "}
  {operacion.clausula_pago_consignacion_6}
</p>

          <p>
  <strong>Septima.</strong>{" "}
  {operacion.clausula_pago_consignacion_7}
</p>

          <p>
            En prueba de conformidad, se firman dos
            ejemplares de un mismo tenor y a un solo
            efecto.
          </p>

          <div className="firmas-recibo">
            <div className="firma-recibo">
              EL CONSIGNANTE
              <br />
              {nombreCliente(cliente)}
              <br />
              DNI/CUIT:{" "}
              {identificacionCliente(cliente)}
            </div>

            <div className="firma-recibo">
              MotoCars Concesionaria
            </div>
          </div>
        </section>
      </MotoCarsDocumentoLayout>
    </>
  );
}