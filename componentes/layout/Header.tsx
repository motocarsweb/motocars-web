"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <div className="container nav">
        <a
          href="/"
          className="logo"
          aria-label="MotoCars"
          onClick={closeMenu}
        >
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

        <button
          type="button"
          className="mobile-menu-button"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? (
            <X size={30} strokeWidth={2} />
          ) : (
            <Menu size={30} strokeWidth={2} />
          )}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}
      >
        <nav
          className="mobile-menu-nav"
          aria-label="Navegación móvil"
        >
          <a href="/" onClick={closeMenu}>
            Inicio
          </a>

          <a href="#vehiculos" onClick={closeMenu}>
            Vehículos
          </a>

          <a href="#nosotros" onClick={closeMenu}>
            Nosotros
          </a>

          <a href="#contacto" onClick={closeMenu}>
            Contacto
          </a>
        </nav>

        <div className="mobile-menu-actions">
          <a
            href="tel:+542995133023"
            className="mobile-menu-phone"
            onClick={closeMenu}
          >
            <Phone size={19} strokeWidth={2} />
            <span>299 513-3023</span>
          </a>

          <a
            href="https://wa.me/5492995133023?text=Hola%20MotoCars,%20quiero%20información%20sobre%20un%20vehículo."
            className="mobile-menu-whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            <MessageCircle size={19} strokeWidth={2} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}