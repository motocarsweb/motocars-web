"use client";

import Image from "next/image";

export default function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <div className="logo">
          <Image
  src="/logo/logo.png"
  alt="MotoCars Concesionaria"
  width={200}
  height={200}
  priority
  style={{
    width: "200px",
    height: "auto",
  }}
/>
        </div>

        <nav>
          <a href="#">Inicio</a>
          <a href="#vehiculos">Vehículos</a>
          <a href="#servicios">Servicios</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <a
          href="https://wa.me/5492995133023"
          className="btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}