import Footer from "@/componentes/layout/Footer";
import {
  HeroMotos,
  BrandsSection,
  RVMSection,
  JAWASection,
} from "@/componentes/motos";
import MotosStock from "@/componentes/motos/MotosStock";

export default function MotosPage() {
  return (
    <>
      <main>
        <HeroMotos />
        <BrandsSection />
        <RVMSection />
        <JAWASection />
        <MotosStock />
      </main>

      <Footer showCta={false} />
    </>
  );
}