"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { eliminarVehiculo } from "@/lib/supabase-vehicles";

type VehicleDeleteButtonProps = {
  vehiculoId: number;
  nombreVehiculo: string;
};

export default function VehicleDeleteButton({
  vehiculoId,
  nombreVehiculo,
}: VehicleDeleteButtonProps) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    if (eliminando) {
      return;
    }

    const confirmado = window.confirm(
      `¿Seguro que querés eliminar "${nombreVehiculo}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmado) {
      return;
    }

    setEliminando(true);

    try {
      const eliminado = await eliminarVehiculo(vehiculoId);

      if (!eliminado) {
        alert("No se pudo eliminar el vehículo.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error al eliminar el vehículo:", error);

      alert("Ocurrió un error al eliminar el vehículo.");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={eliminar}
      disabled={eliminando}
      style={{
        minHeight: 36,
        padding: "0 12px",
        border: "1px solid #dc2626",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        color: "#dc2626",
        cursor: eliminando ? "not-allowed" : "pointer",
        fontSize: 13,
        fontWeight: 700,
        opacity: eliminando ? 0.65 : 1,
        whiteSpace: "nowrap",
      }}
    >
      {eliminando ? "Eliminando..." : "Eliminar"}
    </button>
  );
}