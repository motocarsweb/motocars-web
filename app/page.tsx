import Header from "@/componentes/layout/Header";
import Footer from "@/componentes/layout/Footer";

import Hero from "@/componentes/Home/Hero";
import Stats from "@/componentes/Home/Stats";
import FeaturedCars from "@/componentes/Home/FeaturedCars";
import About from "@/componentes/Home/About";
import Brands from "@/componentes/Home/Brands";
import CreditoCTA from "@/componentes/Home/CreditoCTA";
import { obtenerVehiculosPublicos } from "@/lib/supabase-vehicles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const todosLosVehiculos = await obtenerVehiculosPublicos();

  const vehiculosPublicados = todosLosVehiculos.filter(
    (vehiculo) =>
      vehiculo.publicado === true &&
    vehiculo.destacado === true &&
      vehiculo.tipo?.trim().toLowerCase() !== "moto"
  );

  return (
    <>
      <Header />

      <Hero />

      <Stats />

      <Brands />


<CreditoCTA />

<FeaturedCars vehicles={vehiculosPublicados} />

      <About />

      <Footer />
    </>
  );
}