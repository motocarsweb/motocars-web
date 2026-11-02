import { NextResponse } from "next/server";
import { obtenerPerfilAcceso } from "@/lib/permisos-acceso";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const perfil = await obtenerPerfilAcceso();
  if (!perfil) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (perfil.rol !== "vendedor" || !perfil.puedePresupuestos || !perfil.codigoReferido) {
    return NextResponse.json({ error: "No tenés permiso para crear presupuestos." }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }
  const d = body as Record<string, unknown>;
  const vehiculoId = Number(d.vehiculo_id);
  const nombre = typeof d.nombre_cliente === "string" ? d.nombre_cliente.trim() : "";
  if (!Number.isSafeInteger(vehiculoId) || vehiculoId <= 0 || !nombre || nombre.length > 150) {
    return NextResponse.json({ error: "Vehículo o cliente inválido." }, { status: 400 });
  }

  const { data: vehiculo, error: errorVehiculo } = await supabaseAdmin
    .from("vehiculos").select("id, precio").eq("id", vehiculoId)
    .eq("publicado", true).eq("en_stock", true).maybeSingle();
  if (errorVehiculo || !vehiculo || !Number.isFinite(Number(vehiculo.precio)) || Number(vehiculo.precio) < 0) {
    return NextResponse.json({ error: "Vehículo no disponible." }, { status: 400 });
  }

  // Por seguridad el importe se determina en el servidor; no se aceptan descuentos
  // ni condiciones financieras arbitrarias desde el navegador.
  const precio = Number(vehiculo.precio);
  const telefono = typeof d.telefono === "string" ? d.telefono.trim().slice(0, 40) : "";
  const { data: creado, error: errorCreacion } = await supabaseAdmin
    .from("presupuestos")
    .insert({
      vehiculo_id: vehiculoId,
      nombre_cliente: nombre,
      telefono: telefono || null,
      precio_vehiculo: precio,
      bonificacion: 0,
      gastos: 0,
      valor_permuta: 0,
      total: precio,
      validez_dias: 7,
      estado: "pendiente",
      observaciones: `Referido: ${perfil.codigoReferido}`,
    })
    .select("id").single();
  if (errorCreacion || !creado) {
    console.error("Error al crear presupuesto referido:", errorCreacion);
    return NextResponse.json({ error: "No se pudo crear el presupuesto." }, { status: 500 });
  }
  const numero = `P-${String(creado.id).padStart(6, "0")}`;
  const { error: errorNumero } = await supabaseAdmin.from("presupuestos")
    .update({ numero }).eq("id", creado.id);
  if (errorNumero) {
    console.error("Error al numerar presupuesto referido:", errorNumero);
    return NextResponse.json({ error: "Presupuesto creado, pero no se pudo asignar número. Contactá al administrador." }, { status: 500 });
  }
  return NextResponse.json({ id: creado.id, numero }, { status: 201 });
}
