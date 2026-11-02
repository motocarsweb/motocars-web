"use client";

const CODIGOS = ["david", "nazareno", "alexander", "cristian", "jorge", "german"];
const CLAVE = "motocars_referido";
const DURACION = 30 * 24 * 60 * 60 * 1000;

export function codigoReferidoVigente(): string | null {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    if (typeof datos.codigo !== "string" || !CODIGOS.includes(datos.codigo) ||
        typeof datos.fecha !== "number" || Date.now() < datos.fecha ||
        Date.now() - datos.fecha >= DURACION) return null;
    return datos.codigo;
  } catch { return null; }
}

export function registrarEventoReferido(tipo: "visita" | "whatsapp", codigo: string) {
  if (!CODIGOS.includes(codigo)) return;
  void fetch("/api/referidos/eventos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ codigo, tipo }),
    keepalive: true,
  }).catch(() => {});
}
