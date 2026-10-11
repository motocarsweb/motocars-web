
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

import { createHmac } from "node:crypto";

function obtenerIdentificador(request: NextRequest): string | null {
  const secreto = process.env.CREDITO_RATE_LIMIT_SECRET;

  if (!secreto || secreto.length < 32) {
    return null;
  }

  const ip = request.headers
  .get("x-forwarded-for")
  ?.split(",")
  .at(-1)
  ?.trim();

  if (!ip) {
    return null;
  }

  return createHmac("sha256", secreto)
    .update(ip)
    .digest("hex");
}

export const runtime = "nodejs";

type Solicitud = {
  nombre: string;
  dni: string;
  cuil: string;
  localidad: string;
  tipoVehiculo: string;
  vehiculo: string;
  actividadLaboral: string;
  celular: string;
  aceptaContacto: boolean;
  vehiculoId: number | null;
  website?: string;
};

function texto(valor: unknown, maximo: number): string {
  return typeof valor === "string"
    ? valor.trim().slice(0, maximo)
    : "";
}

function respuestaError(mensaje: string, estado: number) {
  return NextResponse.json(
    { ok: false, error: mensaje },
    { status: estado }
  );
}

export async function POST(request: NextRequest) {
  try {
    const longitud = Number(
      request.headers.get("content-length") ?? "0"
    );

    if (longitud > 10000) {
      return respuestaError("Solicitud demasiado grande.", 413);
    }
const identificador = obtenerIdentificador(request);

if (!identificador) {
  return respuestaError(
    "No se pudo verificar la seguridad de la solicitud.",
    503
  );
}

const { data: permitido, error: errorLimite } =
  await supabaseAdmin.rpc(
    "verificar_limite_credito",
    { p_identificador: identificador }
  );

if (errorLimite) {
  console.error(
    "Error al verificar límite de crédito:",
    errorLimite.code
  );

  return respuestaError(
    "No se pudo verificar la solicitud. Intentá más tarde.",
    503
  );
}

if (permitido !== true) {
  return respuestaError(
    "Alcanzaste el límite de solicitudes. Intentá nuevamente en una hora.",
    429
  );
}
    const cuerpo: unknown = await request.json();

    if (
      !cuerpo ||
      typeof cuerpo !== "object" ||
      Array.isArray(cuerpo)
    ) {
      return respuestaError("Datos inválidos.", 400);
    }

    const entrada = cuerpo as Record<string, unknown>;

    // Campo trampa para bots. No se muestra al usuario.
    if (entrada.website) {
      return NextResponse.json({ ok: true });
    }

    const datos: Solicitud = {
      nombre: texto(entrada.nombre, 120),
      dni: texto(entrada.dni, 20),
      cuil: texto(entrada.cuil, 20),
      localidad: texto(entrada.localidad, 100),
      tipoVehiculo: texto(entrada.tipoVehiculo, 20),
      vehiculo: texto(entrada.vehiculo, 150),
      actividadLaboral: texto(
        entrada.actividadLaboral,
        150
      ),
      celular: texto(entrada.celular, 25),
      aceptaContacto: entrada.aceptaContacto === true,
      vehiculoId:
        typeof entrada.vehiculoId === "number"
          ? entrada.vehiculoId
          : null,
    };

    if (
      !datos.nombre ||
      !datos.localidad ||
      !datos.actividadLaboral ||
      !datos.celular ||
      !datos.aceptaContacto
    ) {
      return respuestaError(
        "Completá todos los campos obligatorios.",
        400
      );
    }

    if (!/^\d{7,8}$/.test(datos.dni)) {
      return respuestaError("DNI inválido.", 400);
    }

    if (!/^\d{11}$/.test(datos.cuil)) {
      return respuestaError("CUIL inválido.", 400);
    }

    if (
      datos.tipoVehiculo !== "auto" &&
      datos.tipoVehiculo !== "moto"
    ) {
      return respuestaError(
        "Seleccioná un tipo de vehículo válido.",
        400
      );
    }

    if (
      datos.vehiculoId !== null &&
      (!Number.isSafeInteger(datos.vehiculoId) ||
        datos.vehiculoId <= 0)
    ) {
      return respuestaError(
        "Identificador de vehículo inválido.",
        400
      );
    }

    const { error } = await supabaseAdmin
      .from("solicitudes_credito")
      .insert({
        nombre_apellido: datos.nombre,
        dni: datos.dni,
        cuil: datos.cuil,
        localidad: datos.localidad,
        tipo_vehiculo: datos.tipoVehiculo,
        vehiculo_interes: datos.vehiculo || null,
        vehiculo_id: datos.vehiculoId,
        actividad_laboral: datos.actividadLaboral,
        celular: datos.celular,
        acepta_contacto: true,
        estado: "pendiente",
      });

    if (error) {
      console.error(
        "Error al guardar solicitud de crédito:",
        error.code
      );

      return respuestaError(
        "No pudimos registrar la solicitud. Intentá nuevamente.",
        500
      );
    }

    return NextResponse.json(
      {
        ok: true,
        mensaje: "Solicitud registrada correctamente.",
      },
      { status: 201 }
    );
  } catch {
    return respuestaError(
      "No pudimos procesar la solicitud.",
      400
    );
  }
}
