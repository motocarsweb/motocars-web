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
  type IngresoUsado,
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

function formatearKilometros(
  kilometros:
    | number
    | null
) {
  if (
    kilometros === null
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "es-AR"
  ).format(
    kilometros
  );
}

function CasilleroDocumento({
  marcado,
  texto,
}: {
  marcado: boolean;
  texto: string;
}) {
  return (
    <div className="item-documentacion">
      <span className="casillero-documentacion">
        {marcado
          ? "☑"
          : "☐"}
      </span>

      <span>
        {texto}
      </span>
    </div>
  );
}

export default function BoletoUsadoPermutaPage() {
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
    ingresoUsado,
    setIngresoUsado,
  ] =
    useState<IngresoUsado | null>(
      null
    );

  const [
    vehiculoPermuta,
    setVehiculoPermuta,
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
          "usado"
        ) {
          throw new Error(
            "El vehículo vendido no corresponde a un usado."
          );
        }

        if (
          !ingresoCargado ||
          ingresoCargado.tipo_ingreso !==
            "permuta"
        ) {
          throw new Error(
            "Esta venta no tiene una unidad usada recibida en permuta."
          );
        }

        const permutaCargada =
          await obtenerVehiculoPorId(
            ingresoCargado.vehiculo_id
          );

        if (
          !permutaCargada
        ) {
          throw new Error(
            "No se encontró el vehículo recibido en permuta."
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

        setIngresoUsado(
          ingresoCargado
        );

        setVehiculoPermuta(
          permutaCargada
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
            : "No se pudo cargar el boleto de venta con permuta."
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
        Cargando boleto de venta con permuta...
      </main>
    );
  }

  if (
    error ||
    !operacion ||
    !cliente ||
    !vehiculo ||
    !ingresoUsado ||
    !vehiculoPermuta
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
            "No se pudo cargar el boleto de venta con permuta."}
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

        .boleto-usado-texto {
          margin-top: 16px;

          font-size: 12.5px;
          line-height: 1.38;

          text-align: justify;
        }

        .boleto-usado-texto p {
          margin: 0 0 8px;
        }

        .boleto-usado-texto strong {
          font-weight: 800;
        }

        .titulo-seccion-usado {
          margin: 11px 0 6px;

          padding-bottom: 4px;

          border-bottom:
            1px solid #d4d4d4;

          font-size: 11.5px;
          font-weight: 800;

          letter-spacing: 0.6px;

          text-transform: uppercase;
        }

        .datos-usado {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 4px 20px;

          font-size: 11.5px;
        }

        .dato-usado {
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

        .bloque-permuta {
          margin: 8px 0 10px;

          padding: 9px 10px;

          border: 1px solid #d4d4d4;
          border-radius: 6px;

          background: #fafafa;
        }

        .documentacion-permuta {
          margin: 6px 0 10px;

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          column-gap: 22px;
          row-gap: 3px;

          padding: 8px 10px;

          border: 1px solid #d4d4d4;
          border-radius: 6px;

          font-size: 11.2px;
          line-height: 1.25;
        }

        .item-documentacion {
          display: flex;
          align-items: flex-start;

          gap: 6px;

          min-width: 0;
        }

        .casillero-documentacion {
          flex: 0 0 auto;

          font-size: 13px;
          line-height: 1;
        }

        .firmas-usado {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 70px;

          margin-top: 90px;
          margin-bottom: 10px;
        }

        .firma-usado {
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
          .datos-usado,
          .documentacion-permuta {
            grid-template-columns: 1fr;
          }

          .firmas-usado {
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
        <section className="boleto-usado-texto">
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
  automotor usado con permuta.
</p>

          <h2 className="titulo-seccion-usado">
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
    <div className="dato-usado">
      <strong>Comprador:</strong>
      <span>{nombreCliente(cliente)}</span>
    </div>

    <div className="dato-usado">
      <strong>Fecha nac.:</strong>
      <span>
        {cliente.fecha_nacimiento
          ? formatearFecha(cliente.fecha_nacimiento)
          : "—"}
      </span>
    </div>

    <div className="dato-usado">
      <strong>Estado civil:</strong>
      <span>{cliente.estado_civil || "—"}</span>
    </div>

    <div className="dato-usado">
      <strong>Domicilio:</strong>
      <span>{cliente.direccion || "—"}</span>
    </div>

    <div className="dato-usado">
      <strong>Teléfono:</strong>
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
    <div className="dato-usado">
      <strong>DNI/CUIT:</strong>
      <span>{documentoCliente(cliente)}</span>
    </div>

    <div className="dato-usado">
      <strong>Profesión:</strong>
      <span>{cliente.profesion || "—"}</span>
    </div>

    {cliente.estado_civil === "Casado/a" && (
      <>
        <div className="dato-usado">
          <strong>Cónyuge:</strong>
          <span>
            {cliente.conyuge_nombre || "—"}
          </span>
        </div>

        <div className="dato-usado">
          <strong>DNI cónyuge:</strong>
          <span>
            {cliente.conyuge_dni || "—"}
          </span>
        </div>
      </>
    )}

    <div className="dato-usado">
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

    <div className="dato-usado">
      <strong>Email:</strong>
      <span>{cliente.email || "—"}</span>
    </div>
  </div>
</div>

          <h2 className="titulo-seccion-usado">
            Vehículo vendido
          </h2>

          <div className="datos-usado">
            <div className="dato-usado">
              <strong>
                Vehículo:
              </strong>

              <span>
                {nombreVehiculo(
                  vehiculo
                )}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Año:
              </strong>

              <span>
                {vehiculo.anio ??
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Dominio:
              </strong>

              <span>
                {vehiculo.dominio ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Color:
              </strong>

              <span>
                {vehiculo.color ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Chasis:
              </strong>

              <span>
                {vehiculo.numero_chasis ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Motor:
              </strong>

              <span>
                {vehiculo.numero_motor ||
                  "—"}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Kilómetros:
              </strong>

              <span>
                {formatearKilometros(
                  vehiculo.kilometros
                )}
              </span>
            </div>

            <div className="dato-usado">
              <strong>
                Condición:
              </strong>

              <span>
                Usado
              </span>
            </div>
          </div>

          <p
            style={{
              marginTop: 12,
            }}
          >
            <strong>
              1)
            </strong>{" "}
            EL VENDEDOR vende a EL
            COMPRADOR el vehículo usado
            individualizado
            precedentemente, el cual ha
            sido examinado, probado y
            verificado por el adquirente,
            quien manifiesta conocer su
            estado general de uso y
            conservación.
          </p>

          <p>
            El precio total de la
            operación se establece en la
            suma de{" "}
            <strong>
              {formatearImporteCompleto(
                operacion.total,
                operacion.moneda
              )}
            </strong>
            .
          </p>

          <h2 className="titulo-seccion-usado">
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

            <br />
            <br />

            <strong>
              Unidad recibida en permuta:
            </strong>{" "}
            {nombreVehiculo(
              vehiculoPermuta
            )}
            {vehiculoPermuta.dominio
              ? ` - Dominio ${vehiculoPermuta.dominio}`
              : ""}

            {ingresoUsado.valor_ingreso >
              0 && (
              <>
                <br />

                <strong>
                  Valor asignado:
                </strong>{" "}
                {formatearImporteCompleto(
                  ingresoUsado.valor_ingreso,
                  "ARS"
                )}
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
            EL COMPRADOR declara que la
            unidad entregada en permuta,
            individualizada en el punto
            siguiente, es de su entera
            propiedad y que, salvo lo
            expresamente informado en el
            presente contrato, no registra
            embargos, inhibiciones ni
            deudas que impidan su
            transferencia.
          </p>

          <p>
            <strong>
              3)
            </strong>{" "}
            La unidad entregada en
            permuta se individualiza con
            los siguientes datos:
          </p>

          <div className="bloque-permuta">
            <div className="datos-usado">
              <div className="dato-usado">
                <strong>
                  Vehículo:
                </strong>

                <span>
                  {nombreVehiculo(
                    vehiculoPermuta
                  )}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Año:
                </strong>

                <span>
                  {vehiculoPermuta.anio ??
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Dominio:
                </strong>

                <span>
                  {vehiculoPermuta.dominio ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Color:
                </strong>

                <span>
                  {vehiculoPermuta.color ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Chasis:
                </strong>

                <span>
                  {vehiculoPermuta.numero_chasis ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Motor:
                </strong>

                <span>
                  {vehiculoPermuta.numero_motor ||
                    "—"}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Kilómetros:
                </strong>

                <span>
                  {formatearKilometros(
                    vehiculoPermuta.kilometros
                  )}
                </span>
              </div>

              <div className="dato-usado">
                <strong>
                  Valor:
                </strong>

                <span>
                  {ingresoUsado.valor_ingreso >
                  0
                    ? formatearImporteCompleto(
                        ingresoUsado.valor_ingreso,
                        "ARS"
                      )
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          <p>
            <strong>
              4)
            </strong>{" "}
            DOCUMENTACIÓN Y ELEMENTOS
            RECIBIDOS DE LA UNIDAD
            ENTREGADA EN PERMUTA:
          </p>

          <div className="documentacion-permuta">
            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_titulo_propiedad
              }
              texto="Título de Propiedad"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_cat
              }
              texto="CAT"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_cedula
              }
              texto="Cédula de identificación"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_cedulas_adicionales
              }
              texto="Cédulas adicionales"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_formulario_08
              }
              texto="Formulario 08 firmado/certificado"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_verificacion_policial
              }
              texto="Verificación policial / Formulario 12"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_libre_deuda_patentes
              }
              texto="Libre deuda de patentes"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_libre_deuda_infracciones
              }
              texto="Libre deuda de infracciones"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_informe_dominio
              }
              texto="Informe de dominio"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_manuales
              }
              texto="Manuales"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_duplicado_llave
              }
              texto="Duplicado de llave"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_prenda_03
              }
              texto="Prenda 03"
            />

            <CasilleroDocumento
              marcado={
                ingresoUsado.doc_otros
              }
              texto={
                ingresoUsado.doc_otros &&
                ingresoUsado.doc_otros_detalle
                  ? `Otros: ${ingresoUsado.doc_otros_detalle}`
                  : "Otros"
              }
            />
          </div>

          <p>
            <strong>
              5)
            </strong>{" "}
            En este acto se entregará al
            COMPRADOR la siguiente
            documentación y elementos,
            según corresponda: a) Cédula
            de identificación del titular
            anterior; b) Seguro provisorio
            (optativo); c) Copia del
            Título de Propiedad; d)
            Duplicado de llaves; e)
            Manuales; f) Verificación
            vehicular; g) Detalle de
            servicios.
          </p>

          <p>
            <strong>
              6)
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
              7)
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

          <div className="firmas-usado">
            <div className="firma-usado">
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

            <div className="firma-usado">
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
