import type { ChangeEvent } from "react";

type DescriptionFormData = {
  condicion: string;
  descripcion: string;
  observaciones_internas: string;
};

type DescriptionSectionProps = {
  form: DescriptionFormData;

  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
};

const OBSERVACION_0KM =
  "Máxima financiación. Permutas. Valor referencial (todo 0 km se debe verificar precio, stock y color en el momento).";

export default function DescriptionSection({
  form,
  onChange,
}: DescriptionSectionProps) {
  const observacion0KmActiva =
    form.descripcion.trim() === OBSERVACION_0KM;

  function actualizarDescripcion(valor: string) {
    onChange({
      target: {
        name: "descripcion",
        value: valor,
        type: "textarea",
      },
    } as ChangeEvent<HTMLTextAreaElement>);
  }

  function cambiarObservacion0Km(
    event: ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.checked) {
      actualizarDescripcion(OBSERVACION_0KM);
      return;
    }

    if (observacion0KmActiva) {
      actualizarDescripcion("");
    }
  }

  return (
    <>
      {form.condicion === "0km" && (
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            border: "1px solid #dbe3ee",
            borderRadius: 10,
            backgroundColor: "#f8fafc",
            color: "#334155",
            fontSize: 14,
            lineHeight: 1.45,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={observacion0KmActiva}
            onChange={cambiarObservacion0Km}
            style={{
              marginTop: 3,
              width: 16,
              height: 16,
              flex: "0 0 auto",
            }}
          />

          <span>
            <strong>
              Cargar observación comercial estándar para 0 km
            </strong>
            <br />
            <span
              style={{
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Máxima financiación. Permutas. Valor referencial
              (todo 0 km se debe verificar precio, stock y color
              en el momento).
            </span>
          </span>
        </label>
      )}

      <textarea
        name="descripcion"
        placeholder="Descripción comercial"
        value={form.descripcion}
        onChange={onChange}
        rows={5}
      />

      <textarea
        name="observaciones_internas"
        placeholder="Observaciones internas"
        value={form.observaciones_internas}
        onChange={onChange}
        rows={4}
      />
    </>
  );
}