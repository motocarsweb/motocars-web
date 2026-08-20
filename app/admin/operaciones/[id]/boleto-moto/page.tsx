"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { obtenerCliente, type Cliente } from "@/lib/service/clientes";
import { obtenerOperacion, type Operacion } from "@/lib/service/operaciones";
import { obtenerVehiculoPorId, type VehiculoSupabase } from "@/lib/supabase-vehicles";
import { formatearImporteCompleto } from "@/lib/utils/numero-a-letras";

function nombreCliente(cliente: Cliente) {
  if (cliente.tipo_persona === "juridica") {
    return cliente.razon_social || "Empresa sin razón social";
  }

  return `${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`.trim() || "Cliente sin nombre";
}

function documentoCliente(cliente: Cliente) {
  return cliente.cuit || cliente.dni || "—";
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha));
}

function marcaNormalizada(vehiculo: VehiculoSupabase) {
  return (vehiculo.marca || "").trim().toLowerCase();
}

export default function BoletoMotoPage() {
  const params = useParams<{ id: string }>();
  const [operacion, setOperacion] = useState<Operacion | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [vehiculo, setVehiculo] = useState<VehiculoSupabase | null>(null);

  const [cargando, setCargando] = useState(true);
const [error, setError] = useState("");

const [mostrarDetallePago, setMostrarDetallePago] =
  useState(false);

const [detallePagoManual, setDetallePagoManual] =
  useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const operacionId = Number(params.id);

      if (!Number.isInteger(operacionId) || operacionId <= 0) {
        setError("El identificador de la operación no es válido.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");

        const operacionCargada = await obtenerOperacion(operacionId);

        if (operacionCargada.tipo_operacion !== "venta") {
          throw new Error("Esta operación no corresponde a una venta.");
        }

        const [clienteCargado, vehiculoCargado] = await Promise.all([
          obtenerCliente(operacionCargada.cliente_id),
          obtenerVehiculoPorId(operacionCargada.vehiculo_id),
        ]);

        if (!vehiculoCargado) {
          throw new Error("No se encontró la motocicleta de la operación.");
        }

        if (!activo) return;

        setOperacion(operacionCargada);
        setCliente(clienteCargado);
        setVehiculo(vehiculoCargado);
      } catch (errorDesconocido) {
        if (!activo) return;

        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : "No se pudo cargar el boleto de venta de motocicleta."
        );
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [params.id]);

  const esRvm = useMemo(
    () => (vehiculo ? marcaNormalizada(vehiculo) === "rvm" : false),
    [vehiculo]
  );

  const esJawa = useMemo(
    () => (vehiculo ? marcaNormalizada(vehiculo) === "jawa" : false),
    [vehiculo]
  );

  const es0Km = vehiculo?.condicion === "0km";

  if (cargando) {
    return <main style={{ padding: 32 }}>Cargando boleto de venta de motocicleta...</main>;
  }

  if (error || !operacion || !cliente || !vehiculo) {
    return (
      <main style={{ padding: 32 }}>
        <p style={{ color: "#b91c1c" }}>
          {error || "No se pudo cargar el boleto de venta de motocicleta."}
        </p>
        <Link href={`/admin/operaciones/${params.id}`}>Volver a la operación</Link>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #e5e7eb; color: #111827; font-family: Arial, Helvetica, sans-serif; }
        .barra-documento { width: min(210mm, calc(100% - 32px)); margin: 20px auto 12px; display: flex; justify-content: space-between; gap: 12px; }
        .boton-documento { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border: 1px solid #d1d5db; border-radius: 8px; background: white; padding: 0 16px; color: #111827; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; }
        .boton-principal { border-color: #111827; background: #111827; color: white; }
        .hoja-moto { width: 210mm; min-height: 297mm; margin: 0 auto 18px; padding: 13mm 13mm 11mm; background: white; box-shadow: 0 4px 18px rgb(0 0 0 / 10%); position: relative; 
        font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  color: #111;
  }
        .encabezado-moto { display: grid; grid-template-columns: 1fr 1fr; border: 1.5px solid #111; border-radius: 28px; overflow: hidden; }
        .encabezado-marca, .encabezado-recibo { min-height: 49mm; padding: 9mm 8mm; }
        .encabezado-marca { border-right: 1.5px solid #111; }
        .logos-moto { display: flex; align-items: center; justify-content: center; gap: 18px; margin-bottom: 7px; }
        .logos-moto img { display: block; object-fit: contain; max-width: 145px; max-height: 62px; }
        .datos-comerciales { text-align: center; font-size: 12px; line-height: 1.35; font-weight: 700; }
        .gracias { margin-top: 7px; font-size: 11px; font-style: italic; }
        .encabezado-recibo { display: flex; flex-direction: column; justify-content: center; text-align: center; }
        .titulo-recibo { font-size: 18px; font-weight: 800; text-transform: uppercase; }
        .fecha-recibo { margin-top: 8px; font-size: 12px; }
        .datos-fiscales { margin-top: 16px; font-size: 11.5px; line-height: 1.35; }
        .datos-cliente {
  margin-top: 8mm;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 10mm;
  row-gap: 5px;
  font-size: 13px;
  line-height: 1.25;
  padding-bottom: 7mm;
border-bottom: 1px solid #cbd5e1;
margin-left: 6mm;
margin-right: 6mm;
}
.datos-cliente .etiqueta {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  color: #171717;
}

.datos-cliente .valor {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  font-style: normal;
  color: #171717;
}

.fila-dato {
  display: grid;
  grid-template-columns: 34mm 1fr;
  gap: 5px;
  align-items: baseline;
}
  .fila-dato .etiqueta {
  white-space: nowrap;
}

.etiqueta {
  text-align: left;
  font-style: normal;
  font-weight: 700;
  color: #374151;
}

.valor {
  font-weight: 600;
  color: #111827;
}
        .bloque-detalle {
  margin-top: 8mm;
  font-size: 11.5px;
  line-height: 1.55;
  color: #171717;
  padding-bottom: 7mm;
border-bottom: 1px solid #cbd5e1;
margin-left: 6mm;
margin-right: 6mm;
}

.bloque-detalle > strong {
  display: block;
  margin-bottom: 4mm;
  font-size: 13px;
  font-weight: 800;
}

.detalle-operacion {
  min-height: 24mm;
  white-space: pre-wrap;
  font-weight: 400;
  text-align: justify;
  text-justify: inter-word;
  line-height: 1.55;
}
        .datos-unidad {
  width: 88%;
  margin: 4mm auto 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8mm;
  font-size: 12px;
  padding-bottom: 5mm;
  border-bottom: 1px solid #cbd5e1;
}
  .columna-unidad {
  display: grid;
  gap: 6px;
}
  .fila-unidad {
  display: grid;
  grid-template-columns: 26mm 1fr;
  column-gap: 5mm;
  align-items: baseline;
  font-size: 12px;
  line-height: 1.4;
}

.fila-unidad .etiqueta {
  font-weight: 400;
}

.fila-unidad .valor {
  font-weight: 500;
}
  .fila-unidad .etiqueta {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  font-style: normal;
  color: #171717;
  text-align: left;
}

.fila-unidad .valor {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #171717;
}
        .datos-entrega {
  margin-top: 5mm;
  margin-left: 6mm;
  margin-right: 6mm;
  margin-bottom: 8mm;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4mm;
  font-size: 12px;
  line-height: 1.5;
}
.datos-entrega strong {
  font-size: 12px;
  font-weight: 600;
}
.datos-gestoria {
  min-height: 14mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid #cbd5e1;
}

.datos-entrega-fecha {
  min-height: 8mm;
}
        .firma-moto {
  position: absolute;
  left: 13mm;
  right: 13mm;
  bottom: 11mm;

  display: grid;
  grid-template-columns: 1fr 1fr;

  min-height: 40mm;

  border: 1px solid #111;
}

.firma-marca,
.firma-comprador {
  display: flex;
  padding: 6mm;
  text-align: center;
}

.firma-marca {
  border-right: 1px solid #111;

  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  gap: 4mm;

  font-size: 11px;
  font-weight: 600;
}

.firma-marca .logos-moto {
  margin: 0;
  gap: 12px;
}

.firma-marca .logos-moto img {
  max-width: 105px;
  max-height: 38px;
}

.firma-comprador {
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  padding-top: 5mm;

  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
}
        .detalle-pago-titulo { margin-top: 7mm; text-align: center; font-size: 21px; font-weight: 800; text-decoration: underline; }
        .detalle-pago-contenido { margin-top: 18mm; font-size: 16px; line-height: 1.45; }
        .detalle-pago-contenido p { margin: 0 0 15px; }
        .detalle-pago-contenido .destacado { font-weight: 800; }
        .detalle-pago-contenido .aviso { margin-top: 19mm; font-size: 14px; text-transform: uppercase; }
        .pie-pago { position: absolute; left: 13mm; right: 13mm; bottom: 18mm; text-align: center; font-size: 13px; line-height: 1.4; font-weight: 800; }
        .pie-pago .logos-moto { margin-top: 10px; }
        @media print {
  html,
  body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  aside,
  header,
  .barra-documento,
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
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .hoja-moto {
    display: block !important;
    position: relative !important;
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    margin: 0 !important;
    padding: 13mm 13mm 11mm !important;
    box-shadow: none !important;
    background: #ffffff !important;
    page-break-after: always;
    break-after: page;
  }

  .hoja-moto:last-of-type {
    page-break-after: auto;
    break-after: auto;
  }
}

@page {
  size: A4 portrait;
  margin: 0;
}
      `}</style>

      <div className="barra-documento no-imprimir">
        <Link href={`/admin/operaciones/${operacion.id}`} className="boton-documento">
          Volver a la operación
        </Link>
        <button
  type="button"
  className="boton-documento"
  onClick={() =>
    setMostrarDetallePago((anterior) => !anterior)
  }
>
  {mostrarDetallePago
    ? "Quitar detalle de pago"
    : "Agregar detalle de pago"}
</button>
        <button type="button" className="boton-documento boton-principal" onClick={() => window.print()}>
          Imprimir / Guardar PDF
        </button>
      </div>

      <section className="hoja-moto">
        <div className="encabezado-moto">
          <div className="encabezado-marca">
            <div className="logos-moto">
              <img src="/logos/rvm-patagonia-boleto.png" alt="RVM Patagonia" />
              <img src="/logos/jawa-patagonia-boleto.png" alt="JAWA Patagonia" />
            </div>
            <div className="datos-comerciales">
              RVM PATAGONIA · JAWA PATAGONIA<br />
              P. Pobladores 1400<br />
              NEUQUÉN CAPITAL<br />
              Tel.: 299-5133023<br />
              rvmpatagonia@gmail.com
              <div className="gracias">¡Muchas gracias por elegirnos!</div>
            </div>
          </div>

          <div className="encabezado-recibo">
            <div className="titulo-recibo">Recibo de venta {es0Km ? "0 km" : "usado"}</div>
            <div className="fecha-recibo">FECHA: {formatearFecha(operacion.created_at)}</div>
            <div className="datos-fiscales">
              CUIT Nº: 20-28516331-6<br />
              I.S.I.B. Nº: 149/602-06<br />
              MAURO JORGE SEBASTIÁN<br />
              IVA RESPONSABLE INSCRIPTO
            </div>
          </div>
        </div>

        <div className="datos-cliente">
          <div className="fila-dato"><div className="etiqueta">Cliente</div><div className="valor">{nombreCliente(cliente)}</div></div>
          <div className="fila-dato"><div className="etiqueta">DNI / CUIL / CUIT</div><div className="valor">{documentoCliente(cliente)}</div></div>
          <div className="fila-dato"><div className="etiqueta">Domicilio</div><div className="valor">{cliente.direccion || "—"}</div></div>
          <div className="fila-dato"><div className="etiqueta">Localidad</div><div className="valor">{cliente.ciudad || "—"}</div></div>
          <div className="fila-dato"><div className="etiqueta">Provincia</div><div className="valor">{cliente.provincia || "—"}</div></div>
          <div className="fila-dato"><div className="etiqueta">Estado civil</div><div className="valor">{cliente.estado_civil || "—"}</div></div>
          <div className="fila-dato"><div className="etiqueta">Teléfono</div><div className="valor">{cliente.whatsapp || cliente.telefono || "—"}</div></div>
          <div className="fila-dato"><div className="etiqueta">Email</div><div className="valor">{cliente.email || "—"}</div></div>
        </div>

        <div className="bloque-detalle">
          <strong>Detalle:</strong>
          <div className="detalle-operacion">
            Precio total: {formatearImporteCompleto(operacion.total, operacion.moneda)}{"\n"}
            Forma de pago: {operacion.forma_pago || "A definir"}
            {operacion.detalle_pago ? `\n${operacion.detalle_pago}` : ""}
          </div>
        </div>

        <div className="datos-unidad">
  <div className="columna-unidad">
    <div className="fila-unidad">
      <div className="etiqueta">Marca</div>
      <div className="valor">{vehiculo.marca || "—"}</div>
    </div>

    <div className="fila-unidad">
      <div className="etiqueta">Modelo</div>
      <div className="valor">
        {[vehiculo.modelo, vehiculo.version].filter(Boolean).join(" ") || "—"}
      </div>
    </div>

    <div className="fila-unidad">
      <div className="etiqueta">Año</div>
      <div className="valor">{vehiculo.anio ?? "—"}</div>
    </div>

    <div className="fila-unidad">
      <div className="etiqueta">Condición</div>
      <div className="valor">{es0Km ? "0 KM" : "USADA"}</div>
    </div>
  </div>

  <div className="columna-unidad">
    <div className="fila-unidad">
      <div className="etiqueta">Tipo</div>
      <div className="valor">{vehiculo.tipo || "Motocicleta"}</div>
    </div>

    <div className="fila-unidad">
      <div className="etiqueta">Chasis</div>
      <div className="valor">{vehiculo.numero_chasis || "—"}</div>
    </div>

    <div className="fila-unidad">
      <div className="etiqueta">Motor</div>
      <div className="valor">{vehiculo.numero_motor || "—"}</div>
    </div>

    {!es0Km && (
      <div className="fila-unidad">
        <div className="etiqueta">Dominio</div>
        <div className="valor">{vehiculo.dominio || "—"}</div>
      </div>
    )}
  </div>
</div>
        <div className="datos-entrega">
  <div className="datos-gestoria">
    <strong>Gestoría:</strong>{" "}
    {operacion.gastos_gestoria_incluidos
      ? "Incluida en la operación"
      : operacion.gastos_gestoria > 0
        ? formatearImporteCompleto(
            operacion.gastos_gestoria,
            "ARS"
          )
        : "A definir"}
  </div>

  <div className="datos-entrega-fecha">
    <strong>Entrega:</strong>{" "}
    {operacion.fecha_entrega
      ? `${operacion.fecha_entrega}${
          operacion.hora_entrega
            ? ` - ${operacion.hora_entrega}`
            : ""
        }`
      : "A coordinar"}
  </div>
        </div>

        <div className="firma-moto">
          <div className="firma-marca">
            RVM PATAGONIA · JAWA PATAGONIA
            <div className="logos-moto">
              <img src="/logos/rvm-patagonia-boleto.png" alt="RVM Patagonia" />
              <img src="/logos/jawa-patagonia-boleto.png" alt="JAWA Patagonia" />
            </div>
          </div>
          <div className="firma-comprador">Firma y aclaración del comprador</div>
        </div>
      </section>

      {mostrarDetallePago && (
  <>
    <textarea
      value={detallePagoManual}
      onChange={(e) => setDetallePagoManual(e.target.value)}
      placeholder="Escribí aquí el detalle de cuentas, importes, titulares, referencias o aclaraciones de pago..."
      className="no-imprimir"
      style={{
        width: "100%",
        minHeight: 120,
        marginTop: 12,
        padding: 12,
        border: "1px solid #d1d5db",
        borderRadius: 8,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 14,
        resize: "vertical",
      }}
    />

    <section className="hoja-moto">
      <div className="detalle-pago-titulo">
        DETALLE DE PAGO
      </div>

      <div className="detalle-pago-contenido">
        <p className="destacado">
          PAGO / CONDICIONES DE LA OPERACIÓN
        </p>

        <p>
          <strong>Monto total:</strong>{" "}
          {formatearImporteCompleto(
            operacion.total,
            operacion.moneda
          )}
        </p>

        <p>
          <strong>Forma de pago:</strong>{" "}
          {operacion.forma_pago || "A definir"}
        </p>

        {detallePagoManual.trim() && (
          <p style={{ whiteSpace: "pre-wrap" }}>
            <strong>Detalle:</strong>
            <br />
            {detallePagoManual}
          </p>
        )}
      </div>

      <div className="pie-pago">
        Enviar comprobantes a rvmpatagonia@gmail.com
        <br />
        Muchas gracias
        <br />
        RVM PATAGONIA · JAWA PATAGONIA

        <div className="logos-moto">
          <img
            src="/logos/rvm-patagonia-boleto.png"
            alt="RVM Patagonia"
          />
          <img
            src="/logos/jawa-patagonia-boleto.png"
            alt="JAWA Patagonia"
          />
        </div>
      </div>
    </section>
  </>
)}
    </>
  );
}