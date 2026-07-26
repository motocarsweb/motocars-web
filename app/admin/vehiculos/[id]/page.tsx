"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  actualizarVehiculo,
  obtenerVehiculoPorId,
} from "@/lib/supabase-vehicles";
import { subirImagenesVehiculo } from "@/lib/storage";

type ImagenEditable = {
  id: string;
  tipo: "existente" | "nueva";
  url: string;
  archivo?: File;
};

function crearId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function EditarVehiculoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const vehiculoId = Number(params.id);

  const urlsTemporales = useRef<string[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [imagenes, setImagenes] = useState<ImagenEditable[]>([]);

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

      try {
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

        const imagenesGuardadas = Array.isArray(vehiculo.imagenes)
          ? vehiculo.imagenes.filter(
              (url): url is string =>
                typeof url === "string" && url.trim().length > 0
            )
          : [];

        const imagenPrincipal =
          typeof vehiculo.imagen_principal === "string"
            ? vehiculo.imagen_principal.trim()
            : "";

        let urlsOrdenadas = [...imagenesGuardadas];

        if (
          imagenPrincipal &&
          !urlsOrdenadas.includes(imagenPrincipal)
        ) {
          urlsOrdenadas.unshift(imagenPrincipal);
        }

        if (
          imagenPrincipal &&
          urlsOrdenadas.includes(imagenPrincipal)
        ) {
          urlsOrdenadas = [
            imagenPrincipal,
            ...urlsOrdenadas.filter(
              (url) => url !== imagenPrincipal
            ),
          ];
        }

        const urlsSinDuplicados = Array.from(
          new Set(urlsOrdenadas)
        );

        setImagenes(
          urlsSinDuplicados.map((url) => ({
            id: crearId(),
            tipo: "existente" as const,
            url,
          }))
        );
      } catch (error) {
        console.error("Error al cargar el vehículo:", error);

        alert("No se pudo cargar la información del vehículo.");
        router.replace("/admin/vehiculos");
      } finally {
        setCargando(false);
      }
    }

    cargarVehiculo();
  }, [router, vehiculoId]);

  useEffect(() => {
    return () => {
      urlsTemporales.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

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

  function seleccionarImagenes(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivos = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (archivos.length === 0) {
      return;
    }

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const limiteBytes = 10 * 1024 * 1024;

    const archivosValidos: File[] = [];

    for (const archivo of archivos) {
      if (!formatosPermitidos.includes(archivo.type)) {
        alert(
          `El archivo "${archivo.name}" no es válido. Solo se permiten imágenes JPG, PNG o WEBP.`
        );
        continue;
      }

      if (archivo.size > limiteBytes) {
        alert(
          `La imagen "${archivo.name}" supera el límite de 10 MB.`
        );
        continue;
      }

      archivosValidos.push(archivo);
    }

    if (archivosValidos.length === 0) {
      return;
    }

    if (imagenes.length + archivosValidos.length > 20) {
      alert("Se permiten como máximo 20 imágenes por vehículo.");
      return;
    }

    const imagenesNuevas = archivosValidos.map((archivo) => {
      const urlTemporal = URL.createObjectURL(archivo);

      urlsTemporales.current.push(urlTemporal);

      return {
        id: crearId(),
        tipo: "nueva" as const,
        url: urlTemporal,
        archivo,
      };
    });

    setImagenes((imagenesAnteriores) => [
      ...imagenesAnteriores,
      ...imagenesNuevas,
    ]);
  }

  function hacerPortada(indice: number) {
    if (indice === 0) {
      return;
    }

    setImagenes((imagenesAnteriores) => {
      const copia = [...imagenesAnteriores];
      const [imagenSeleccionada] = copia.splice(indice, 1);

      return [imagenSeleccionada, ...copia];
    });
  }

  function moverImagen(
    indice: number,
    direccion: "izquierda" | "derecha"
  ) {
    setImagenes((imagenesAnteriores) => {
      const nuevoIndice =
        direccion === "izquierda" ? indice - 1 : indice + 1;

      if (
        nuevoIndice < 0 ||
        nuevoIndice >= imagenesAnteriores.length
      ) {
        return imagenesAnteriores;
      }

      const copia = [...imagenesAnteriores];

      [copia[indice], copia[nuevoIndice]] = [
        copia[nuevoIndice],
        copia[indice],
      ];

      return copia;
    });
  }

  function eliminarImagen(indice: number) {
    setImagenes((imagenesAnteriores) => {
      const imagenEliminada = imagenesAnteriores[indice];

      if (imagenEliminada?.tipo === "nueva") {
        URL.revokeObjectURL(imagenEliminada.url);

        urlsTemporales.current = urlsTemporales.current.filter(
          (url) => url !== imagenEliminada.url
        );
      }

      return imagenesAnteriores.filter(
        (_, posicion) => posicion !== indice
      );
    });
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
      const archivosNuevos = imagenes
        .filter(
          (
            imagen
          ): imagen is ImagenEditable & {
            tipo: "nueva";
            archivo: File;
          } =>
            imagen.tipo === "nueva" &&
            imagen.archivo instanceof File
        )
        .map((imagen) => imagen.archivo);

      const urlsNuevas =
        archivosNuevos.length > 0
          ? await subirImagenesVehiculo(archivosNuevos)
          : [];

      let indiceUrlNueva = 0;

      const urlsFinales = imagenes
        .map((imagen) => {
          if (imagen.tipo === "existente") {
            return imagen.url;
          }

          const urlSubida = urlsNuevas[indiceUrlNueva];
          indiceUrlNueva += 1;

          return urlSubida;
        })
        .filter(
          (url): url is string =>
            typeof url === "string" && url.trim().length > 0
        );

      const imagenPrincipal =
        urlsFinales.length > 0 ? urlsFinales[0] : null;

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
        imagenes: urlsFinales,
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
        "No se pudieron guardar los cambios o subir las imágenes."
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
          flexWrap: "wrap",
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
          maxWidth: 900,
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
            gap: 16,
            padding: 18,
            border: "1px solid #d1d5db",
            borderRadius: 12,
            backgroundColor: "#ffffff",
          }}
        >
          <div>
            <strong>Imágenes del vehículo</strong>

            <p
              style={{
                margin: "6px 0 0",
                color: "#6b7280",
                fontSize: 14,
              }}
            >
              La primera imagen será utilizada como portada.
            </p>
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={seleccionarImagenes}
          />

          <small style={{ color: "#6b7280" }}>
            JPG, PNG o WEBP. Máximo 10 MB por imagen y 20
            imágenes en total.
          </small>

          {imagenes.length === 0 ? (
            <div
              style={{
                padding: 24,
                border: "1px dashed #9ca3af",
                borderRadius: 10,
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Este vehículo no tiene imágenes seleccionadas.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(190px, 1fr))",
                gap: 16,
                alignItems: "stretch",
              }}
            >
              {imagenes.map((imagen, indice) => (
                <article
                  key={imagen.id}
                  style={{
                    display: "grid",
                    gridTemplateRows: "auto auto auto auto",
                    gap: 10,
                    height: "100%",
                    padding: 10,
                    border:
                      indice === 0
                        ? "2px solid #111827"
                        : "1px solid #d1d5db",
                    borderRadius: 10,
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "4 / 3",
                    }}
                  >
                    <img
                      src={imagen.url}
                      alt={`Imagen ${indice + 1} de ${form.marca} ${form.modelo}`}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />

                    {indice === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          padding: "5px 8px",
                          borderRadius: 6,
                          backgroundColor: "#111827",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        PORTADA
                      </span>
                    )}
                  </div>

                  {indice === 0 ? (
                    <div
                      style={{
                        minHeight: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 10px",
                        border: "1px solid #111827",
                        borderRadius: 7,
                        backgroundColor: "#111827",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Portada seleccionada
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => hacerPortada(indice)}
                      style={{
                        minHeight: 36,
                        padding: "8px 10px",
                        border: "1px solid #111827",
                        borderRadius: 7,
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Hacer portada
                    </button>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        moverImagen(indice, "izquierda")
                      }
                      disabled={indice === 0}
                      aria-label="Mover imagen hacia la izquierda"
                      style={{
                        minHeight: 36,
                        padding: "8px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: 7,
                        backgroundColor: "#ffffff",
                        cursor:
                          indice === 0
                            ? "not-allowed"
                            : "pointer",
                        opacity: indice === 0 ? 0.5 : 1,
                      }}
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moverImagen(indice, "derecha")
                      }
                      disabled={indice === imagenes.length - 1}
                      aria-label="Mover imagen hacia la derecha"
                      style={{
                        minHeight: 36,
                        padding: "8px 10px",
                        border: "1px solid #d1d5db",
                        borderRadius: 7,
                        backgroundColor: "#ffffff",
                        cursor:
                          indice === imagenes.length - 1
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          indice === imagenes.length - 1
                            ? 0.5
                            : 1,
                      }}
                    >
                      →
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => eliminarImagen(indice)}
                    style={{
                      minHeight: 36,
                      padding: "8px 10px",
                      border: "1px solid #dc2626",
                      borderRadius: 7,
                      backgroundColor: "#ffffff",
                      color: "#dc2626",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          )}
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
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando
            ? "Subiendo imágenes y guardando..."
            : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}