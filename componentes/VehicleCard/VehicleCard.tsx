import Link from "next/link";
import {
  ArrowUpRight,
  Fuel,
  Gauge,
  MessageCircle,
  Settings2,
} from "lucide-react";

import type { VehiculoSupabase } from "@/lib/supabase-vehicles";

type VehicleCardProps = {
  vehicle: VehiculoSupabase;
};

const WHATSAPP_NUMBER = "5492995133023";

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

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const imagen =
    vehicle.imagen_principal?.trim() || "/images/vehiculo-placeholder.jpg";

  const marca = vehicle.marca?.trim() || "Marca sin informar";
  const modelo = vehicle.modelo?.trim() || "Modelo sin informar";
  const version = vehicle.version?.trim() || "";

  const nombreCompleto = `${marca} ${modelo}${
    version ? ` ${version}` : ""
  }`;

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, me interesa el ${nombreCompleto}${
      vehicle.anio ? ` ${vehicle.anio}` : ""
    } publicado en MotoCars. Quisiera recibir más información.`
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeWhatsApp}`;

  return (
    <article className="vehicle-card">
      <Link
        href={`/vehiculos/${vehicle.id}`}
        className="vehicle-image"
        aria-label={`Ver ${nombreCompleto}`}
      >
        <img src={imagen} alt={nombreCompleto} loading="lazy" />

        {vehicle.destacado && (
          <span className="vehicle-badge">Destacado</span>
        )}

        <span className="vehicle-image-action">
          Ver detalle
          <ArrowUpRight size={15} />
        </span>
      </Link>

      <div className="vehicle-content">
        <div className="vehicle-heading">
          <div>
            <span className="vehicle-brand">{marca}</span>

            <h3>
              {modelo}
              {version ? ` ${version}` : ""}
            </h3>
          </div>

          {vehicle.anio !== null && (
            <span className="vehicle-year">{vehicle.anio}</span>
          )}
        </div>

        <div className="vehicle-info">
          <span>
            <Gauge size={15} />
            {formatearKilometros(vehicle.kilometros)}
          </span>

          <span>
            <Fuel size={15} />
            {vehicle.combustible || "Sin informar"}
          </span>

          <span>
            <Settings2 size={15} />
            {vehicle.transmision || "Sin informar"}
          </span>
        </div>

        <div className="vehicle-price-wrapper">
          <span className="vehicle-price-label">Precio</span>

          <div className="vehicle-price">
            {formatearPrecio(vehicle.precio)}
          </div>
        </div>

        <div className="vehicle-card-actions">
          <Link
            href={`/vehiculos/${vehicle.id}`}
            className="vehicle-details-button"
          >
            Ver vehículo
            <ArrowUpRight size={16} />
          </Link>

          <a
            href={whatsappUrl}
            className="vehicle-whatsapp-button"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Consultar por WhatsApp sobre ${nombreCompleto}`}
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}