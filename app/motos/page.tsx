import Footer from "@/componentes/layout/Footer";
import {
  HeroMotos,
  BrandsSection,
  RVMSection,
  JAWASection,
} from "@/componentes/motos";

export default function MotosPage() {
  return (

      <><main>
          <HeroMotos />
          <BrandsSection />
          <RVMSection />
          <JAWASection />
      </main><Footer showCta={false} /></>
  );
}
