import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/componentes/layout/Footer";
import { supabase } from "@/lib/supabase";
import type { VehiculoSupabase } from "@/lib/supabase-vehicles";

type MotosPorMarcaPageProps = {
  params: Promise<{
    marca: string;
  }>;
};

const MARCAS_VALIDAS = ["rvm", "jawa"];

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

export default async function MotosPorMarcaPage({
  params,
}: MotosPorMarcaPageProps) {
  const { marca } = await params;

  if (!MARCAS_VALIDAS.includes(marca)) {
    notFound();
  }

  const marcaNombre = marca.toUpperCase();

  const { data, error } = await supabase
    .from("vehiculos")
    .select(`
  *,
  estilos_moto (
    slug
  )
`)
    .eq("tipo", "Moto")
    .eq("publicado", true)
    .ilike("marca", marcaNombre)
    .order("destacado", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      `Error al cargar motos ${marcaNombre}:`,
      error.message
    );
  }

  type MotoConEstilo = VehiculoSupabase & {
  estilos_moto: {
    slug: string;
  } | null;
};

const motos = (data ?? []) as MotoConEstilo[];

  return (
    <>
      <main
        style={{
          minHeight: "75vh",
          padding: "40px 20px 80px",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1180,
            margin: "0 auto",
          }}
        >
          <Link
            href="/motos"
            style={{
              display: "inline-block",
              marginBottom: 36,
              color: "#334155",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Volver a Motos
          </Link>

          <div
            style={{
              marginBottom: 32,
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
              Stock por marca
            </span>

            <h1
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: "clamp(32px, 4vw, 48px)",
              }}
            >
              {marcaNombre}
            </h1>
          </div>

          {motos.length === 0 ? (
            <p
              style={{
                color: "#64748b",
                fontSize: 16,
              }}
            >
              No hay motos publicadas de {marcaNombre}.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(280px, 340px))",
                gap: 22,
                justifyContent: "start",
              }}
            >
              {motos.map((moto) => {
                const imagen =
                  moto.imagen_principal?.trim() ||
                  moto.imagenes?.[0] ||
                  "/images/placeholder-vehicle.jpg";

                const titulo =
                  [moto.modelo, moto.version]
                    .filter(Boolean)
                    .join(" ") || "Moto";

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
                    <img
                      src={imagen}
                      alt={`${marcaNombre} ${titulo}`}
                      style={{
                        display: "block",
                        width: "100%",
                        aspectRatio: "4 / 3",
                        objectFit: "cover",
                        background: "#f1f5f9",
                      }}
                    />

                    <div
                      style={{
                        padding: 20,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          marginBottom: 5,
                          color: "#64748b",
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {marcaNombre}
                      </span>

                      <h2
                        style={{
                          margin: 0,
                          color: "#111827",
                          fontSize: 22,
                        }}
                      >
                        {titulo}
                      </h2>

                      <div
                        style={{
                          marginTop: 16,
                          color: "#111827",
                          fontSize: 22,
                          fontWeight: 800,
                        }}
                      >
                        {formatearPrecio(moto.precio)}
                      </div>

                      <a
                        href={`/motos/${moto.estilos_moto?.slug}/${moto.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          minHeight: 42,
                          marginTop: 18,
                          borderRadius: 10,
                          background: "#111827",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: 14,
                          fontWeight: 800,
                        }}
                      >
                        Ver moto
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer showCta={false} />
    </>
  );
}