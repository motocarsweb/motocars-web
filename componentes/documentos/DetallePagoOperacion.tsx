"use client";

import { useState } from "react";

import MotoCarsDocumentoLayout from "@/componentes/documentos/MotoCarsDocumentoLayout";
import { formatearImporteCompleto } from "@/lib/utils/numero-a-letras";

type TransferenciaPago = {
  importe: string;
  banco: string;
  titular: string;
  cuit: string;
  cbu: string;
  alias: string;
};

type Props = {
  numero: string | number;
  fecha: string;
  mostrar: boolean;
  onToggle: () => void;
};

const TRANSFERENCIA_INICIAL: TransferenciaPago = {
  importe: "",
  banco: "",
  titular: "",
  cuit: "",
  cbu: "",
  alias: "",
};

export default function DetallePagoOperacion({
  numero,
  fecha,
  mostrar,
  onToggle,
}: Props) {

  const [transferencias, setTransferencias] = useState<
    TransferenciaPago[]
  >([{ ...TRANSFERENCIA_INICIAL }]);

  const [observaciones, setObservaciones] = useState("");

  function actualizarTransferencia(
    indice: number,
    campo: keyof TransferenciaPago,
    valor: string
  ) {
    setTransferencias((anteriores) =>
      anteriores.map((transferencia, i) =>
        i === indice
          ? { ...transferencia, [campo]: valor }
          : transferencia
      )
    );
  }

  function agregarTransferencia() {
    setTransferencias((anteriores) => [
      ...anteriores,
      { ...TRANSFERENCIA_INICIAL },
    ]);
  }

  return (
    <>

      {mostrar && (
        <MotoCarsDocumentoLayout
          titulo="Detalle de Pago"
          numero={numero}
          fecha={fecha}
        >
          <section className="boleto-0km-texto">
            <h2 className="titulo-seccion-0km">
              Pago / Condiciones de la operación
            </h2>

            <div className="no-imprimir">
              {transferencias.map((transferencia, indice) => (
                <div
                  key={indice}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 10,
                    marginBottom: 18,
                    padding: 14,
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                  }}
                >
                  <strong style={{ gridColumn: "1 / -1" }}>
                    Transferencia {indice + 1}
                  </strong>

                  {(
                    [
                      ["importe", "Importe"],
                      ["banco", "Banco"],
                      ["titular", "Titular"],
                      ["cuit", "CUIT"],
                      ["cbu", "CBU / CVU"],
                      ["alias", "Alias"],
                    ] as const
                  ).map(([campo, etiqueta]) => (
                    <input
                      key={campo}
                      type={campo === "importe" ? "number" : "text"}
                      placeholder={etiqueta}
                      value={transferencia[campo]}
                      onChange={(e) =>
                        actualizarTransferencia(
                          indice,
                          campo,
                          e.target.value
                        )
                      }
                      style={{
                        padding: 10,
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                      }}
                    />
                  ))}
                </div>
              ))}

              <button
                type="button"
                onClick={agregarTransferencia}
                style={{
                  marginBottom: 16,
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                + Agregar otra transferencia
              </button>

              <textarea
                value={observaciones}
                onChange={(e) =>
                  setObservaciones(e.target.value)
                }
                placeholder="Observaciones o instrucciones adicionales..."
                style={{
                  width: "100%",
                  minHeight: 70,
                  padding: 10,
                  marginBottom: 16,
                  resize: "vertical",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                }}
              />
            </div>

            <div className="solo-imprimir">
              {transferencias.map((transferencia, indice) => (
                <div
                  key={indice}
                  className="condiciones-pago"
                  style={{ marginBottom: 14 }}
                >
                  <strong>
                    TRANSFERENCIA {indice + 1}
                  </strong>

                  <br />
                  <br />

                  <strong>Importe:</strong>{" "}
                  {transferencia.importe
                    ? formatearImporteCompleto(
                        Number(transferencia.importe),
                        "ARS"
                      )
                    : "—"}

                  <br />
                  <strong>Banco:</strong>{" "}
                  {transferencia.banco || "—"}

                  <br />
                  <strong>Titular:</strong>{" "}
                  {transferencia.titular || "—"}

                  <br />
                  <strong>CUIT:</strong>{" "}
                  {transferencia.cuit || "—"}

                  <br />
                  <strong>CBU / CVU:</strong>{" "}
                  {transferencia.cbu || "—"}

                  <br />
                  <strong>Alias:</strong>{" "}
                  {transferencia.alias || "—"}
                </div>
              ))}

              {observaciones.trim() && (
                <div className="condiciones-pago">
                  <strong>
                    Observaciones / instrucciones adicionales:
                  </strong>

                  <br />
                  <br />

                  <span style={{ whiteSpace: "pre-wrap" }}>
                    {observaciones}
                  </span>
                </div>
              )}
            </div>
          </section>
        </MotoCarsDocumentoLayout>
      )}
    </>
  );
}