import Image from "next/image";
import Link from "next/link";

const marcas = [
  {
    nombre: "MotoCars",
    descripcion: "Autos, SUVs, pickups y utilitarios seleccionados.",
    logo: "/logos/motocars-horizontal-blanco.png",
    href: "#vehiculos",
    boton: "Ver vehículos",
    clase: "brand-card brand-card-motocars",
  },
  {
    nombre: "RVM Patagonia",
    descripcion: "Adventure, touring, enduro y motos para todos los caminos.",
    logo: "/logos/rvm-patagonia.png",
    href: "#vehiculos",
    boton: "Ver motos RVM",
    clase: "brand-card brand-card-rvm",
  },
  {
    nombre: "JAWA Patagonia",
    descripcion: "Motos clásicas, urbanas y touring con identidad propia.",
    logo: "/logos/jawa-patagonia.png",
    href: "#vehiculos",
    boton: "Ver motos JAWA",
    clase: "brand-card brand-card-jawa",
  },
];

export default function Brands() {
  return (
    <section className="brands-section">
      <div className="container">
        <div className="brands-heading">
          <span>Nuestras marcas</span>

          <h2>
            Movilidad para cada
            <strong> forma de vivir.</strong>
          </h2>

          <p>
            Autos, pickups y motos reunidos en un mismo lugar, con el respaldo y
            la trayectoria de MotoCars.
          </p>
        </div>

        <div className="brands-grid">
          {marcas.map((marca) => (
            <article key={marca.nombre} className={marca.clase}>
              <div className="brand-logo-wrapper">
                <Image
  src={marca.logo}
  alt={marca.nombre}
  width={360}
  height={140}
  className="brand-logo"
/>
                /
              </div>

              <div className="brand-content">
                <p>{marca.descripcion}</p>

                <Link href={marca.href} className="brand-link">
                  {marca.boton}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}