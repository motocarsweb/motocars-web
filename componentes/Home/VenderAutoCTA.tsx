import Link from "next/link";
import styles from "./VenderAutoCTA.module.css";

export default function VenderAutoCTA() {
  return (
    <section className={styles.banner} aria-labelledby="vender-auto-titulo">
      <div className={styles.inner}>
        <h2 id="vender-auto-titulo" className={styles.title}>
          ¿TENÉS UN AUTO PARA VENDER?
        </h2>

        <p className={styles.description}>
          Ofrecenos tu vehículo de forma rápida y sencilla.
          Completá el formulario y nuestro equipo se pondrá en contacto con vos.
        </p>

        <Link href="/vende-tu-auto" className={styles.button}>
          HACÉ CLIC ACÁ
        </Link>
      </div>
    </section>
  );
}
