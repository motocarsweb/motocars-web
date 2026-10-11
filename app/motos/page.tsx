import Footer from "@/componentes/layout/Footer";
import {
  HeroMotos,
  BrandsSection,
  RVMSection,
  JAWASection,
} from "@/componentes/motos";

import CTASection from "@/componentes/motos/CTASection";
import MotosStock from "@/componentes/motos/MotosStock";

export default function MotosPage() {
  return (
    <>
      <main>
        <HeroMotos />
        <CTASection />
        <BrandsSection />
        <RVMSection />
        <JAWASection />
        <MotosStock />
      </main>

      <Footer showCta={false} />
    </>
  );
}