"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { actualizarVehiculo } from "@/lib/supabase-vehicles";

type VehiclePublishButtonProps = {
  vehiculoId: number;
  publicado: boolean;
};

export default function VehiclePublishButton({
  vehiculoId,
  publicado,
}: VehiclePublishButtonProps) {
  const router = useRouter();
  const [actualizando, setActualizando] = useState(false);

  async function cambiarPublicacion() {
    if (actualizando) {
      return;
    }

    const accion = publicado ? "despublicar" : "publicar";

    const confirmado = window.confirm(
      `¿Querés ${accion} este vehículo?`
    );

    if (!confirmado) {
      return;
    }

    setActualizando(true);

    try {
      const resultado = await actualizarVehiculo(vehiculoId, {
        publicado: !publicado,
      });

      if (!resultado) {
        alert("No se pudo cambiar el estado de publicación.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Error al cambiar la publicación del vehículo:",
        error
      );

      alert("Ocurrió un error al actualizar el vehículo.");
    } finally {
      setActualizando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={cambiarPublicacion}
      disabled={actualizando}
      style={{
        minHeight: 36,
        padding: "0 12px",
        border: publicado
          ? "1px solid #dc2626"
          : "1px solid #059669",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        color: publicado ? "#dc2626" : "#047857",
        cursor: actualizando ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 700,
        opacity: actualizando ? 0.65 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {actualizando
        ? "Actualizando..."
        : publicado
          ? "Despublicar"
          : "Publicar"}
    </button>
  );
}