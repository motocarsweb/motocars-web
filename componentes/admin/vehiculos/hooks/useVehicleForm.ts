"use client";

import { useState } from "react";

export type MarcaFormulario = {
  id: string;
  nombre: string;
};

export type VehicleFormData = {
  marca: string;
  modelo: string;
  version: string;
  combustible: string;
  transmision: string;
  tipo: string;

  marca_id: string;
  modelo_id: string;
  version_id: string;
  tipo_vehiculo_id: string;
  estilo_moto_id: string;
  combustible_id: string;
  transmision_id: string;
  traccion_id: string;
  tipo_ingreso_id: string;

  anio: string;
  precio: string;
  precio_compra: string;
  kilometros: string;

  color: string;
  estado: string;
  condicion: string;

  dominio: string;
  numero_chasis: string;
  numero_motor: string;

  destacado: boolean;
  publicado: boolean;

  descripcion: string;
  observaciones_internas: string;
};

export const VEHICLE_FORM_INITIAL_DATA: VehicleFormData = {
  marca: "",
  modelo: "",
  version: "",
  combustible: "",
  transmision: "",
  tipo: "",

  marca_id: "",
  modelo_id: "",
  version_id: "",
  tipo_vehiculo_id: "",
  estilo_moto_id: "",
  combustible_id: "",
  transmision_id: "",
  traccion_id: "",
  tipo_ingreso_id: "",

  anio: "",
  precio: "",
  precio_compra: "",
  kilometros: "",

  color: "",
  estado: "Disponible",
  condicion: "usado",

  dominio: "",
  numero_chasis: "",
  numero_motor: "",

  destacado: false,
  publicado: true,

  descripcion: "",
  observaciones_internas: "",
};

type ActualizarMarcaParametros = {
  event: React.ChangeEvent<HTMLSelectElement>;
  marcas: MarcaFormulario[];
  cargarModelosPorMarca: (
    marcaId: string
  ) => Promise<void>;
  limpiarModeloNuevo: () => void;
};

export function useVehicleForm() {
  const [form, setForm] = useState<VehicleFormData>(
    VEHICLE_FORM_INITIAL_DATA
  );

  function actualizar(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = event.target;

    setForm((formAnterior) => ({
      ...formAnterior,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function actualizarMarca({
    event,
    marcas,
    cargarModelosPorMarca,
    limpiarModeloNuevo,
  }: ActualizarMarcaParametros) {
    const marcaId = event.target.value;

    const marcaSeleccionada = marcas.find(
      (marca) => marca.id === marcaId
    );

    limpiarModeloNuevo();

    setForm((formAnterior) => ({
      ...formAnterior,

      marca_id: marcaId,
      marca: marcaSeleccionada?.nombre ?? "",

      modelo_id: "",
      modelo: "",

      version_id: "",
      version: "",
    }));

    await cargarModelosPorMarca(marcaId);
  }

  function actualizarCampos(
    campos: Partial<VehicleFormData>
  ) {
    setForm((formAnterior) => ({
      ...formAnterior,
      ...campos,
    }));
  }

  function reemplazarFormulario(
    datos: VehicleFormData
  ) {
    setForm(datos);
  }

  function limpiarFormulario() {
    setForm({
      ...VEHICLE_FORM_INITIAL_DATA,
    });
  }

  return {
    form,
    setForm,

    actualizar,
    actualizarMarca,

    actualizarCampos,
    reemplazarFormulario,
    limpiarFormulario,
  };
}