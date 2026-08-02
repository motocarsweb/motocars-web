"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { actualizarVehiculo } from "@/lib/supabase-vehicles";

type VehicleFeaturedButtonProps = {
  vehiculoId: number;
  destacado: boolean;
};

export default function VehicleFeaturedButton({
  vehiculoId,
  destacado,
}: VehicleFeaturedButtonProps) {
  const router = useRouter();
  const [actualizando, setActualizando] = useState(false);

  async function cambiarDestacado() {
    if (actualizando) {
      return;
    }

    const accion = destacado
      ? "quitar de destacados"
      : "marcar como destacado";

    const confirmado = window.confirm(
      `¿Querés ${accion} este vehículo?`
    );

    if (!confirmado) {
      return;
    }

    setActualizando(true);

    try {
      const resultado = await actualizarVehiculo(vehiculoId, {
        destacado: !destacado,
      });

      if (!resultado) {
        alert("No se pudo cambiar el estado destacado.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "Error al cambiar el estado destacado:",
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
      onClick={cambiarDestacado}
      disabled={actualizando}
      style={{
        minHeight: 36,
        padding: "0 12px",
        border: destacado
          ? "1px solid #d97706"
          : "1px solid #d1d5db",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        color: destacado ? "#b45309" : "#374151",
        cursor: actualizando ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 700,
        opacity: actualizando ? 0.65 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {actualizando
        ? "Actualizando..."
        : destacado
          ? "Quitar destacado"
          : "Destacar"}
    </button>
  );
}