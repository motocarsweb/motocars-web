
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { crearSupabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

const CAMPOS = [
  "cedula_identificacion",
  "seguro_provisorio",
  "copia_titulo",
  "duplicado_llaves",
  "manuales",
  "verificacion_vehicular",
  "detalle_servicios",
] as const;

type Campo = (typeof CAMPOS)[number];


async function autorizar() {
  const supabase = await crearSupabaseServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  const { data: permiso, error: errorPermiso } =
    await clienteAdmin()
      .from("usuarios_admin")
      .select("rol, activo")
      .eq("user_id", user.id)
      .eq("rol", "administrador")
      .eq("activo", true)
      .maybeSingle();

  if (errorPermiso || !permiso) {
    return false;
  }

  return true;
}


function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Falta configuración de Supabase.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function validarId(valor: unknown): number | null {
  const id = Number(valor);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await autorizar())) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const operacionId = validarId(
      request.nextUrl.searchParams.get("operacion_id")
    );

    if (!operacionId) {
      return NextResponse.json(
        { error: "ID de operación inválido." },
        { status: 400 }
      );
    }

    const { data, error } = await clienteAdmin()
      .from("documentacion_entrega_operacion")
      .select(
        "operacion_id, cedula_identificacion, seguro_provisorio, copia_titulo, duplicado_llaves, manuales, verificacion_vehicular, detalle_servicios, observaciones"
      )
      .eq("operacion_id", operacionId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error al consultar documentación:", error);

    return NextResponse.json(
      { error: "No se pudo consultar la documentación." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await autorizar())) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const operacionId = validarId(body?.operacion_id);

    if (!operacionId) {
      return NextResponse.json(
        { error: "ID de operación inválido." },
        { status: 400 }
      );
    }

    const registro: Record<string, boolean | number | string> = {
      operacion_id: operacionId,
    };

    for (const campo of CAMPOS) {
      const valor = body[campo as Campo];

      if (typeof valor !== "boolean") {
        return NextResponse.json(
          { error: `Valor inválido: ${campo}.` },
          { status: 400 }
        );
      }

      registro[campo] = valor;
    }

    if (
      typeof body.observaciones !== "string" ||
      body.observaciones.length > 2000
    ) {
      return NextResponse.json(
        { error: "Observaciones inválidas." },
        { status: 400 }
      );
    }

    registro.observaciones = body.observaciones;

    const admin = clienteAdmin();

    const { data: operacion, error: errorOperacion } =
      await admin
        .from("operaciones")
        .select("id")
        .eq("id", operacionId)
        .maybeSingle();

    if (errorOperacion) throw errorOperacion;

    if (!operacion) {
      return NextResponse.json(
        { error: "La operación no existe." },
        { status: 404 }
      );
    }

    const { data, error } = await admin
      .from("documentacion_entrega_operacion")
      .upsert(registro, {
        onConflict: "operacion_id",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error al guardar documentación:", error);

    return NextResponse.json(
      { error: "No se pudo guardar la documentación." },
      { status: 500 }
    );
  }
}
