
"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { registrarEventoReferido } from "@/lib/referidos-eventos";

type Props = {
  titulo: string;
  anio?: string | number | null;
  variante?: "detalle" | "tarjeta";
};

const CLAVE_REFERIDO = "motocars_referido";
const DURACION = 30 * 24 * 60 * 60 * 1000;

export default function WhatsAppReferido({
  titulo,
  anio,
  variante = "detalle",
}: Props) {
  const [referido, setReferido] = useState<string | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_REFERIDO);
      if (!guardado) return;

      const datos = JSON.parse(guardado);

      if (
        typeof datos.codigo === "string" &&
        typeof datos.fecha === "number" &&
        Date.now() >= datos.fecha &&
        Date.now() - datos.fecha < DURACION
      ) {
        setReferido(datos.codigo);
      } else {
        localStorage.removeItem(CLAVE_REFERIDO);
      }
    } catch {
      localStorage.removeItem(CLAVE_REFERIDO);
    }
  }, []);

  const mensajeBase =
    variante === "tarjeta"
      ? `Hola, me interesa el ${titulo}${anio ? ` ${anio}` : ""} publicado en MotoCars. Quisiera recibir más información.`
      : `Hola, quiero consultar por el vehículo ${titulo}${anio ? `, año ${anio}` : ""}. Lo vi publicado en la web de MotoCars.`;

  const mensaje = mensajeBase +
    (referido ? `\nVendedor referido: ${referido.toUpperCase()}` : "");

  const whatsappUrl =
    `https://wa.me/5492995133023?text=${encodeURIComponent(mensaje)}`;

  if (variante === "tarjeta") {
    return (
      <a
        href={whatsappUrl}
      onClick={() => { if (referido) registrarEventoReferido("whatsapp", referido); }}
        onClick={() => { if (referido) registrarEventoReferido("whatsapp", referido); }}
        className="vehicle-whatsapp-button"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Consultar por WhatsApp sobre ${titulo}`}
      >
        <MessageCircle size={17} />
        WhatsApp
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="vehicle-detail-whatsapp"
    >
      Consultar por WhatsApp
    </a>
  );
}
