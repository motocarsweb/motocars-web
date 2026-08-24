import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/componentes/layout/Footer";
import VehicleGallery from "@/componentes/VehicleGallery/VehicleGallery";
import { obtenerVehiculoPublicoPorId } from "@/lib/supabase-vehicles";

type MotoDetailPageProps = {
  params: Promise<{
    estilo: string;
    id: string;
  }>;
};

const ESTILOS_VALIDOS = [
  "adventure",
  "touring",
  "sport",
  "enduro",
  "custom",
  "clasicas",
];

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

function normalizarImagenes(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.filter(
      (imagen): imagen is string =>
        typeof imagen === "string" &&
        imagen.trim().length > 0
    );
  }

  if (typeof valor === "string") {
    const texto = valor.trim();

    if (!texto) {
      return [];
    }

    try {
      const parseado = JSON.parse(texto);

      if (Array.isArray(parseado)) {
        return parseado.filter(
          (imagen): imagen is string =>
            typeof imagen === "string" &&
            imagen.trim().length > 0
        );
      }
    } catch {
      return [texto];
    }
  }

  return [];
}

export default async function MotoDetailPage({
  params,
}: MotoDetailPageProps) {
  const { estilo, id } = await params;

  if (!ESTILOS_VALIDOS.includes(estilo)) {
    notFound();
  }

  const motoId = Number(id);

  if (!Number.isInteger(motoId) || motoId <= 0) {
    notFound();
  }

  const moto = await obtenerVehiculoPublicoPorId(motoId);

  if (!moto) {
    notFound();
  }

  if (
    moto.tipo?.trim().toLowerCase() !== "moto" ||
    moto.publicado !== true
  ) {
    notFound();
  }

  const titulo =
    [moto.marca, moto.modelo, moto.version]
      .filter(Boolean)
      .join(" ") || "Moto";

  const imagenPrincipal =
    moto.imagen_principal?.trim() ||
    "/images/placeholder-vehicle.jpg";

  const imagenesGuardadas = normalizarImagenes(
    moto.imagenes as unknown
  );

  const imagenes = [
    imagenPrincipal,
    ...imagenesGuardadas,
  ].filter(
    (imagen, index, listado) =>
      Boolean(imagen?.trim()) &&
      listado.indexOf(imagen) === index
  );

  const mensajeWhatsApp = encodeURIComponent(
    `Hola, quiero consultar por la moto ${titulo}${
      moto.anio ? `, año ${moto.anio}` : ""
    }. La vi publicada en la web de MotoCars.`
  );

  const whatsappUrl =
    `https://wa.me/5492995133023?text=${mensajeWhatsApp}`;

  return (
    <>
      <main className="vehicle-detail-page moto-detail-page">
        <section className="vehicle-detail">
          <div className="container">
            <Link
              href={`/motos/${estilo}`}
              className="vehicle-back-link"
            >
              ← Volver a {estilo}
            </Link>

            <div className="vehicle-detail-grid">
              <VehicleGallery
                imagenes={imagenes}
                titulo={titulo}
              />

              <div className="vehicle-detail-content">
                {moto.destacado && (
                  <span className="vehicle-detail-badge">
                    Destacada
                  </span>
                )}

                <h1>{titulo}</h1>

                <p className="vehicle-detail-price">
                  {formatearPrecio(moto.precio)}
                </p>

                <div className="vehicle-detail-info">
                  <div className="vehicle-detail-info-card">
                    <span>Año</span>
                    <strong>
                      {moto.anio || "Consultar"}
                    </strong>
                  </div>

                  <div className="vehicle-detail-info-card">
                    <span>Kilómetros</span>
                    <strong>
                      {formatearKilometros(
                        moto.kilometros
                      )}
                    </strong>
                  </div>

                  <div className="vehicle-detail-info-card">
                    <span>Condición</span>
                    <strong>
                      {moto.condicion === "0km"
                        ? "0 km"
                        : moto.condicion || "Consultar"}
                    </strong>
                  </div>

                  <div className="vehicle-detail-info-card">
                    <span>Color</span>
                    <strong>
                      {moto.color || "Consultar"}
                    </strong>
                  </div>

                  <div className="vehicle-detail-info-card">
                    <span>Estado</span>
                    <strong>
                      {moto.estado || "Consultar"}
                    </strong>
                  </div>

                  <div className="vehicle-detail-info-card">
                    <span>Marca</span>
                    <strong>
                      {moto.marca || "Consultar"}
                    </strong>
                  </div>
                </div>

                {moto.descripcion && (
                  <div className="vehicle-detail-description">
                    <h2>Descripción</h2>
                    <p>{moto.descripcion}</p>
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
                  disponibilidad, patentamiento y
                  formas de pago.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer showCta={false} />
    </>
  );
}