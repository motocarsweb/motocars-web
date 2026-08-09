import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/5492995133023?text=Hola%20MotoCars%2C%20quiero%20hacer%20una%20consulta.";

export default function Footer() {
  return (
    <footer id="contacto" className="site-footer">
      {/* CTA SUPERIOR */}
      <div className="footer-cta">
        <div className="container footer-cta-inner">
          <div>
            <span className="footer-eyebrow">Estamos para asesorarte</span>

            <h2>¿Encontraste el vehículo que buscabas?</h2>

            <p>
              Escribinos y recibí atención personalizada de nuestro equipo.
            </p>
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-cta-button"
          >
            <MessageCircle size={19} />
            Consultar ahora
          </a>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="footer-main">
        <div className="container footer-grid">

          {/* COLUMNA 1 */}
          <div className="footer-brand">
            <Link href="/" aria-label="Ir al inicio de MotoCars">
              <Image
                src="/logos/motocars-white.png"
                alt="MotoCars Concesionaria"
                width={300}
                height={100}
                className="footer-main-logo"
                unoptimized
              />
            </Link>

            <div className="footer-history">
              <span className="footer-history-line" />

              <strong>
                +35 años en la Esquina de Siempre
              </strong>
            </div>
          </div>

          {/* COLUMNA 2 */}
          <div className="footer-column">
            <h3>Nuestras marcas</h3>

            <nav className="footer-links" aria-label="Nuestras marcas">
              <Link href="/">MotoCars</Link>
              <Link href="/motos#rvm">RVM Patagonia</Link>
              <Link href="/motos#jawa">JAWA Patagonia</Link>
            </nav>
          </div>

          {/* COLUMNA 3 */}
          <div className="footer-column">
            <h3>Contacto</h3>

            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <MapPin size={18} />

                <span>
                  Primeros Pobladores 1400
                  <small>Neuquén Capital</small>
                </span>
              </div>

              <a
                href="tel:+542995133023"
                className="footer-contact-item"
              >
                <Phone size={18} />
                <span>+54 9 299 513 3023</span>
              </a>

              <a
                href="mailto:motocars.concesionaria@gmail.com"
                className="footer-contact-item"
              >
                <Mail size={18} />
                <span>motocars.concesionaria@gmail.com</span>
              </a>
            </div>
          </div>

          {/* COLUMNA 4 */}
          <div className="footer-column">
            <h3>Horarios</h3>

            <div className="footer-hours">
              <div>
                <Clock3 size={18} />

                <span>
                  <strong>Lunes a Viernes</strong>
                  <small>8:00 a 20:00 hs</small>
                </span>
              </div>

              <div>
                <Clock3 size={18} />

                <span>
                  <strong>Sábados</strong>
                  <small>8:00 a 13:00 hs</small>
                </span>
              </div>
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-whatsapp-note"
            >
              <MessageCircle size={17} />
              Consultanos por WhatsApp todos los días
            </a>

            <div className="footer-social">
              <a
                href="https://www.instagram.com/motocars.concesionaria/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram MotoCars"
              >
                <span>Instagram</span>
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp MotoCars"
              >
                <MessageCircle size={19} />
              </a>
            </div>
          </div>
        </div>

        {/* TRES MARCAS */}
        <div className="container footer-brands-strip">
          <Link href="/" className="footer-brand-link">
            <Image
              src="/logos/motocars-white.png"
              alt="MotoCars"
              width={150}
              height={55}
              unoptimized
            />
          </Link>

          <Link href="/motos#rvm" className="footer-brand-link">
            <Image
              src="/logos/rvm-white.png"
              alt="RVM Patagonia"
              width={150}
              height={65}
              unoptimized
            />
          </Link>

          <Link href="/motos#jawa" className="footer-brand-link">
            <Image
              src="/logos/jawa-white.png"
              alt="JAWA Patagonia"
              width={150}
              height={65}
              unoptimized
            />
          </Link>
        </div>

        {/* PIE FINAL */}
        <div className="container footer-bottom">
          <p>
            © {new Date().getFullYear()} MotoCars Concesionaria.
            Todos los derechos reservados.
          </p>

          <span>Neuquén · Patagonia Argentina</span>
        </div>
      </div>
    </footer>
  );
}