"use client";

import { useEffect, useState } from "react";
import { optimizarFotoWebp } from "@/lib/optimizar-foto-webp";

const campo = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-base text-zinc-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100";
const etiqueta = "mb-1.5 block text-sm font-semibold text-zinc-800";

export default function FormularioVenderAuto() {
  const [fotos, setFotos] = useState<File[]>([]);
  const [errorFotos, setErrorFotos] = useState("");

  const [procesando, setProcesando] = useState(false);
  const [vistasPrevias, setVistasPrevias] = useState<string[]>([]);

  useEffect(() => {
    const urls = fotos.map((foto) => URL.createObjectURL(foto));
    setVistasPrevias(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [fotos]);

  async function seleccionarFotos(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(evento.target.files ?? []);
    evento.target.value = "";
    setFotos([]);
    setErrorFotos("");
    if (archivos.length > 2) {
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
      setFotos(optimizadas);
    } catch (error) {
      setErrorFotos(error instanceof Error ? error.message : "No se pudieron procesar las imágenes.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <form className="mt-8 space-y-8" onSubmit={(evento) => evento.preventDefault()}>
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
        <label className="block"><span className={etiqueta}>Adjuntá hasta 2 fotos de tu auto</span><input className={campo} type="file" name="fotos" accept="image/*" multiple onChange={seleccionarFotos} aria-describedby="ayuda-fotos" /></label>
        <p id="ayuda-fotos" className="text-sm text-zinc-600">Las fotografías se optimizarán antes de enviarse. {procesando ? "Optimizando fotografías..." : `Seleccionadas: ${fotos.length} de 2.`}</p>
        {vistasPrevias.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {vistasPrevias.map((url, indice) => (
              <div key={url} className="overflow-hidden rounded-lg border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Vista previa de la fotografía ${indice + 1}`} className="h-36 w-full object-cover" />
                <p className="p-2 text-center text-xs text-zinc-600">
                  WebP · {(fotos[indice].size / 1024).toFixed(0)} KB
                </p>
              </div>
            ))}
          </div>
        )}
        {errorFotos && <p role="alert" className="text-sm font-semibold text-red-700">{errorFotos}</p>}
      </fieldset>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        El formulario está en etapa de prueba. Todavía no se pueden enviar solicitudes.
      </div>
      <button type="button" disabled className="w-full cursor-not-allowed rounded-lg bg-zinc-400 px-6 py-4 font-bold text-white sm:w-auto">
        Envío disponible próximamente
      </button>
    </form>
  );
}
