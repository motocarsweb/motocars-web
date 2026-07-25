import Header from "@/componentes/layout/Header";
import Footer from "@/componentes/layout/Footer";

import Hero from "@/componentes/Home/Hero";
import Stats from "@/componentes/Home/Stats";
import FeaturedCars from "@/componentes/Home/FeaturedCars";
import About from "@/componentes/Home/About";

import { obtenerVehiculos } from "@/lib/supabase-vehicles";

export default async function Home() {
  const vehiculos = await obtenerVehiculos();
  
    return (
    <>
      <Header />

      <Hero />

      <Stats />

      <FeaturedCars vehicles={vehiculos} />

      <About />

      <Footer />
    </>
  );
}