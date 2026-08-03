import type { ChangeEvent } from "react";

type DescriptionFormData = {
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

export default function DescriptionSection({
  form,
  onChange,
}: DescriptionSectionProps) {
  return (
    <>
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