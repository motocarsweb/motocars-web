import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import type { VehiculoSupabase } from "@/lib/supabase-vehicles";

type MotosStockProps = {
  estiloSlug?: string;
};

type EstiloMoto = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
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

function nombreMoto(moto: VehiculoSupabase) {
  return [moto.marca, moto.modelo, moto.version]
    .filter(Boolean)
    .join(" ");
}

export default async function MotosStock({
  estiloSlug,
}: MotosStockProps) {
  const [
    { data: estilos, error: errorEstilos },
    { data: motos, error: errorMotos },
  ] = await Promise.all([
    supabase
      .from("estilos_moto")
      .select("id, nombre, slug, orden")
      .eq("activo", true)
      .order("orden", { ascending: true }),

    supabase
      .from("vehiculos")
      .select("*")
      .eq("tipo", "Moto")
      .eq("publicado", true)
      .order("destacado", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (errorEstilos) {
    console.error(
      "Error al cargar estilos de motos:",
      errorEstilos.message
    );
  }

  if (errorMotos) {
    console.error(
      "Error al cargar motos:",
      errorMotos.message
    );
  }

  const estilosMoto = (estilos ?? []) as EstiloMoto[];
  const motosPublicadas = (motos ?? []) as VehiculoSupabase[];

  const estilosVisibles = estiloSlug
    ? estilosMoto.filter((estilo) => estilo.slug === estiloSlug)
    : estilosMoto;

  if (motosPublicadas.length === 0) {
    return null;
  }

  return (
  <section
    id="modelos"
    style={{
      scrollMarginTop: 90,
      padding: "72px 20px",
      background: "#f8fafc",
    }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 44,
            textAlign: "center",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: 8,
              color: "#64748b",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Stock disponible
          </span>

          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "clamp(30px, 4vw, 48px)",
              lineHeight: 1.05,
            }}
          >
            Encontrá tu próxima moto
          </h2>
        </div>

        {estilosVisibles.map((estilo) => {
          const motosDelEstilo = motosPublicadas.filter(
            (moto) => moto.estilo_moto_id === estilo.id
          );

          if (motosDelEstilo.length === 0) {
            return null;
          }

          return (
            <section
              key={estilo.id}
              id={estilo.slug}
              style={{
                scrollMarginTop: 100,
                marginBottom: 64,
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Estilo
                </span>

                <h3
                  style={{
                    margin: "6px 0 0",
                    color: "#111827",
                    fontSize: 30,
                  }}
                >
                  {estilo.nombre}
                </h3>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(280px, 340px))",
                  gap: 22,
                  justifyContent: "start",
                }}
              >
                {motosDelEstilo.map((moto) => {
                  const imagen =
                    moto.imagen_principal?.trim() ||
                    moto.imagenes?.[0] ||
                    "/images/placeholder-vehicle.jpg";

                  const detalleHref =
                    `/motos/${estilo.slug}/${moto.id}`;

                  return (
                    <article
                      key={moto.id}
                      style={{
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        borderRadius: 18,
                        background: "#ffffff",
                        boxShadow:
                          "0 12px 30px rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      <Link
                        href={detalleHref}
                        style={{
                          display: "block",
                          color: "inherit",
                          textDecoration: "none",
                        }}
                        aria-label={`Ver detalle de ${nombreMoto(moto)}`}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "4 / 3",
                            background: "#f1f5f9",
                          }}
                        >
                          <Image
                            src={imagen}
                            alt={nombreMoto(moto) || "Motocicleta"}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{
                              objectFit: "cover",
                            }}
                          />

                          {moto.destacado && (
                            <span
                              style={{
                                position: "absolute",
                                top: 14,
                                left: 14,
                                padding: "6px 10px",
                                borderRadius: 999,
                                background: "#111827",
                                color: "#ffffff",
                                fontSize: 11,
                                fontWeight: 800,
                              }}
                            >
                              Destacada
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            padding: "20px 20px 0",
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              marginBottom: 5,
                              color: "#64748b",
                              fontSize: 12,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {moto.marca || "Moto"}
                          </span>

                          <h4
                            style={{
                              margin: 0,
                              color: "#111827",
                              fontSize: 22,
                              lineHeight: 1.2,
                            }}
                          >
                            {[moto.modelo, moto.version]
                              .filter(Boolean)
                              .join(" ")}
                          </h4>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 8,
                              marginTop: 14,
                              color: "#475569",
                              fontSize: 13,
                            }}
                          >
                            {moto.anio && (
                              <span>{moto.anio}</span>
                            )}

                            {moto.condicion && (
                              <span>
                                ·{" "}
                                {moto.condicion === "0km"
                                  ? "0 km"
                                  : "Usada"}
                              </span>
                            )}

                            {moto.color && (
                              <span>· {moto.color}</span>
                            )}
                          </div>

                          <div
                            style={{
                              marginTop: 18,
                              color: "#111827",
                              fontSize: 22,
                              fontWeight: 800,
                            }}
                          >
                            {formatearPrecio(moto.precio)}
                          </div>

                          <div
                            style={{
                              marginTop: 12,
                              color: "#2563eb",
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            Ver fotos y detalle →
                          </div>
                        </div>
                      </Link>

                      <div
                        style={{
                          padding: "18px 20px 20px",
                        }}
                      >
                        <a
                          href={`https://wa.me/5492995133023?text=${encodeURIComponent(
                            `Hola, quiero consultar por la ${nombreMoto(moto)}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            minHeight: 44,
                            borderRadius: 10,
                            background: "#111827",
                            color: "#ffffff",
                            fontSize: 14,
                            fontWeight: 800,
                            textDecoration: "none",
                          }}
                        >
                          Consultar por WhatsApp
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}