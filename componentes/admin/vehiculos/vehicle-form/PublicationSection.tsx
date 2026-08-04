import type { ChangeEvent } from "react";

type PublicationFormData = {
  publicado: boolean;
  destacado: boolean;
};

type PublicationSectionProps = {
  form: PublicationFormData;

  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
};

export default function PublicationSection({
  form,
  onChange,
}: PublicationSectionProps) {
  return (
    <>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <input
          type="checkbox"
          name="publicado"
          checked={form.publicado}
          onChange={onChange}
        />
        Publicar vehículo
      </label>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <input
          type="checkbox"
          name="destacado"
          checked={form.destacado}
          onChange={onChange}
        />
        Vehículo destacado
      </label>
    </>
  );
}