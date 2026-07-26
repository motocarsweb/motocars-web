"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ImageManager from "@/app/ImageManager";
import { crearVehiculo } from "@/lib/supabase-vehicles";
import { subirImagenesVehiculo } from "@/lib/storage";

export default function NuevoVehiculoPage() {
  const router = useRouter();

  const [guardando, setGuardando] = useState(false);
  const [imagenes, setImagenes] = useState<File[]>([]);

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    version: "",
    anio: "",
    precio: "",
    kilometros: "",
    combustible: "",
    transmision: "",
    color: "",
    tipo: "",
    estado: "Usado",
    destacado: false,
    descripcion: "",
  });

  function actualizar(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (guardando) {
      return;
    }

    setGuardando(true);

    try {
      let urlsImagenes: string[] = [];

      if (imagenes.length > 0) {
        urlsImagenes = await subirImagenesVehiculo(imagenes);
      }

      const imagenPrincipal =
        urlsImagenes.length > 0 ? urlsImagenes[0] : null;

      const resultado = await crearVehiculo({
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        version: form.version.trim() || null,
        anio: form.anio ? Number(form.anio) : null,
        precio: form.precio ? Number(form.precio) : null,
        kilometros: form.kilometros
          ? Number(form.kilometros)
          : null,
        combustible: form.combustible.trim() || null,
        transmision: form.transmision.trim() || null,
        color: form.color.trim() || null,
        tipo: form.tipo.trim() || null,
        estado: form.estado || null,
        destacado: form.destacado,
        descripcion: form.descripcion.trim() || null,
        imagen_principal: imagenPrincipal,
        imagenes: urlsImagenes,
      });

      if (!resultado) {
        alert("Ocurrió un error al guardar el vehículo.");
        return;
      }

      alert("Vehículo guardado correctamente.");

      router.push("/admin/vehiculos");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar el vehículo:", error);

      alert(
        "No se pudo guardar el vehículo o subir las imágenes. Revisá la consola para ver el error."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section>
      <h1>Nuevo vehículo</h1>

      <form
        onSubmit={guardar}
        style={{
          display: "grid",
          gap: 18,
          maxWidth: 700,
          marginTop: 30,
        }}
      >
        <input
          name="marca"
          placeholder="Marca"
          value={form.marca}
          onChange={actualizar}
          required
        />

        <input
          name="modelo"
          placeholder="Modelo"
          value={form.modelo}
          onChange={actualizar}
          required
        />

        <input
          name="version"
          placeholder="Versión"
          value={form.version}
          onChange={actualizar}
        />

        <input
          type="number"
          name="anio"
          placeholder="Año"
          min="1900"
          max="2100"
          value={form.anio}
          onChange={actualizar}
        />

        <input
          type="number"
          name="precio"
          placeholder="Precio"
          min="0"
          value={form.precio}
          onChange={actualizar}
        />

        <input
          type="number"
          name="kilometros"
          placeholder="Kilómetros"
          min="0"
          value={form.kilometros}
          onChange={actualizar}
        />

        <input
          name="combustible"
          placeholder="Combustible"
          value={form.combustible}
          onChange={actualizar}
        />

        <input
          name="transmision"
          placeholder="Transmisión"
          value={form.transmision}
          onChange={actualizar}
        />

        <input
          name="color"
          placeholder="Color"
          value={form.color}
          onChange={actualizar}
        />

        <input
          name="tipo"
          placeholder="Tipo"
          value={form.tipo}
          onChange={actualizar}
        />

        <select
          name="estado"
          value={form.estado}
          onChange={actualizar}
        >
          <option value="Nuevo">Nuevo</option>
          <option value="Usado">Usado</option>
        </select>

        <ImageManager
          images={imagenes}
          onChange={setImagenes}
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          rows={5}
          value={form.descripcion}
          onChange={actualizar}
        />

        <label>
          <input
            type="checkbox"
            name="destacado"
            checked={form.destacado}
            onChange={actualizar}
          />{" "}
          Vehículo destacado
        </label>

        <button type="submit" disabled={guardando}>
          {guardando
            ? imagenes.length > 0
              ? `Subiendo ${imagenes.length} imágenes...`
              : "Guardando..."
            : "Guardar vehículo"}
        </button>
      </form>
    </section>
  );
}