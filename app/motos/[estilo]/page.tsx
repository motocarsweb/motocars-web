import Link from "next/link";

import Footer from "@/componentes/layout/Footer";
import MotosStock from "@/componentes/motos/MotosStock";

type MotosPorEstiloPageProps = {
  params: Promise<{
    estilo: string;
  }>;
};

const ESTILOS_VALIDOS = [
  "adventure",
  "touring",
  "sport",
  "enduro",
  "custom",
  "clasicas",
    "minicross",

];

export default async function MotosPorEstiloPage({
  params,
}: MotosPorEstiloPageProps) {
  const { estilo } = await params;

  if (!ESTILOS_VALIDOS.includes(estilo)) {
    return (
      <>
        <main
          style={{
            minHeight: "70vh",
            padding: "80px 20px",
            textAlign: "center",
          }}
        >
          <h1>Estilo de moto no encontrado</h1>

          <Link href="/motos">
            Volver a motos
          </Link>
        </main>

        <Footer showCta={false} />
      </>
    );
  }

  return (
    <>
      <main>
        <div
          style={{
            padding: "32px 20px 0",
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <Link
            href="/motos"
            style={{
              color: "#475569",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Volver a Motos
          </Link>
        </div>

        <MotosStock estiloSlug={estilo} />
      </main>

      <Footer showCta={false} />
    </>
  );
}