"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import {
  FotoPortada,
  obtenerFotoPortada,
  subirFotoPortada,
} from "@/lib/service/foto-portada";

export default function FotoPortadaPage() {
  const [foto, setFoto] =
    useState<FotoPortada | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [subiendo, setSubiendo] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true);
        setError("");

        const fotoActual =
          await obtenerFotoPortada();

        setFoto(fotoActual);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la foto de portada."
        );
      } finally {
        setCargando(false);
      }
    }

    void cargar();
  }, []);

  async function seleccionarFoto(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const archivo =
      event.target.files?.[0];

    event.target.value = "";

    if (!archivo) {
      return;
    }

    if (
      !archivo.type.startsWith("image/")
    ) {
      setError(
        "Seleccioná un archivo de imagen."
      );
      return;
    }

    try {
      setSubiendo(true);
      setError("");
      setMensaje("");

      const nuevaFoto =
        await subirFotoPortada(
          archivo
        );

      setFoto(nuevaFoto);

      setMensaje(
        "La foto de portada se actualizó correctamente."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la foto de portada."
      );
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Foto de portada
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Imagen principal que se muestra en la portada de MotoCars.
          La imagen se convierte automáticamente a WebP y se
          optimiza a un máximo de 1920 px de ancho.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {mensaje}
        </div>
      )}

      <section className="rounded-xl border bg-white p-5">
        {cargando ? (
          <p className="text-sm text-gray-500">
            Cargando foto...
          </p>
        ) : (
          <div className="space-y-5">
            <div
              className="relative overflow-hidden rounded-xl bg-gray-100"
              style={{
                aspectRatio: "16 / 9",
              }}
            >
              <img
                src={
                  foto?.url ??
                  "/images/hero-salon.webp"
                }
                alt="Foto de portada de MotoCars"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white">
                {subiendo
                  ? "Procesando..."
                  : foto
                    ? "Reemplazar foto"
                    : "Cargar foto"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={subiendo}
                  onChange={seleccionarFoto}
                  className="hidden"
                />
              </label>

              <span className="text-sm text-gray-500">
                JPEG, PNG o WebP. El archivo final se guarda optimizado
                en formato WebP.
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}