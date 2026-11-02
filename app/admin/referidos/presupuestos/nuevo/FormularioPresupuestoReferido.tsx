"use client";

import { useState, type FormEvent } from "react";

type Vehiculo = { id: number; nombre: string; precio: number };
type Comprobante = { numero: string; fecha: string; cliente: string; telefono: string; vehiculo: string; precio: number };

export default function FormularioPresupuestoReferido({ vehiculos }: { vehiculos: Vehiculo[] }) {
  const [vehiculoId, setVehiculoId] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [comprobante, setComprobante] = useState<Comprobante | null>(null);
  const [cargando, setCargando] = useState(false);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cargando) return;
    setCargando(true);
    setMensaje("");
    setComprobante(null);
    try {
      const response = await fetch("/api/referidos/presupuestos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehiculo_id: Number(vehiculoId),
          nombre_cliente: nombre,
          telefono,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setMensaje(result.error || "No se pudo generar el presupuesto.");
        return;
      }
      setComprobante(result as Comprobante);
      setNombre("");
      setTelefono("");
      setVehiculoId("");
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section style={{ maxWidth: 640 }}>
      <h1>Nuevo presupuesto</h1>
      <p>Completá los datos del interesado. El precio se obtiene del catálogo de MotoCars.</p>
      <form onSubmit={guardar} style={{ display: "grid", gap: 16 }}>
        <label>Vehículo
          <select required value={vehiculoId} onChange={(e) => setVehiculoId(e.target.value)}
            style={{ display: "block", width: "100%", padding: 12, marginTop: 6 }}>
            <option value="">Seleccioná un vehículo</option>
            {vehiculos.map((v) => <option key={v.id} value={v.id}>
              {v.nombre} — {v.precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}
            </option>)}
          </select>
        </label>
        <label>Nombre y apellido del interesado
          <input required maxLength={150} value={nombre} onChange={(e) => setNombre(e.target.value)}
            style={{ display: "block", width: "100%", padding: 12, marginTop: 6 }} />
        </label>
        <label>Teléfono de contacto
          <input type="tel" maxLength={40} value={telefono} onChange={(e) => setTelefono(e.target.value)}
            style={{ display: "block", width: "100%", padding: 12, marginTop: 6 }} />
        </label>
        <button type="submit" disabled={cargando || vehiculos.length === 0}
          style={{ padding: 14, background: "#d71920", color: "white", border: 0, borderRadius: 8, cursor: "pointer" }}>
          {cargando ? "Generando..." : "Generar presupuesto"}
        </button>
      </form>
      {mensaje && <p role="alert">{mensaje}</p>}
      {comprobante && (
        <div role="status" style={{ marginTop: 24 }}>
          <p>Presupuesto creado correctamente: <strong>{comprobante.numero}</strong></p>
          <div className="ref-print" style={{ background: "#fff", padding: 24, border: "1px solid #ddd", borderRadius: 8 }}>
            <h2 style={{ marginTop: 0 }}>MotoCars — Presupuesto</h2>
            <p><strong>Número:</strong> {comprobante.numero}</p>
            <p><strong>Fecha:</strong> {new Date(comprobante.fecha).toLocaleDateString("es-AR")}</p>
            <p><strong>Cliente:</strong> {comprobante.cliente}</p>
            {comprobante.telefono && <p><strong>Teléfono:</strong> {comprobante.telefono}</p>}
            <p><strong>Vehículo:</strong> {comprobante.vehiculo}</p>
            <p><strong>Precio:</strong> {comprobante.precio.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })}</p>
            <p>Validez: 7 días. Sujeto a disponibilidad y confirmación comercial.</p>
          </div>
          <button type="button" onClick={() => window.print()}
            style={{ marginTop: 12, padding: "12px 18px", border: 0, borderRadius: 8, cursor: "pointer" }}>
            Imprimir / Guardar como PDF
          </button>
        </div>
      )}
      <style>{`@media print {
        body * { visibility: hidden !important; }
        .ref-print, .ref-print * { visibility: visible !important; }
        .ref-print { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; border: none !important; }
      }`}</style>
    </section>
  );
}
