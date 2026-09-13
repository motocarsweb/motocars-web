"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  obtenerFotosSalon,
} from "@/lib/service/fotos-salon";

const showroomImagesFallback = [
  "/images/salon1.jpeg",
  "/images/salon2.jpeg",
  "/images/salon3.JPG",
  "/images/salon4.jpeg",
  "/images/salon5.jpg",
  "/images/salon6.jpeg",
];

export default function About() {
  const [
    showroomImages,
    setShowroomImages,
  ] = useState<string[]>(
    showroomImagesFallback
  );

  useEffect(() => {
    async function cargarFotos() {
      try {
        const fotos =
          await obtenerFotosSalon();

        if (fotos.length > 0) {
          setShowroomImages(
            fotos.map(
              (foto) => foto.url
            )
          );
        }
      } catch (error) {
        console.error(
          "No se pudieron cargar las fotos del salón:",
          error
        );
      }
    }

    void cargarFotos();
  }, []);

  return (
    <section
      className="about"
      id="nosotros"
    >
      <div className="container">
        <div className="about-header">
          <div>
            <span className="about-subtitle">
              NUESTRA CONCESIONARIA
            </span>

            <h2>
              Un espacio pensado para
              elegir tu próximo vehículo
            </h2>
          </div>

          <p>
            En MotoCars combinamos
            experiencia, atención
            personalizada y una selección
            multimarca para acompañarte en
            cada etapa de la compra.
          </p>
        </div>

        <div className="showroom-grid">
          {showroomImages.map(
            (image, index) => (
              <div
                className={`showroom-card showroom-card-${
                  index + 1
                }`}
                key={image}
              >
                <img
                  src={image}
                  alt={`Salón MotoCars ${
                    index + 1
                  }`}
                />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}