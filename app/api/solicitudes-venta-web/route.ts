import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const BUCKET = "solicitudes-venta-web";
const MAX_BODY = 2_300_000;

function error(mensaje: string, status: number) {
  return NextResponse.json({ ok: false, error: mensaje }, { status });
}

function texto(valor: FormDataEntryValue | null, max: number) {
  return typeof valor === "string" ? valor.trim().slice(0, max + 1) : "";
}

function obligatorio(valor: string, max: number) {
  return valor.length > 0 && valor.length <= max;
}

export async function POST(request: NextRequest) {
  const secreto = process.env.CREDITO_RATE_LIMIT_SECRET;
  if (!secreto || secreto.length < 32) return error("Servicio temporalmente no disponible.", 503);
  const ip = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  if (!ip) return error("No se pudo verificar la solicitud.", 503);

  const longitud = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(longitud) || longitud > MAX_BODY) return error("La solicitud supera el tamaño permitido.", 413);
  const tipo = request.headers.get("content-type") ?? "";
  if (!tipo.startsWith("multipart/form-data;")) return error("Formato de solicitud inválido.", 415);

  const origen = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origen || !host) return error("Origen no autorizado.", 403);
  try {
    const url = new URL(origen);
    if (url.host !== host || !["http:", "https:"].includes(url.protocol)) return error("Origen no autorizado.", 403);
  } catch {
    return error("Origen no autorizado.", 403);
  }

  const identificador = createHmac("sha256", secreto).update("venta-web:" + ip).digest("hex");
  const { data: permitido, error: limiteError } = await supabaseAdmin.rpc("verificar_limite_venta_web", { p_identificador: identificador });
  if (limiteError) {
    console.error("Error límite venta web:", limiteError.code);
    return error("No se pudo verificar el límite de solicitudes.", 503);
  }
  if (permitido !== true) return error("Alcanzaste el límite de intentos. Probá nuevamente en una hora.", 429);

  let datos: FormData;
  try {
    if (!request.body) return error("Formulario vacío.", 400);
    const lector = request.body.getReader();
    const partes: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await lector.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY) {
          await lector.cancel().catch(() => {});
          return error("La solicitud supera el tamaño permitido.", 413);
        }
        partes.push(value);
      }
    } finally {
      lector.releaseLock();
    }
    const cuerpo = new Uint8Array(total);
    let posicion = 0;
    for (const parte of partes) {
      cuerpo.set(parte, posicion);
      posicion += parte.byteLength;
    }
    datos = await new Response(cuerpo, { headers: { "content-type": tipo } }).formData();
  } catch {
    return error("No se pudo leer el formulario.", 400);
  }

  if (texto(datos.get("website"), 100)) return NextResponse.json({ ok: true }, { status: 201 });

  const { data: permitidoGlobal, error: errorGlobal } = await supabaseAdmin.rpc("verificar_limite_global_venta_web");
  if (errorGlobal) {
    console.error("Error límite global venta web:", errorGlobal.code);
    return error("Servicio temporalmente no disponible.", 503);
  }
  if (permitidoGlobal !== true) return error("Alcanzamos el límite diario de solicitudes. Probá nuevamente mañana.", 429);


  const nombre = texto(datos.get("nombre"), 120);
  const whatsapp = texto(datos.get("whatsapp"), 25);
  const localidad = texto(datos.get("localidad"), 120);
  const marca = texto(datos.get("marca"), 60);
  const modelo = texto(datos.get("modelo"), 80);
  const version = texto(datos.get("version"), 100);
  const observaciones = texto(datos.get("observaciones"), 1000);
  const moneda = texto(datos.get("moneda"), 3);
  const anio = Number(datos.get("anio"));
  const kilometraje = Number(datos.get("kilometraje"));
  const precio = Number(datos.get("precio"));
  for (const [valor, max, campo] of [
    [nombre, 120, "nombre y apellido"], [whatsapp, 25, "WhatsApp"],
    [localidad, 120, "localidad"], [marca, 60, "marca"], [modelo, 80, "modelo"],
  ] as const) {
    if (!obligatorio(valor, max)) return error("Revisá el campo " + campo + ".", 400);
  }
  const telefono = whatsapp.replace(/[\s()+-]/g, "");
  if (!/^\+?[0-9\s()-]+$/.test(whatsapp) || !/^[0-9]{7,15}$/.test(telefono))
    return error("Ingresá un número de WhatsApp válido.", 400);
  if (version.length > 100 || observaciones.length > 1000)
    return error("Revisá la extensión de versión u observaciones.", 400);
  if (!texto(datos.get("anio"), 4) || !Number.isSafeInteger(anio) || anio < 1950 || anio > 2100)
    return error("Ingresá un año válido.", 400);
  if (!texto(datos.get("kilometraje"), 10) || !Number.isSafeInteger(kilometraje) || kilometraje < 0 || kilometraje > 2147483647)
    return error("Ingresá un kilometraje válido.", 400);
  if (!Number.isFinite(precio) || precio <= 0 || precio > 9999999999999)
    return error("Ingresá un precio válido.", 400);
  if (!["ARS", "USD"].includes(moneda)) return error("Seleccioná una moneda válida.", 400);

  const archivos = datos.getAll("fotos");
  if (archivos.length > 2 || archivos.some((archivo) => !(archivo instanceof File) || archivo.type !== "image/webp" || archivo.size === 0 || archivo.size > 1048576)) {
    return error("Adjuntá como máximo dos fotografías WebP de hasta 1 MB cada una.", 400);
  }
  const id = randomUUID();
  const rutas: string[] = [];
  let reservado = false;
  try {
    if (archivos.length) {
      const { error: limpiezaError } = await supabaseAdmin.rpc("limpiar_reservas_venta_web");
      if (limpiezaError) {
        console.error("Error limpieza reservas venta web:", limpiezaError.code);
        return error("No pudimos verificar el espacio disponible.", 503);
      }
      const bytes = archivos.reduce((total, archivo) => total + (archivo instanceof File ? archivo.size : 0), 0);
      const { data, error: reservaError } = await supabaseAdmin.rpc("reservar_espacio_venta_web", { p_id: id, p_bytes: bytes });
      if (reservaError) return error("No pudimos verificar el espacio disponible.", 503);
      if (data !== true) return error("No hay espacio disponible para fotografías. Podés enviar la solicitud sin fotos.", 409);
      reservado = true;
    }
    for (const [indice, archivo] of archivos.entries()) {
      if (!(archivo instanceof File)) return error("Archivo inválido.", 400);
      const bytes = new Uint8Array(await archivo.arrayBuffer());
      if (bytes.length < 12 ||
          String.fromCharCode(...bytes.subarray(0,4)) !== "RIFF" ||
          String.fromCharCode(...bytes.subarray(8,12)) !== "WEBP") throw new Error("Archivo WebP inválido");
      const ruta = `${id}/foto-${indice + 1}.webp`;
      const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(ruta, bytes, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;
      rutas.push(ruta);
    }

    const { error: insertError } = await supabaseAdmin.from("solicitudes_venta_web").insert({
      id, nombre_apellido: nombre, whatsapp, localidad, marca, modelo,
      version: version || null, anio, kilometraje,
      precio_solicitado: precio, moneda, observaciones: observaciones || null,
      fotos: rutas, origen: "WEB", estado: "pendiente",
    });
    if (insertError) throw insertError;
    return NextResponse.json({ ok: true, mensaje: "Recibimos tu solicitud. Nos comunicaremos con vos." }, { status: 201 });
  } catch (e) {
    console.error("Error solicitud venta web:", e instanceof Error ? e.message : "desconocido");
    if (rutas.length) await supabaseAdmin.storage.from(BUCKET).remove(rutas);
    return error("No pudimos registrar la solicitud. Intentá nuevamente.", 500);
  } finally {
    if (reservado) {
      try {
        const { error: liberarError } = await supabaseAdmin.rpc("liberar_espacio_venta_web", { p_id: id });
        if (liberarError) console.error("Error liberación espacio venta web:", liberarError.code);
      } catch {
        console.error("No se pudo liberar reserva de espacio venta web");
      }
    }
  }
}
