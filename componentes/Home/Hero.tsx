import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" />

   <Image
  src="/logos/motocars-Isotipo-rojo.png"
  alt=""
  width={700}
  height={700}
  className="hero-brand-mark"
  aria-hidden="true"
/>

      <div className="container hero-content">
        <div className="hero-main">
          <span className="hero-subtitle">
           35 años de historia en la Esquina de Siempre
          </span>

          <h1>
            Encontrá el vehículo
            <span>ideal para vos.</span>
          </h1>

          <p>
            En MotoCars seleccionamos cada vehículo para ofrecer calidad,
            respaldo y confianza. Autos usados, 0 km, pickups y motos con
            financiación y atención personalizada en Neuquén.
          </p>

          <div className="hero-buttons">
            <a href="#vehiculos" className="btn hero-primary-button">
              Ver stock disponible
              <ArrowRight size={19} strokeWidth={2.2} />
            </a>

            <a
              href="https://wa.me/5492995133023?text=Hola%20MotoCars%2C%20quiero%20recibir%20informaci%C3%B3n%20sobre%20sus%20veh%C3%ADculos."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline hero-whatsapp-button"
            >
              <MessageCircle size={19} strokeWidth={2.2} />
              Contactar por WhatsApp
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <strong>35+</strong>
              <span>Años de trayectoria</span>
            </div>

            <div className="hero-trust-divider" />

            <div className="hero-trust-item">
              <strong>+5000</strong>
              <span>Vehículos comercializados</span>
            </div>

            <div className="hero-trust-divider" />

            <div className="hero-trust-item">
              <strong>100%</strong>
              <span>Operaciones transparentes</span>
            </div>

            <div className="hero-trust-divider" />

            <div className="hero-trust-item">
              <strong>Multimarca</strong>
              <span>Autos, pickups y motos</span>
            </div>
          </div>
        </div>
      </div>

      <a href="#vehiculos" className="hero-scroll" aria-label="Ver vehículos">
        <span />
        Explorar
      </a>
    </section>
  );
}