import type { ChangeEvent } from "react";

type IdentityFormData = {
  dominio: string;
  numero_chasis: string;
  numero_motor: string;
};

type IdentitySectionProps = {
  form: IdentityFormData;

  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
};

export default function IdentitySection({
  form,
  onChange,
}: IdentitySectionProps) {
  return (
    <>
      <input
        name="dominio"
        placeholder="Dominio"
        value={form.dominio}
        onChange={onChange}
      />

      <input
        name="numero_chasis"
        placeholder="Número de chasis"
        value={form.numero_chasis}
        onChange={onChange}
      />

      <input
        name="numero_motor"
        placeholder="Número de motor"
        value={form.numero_motor}
        onChange={onChange}
      />
    </>
  );
}