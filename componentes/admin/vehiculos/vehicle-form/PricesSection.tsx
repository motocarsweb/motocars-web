import type { ChangeEvent } from "react";

type PricesFormData = {
  precio: string;
  precio_compra: string;
};

type PricesSectionProps = {
  form: PricesFormData;

  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
};

export default function PricesSection({
  form,
  onChange,
}: PricesSectionProps) {
  return (
    <>
      <input
        type="number"
        name="precio"
        placeholder="Precio de venta"
        min="0"
        value={form.precio}
        onChange={onChange}
      />

      <input
        type="number"
        name="precio_compra"
        placeholder="Precio de compra"
        min="0"
        value={form.precio_compra}
        onChange={onChange}
      />
    </>
  );
}