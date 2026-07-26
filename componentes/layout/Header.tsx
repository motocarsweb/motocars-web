"use client";

import Image from "next/image";
import { Phone, MessageCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <a href="/" className="logo" aria-label="MotoCars">
          <Image
            src="/logo/logo.png"
            alt="MotoCars Concesionaria"
            width={240}
            height={80}
            priority
            className="header-logo"
          />
        </a>

        <nav className="header-nav" aria-label="Navegación principal">
          <a href="/">Inicio</a>
          <a href="#vehiculos">Vehículos</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className="header-actions">
          
                  <a href="tel:+542995133023" className="header-phone">
            <Phone size={18} strokeWidth={2} />
            <span>299 513-3023</span>
          </a>

         <a
  href="https://wa.me/5492995133023?text=Hola%20MotoCars,%20quiero%20información%20sobre%20un%20vehículo."
  className="header-whatsapp"
  target="_blank"
  rel="noopener noreferrer"
>
  <MessageCircle size={18} strokeWidth={2} />
  <span>Consultar por WhatsApp</span>
</a>
        </div>
      </div>
    </header>
  );
}