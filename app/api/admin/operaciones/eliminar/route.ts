
import { NextRequest, NextResponse } from "next/server";
import { crearSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await crearSupabaseServer();

    const {
      data: { user },
      error: errorUsuario,
    } = await supabase.auth.getUser();

    if (errorUsuario || !user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 }
      );
    }

    const { data: administrador, error: errorPermiso } =
      await supabaseAdmin
        .from("usuarios_admin")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("rol", "administrador")
        .eq("activo", true)
        .maybeSingle();

    if (errorPermiso || !administrador) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const operacionId = body?.operacion_id;

    if (
      typeof operacionId !== "number" ||
      !Number.isSafeInteger(operacionId) ||
      operacionId <= 0
    ) {
      return NextResponse.json(
        { error: "ID de operación inválido." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.rpc(
      "eliminar_operacion_completa",
      { p_operacion_id: operacionId }
    );

    if (error) {
      console.error("Error al eliminar operación:", error.code);

      return NextResponse.json(
        { error: "No se pudo eliminar la operación." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en eliminación de operación:", error);

    return NextResponse.json(
      { error: "No se pudo procesar la solicitud." },
      { status: 500 }
    );
  }
}
