
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { registrarEventoReferido } from "@/lib/referidos-eventos";

const CLAVE = "motocars_referido";
const DURACION = 30 * 24 * 60 * 60 * 1000;

// Códigos autorizados.
// Los seis códigos vigentes.
const VENDEDORES = ["david", "nazareno", "alexander", "cristian", "jorge", "german"];

export default function CapturarReferido() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const registrarVisita = (codigo: string) => {
      const claveSesion = `motocars_visita_ref_${codigo}`;
      if (sessionStorage.getItem(claveSesion)) return;
      sessionStorage.setItem(claveSesion, "1");
      registrarEventoReferido("visita", codigo);
    };
    // No capturar referidos dentro del administrador.
    if (pathname.startsWith("/admin")) return;

    try {
      const ahora = Date.now();
      const guardado = localStorage.getItem(CLAVE);

      if (guardado) {
        const datos = JSON.parse(guardado);

        if (
          typeof datos.codigo === "string" &&
          typeof datos.fecha === "number" &&
          VENDEDORES.includes(datos.codigo) &&
          ahora >= datos.fecha &&
          ahora - datos.fecha < DURACION
        ) {
          // Primer referido conserva la atribución.
          if (searchParams.get("ref")?.toLowerCase().trim() === datos.codigo) registrarVisita(datos.codigo);
          return;
        }

        localStorage.removeItem(CLAVE);
      }

      const codigo = searchParams.get("ref")?.toLowerCase().trim();

      if (!codigo || !VENDEDORES.includes(codigo)) return;

      localStorage.setItem(
        CLAVE,
        JSON.stringify({
          codigo,
          fecha: ahora,
        })
      );
      registrarVisita(codigo);
    } catch {
      localStorage.removeItem(CLAVE);
    }
  }, [pathname, searchParams]);

  return null;
}
