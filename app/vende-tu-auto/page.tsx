import type { Metadata } from "next";
import Header from "@/componentes/layout/Header";
import Footer from "@/componentes/layout/Footer";
import FormularioVenderAuto from "@/componentes/Home/FormularioVenderAuto";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Vendé tu auto",
  description: "Ofrecé tu vehículo a MotoCars Concesionaria en Neuquén. Enviá los datos de tu auto para que nuestro equipo lo evalúe.",
};

export default function VendeTuAutoPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <p className={styles.eyebrow}>
              MotoCars Concesionaria
            </p>
            <h1 className={styles.heading}>
              ¿Tenés un auto para vender?
            </h1>
            <p className={styles.intro}>
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
