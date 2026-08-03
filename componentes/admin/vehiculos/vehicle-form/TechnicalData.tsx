import type { ChangeEvent } from "react";

type Catalogo = {
  id: string;
  nombre: string;
};

type TechnicalFormData = {
  anio: string;
  kilometros: string;
  combustible_id: string;
  transmision_id: string;
  traccion_id: string;
  color: string;
};

type TechnicalDataProps = {
  form: TechnicalFormData;
  combustibles: Catalogo[];
  transmisiones: Catalogo[];
  tracciones: Catalogo[];
  cargandoCatalogos: boolean;

  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;

  onCombustibleChange: (
    event: ChangeEvent<HTMLSelectElement>
  ) => void;

  onTransmisionChange: (
    event: ChangeEvent<HTMLSelectElement>
  ) => void;
};

export default function TechnicalData({
  form,
  combustibles,
  transmisiones,
  tracciones,
  cargandoCatalogos,
  onChange,
  onCombustibleChange,
  onTransmisionChange,
}: TechnicalDataProps) {
  return (
    <>
      <input
        type="number"
        name="anio"
        placeholder="Año"
        min="1900"
        max="2100"
        value={form.anio}
        onChange={onChange}
      />

      <input
        type="number"
        name="kilometros"
        placeholder="Kilómetros"
        min="0"
        value={form.kilometros}
        onChange={onChange}
      />

      <select
        name="combustible_id"
        value={form.combustible_id}
        onChange={onCombustibleChange}
        disabled={cargandoCatalogos}
      >
        <option value="">Seleccionar combustible</option>

        {combustibles.map((combustible) => (
          <option
            key={combustible.id}
            value={combustible.id}
          >
            {combustible.nombre}
          </option>
        ))}
      </select>

      <select
        name="transmision_id"
        value={form.transmision_id}
        onChange={onTransmisionChange}
        disabled={cargandoCatalogos}
      >
        <option value="">Seleccionar transmisión</option>

        {transmisiones.map((transmision) => (
          <option
            key={transmision.id}
            value={transmision.id}
          >
            {transmision.nombre}
          </option>
        ))}
      </select>

      <select
        name="traccion_id"
        value={form.traccion_id}
        onChange={onChange}
        disabled={cargandoCatalogos}
      >
        <option value="">Seleccionar tracción</option>

        {tracciones.map((traccion) => (
          <option
            key={traccion.id}
            value={traccion.id}
          >
            {traccion.nombre}
          </option>
        ))}
      </select>

      <input
        name="color"
        placeholder="Color"
        value={form.color}
        onChange={onChange}
      />
    </>
  );
}