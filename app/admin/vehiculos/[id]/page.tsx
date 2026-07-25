"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  actualizarVehiculo,
  obtenerVehiculoPorId,
} from "@/lib/supabase-vehicles";
import { subirImagenVehiculo } from "@/lib/storage";

export default function EditarVehiculoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const vehiculoId = Number(params.id);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [imagenNueva, setImagenNueva] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [imagenActual, setImagenActual] = useState("");

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

  useEffect(() => {
    async function cargarVehiculo() {
      if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
        alert("El identificador del vehículo no es válido.");
        router.replace("/admin/vehiculos");
        return;
      }

      const vehiculo = await obtenerVehiculoPorId(vehiculoId);

      if (!vehiculo) {
        alert("No se encontró el vehículo.");
        router.replace("/admin/vehiculos");
        return;
      }

      setForm({
        marca: vehiculo.marca ?? "",
        modelo: vehiculo.modelo ?? "",
        version: vehiculo.version ?? "",
        anio: vehiculo.anio?.toString() ?? "",
        precio: vehiculo.precio?.toString() ?? "",
        kilometros: vehiculo.kilometros?.toString() ?? "",
        combustible: vehiculo.combustible ?? "",
        transmision: vehiculo.transmision ?? "",
        color: vehiculo.color ?? "",
        tipo: vehiculo.tipo ?? "",
        estado: vehiculo.estado ?? "Usado",
        destacado: vehiculo.destacado ?? false,
        descripcion: vehiculo.descripcion ?? "",
      });

      setImagenActual(vehiculo.imagen_principal ?? "");
      setCargando(false);
    }

    cargarVehiculo();
  }, [router, vehiculoId]);

  useEffect(() => {
    if (!imagenNueva) {
      setVistaPrevia("");
      return;
    }

    const urlTemporal = URL.createObjectURL(imagenNueva);
    setVistaPrevia(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [imagenNueva]);

  function actualizarCampo(
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

  function seleccionarImagen(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo = event.target.files?.[0];

    if (!archivo) {
      setImagenNueva(null);
      return;
    }

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatosPermitidos.includes(archivo.type)) {
      alert("La imagen debe ser JPG, PNG o WEBP.");
      event.target.value = "";
      setImagenNueva(null);
      return;
    }

    const limiteBytes = 10 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      alert("La imagen no puede superar los 10 MB.");
      event.target.value = "";
      setImagenNueva(null);
      return;
    }

    setImagenNueva(archivo);
  }

  async function guardarCambios(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (guardando) {
      return;
    }

    setGuardando(true);

    try {
      let imagenPrincipal: string | null = imagenActual || null;

      if (imagenNueva) {
        imagenPrincipal = await subirImagenVehiculo(imagenNueva);
      }

      const resultado = await actualizarVehiculo(vehiculoId, {
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
      });

      if (!resultado) {
        alert("No se pudieron guardar los cambios.");
        return;
      }

      alert("Vehículo actualizado correctamente.");

      router.push("/admin/vehiculos");
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar el vehículo:", error);

      alert(
        "No se pudo actualizar el vehículo o subir la imagen."
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <section>
        <h1>Editar vehículo</h1>
        <p>Cargando información...</p>
      </section>
    );
  }

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Editar vehículo</h1>

          <p style={{ marginTop: 8, color: "#6b7280" }}>
            {form.marca} {form.modelo}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/vehiculos")}
          style={{
            padding: "10px 16px",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          Volver
        </button>
      </div>

      <form
        onSubmit={guardarCambios}
        style={{
          display: "grid",
          gap: 18,
          maxWidth: 700,
        }}
      >
        <input
          name="marca"
          placeholder="Marca"
          value={form.marca}
          onChange={actualizarCampo}
          required
        />

        <input
          name="modelo"
          placeholder="Modelo"
          value={form.modelo}
          onChange={actualizarCampo}
          required
        />

        <input
          name="version"
          placeholder="Versión"
          value={form.version}
          onChange={actualizarCampo}
        />

        <input
          type="number"
          name="anio"
          placeholder="Año"
          min="1900"
          max="2100"
          value={form.anio}
          onChange={actualizarCampo}
        />

        <input
          type="number"
          name="precio"
          placeholder="Precio"
          min="0"
          value={form.precio}
          onChange={actualizarCampo}
        />

        <input
          type="number"
          name="kilometros"
          placeholder="Kilómetros"
          min="0"
          value={form.kilometros}
          onChange={actualizarCampo}
        />

        <input
          name="combustible"
          placeholder="Combustible"
          value={form.combustible}
          onChange={actualizarCampo}
        />

        <input
          name="transmision"
          placeholder="Transmisión"
          value={form.transmision}
          onChange={actualizarCampo}
        />

        <input
          name="color"
          placeholder="Color"
          value={form.color}
          onChange={actualizarCampo}
        />

        <input
          name="tipo"
          placeholder="Tipo"
          value={form.tipo}
          onChange={actualizarCampo}
        />

        <select
          name="estado"
          value={form.estado}
          onChange={actualizarCampo}
        >
          <option value="Nuevo">Nuevo</option>
          <option value="Usado">Usado</option>
        </select>

        <div
          style={{
            display: "grid",
            gap: 12,
            padding: 18,
            border: "1px solid #d1d5db",
            borderRadius: 10,
          }}
        >
          <strong>Imagen principal</strong>

          {(vistaPrevia || imagenActual) && (
            <img
              src={vistaPrevia || imagenActual}
              alt={`${form.marca} ${form.modelo}`}
              style={{
                width: "100%",
                maxWidth: 420,
                height: 260,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid #d1d5db",
              }}
            />
          )}

          <label htmlFor="imagen-nueva">
            Seleccionar una nueva imagen
          </label>

          <input
            id="imagen-nueva"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={seleccionarImagen}
          />

          <small>
            Si no seleccionás otra imagen, se conservará la actual.
          </small>
        </div>

        <textarea
          name="descripcion"
          placeholder="Descripción"
          rows={5}
          value={form.descripcion}
          onChange={actualizarCampo}
        />

        <label>
          <input
            type="checkbox"
            name="destacado"
            checked={form.destacado}
            onChange={actualizarCampo}
          />{" "}
          Vehículo destacado
        </label>

        <button
          type="submit"
          disabled={guardando}
          style={{
            padding: "13px 18px",
            border: 0,
            borderRadius: 8,
            backgroundColor: "#111827",
            color: "white",
            fontWeight: 600,
            cursor: guardando ? "not-allowed" : "pointer",
          }}
        >
          {guardando
            ? imagenNueva
              ? "Subiendo imagen y guardando..."
              : "Guardando cambios..."
            : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}