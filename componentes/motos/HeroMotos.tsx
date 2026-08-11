import Image from "next/image";
import "./HeroMotos.css";

const WHATSAPP_URL =
  "https://wa.me/5492995133023?text=Hola%20quiero%20recibir%20información%20sobre%20las%20motos.";

export default function HeroMotos() {
  return (
    <section className="motos-hero">
      <div className="motos-overlay" />
      <div className="motos-isotipo">
  <Image
    src="/images/showroom/patagonia-isotipo.png"
    alt=""
    width={700}
    height={700}
    unoptimized
  />
</div>

      <div className="container motos-content">
        <span className="motos-eyebrow">
          REPRESENTANTES OFICIALES
        </span>

        <div className="motos-logos">
          <Image
            src="/logos/rvm-white.png"
            alt="RVM Patagonia"
            width={260}
            height={90}
            className="motos-logo"
            unoptimized
          />

          <div className="motos-divider" />

          <Image
            src="/logos/jawa-white.png"
            alt="JAWA Patagonia"
            width={260}
            height={90}
            className="motos-logo"
            unoptimized
          />
        </div>

        <p className="motos-location">
          Neuquén · Patagonia Argentina
        </p>

        <p className="motos-slogan">
          ...hacia la aventura siempre
        </p>

        <div className="motos-buttons">
          <a href="#modelos" className="motos-primary-button">
            Ver modelos
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="motos-whatsapp-button"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}