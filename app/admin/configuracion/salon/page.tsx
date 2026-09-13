"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import PageHeader from "@/componentes/admin/PageHeader";

import {
  actualizarOrdenFotosSalon,
  eliminarFotoSalon,
  obtenerFotosSalon,
  subirFotoSalon,
  type FotoSalon,
} from "@/lib/service/fotos-salon";

const MAX_FOTOS = 6;

export default function FotosSalonPage() {
  const [fotos, setFotos] =
    useState<FotoSalon[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [subiendo, setSubiendo] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    void cargarFotos();
  }, []);

  async function cargarFotos() {
    try {
      setError("");

      const data =
        await obtenerFotosSalon();

      setFotos(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudieron cargar las fotos."
      );
    } finally {
      setCargando(false);
    }
  }

  async function seleccionarFotos(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const archivos = Array.from(
      event.target.files ?? []
    );

    event.target.value = "";

    if (archivos.length === 0) {
      return;
    }

    if (
      fotos.length +
        archivos.length >
      MAX_FOTOS
    ) {
      alert(
        `Podés tener como máximo ${MAX_FOTOS} fotos del salón.`
      );

      return;
    }

    setSubiendo(true);
    setError("");

    try {
      let siguienteOrden =
        fotos.length;

      for (const archivo of archivos) {
        await subirFotoSalon(
          archivo,
          siguienteOrden
        );

        siguienteOrden++;
      }

      await cargarFotos();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo subir la imagen."
      );
    } finally {
      setSubiendo(false);
    }
  }

  async function eliminar(
    foto: FotoSalon
  ) {
    const confirmar =
      window.confirm(
        "¿Eliminar esta foto del salón?"
      );

    if (!confirmar) {
      return;
    }

    try {
      setError("");

      await eliminarFotoSalon(foto);

      const restantes =
        fotos.filter(
          (item) =>
            item.id !== foto.id
        );

      await actualizarOrdenFotosSalon(
        restantes
      );

      setFotos(
        restantes.map(
          (item, index) => ({
            ...item,
            orden: index,
          })
        )
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo eliminar la foto."
      );
    }
  }

  async function mover(
    index: number,
    direccion: -1 | 1
  ) {
    const nuevoIndex =
      index + direccion;

    if (
      nuevoIndex < 0 ||
      nuevoIndex >= fotos.length
    ) {
      return;
    }

    const actual =
      fotos[index];

    const destino =
      fotos[nuevoIndex];

    if (!actual || !destino) {
      return;
    }

    const nuevasFotos =
      [...fotos];

    nuevasFotos[index] =
      destino;

    nuevasFotos[nuevoIndex] =
      actual;

    setFotos(nuevasFotos);

    try {
      await actualizarOrdenFotosSalon(
        nuevasFotos
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo guardar el orden."
      );

      await cargarFotos();
    }
  }

  return (
    <main className="p-6">
      <PageHeader
        titulo="Fotos del salón"
        descripcion="Administrá las imágenes que aparecen en la página principal de MotoCars."
      />

      <div className="mx-auto mt-6 max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5">
          <div>
            <strong className="block text-lg">
              Galería del salón
            </strong>

            <span className="text-sm text-gray-500">
              {fotos.length} de{" "}
              {MAX_FOTOS} fotos
            </span>
          </div>

          <label
            className={`inline-flex cursor-pointer items-center rounded-lg px-5 py-3 font-semibold text-white ${
              subiendo ||
              fotos.length >= MAX_FOTOS
                ? "cursor-not-allowed bg-gray-400"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {subiendo
              ? "Procesando..."
              : "Agregar fotos"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={
                subiendo ||
                fotos.length >=
                  MAX_FOTOS
              }
              onChange={
                seleccionarFotos
              }
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {cargando ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            Cargando fotos...
          </div>
        ) : fotos.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center text-gray-500">
            Todavía no hay fotos cargadas.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {fotos.map(
              (foto, index) => (
                <article
                  key={foto.id}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <img
                      src={foto.url}
                      alt={`Salón MotoCars ${
                        index + 1
                      }`}
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>

                  <div className="grid gap-3 p-4">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={
                          index === 0
                        }
                        onClick={() =>
                          mover(
                            index,
                            -1
                          )
                        }
                        className="rounded-lg border px-3 py-2 font-medium disabled:opacity-30"
                      >
                        ← Izquierda
                      </button>

                      <button
                        type="button"
                        disabled={
                          index ===
                          fotos.length -
                            1
                        }
                        onClick={() =>
                          mover(
                            index,
                            1
                          )
                        }
                        className="rounded-lg border px-3 py-2 font-medium disabled:opacity-30"
                      >
                        Derecha →
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        eliminar(foto)
                      }
                      className="rounded-lg border border-red-300 px-3 py-2 font-medium text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}