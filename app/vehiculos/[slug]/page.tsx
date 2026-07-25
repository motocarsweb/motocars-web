import Link from "next/link";
import { notFound } from "next/navigation";

import VehicleGallery from "@/componentes/VehicleGallery/VehicleGallery";
import { obtenerVehiculoPorId } from "@/lib/supabase-vehicles";

type VehicleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatearPrecio(precio: number | null | undefined) {
  if (!precio) {
    return "Consultar precio";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

function formatearKilometros(
  kilometros: number | null | undefined
) {
  if (kilometros === null || kilometros === undefined) {
    return "Consultar";
  }

  return `${new Intl.NumberFormat("es-AR").format(
    kilometros
  )} km`;
}

export default async function VehicleDetailPage({
  params,
}: VehicleDetailPageProps) {
  const { slug } = await params;

  const id = Number(slug);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const vehiculo = await obtenerVehiculoPorId(id);

  if (!vehiculo) {
    notFound();
  }

  const titulo =
    [vehiculo.marca, vehiculo.modelo, vehiculo.version]
      .filter(Boolean)
      .join(" ") || "Vehículo";

  const imagenPrincipal =
    vehiculo.imagen_principal?.trim() ||
    "/images/placeholder-vehicle.jpg";

  const imagenesGuardadas = Array.isArray(vehiculo.imagenes)
    ? vehiculo.imagenes
    : [];

  const imagenes = [
    imagenPrincipal,
    ...imagenesGuardadas,
  ].filter(
    (imagen, index, listado) =>
      Boolean(imagen?.trim()) &&
      listado.indexOf(imagen) === index
  );

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, quiero consultar por el vehículo ${titulo}${
      vehiculo.anio ? `, año ${vehiculo.anio}` : ""
    }. Lo vi publicado en la web de MotoCars.`
  );

  const whatsappUrl =
    `https://wa.me/5492995133023?text=${mensajeWhatsApp}`;

  return (
    <main className="vehicle-detail-page">
      <section className="vehicle-detail">
        <div className="container">
          <Link
            href="/#vehiculos"
            className="vehicle-back-link"
          >
            ← Volver a vehículos
          </Link>

          <div className="vehicle-detail-grid">
            <VehicleGallery
              imagenes={imagenes}
              titulo={titulo}
            />

            <div className="vehicle-detail-content">
              {vehiculo.destacado && (
                <span className="vehicle-detail-badge">
                  Nuevo ingreso
                </span>
              )}

              <h1>{titulo}</h1>

              <p className="vehicle-detail-price">
                {formatearPrecio(vehiculo.precio)}
              </p>

              <div className="vehicle-detail-info">
                <div className="vehicle-detail-info-card">
                  <span>Año</span>
                  <strong>
                    {vehiculo.anio || "Consultar"}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <span>Kilómetros</span>
                  <strong>
                    {formatearKilometros(
                      vehiculo.kilometros
                    )}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <span>Combustible</span>
                  <strong>
                    {vehiculo.combustible || "Consultar"}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <span>Transmisión</span>
                  <strong>
                    {vehiculo.transmision || "Consultar"}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <span>Color</span>
                  <strong>
                    {vehiculo.color || "Consultar"}
                  </strong>
                </div>

                <div className="vehicle-detail-info-card">
                  <span>Estado</span>
                  <strong>
                    {vehiculo.estado || "Consultar"}
                  </strong>
                </div>
              </div>

              {vehiculo.descripcion && (
                <div className="vehicle-detail-description">
                  <h2>Descripción</h2>
                  <p>{vehiculo.descripcion}</p>
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="vehicle-detail-whatsapp"
              >
                Consultar por WhatsApp
              </a>

              <p className="vehicle-detail-note">
                Consultanos por financiación,
                disponibilidad y recepción de vehículos
                usados.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}