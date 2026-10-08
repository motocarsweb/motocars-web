"use client";







import Link from "next/link";



import { useEffect, useState } from "react";



import { useParams } from "next/navigation";



import MotoCarsDocumentoLayout from "@/componentes/documentos/MotoCarsDocumentoLayout";



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







export default function BoletoMotoPage() {



  const params = useParams<{ id: string }>();



  const [operacion, setOperacion] = useState<Operacion | null>(null);



  const [cliente, setCliente] = useState<Cliente | null>(null);



  const [vehiculo, setVehiculo] = useState<VehiculoSupabase | null>(null);







  const [cargando, setCargando] = useState(true);



const [error, setError] = useState("");







const [mostrarDetallePago, setMostrarDetallePago] =



  useState(false);







const [mostrarPrecio, setMostrarPrecio] =



  useState(true);







const [mostrarObservaciones, setMostrarObservaciones] =



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



        \* { box-sizing: border-box; }



        body { margin: 0; background: #e5e7eb; color: #111827; font-family: Arial, Helvetica, sans-serif; }



        .barra-documento { width: min(210mm, calc(100% - 32px)); margin: 20px auto 12px; display: flex; justify-content: space-between; gap: 12px; }



        .boton-documento { display: inline-flex; align-items: center; justify-content: center; min-height: 42px; border: 1px solid #d1d5db; border-radius: 8px; background: white; padding: 0 16px; color: #111827; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; }



        .boton-principal { border-color: #111827; background: #111827; color: white; }



        .hoja-moto { width: 210mm; min-height: 297mm; margin: 0 auto 18px; padding: 13mm 13mm 11mm; background: white; box-shadow: 0 4px 18px rgb(0 0 0 / 10%); position: relative;&#x20;



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



                /* Firmas: una sola fila, sin recuadro y sin cortes de impresión */
        .firma-moto {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 12mm;
          align-items: start;
          width: calc(100% - 12mm);
          margin: 6mm 6mm 0;
          padding: 0;
          border: 0;
          min-height: 0;
          position: relative;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .firma-marca, .firma-comprador {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          padding: 0;
          border: 0;
          font-size: 10px;
          font-weight: 600;
          line-height: 1.25;
          text-transform: none;
        }
        .linea-firma-moto {
          height: 12mm;
          width: 90%;
          border-bottom: 1px solid #222;
          margin-bottom: 2mm;
        }
        .firma-marca .logos-moto {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9mm;
          margin: 2mm 0 0;
          width: 100%;
        }
        .firma-marca .logos-moto img {
          max-width: 30mm;
          max-height: 12mm;
          width: auto;
          height: auto;
          object-fit: contain;
        }
.detalle-pago-titulo { margin-top: 7mm; text-align: center; font-size: 21px; font-weight: 800; text-decoration: underline; }



        .detalle-pago-contenido { margin-top: 18mm; font-size: 16px; line-height: 1.45; }



        .detalle-pago-contenido p { margin: 0 0 15px; }



        .detalle-pago-contenido .destacado { font-weight: 800; }



        .detalle-pago-contenido .aviso { margin-top: 19mm; font-size: 14px; text-transform: uppercase; }



        .pie-pago { position: absolute; left: 13mm; right: 13mm; bottom: 18mm; text-align: center; font-size: 13px; line-height: 1.4; font-weight: 800; }



        .pie-pago .logos-moto { margin-top: 10px; }



        @media print {
          .barra-documento, .no-imprimir { display: none !important; }
          .documento-motocars {
            display: flex !important;
            flex-direction: column !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 12mm 14mm 10mm !important;
          }
          .documento-motocars .documento-contenido {
            display: block !important;
            flex: 1 1 auto;
            min-height: 0;
          }
          .documento-motocars .datos-cliente,
          .documento-motocars .datos-unidad,
          .documento-motocars .firma-moto { display: grid !important; }
          .documento-motocars .fila-dato,
          .documento-motocars .fila-unidad { display: grid !important; }
          .documento-motocars .firma-moto {
            grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

        @page {



  size: A4 portrait;



  margin: 0;



}





        /\* Adaptación del boleto al formato institucional RVM \*/

        .documento-motocars { margin-bottom: 18px; }

        .documento-motocars .documento-contenido { font-size: 12px; line-height: 1.35; }

        .datos-fiscales-moto { margin: 8px 0 0; text-align: right; font-size: 9px; color: #52525b; }

        .documento-motocars .datos-cliente { margin-top: 5mm; padding-bottom: 4mm; row-gap: 4px; }

        .documento-motocars .bloque-detalle { margin-top: 5mm; padding-bottom: 4mm; }

        .documento-motocars .datos-unidad { margin-top: 4mm; padding-bottom: 4mm; }

        .documento-motocars .datos-entrega { margin-top: 4mm; margin-bottom: 3mm; gap: 2mm; }

        /* Boleto moto: columnas de datos y firmas, sin afectar los documentos de autos */
        .documento-motocars .datos-cliente {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          column-gap: 8mm;
          row-gap: 2mm;
        }
        .documento-motocars .fila-dato {
          display: grid !important;
          grid-template-columns: 30mm minmax(0, 1fr) !important;
          gap: 2mm;
          align-items: baseline;
        }
        .documento-motocars .datos-unidad {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        .documento-motocars .fila-unidad {
          display: grid !important;
          grid-template-columns: 23mm minmax(0, 1fr) !important;
          gap: 2mm;
        }
        .documento-motocars .firma-moto {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 12mm;
          align-items: start;
          width: calc(100% - 12mm);
          margin: 5mm 6mm 0;
          padding: 0;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .documento-motocars .firma-moto > .firma-marca,
        .documento-motocars .firma-moto > .firma-comprador {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
          width: auto !important;
          min-width: 0;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          text-align: center;
        }
        .documento-motocars .firma-moto .linea-firma-moto {
          width: 90%;
          height: 11mm;
          flex: 0 0 11mm;
          border-bottom: 1px solid #222;
          margin: 0 0 2mm;
        }
        .documento-motocars .firma-marca .logos-moto { margin-top: 2mm; }
        .documento-motocars .firma-marca .logos-moto img { max-height: 10mm; }
        .documento-motocars .detalle-pago-titulo { display: none; }

        .documento-motocars .detalle-pago-contenido { margin-top: 12mm; font-size: 14px; }

        .aviso-pago-moto { margin-top: 20mm; font-size: 12px; text-align: center; font-weight: 700; }

        @media print {

          .documento-motocars { display: flex !important; break-after: page !important; page-break-after: always !important; margin: 0 !important; }

          .documento-motocars:last-of-type { break-after: auto !important; page-break-after: auto !important; }

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



            setMostrarPrecio((anterior) => !anterior)



          }



        >



          {mostrarPrecio



            ? "Ocultar precio"



            : "Mostrar precio"}



        </button>







        <button



          type="button"



          className="boton-documento"



          onClick={() =>



            setMostrarObservaciones((anterior) => !anterior)



          }



        >



          {mostrarObservaciones



            ? "Ocultar observaciones"



            : "Mostrar observaciones"}



        </button>







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







      <MotoCarsDocumentoLayout

        marca="motos"

        titulo={`RECIBO DE VENTA ${es0Km ? "0 KM" : "USADO"}`}

        numero={operacion.numero || operacion.id}

        fecha={formatearFecha(operacion.created_at)}

      >

        <div className="datos-cliente">



  <div className="fila-dato">



    <div className="etiqueta">



      Cliente



    </div>







    <div className="valor">



      {nombreCliente(cliente)}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      DNI / CUIL / CUIT



    </div>







    <div className="valor">



      {documentoCliente(cliente)}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      Fecha nac.



    </div>







    <div className="valor">



      {cliente.fecha_nacimiento



        ? formatearFecha(



            cliente.fecha_nacimiento



          )



        : "—"}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      Profesión



    </div>







    <div className="valor">



      {cliente.profesion || "—"}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      Estado civil



    </div>







    <div className="valor">



      {cliente.estado_civil || "—"}



    </div>



  </div>







  {cliente.estado_civil === "Casado/a" && (



    <div



      style={{



        display: "grid",



        gap: 5,



      }}



    >



      <div className="fila-dato">



        <div className="etiqueta">



          Cónyuge



        </div>







        <div className="valor">



          {cliente.conyuge_nombre || "—"}



        </div>



      </div>







      <div className="fila-dato">



        <div className="etiqueta">



          DNI cónyuge



        </div>







        <div className="valor">



          {cliente.conyuge_dni || "—"}



        </div>



      </div>



    </div>



  )}







  <div className="fila-dato">



    <div className="etiqueta">



      Domicilio



    </div>







    <div className="valor">



      {cliente.direccion || "—"}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      Localidad



    </div>







    <div className="valor">



      {cliente.ciudad || "—"}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      Provincia



    </div>







    <div className="valor">



      {cliente.provincia || "—"}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      Teléfono



    </div>







    <div className="valor">



      {cliente.whatsapp ||



        cliente.telefono ||



        "—"}



    </div>



  </div>







  <div className="fila-dato">



    <div className="etiqueta">



      Email



    </div>







    <div className="valor">



      {cliente.email || "—"}



    </div>



  </div>



</div>







        <div className="bloque-detalle">



          <strong>Detalle:</strong>





            {mostrarPrecio && (



              <>



                Precio total: {formatearImporteCompleto(



                  operacion.total,



                  operacion.moneda



                )}{"\n"}



                                {operacion.importe_reserva !== null &&



                  operacion.importe_reserva > 0 && (



                    <>



                      Reserva abonada: {formatearImporteCompleto(



                        operacion.importe_reserva,



                        operacion.moneda



                      )}{"\n"}



                      Saldo pendiente: {formatearImporteCompleto(



                        Math.max(



                          0,



                          operacion.total -



                            operacion.importe_reserva



                        ),



                        operacion.moneda



                      )}{"\n"}



                    </>



                  )}



              </>



            )}



            Forma de pago: {operacion.forma_pago || "A definir"}



            {operacion.detalle_pago ? `\n${operacion.detalle_pago}` : ""}
<div className="detalle-operacion">
{mostrarObservaciones && operacion.observaciones && (
  <p style={{ whiteSpace: "pre-wrap" }}>
    <strong>Observaciones:</strong> {operacion.observaciones}
  </p>
)}


            
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
            <div className="linea-firma-moto" />
            <span>Firma vendedor — RVM PATAGONIA</span>
            <div className="logos-moto">
              <img src="/logos/rvm-patagonia-boleto.png" alt="RVM Patagonia" />
              <img src="/logos/jawa-patagonia-boleto.png" alt="JAWA Patagonia" />
            </div>
          </div>
          <div className="firma-comprador">
            <div className="linea-firma-moto" />
            <span>Firma y aclaración del comprador</span>
          </div>
        </div>
</MotoCarsDocumentoLayout>







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







    <MotoCarsDocumentoLayout

      marca="motos"

      titulo="DETALLE DE PAGO"

      numero={operacion.numero || operacion.id}

      fecha={formatearFecha(operacion.created_at)}

    >



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







      <p className="aviso-pago-moto">Enviar comprobantes a rvmpatagonia@gmail.com</p>





    </MotoCarsDocumentoLayout>



  </>



)}



    </>



  );



}