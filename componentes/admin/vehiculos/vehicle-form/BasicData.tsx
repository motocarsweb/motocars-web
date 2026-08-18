import type { ChangeEvent } from "react";

import VersionSelector from "../VersionSelector";

type Marca = {
  id: string;
  nombre: string;
};

type Modelo = {
  id: string;
  nombre: string;
  marca_id: string;
};

type Catalogo = {
  id: string;
  nombre: string;
};

type BasicFormData = {
  tipo_ingreso_id: string;

  marca: string;
  marca_id: string;

  modelo: string;
  modelo_id: string;

  version: string;
  version_id: string;

  tipo: string;
  tipo_vehiculo_id: string;
  estilo_moto_id: string;

  condicion: string;
};

type BasicDataProps = {
  form: BasicFormData;
  marcas: Marca[];
  modelos: Modelo[];
  tiposVehiculo: Catalogo[];
  estilosMoto: Catalogo[];
  onEstiloMotoChange: (
  event: ChangeEvent<HTMLSelectElement>
) => void;
  tiposIngreso: Catalogo[];
  cargandoCatalogos: boolean;
  cargandoModelos: boolean;
  agregandoModelo: boolean;
  modeloNuevo: string;
  valorModeloNuevo: string;

  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;

  onMarcaChange: (
    event: ChangeEvent<HTMLSelectElement>
  ) => void | Promise<void>;

  onModeloChange: (
    event: ChangeEvent<HTMLSelectElement>
  ) => void;

  onModeloNuevoChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;

  onVersionChange: (
    versionId: string,
    versionNombre: string
  ) => void;

  onTipoVehiculoChange: (
    event: ChangeEvent<HTMLSelectElement>
  ) => void;
};

export default function BasicData({
  form,
  marcas,
  modelos,
  tiposVehiculo,
  estilosMoto,
  tiposIngreso,
  cargandoCatalogos,
  cargandoModelos,
  agregandoModelo,
  modeloNuevo,
  valorModeloNuevo,
  onChange,
  onMarcaChange,
  onModeloChange,
  onModeloNuevoChange,
  onVersionChange,
  onTipoVehiculoChange,
  onEstiloMotoChange,
}: BasicDataProps) {
  return (
    <>
      <select
        name="tipo_ingreso_id"
        value={form.tipo_ingreso_id}
        onChange={onChange}
        required
        disabled={cargandoCatalogos}
      >
        <option value="">
          {cargandoCatalogos
            ? "Cargando tipos de ingreso..."
            : "Seleccionar tipo de ingreso"}
        </option>

        {tiposIngreso.map((tipoIngreso) => (
          <option
            key={tipoIngreso.id}
            value={tipoIngreso.id}
          >
            {tipoIngreso.nombre}
          </option>
        ))}
      </select>

      <select
        name="marca_id"
        value={form.marca_id}
        onChange={onMarcaChange}
        required
        disabled={cargandoCatalogos}
      >
        <option value="">
          {cargandoCatalogos
            ? "Cargando marcas..."
            : "Seleccionar marca"}
        </option>

        {marcas.map((marca) => (
          <option key={marca.id} value={marca.id}>
            {marca.nombre}
          </option>
        ))}
      </select>

      <select
        name="modelo_id"
        value={form.modelo_id}
        onChange={onModeloChange}
        required
        disabled={!form.marca_id || cargandoModelos}
      >
        <option value="">
          {!form.marca_id
            ? "Primero seleccioná una marca"
            : cargandoModelos
              ? "Cargando modelos..."
              : "Seleccionar modelo"}
        </option>

        {modelos.map((modelo) => (
          <option key={modelo.id} value={modelo.id}>
            {modelo.nombre}
          </option>
        ))}

        {form.marca_id && (
          <option value={valorModeloNuevo}>
            + Agregar modelo nuevo
          </option>
        )}
      </select>

      {agregandoModelo && (
        <input
          name="modelo_nuevo"
          placeholder="Escribí el modelo nuevo"
          value={modeloNuevo}
          onChange={onModeloNuevoChange}
          required
          autoFocus
        />
      )}

      <VersionSelector
        modeloId={form.modelo_id}
        versionId={form.version_id}
        versionNombre={form.version}
        onChange={onVersionChange}
      />

      <select
        name="tipo_vehiculo_id"
        value={form.tipo_vehiculo_id}
        onChange={onTipoVehiculoChange}
        required
        disabled={cargandoCatalogos}

      >
        <option value="">
          Seleccionar tipo de vehículo
        </option>

        {tiposVehiculo.map((tipoVehiculo) => (
          <option
            key={tipoVehiculo.id}
            value={tipoVehiculo.id}
          >
            {tipoVehiculo.nombre}
          </option>
        ))}
      </select>

      {form.tipo === "Moto" && (
  <select
    name="estilo_moto_id"
    value={form.estilo_moto_id}
    onChange={onEstiloMotoChange}
    required
  >
    <option value="">
      Seleccionar estilo de moto
    </option>

    {estilosMoto.map((estilo) => (
      <option
        key={estilo.id}
        value={estilo.id}
      >
        {estilo.nombre}
      </option>
    ))}
  </select>
)}

      <select
        name="condicion"
        value={form.condicion}
        onChange={onChange}
      >
        <option value="0km">0 km</option>
        <option value="usado">Usado</option>
      </select>
    </>
  );
}