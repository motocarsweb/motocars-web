"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type VehicleGalleryProps = {
  imagenes: string[];
  marca: string;
  modelo: string;
};

export default function VehicleGallery({
  imagenes,
  marca,
  modelo,
}: VehicleGalleryProps) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(imagenes[0]);

  const indiceActual = imagenes.indexOf(imagenSeleccionada);

  const imagenAnterior = () => {
    const nuevoIndice =
      indiceActual === 0 ? imagenes.length - 1 : indiceActual - 1;

    setImagenSeleccionada(imagenes[nuevoIndice]);
  };

    const imagenSiguiente = () => {
    const nuevoIndice =
      indiceActual === imagenes.length - 1 ? 0 : indiceActual + 1;

    setImagenSeleccionada(imagenes[nuevoIndice]);
  };

  useEffect(() => {
    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        imagenAnterior();
      }

      if (event.key === "ArrowRight") {
        imagenSiguiente();
      }
    };

    window.addEventListener("keydown", manejarTecla);

    return () => {
      window.removeEventListener("keydown", manejarTecla);
    };
  }, [imagenSeleccionada]);

  return (
    <div className="vehicle-detail-gallery">
      <div className="vehicle-detail-main-image">
        <img
          src={imagenSeleccionada}
          alt={`${marca} ${modelo}`}
        />

        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              className="vehicle-gallery-arrow vehicle-gallery-arrow-left"
              onClick={imagenAnterior}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={28} />
            </button>

            <button
              type="button"
              className="vehicle-gallery-arrow vehicle-gallery-arrow-right"
              onClick={imagenSiguiente}
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {imagenes.length > 1 && (
        <div className="vehicle-detail-thumbnails">
          {imagenes.map((imagen, index) => (
            <button
              key={imagen}
              type="button"
              className={
                imagenSeleccionada === imagen
                  ? "vehicle-thumbnail active"
                  : "vehicle-thumbnail"
              }
              onClick={() => setImagenSeleccionada(imagen)}
            >
              <img
                src={imagen}
                alt={`${marca} ${modelo} - imagen ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}