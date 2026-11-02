
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const CLAVE = "motocars_referido";
const DURACION = 30 * 24 * 60 * 60 * 1000;

// Códigos autorizados.
// Incorporaremos los otros tres vendedores después.
const VENDEDORES = ["david", "nazareno", "alexander", "cristian", "jorge", "german"];

export default function CapturarReferido() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
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
          // Primer vendedor conserva la atribución.
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
    } catch {
      localStorage.removeItem(CLAVE);
    }
  }, [pathname, searchParams]);

  return null;
}
