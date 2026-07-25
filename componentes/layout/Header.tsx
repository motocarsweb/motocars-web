"use client";

import Image from "next/image";
import { Phone, MapPin } from "lucide-react";

export default function Header() {
  return (
    <header className="header">
      <div className="container nav">
        <a href="/" className="logo" aria-label="MotoCars">
          <Image
            src="/logo/logo.png"
            alt="MotoCars Concesionaria"
            width={200}
            height={60}
            priority
            style={{
              width: "200px",
              height: "auto",
            }}
          />
        </a>

        <nav>
          <a href="#">Inicio</a>
          <a href="#vehiculos">Vehículos</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "white",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <MapPin size={16} />
            Neuquén
          </div>

          <a
            href="tel:+542995133023"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "white",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Phone size={16} />
            299 513-3023
          </a>

          <a
            href="https://wa.me/5492995133023?text=Hola%20MotoCars,%20quiero%20información%20sobre%20un%20vehículo."
            className="btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}