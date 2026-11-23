"use client";

import { useEffect, useState } from "react";
import { optimizarFotoWebp } from "@/lib/optimizar-foto-webp";

const campo = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-base text-zinc-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100";
const etiqueta = "mb-1.5 block text-sm font-semibold text-zinc-800";

export default function FormularioVenderAuto() {
  const [fotos, setFotos] = useState<File[]>([]);
  const [errorFotos, setErrorFotos] = useState("");

  const [procesando, setProcesando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorEnvio, setErrorEnvio] = useState("");
  const [vistasPrevias, setVistasPrevias] = useState<{ url: string; foto: File }[]>([]);

  useEffect(() => {
    const urls = fotos.map((foto) => ({ url: URL.createObjectURL(foto), foto }));
    setVistasPrevias(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url.url));
  }, [fotos]);

  async function seleccionarFotos(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    if (procesando || enviando) return;
    setErrorFotos("");
    if (archivos.length + fotos.length > 2) {
      setErrorFotos("Podés adjuntar como máximo dos fotografías.");
      return;
    }
    if (archivos.some((archivo) => !archivo.type.startsWith("image/"))) {
      setErrorFotos("Seleccioná únicamente archivos de imagen.");
      return;
    }
    if (!archivos.length) return;
    setProcesando(true);
    try {
      const optimizadas = await Promise.all(archivos.map(optimizarFotoWebp));
      setFotos((actuales) => [...actuales, ...optimizadas].slice(0, 2));
    } catch (error) {
      setErrorFotos(error instanceof Error ? error.message : "No se pudieron procesar las imágenes.");
    } finally {
      setProcesando(false);
    }
  }

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviando || procesando) return;
    setEnviando(true);
    setMensaje("");
    setErrorEnvio("");
    try {
      const formulario = evento.currentTarget;
      const datos = new FormData(formulario);
      datos.delete("fotos");
      fotos.forEach((foto) => datos.append("fotos", foto));
      const respuesta = await fetch("/api/solicitudes-venta-web", { method: "POST", body: datos });
      const resultado: { ok?: boolean; error?: string; mensaje?: string } = await respuesta.json();
      if (!respuesta.ok || !resultado.ok) throw new Error(resultado.error || "No pudimos enviar la solicitud.");
      setMensaje(resultado.mensaje || "Solicitud recibida correctamente.");
      formulario.reset();
      setFotos([]);
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : "No pudimos enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="mt-8 space-y-8" onSubmit={enviar}>
      <fieldset className="space-y-4">
        <legend className="mb-4 text-xl font-bold text-zinc-950">Tus datos de contacto</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={etiqueta}>Nombre y apellido *</span><input className={campo} name="nombre" autoComplete="name" required maxLength={120} placeholder="Tu nombre completo" /></label>
          <label><span className={etiqueta}>WhatsApp *</span><input className={campo} name="whatsapp" type="tel" autoComplete="tel" required maxLength={25} placeholder="Ej.: 299 1234567" /></label>
        </div>
        <label className="block"><span className={etiqueta}>Localidad y provincia *</span><input className={campo} name="localidad" required maxLength={120} placeholder="Ej.: Neuquén, Neuquén" /></label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-4 text-xl font-bold text-zinc-950">Datos del vehículo</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={etiqueta}>Marca *</span><input className={campo} name="marca" required maxLength={60} placeholder="Ej.: Toyota" /></label>
          <label><span className={etiqueta}>Modelo *</span><input className={campo} name="modelo" required maxLength={80} placeholder="Ej.: Corolla" /></label>
          <label><span className={etiqueta}>Versión</span><input className={campo} name="version" maxLength={100} placeholder="Ej.: XEI 2.0 CVT" /></label>
          <label><span className={etiqueta}>Año *</span><input className={campo} name="anio" type="number" min="1950" max="2027" required placeholder="Ej.: 2021" /></label>
          <label><span className={etiqueta}>Kilometraje *</span><input className={campo} name="kilometraje" type="number" min="0" required placeholder="Ej.: 65000" /></label>
          <label><span className={etiqueta}>Precio solicitado *</span><input className={campo} name="precio" type="number" min="1" required placeholder="Ej.: 25000000" /></label>
          <label><span className={etiqueta}>Moneda *</span><select className={campo} name="moneda" defaultValue="ARS" required><option value="ARS">Pesos argentinos (ARS)</option><option value="USD">Dólares (USD)</option></select></label>
        </div>
        <label className="block"><span className={etiqueta}>Observaciones</span><textarea className={campo} name="observaciones" rows={3} maxLength={1000} placeholder="Estado general, equipamiento o cualquier información relevante" /></label>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-3 text-xl font-bold text-zinc-950">Fotografías</legend>
        <label className="block"><span className={etiqueta}>Adjuntá hasta 2 fotos de tu auto</span><input className={campo} type="file" name="fotos" accept="image/*" multiple disabled={procesando || enviando || fotos.length >= 2} onChange={seleccionarFotos} aria-describedby="ayuda-fotos" /></label>
        <p id="ayuda-fotos" className="text-sm text-zinc-600">Las fotografías se optimizarán antes de enviarse. {procesando ? "Optimizando fotografías..." : `Seleccionadas: ${fotos.length} de 2.`}</p>
        {vistasPrevias.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {vistasPrevias.map(({ url, foto }, indice) => (
              <div key={url} className="relative overflow-hidden rounded-lg border border-zinc-200">
                <button type="button" disabled={procesando || enviando} aria-label={`Eliminar fotografía ${indice + 1}`} onClick={() => { setFotos((actuales) => actuales.filter((archivo) => archivo !== foto)); setErrorFotos(""); }} style={{ position: "absolute", top: 8, right: 8, width: 36, height: 36, borderRadius: "50%", background: "#d71935", color: "#fff", fontSize: 25, lineHeight: 1, cursor: "pointer", zIndex: 1 }}>×</button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Vista previa de la fotografía ${indice + 1}`} className="h-36 w-full object-cover" />
                <p className="p-2 text-center text-xs text-zinc-600">
                  WebP · {(foto.size / 1024).toFixed(0)} KB
                </p>
              </div>
            ))}
          </div>
        )}
        {errorFotos && <p role="alert" className="text-sm font-semibold text-red-700">{errorFotos}</p>}
      </fieldset>

      <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {mensaje && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">{mensaje}</p>}
      {errorEnvio && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorEnvio}</p>}
      <button type="submit" disabled={enviando || procesando} className="w-full rounded-lg bg-red-600 px-6 py-4 font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto">
        {enviando ? "Enviando..." : procesando ? "Procesando fotografías..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
