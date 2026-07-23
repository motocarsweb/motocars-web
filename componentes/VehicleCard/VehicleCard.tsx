import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Fuel,
  Gauge,
  Settings2,
} from "lucide-react";

type Vehicle = {
  id: number;
  marca: string;
  modelo: string;
  version: string | null;
  anio: number | null;
  precio: number | null;
  kilometros: number | null;
  combustible: string | null;
  transmision: string | null;
  color: string | null;
  tipo: string | null;
  estado: string | null;
  destacado: boolean | null;
  descripcion: string | null;
  imagen_principal: string | null;
};

type VehicleCardProps = {
  vehicle: Vehicle;
};

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

  const nombreCompleto = `${vehicle.marca} ${vehicle.modelo}`;

  return (
    <article className="vehicle-card">
      <Link
        href={`/vehiculos/${vehicle.id}`}
        className="vehicle-image"
        aria-label={`Ver ${nombreCompleto}`}
      >
        <img
          src={imagen}
          alt={nombreCompleto}
          loading="lazy"
        />

        {vehicle.destacado && (
          <span className="vehicle-badge">Destacado</span>
        )}

        <span className="vehicle-image-action">
          Ver detalle
          <ArrowUpRight size={16} />
        </span>
      </Link>

      <div className="vehicle-content">
        <div className="vehicle-heading">
          <div>
            <span className="vehicle-brand">{vehicle.marca}</span>

            <h3>
              {vehicle.modelo}
              {vehicle.version ? ` ${vehicle.version}` : ""}
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

          <span>
            <CalendarDays size={15} />
            Modelo {vehicle.anio ?? "Sin informar"}
          </span>
        </div>

        <div className="vehicle-card-footer">
          <div>
            <span className="vehicle-price-label">Precio</span>

            <div className="vehicle-price">
              {formatearPrecio(vehicle.precio)}
            </div>
          </div>

          <Link
            href={`/vehiculos/${vehicle.id}`}
            className="vehicle-details-button"
          >
            Ver vehículo
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}