import { ArrowRight, MessageCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay" />

      <div className="container hero-content">
        <div className="hero-main">
          <span className="hero-subtitle">
            MOTOCARS CONCESIONARIA · NEUQUÉN
          </span>

          <h1>
            Tu próximo vehículo.
            <span> Tu nueva historia.</span>
          </h1>

          <p>
            Más de 30 años acompañando a nuestros clientes en la compra y venta
            de vehículos nuevos y usados, con atención personalizada y respaldo
            en cada operación.
          </p>

          <div className="hero-buttons">
            <a href="#vehiculos" className="btn hero-primary-button">
              Ver vehículos
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
        </div>

        <div className="hero-trust">
          <div className="hero-trust-item">
            <strong>+30</strong>
            <span>Años de trayectoria</span>
          </div>

          <div className="hero-trust-divider" />

          <div className="hero-trust-item">
            <strong>Multimarca</strong>
            <span>Vehículos seleccionados</span>
          </div>

          <div className="hero-trust-divider" />

          <div className="hero-trust-item">
            <strong>Neuquén</strong>
            <span>Atención personalizada</span>
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