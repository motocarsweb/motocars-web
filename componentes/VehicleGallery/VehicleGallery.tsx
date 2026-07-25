"use client";

import { useState } from "react";

type VehicleGalleryProps = {
  imagenes?: string[];
  titulo: string;
};

export default function VehicleGallery({
  imagenes = [],
  titulo,
}: VehicleGalleryProps) {
  const imagenesValidas = imagenes.filter(
    (imagen, index, listado) =>
      Boolean(imagen?.trim()) && listado.indexOf(imagen) === index
  );

  const [imagenActiva, setImagenActiva] = useState(
    imagenesValidas[0] || "/images/placeholder-vehicle.jpg"
  );

  return (
    <div className="vehicle-detail-gallery">
      <div className="vehicle-detail-main-image">
        <img src={imagenActiva} alt={titulo} />
      </div>

      {imagenesValidas.length > 1 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(90px, 1fr))",
            gap: 10,
            marginTop: 14,
          }}
        >
          {imagenesValidas.map((imagen, index) => {
            const seleccionada = imagen === imagenActiva;

            return (
              <button
                key={imagen}
                type="button"
                onClick={() => setImagenActiva(imagen)}
                aria-label={`Ver imagen ${index + 1} de ${titulo}`}
                style={{
                  padding: 0,
                  border: seleccionada
                    ? "3px solid #111827"
                    : "1px solid #d1d5db",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img
                  src={imagen}
                  alt={`${titulo} - imagen ${index + 1}`}
                  style={{
                    display: "block",
                    width: "100%",
                    height: 75,
                    objectFit: "cover",
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}