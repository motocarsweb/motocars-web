import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Car,
  Cog,
  Fuel,
  Gauge,
  Palette,
} from "lucide-react";

import VehicleGallery from "@/componentes/VehicleDetail/VehicleGallery";
import { obtenerVehiculoPorId } from "@/lib/supabase-vehicles";

const whatsappNumber = "5492995133023";

function formatearPrecio(precio: number | null) {
  if (precio === null) {
    return "Consultar";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatearKilometros(kilometros: number | null) {
  if (kilometros === null) {
    return "Sin informar";
  }

  return `${new Intl.NumberFormat("es-AR").format(kilometros)} km`;
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const vehicleId = Number(slug);

  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    notFound();
  }

  const vehicle = await obtenerVehiculoPorId(vehicleId);

  if (!vehicle) {
    notFound();
  }

  const nombreCompleto = [
    vehicle.marca,
    vehicle.modelo,
    vehicle.version,
  ]
    .filter(Boolean)
    .join(" ");

  const imagenPrincipal =
    vehicle.imagen_principal?.trim() || "/images/vehiculo-placeholder.jpg";
    const imagenes =
  vehicle.marca.toLowerCase() === "jeep" &&
  vehicle.modelo.toLowerCase() === "renegade"
    ? [
        "/images/renegade1.jpeg",
        "/images/renegade2.jpeg",
        "/images/renegade3.jpeg",
        "/images/renegade4.jpeg",
        "/images/renegade5.jpeg",
        "/images/renegade6.jpeg",
        "/images/renegade7.jpeg",
      ]
    : [imagenPrincipal];

  const whatsappMessage = encodeURIComponent(
    `Hola, vi publicado el vehículo ${nombreCompleto}${
      vehicle.anio ? ` modelo ${vehicle.anio}` : ""
    } en la web de MotoCars y quisiera recibir más información.`
  );

  return (
    <main className="vehicle-detail-page">
      <section className="vehicle-detail">
        <div className="container">
          <Link href="/#vehiculos" className="vehicle-back-link">
            ← Volver a vehículos
          </Link>

          <div className="vehicle-detail-grid">
            <VehicleGallery
  imagenes={imagenes}
  marca={vehicle.marca}
  modelo={vehicle.modelo}
/>

            <div className="vehicle-detail-content">
              <span className="vehicle-detail-badge">
                {vehicle.estado || "Disponible"}
              </span>

              <h1>{nombreCompleto}</h1>

              <div className="vehicle-detail-price">
                {formatearPrecio(vehicle.precio)}
              </div>

              <p className="vehicle-detail-description">
                {vehicle.descripcion ||
                  "Unidad disponible en MotoCars. Consultanos para conocer más detalles, opciones de financiación y condiciones de permuta."}
              </p>

              <div className="vehicle-detail-info">
                <div className="vehicle-detail-info-card">
                  <Calendar size={22} />
                  <span>Año</span>
                  <strong>{vehicle.anio ?? "Sin informar"}</strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <Gauge size={22} />
                  <span>Kilómetros</span>
                  <strong>
                    {formatearKilometros(vehicle.kilometros)}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <Fuel size={22} />
                  <span>Combustible</span>
                  <strong>
                    {vehicle.combustible || "Sin informar"}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <Cog size={22} />
                  <span>Transmisión</span>
                  <strong>
                    {vehicle.transmision || "Sin informar"}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <Car size={22} />
                  <span>Tipo</span>
                  <strong>{vehicle.tipo || "Sin informar"}</strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <Palette size={22} />
                  <span>Color exterior</span>
                  <strong>{vehicle.color || "Sin informar"}</strong>
                </div>
              </div>

              <div className="vehicle-detail-location">
                <span>Ubicación</span>
                <strong>Neuquén Capital</strong>
              </div>

              <a
                className="vehicle-detail-whatsapp"
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Consultar por WhatsApp
              </a>

              <p className="vehicle-detail-note">
                Consultanos por financiación, permutas y disponibilidad de la
                unidad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}