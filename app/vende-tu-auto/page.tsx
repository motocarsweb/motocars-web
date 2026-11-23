import type { Metadata } from "next";
import Header from "@/componentes/layout/Header";
import Footer from "@/componentes/layout/Footer";
import FormularioVenderAuto from "@/componentes/Home/FormularioVenderAuto";

export const metadata: Metadata = {
  title: "Vendé tu auto",
  description: "Ofrecé tu vehículo a MotoCars Concesionaria en Neuquén. Enviá los datos de tu auto para que nuestro equipo lo evalúe.",
};

export default function VendeTuAutoPage() {
  return (
    <>
      <Header />
      <main className="min-h-[65vh] bg-zinc-50 px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-600">
              MotoCars Concesionaria
            </p>
            <h1 className="text-3xl font-bold text-zinc-950 md:text-4xl">
              ¿Tenés un auto para vender?
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Contanos qué vehículo querés vender. Nuestro equipo revisará
              la información y se comunicará con vos.
            </p>
            <FormularioVenderAuto />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
