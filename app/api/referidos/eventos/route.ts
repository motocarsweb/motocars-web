import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const CODIGOS = new Set(["david", "nazareno", "alexander", "cristian", "jorge", "german"]);
const TIPOS = new Set(["visita", "whatsapp"]);

export async function POST(request: NextRequest) {
  // Solo solicitudes originadas desde la web. No constituye protección
  // antibots completa; las métricas son orientativas.
  const origen = request.headers.get("origin");
  if (!origen || new URL(origen).host !== request.nextUrl.host ||
      !["https:", "http:"].includes(new URL(origen).protocol)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  }

  if (Number(request.headers.get("content-length") || 0) > 1024) {
    return NextResponse.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  }

  let datos: unknown;
  try { datos = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }

  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { codigo, tipo } = datos as Record<string, unknown>;
  if (typeof codigo !== "string" || !CODIGOS.has(codigo) ||
      typeof tipo !== "string" || !TIPOS.has(tipo)) {
    return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.rpc("incrementar_metrica_referido", {
    p_codigo: codigo, p_tipo: tipo,
  });
  if (error) {
    console.error("Error al registrar métrica de referido:", error.code);
    return NextResponse.json({ error: "No se pudo registrar" }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
