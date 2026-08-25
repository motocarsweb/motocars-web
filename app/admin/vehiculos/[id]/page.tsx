"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import VersionSelector from "@/componentes/admin/vehiculos/VersionSelector";
import { supabase } from "@/lib/supabase";
import {
  actualizarVehiculo,
  obtenerVehiculoPorId,
} from "@/lib/supabase-vehicles";
import { subirImagenesVehiculo } from "@/lib/storage";

type Catalogo = { id: string; nombre: string };
type Modelo = { id: string; nombre: string; marca_id: string };
const NUEVA_MARCA = "__nueva_marca__";
const NUEVO_MODELO = "__nuevo_modelo__";

function crearSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ImagenEditable = {
  id: string;
  tipo: "existente" | "nueva";
  url: string;
  archivo?: File;
};

type EditForm = {
  tipo_ingreso_id: string;
  marca: string;
  marca_id: string;
  modelo: string;
  modelo_id: string;
  version: string;
  version_id: string;
  tipo: string;
  tipo_vehiculo_id: string;
  estilo_moto_id: string;
  combustible: string;
  combustible_id: string;
  transmision: string;
  transmision_id: string;
  traccion_id: string;
  anio: string;
  precio: string;
  precio_compra: string;
  kilometros: string;
  color: string;
  estado: string;
  condicion: string;
  dominio: string;
  numero_chasis: string;
  numero_motor: string;
  destacado: boolean;
  publicado: boolean;
  descripcion: string;
  observaciones_internas: string;
};

const VACIO: EditForm = {
  tipo_ingreso_id: "",
  marca: "",
  marca_id: "",
  modelo: "",
  modelo_id: "",
  version: "",
  version_id: "",
  tipo: "",
  tipo_vehiculo_id: "",
  estilo_moto_id: "",
  combustible: "",
  combustible_id: "",
  transmision: "",
  transmision_id: "",
  traccion_id: "",
  anio: "",
  precio: "",
  precio_compra: "",
  kilometros: "",
  color: "",
  estado: "Disponible",
  condicion: "usado",
  dominio: "",
  numero_chasis: "",
  numero_motor: "",
  destacado: false,
  publicado: true,
  descripcion: "",
  observaciones_internas: "",
};

function idTemporal() {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export default function EditarVehiculoPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const vehiculoId = Number(params.id);

  const temporales = useRef<string[]>([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState<EditForm>(VACIO);

  const [marcas, setMarcas] = useState<Catalogo[]>([]);
  const [agregandoMarca, setAgregandoMarca] = useState(false);
const [marcaNueva, setMarcaNueva] = useState("");

const [agregandoModelo, setAgregandoModelo] = useState(false);
const [modeloNuevo, setModeloNuevo] = useState("");
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tiposVehiculo, setTiposVehiculo] = useState<Catalogo[]>([]);
  const [estilosMoto, setEstilosMoto] = useState<Catalogo[]>([]);
  const [combustibles, setCombustibles] = useState<Catalogo[]>([]);
  const [transmisiones, setTransmisiones] = useState<Catalogo[]>([]);
  const [tracciones, setTracciones] = useState<Catalogo[]>([]);
  const [tiposIngreso, setTiposIngreso] = useState<Catalogo[]>([]);
  const [imagenes, setImagenes] = useState<ImagenEditable[]>([]);

  async function cargarModelos(marcaId: string) {
    if (!marcaId) {
      setModelos([]);
      return;
    }

    const { data } = await supabase
      .from("modelos")
      .select("id, nombre, marca_id")
      .eq("marca_id", marcaId)
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    setModelos(data ?? []);
  }

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
        router.replace("/admin/vehiculos");
        return;
      }

      const [
        vehiculo,
        rMarcas,
        rTipos,
        rEstilos,
        rCombustibles,
        rTransmisiones,
        rTracciones,
        rIngresos,
      ] = await Promise.all([
        obtenerVehiculoPorId(vehiculoId),
        supabase.from("marcas").select("id,nombre").eq("activo", true).order("nombre"),
        supabase.from("tipos_vehiculo").select("id,nombre").eq("activo", true).order("orden"),
        supabase.from("estilos_moto").select("id,nombre").eq("activo", true).order("orden"),
        supabase.from("combustibles").select("id,nombre").eq("activo", true).order("orden"),
        supabase.from("transmisiones").select("id,nombre").eq("activo", true).order("orden"),
        supabase.from("tracciones").select("id,nombre").eq("activo", true).order("orden"),
        supabase.from("tipos_ingreso").select("id,nombre").eq("activo", true).order("orden"),
      ]);

      if (!activo) return;

      if (!vehiculo) {
        alert("No se encontró el vehículo.");
        router.replace("/admin/vehiculos");
        return;
      }

      setMarcas(rMarcas.data ?? []);
      setTiposVehiculo(rTipos.data ?? []);
      setEstilosMoto(rEstilos.data ?? []);
      setCombustibles(rCombustibles.data ?? []);
      setTransmisiones(rTransmisiones.data ?? []);
      setTracciones(rTracciones.data ?? []);
      setTiposIngreso(rIngresos.data ?? []);

      if (vehiculo.marca_id) {
        await cargarModelos(vehiculo.marca_id);
      }

      setForm({
        tipo_ingreso_id: vehiculo.tipo_ingreso_id ?? "",
        marca: vehiculo.marca ?? "",
        marca_id: vehiculo.marca_id ?? "",
        modelo: vehiculo.modelo ?? "",
        modelo_id: vehiculo.modelo_id ?? "",
        version: vehiculo.version ?? "",
        version_id: vehiculo.version_id ?? "",
        tipo: vehiculo.tipo ?? "",
        tipo_vehiculo_id: vehiculo.tipo_vehiculo_id ?? "",
        estilo_moto_id: vehiculo.estilo_moto_id ?? "",
        combustible: vehiculo.combustible ?? "",
        combustible_id: vehiculo.combustible_id ?? "",
        transmision: vehiculo.transmision ?? "",
        transmision_id: vehiculo.transmision_id ?? "",
        traccion_id: vehiculo.traccion_id ?? "",
        anio: vehiculo.anio?.toString() ?? "",
        precio: vehiculo.precio?.toString() ?? "",
        precio_compra: vehiculo.precio_compra?.toString() ?? "",
        kilometros: vehiculo.kilometros?.toString() ?? "",
        color: vehiculo.color ?? "",
        estado: vehiculo.estado ?? "Disponible",
        condicion: vehiculo.condicion ?? "usado",
        dominio: vehiculo.dominio ?? "",
        numero_chasis: vehiculo.numero_chasis ?? "",
        numero_motor: vehiculo.numero_motor ?? "",
        destacado: vehiculo.destacado ?? false,
        publicado: vehiculo.publicado ?? true,
        descripcion: vehiculo.descripcion ?? "",
        observaciones_internas: vehiculo.observaciones_internas ?? "",
      });

      const lista = Array.isArray(vehiculo.imagenes)
        ? vehiculo.imagenes.filter((x): x is string => typeof x === "string" && x.trim() !== "")
        : [];

      const principal = vehiculo.imagen_principal?.trim() ?? "";
      const ordenadas = principal
        ? [principal, ...lista.filter((x) => x !== principal)]
        : lista;

      setImagenes(
        Array.from(new Set(ordenadas)).map((url) => ({
          id: idTemporal(),
          tipo: "existente" as const,
          url,
        }))
      );

      setCargando(false);
    }

    cargar();

    return () => {
      activo = false;
      temporales.current.forEach((url) => URL.revokeObjectURL(url));
      temporales.current = [];
    };
  }, [router, vehiculoId]);

  function campo(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  }

  async function cambiarMarca(event: React.ChangeEvent<HTMLSelectElement>) {
  const id = event.target.value;

  if (id === NUEVA_MARCA) {
    setAgregandoMarca(true);
    setMarcaNueva("");

    setAgregandoModelo(true);
    setModeloNuevo("");

    setModelos([]);

    setForm((anterior) => ({
      ...anterior,
      marca_id: NUEVA_MARCA,
      marca: "",
      modelo_id: NUEVO_MODELO,
      modelo: "",
      version_id: "",
      version: "",
    }));

    return;
  }

  setAgregandoMarca(false);
  setMarcaNueva("");
  setAgregandoModelo(false);
  setModeloNuevo("");

  const item = marcas.find((x) => x.id === id);

  setForm((anterior) => ({
    ...anterior,
    marca_id: id,
    marca: item?.nombre ?? "",
    modelo_id: "",
    modelo: "",
    version_id: "",
    version: "",
  }));

  await cargarModelos(id);
}

  function cambiarModelo(event: React.ChangeEvent<HTMLSelectElement>) {
  const id = event.target.value;

  if (id === NUEVO_MODELO) {
    setAgregandoModelo(true);
    setModeloNuevo("");

    setForm((anterior) => ({
      ...anterior,
      modelo_id: NUEVO_MODELO,
      modelo: "",
      version_id: "",
      version: "",
    }));

    return;
  }

  setAgregandoModelo(false);
  setModeloNuevo("");

  const item = modelos.find((x) => x.id === id);

  setForm((anterior) => ({
    ...anterior,
    modelo_id: id,
    modelo: item?.nombre ?? "",
    version_id: "",
    version: "",
  }));
}

  function cambiarTipo(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    const item = tiposVehiculo.find((x) => x.id === id);
    const esMoto = item?.nombre === "Moto";

    setForm((anterior) => ({
      ...anterior,
      tipo_vehiculo_id: id,
      tipo: item?.nombre ?? "",
      estilo_moto_id: esMoto ? anterior.estilo_moto_id : "",
    }));
  }

  function cambiarCombustible(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    const item = combustibles.find((x) => x.id === id);

    setForm((anterior) => ({
      ...anterior,
      combustible_id: id,
      combustible: item?.nombre ?? "",
    }));
  }

  function cambiarTransmision(event: React.ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;
    const item = transmisiones.find((x) => x.id === id);

    setForm((anterior) => ({
      ...anterior,
      transmision_id: id,
      transmision: item?.nombre ?? "",
    }));
  }

  function agregarFotos(event: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(event.target.files ?? []);
    event.target.value = "";

    const validos = archivos.filter((archivo) => {
      const tipoOk = ["image/jpeg", "image/png", "image/webp"].includes(archivo.type);
      const pesoOk = archivo.size <= 10 * 1024 * 1024;

      if (!tipoOk) alert(`"${archivo.name}" no es JPG, PNG o WEBP.`);
      if (!pesoOk) alert(`"${archivo.name}" supera los 10 MB.`);

      return tipoOk && pesoOk;
    });

    if (imagenes.length + validos.length > 20) {
      alert("Se permiten como máximo 20 imágenes.");
      return;
    }

    const nuevas = validos.map((archivo) => {
      const url = URL.createObjectURL(archivo);
      temporales.current.push(url);

      return {
        id: idTemporal(),
        tipo: "nueva" as const,
        url,
        archivo,
      };
    });

    setImagenes((anteriores) => [...anteriores, ...nuevas]);
  }

  function eliminarFoto(id: string) {
    setImagenes((anteriores) => {
      const encontrada = anteriores.find((x) => x.id === id);

      if (encontrada?.tipo === "nueva") {
        URL.revokeObjectURL(encontrada.url);
        temporales.current = temporales.current.filter((url) => url !== encontrada.url);
      }

      return anteriores.filter((x) => x.id !== id);
    });
  }

  function portada(id: string) {
    setImagenes((anteriores) => {
      const indice = anteriores.findIndex((x) => x.id === id);
      if (indice <= 0) return anteriores;

      const copia = [...anteriores];
      const [seleccionada] = copia.splice(indice, 1);
      return seleccionada ? [seleccionada, ...copia] : anteriores;
    });
  }

  function mover(id: string, delta: number) {
    setImagenes((anteriores) => {
      const i = anteriores.findIndex((x) => x.id === id);
      const j = i + delta;

      if (i < 0 || j < 0 || j >= anteriores.length) {
        return anteriores;
      }

      const copia = [...anteriores];
      [copia[i], copia[j]] = [copia[j], copia[i]];
      return copia;
    });
  }

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (guardando) return;

    if (!form.marca_id || !form.modelo_id || !form.tipo_vehiculo_id) {
      alert("Completá marca, modelo y tipo de vehículo.");
      return;
    }

    if (form.tipo === "Moto" && !form.estilo_moto_id) {
      alert("Seleccioná el estilo de la moto.");
      return;
    }

    setGuardando(true);

    try {
      let marcaIdDefinitiva = form.marca_id;
let marcaNombreDefinitiva = form.marca;

if (agregandoMarca) {
  const nombreMarca = marcaNueva.trim();
  const slugMarca = crearSlug(nombreMarca);

  const { data: marcaExistente } = await supabase
    .from("marcas")
    .select("id,nombre")
    .eq("slug", slugMarca)
    .maybeSingle();

  if (marcaExistente) {
    marcaIdDefinitiva = marcaExistente.id;
    marcaNombreDefinitiva = marcaExistente.nombre;
  } else {
    const { data: marcaCreada, error: errorMarca } = await supabase
      .from("marcas")
      .insert({
        nombre: nombreMarca,
        slug: slugMarca,
        activo: true,
      })
      .select("id,nombre")
      .single();

    if (errorMarca) {
      throw new Error(
        `No se pudo crear la marca nueva: ${errorMarca.message}`
      );
    }

    marcaIdDefinitiva = marcaCreada.id;
    marcaNombreDefinitiva = marcaCreada.nombre;
  }
}

let modeloIdDefinitivo = form.modelo_id;
let modeloNombreDefinitivo = form.modelo;

if (agregandoModelo) {
  const nombreModelo = modeloNuevo.trim();
  const slugModelo = crearSlug(nombreModelo);

  const { data: modeloExistente } = await supabase
    .from("modelos")
    .select("id,nombre")
    .eq("marca_id", marcaIdDefinitiva)
    .eq("slug", slugModelo)
    .maybeSingle();

  if (modeloExistente) {
    modeloIdDefinitivo = modeloExistente.id;
    modeloNombreDefinitivo = modeloExistente.nombre;
  } else {
    const { data: modeloCreado, error: errorModelo } = await supabase
      .from("modelos")
      .insert({
        marca_id: marcaIdDefinitiva,
        nombre: nombreModelo,
        slug: slugModelo,
        activo: true,
      })
      .select("id,nombre")
      .single();

    if (errorModelo) {
      throw new Error(
        `No se pudo crear el modelo nuevo: ${errorModelo.message}`
      );
    }

    modeloIdDefinitivo = modeloCreado.id;
    modeloNombreDefinitivo = modeloCreado.nombre;
  }
}
      const nuevas = imagenes.filter(
        (x): x is ImagenEditable & { tipo: "nueva"; archivo: File } =>
          x.tipo === "nueva" && x.archivo instanceof File
      );

      const urlsSubidas =
        nuevas.length > 0
          ? await subirImagenesVehiculo(nuevas.map((x) => x.archivo))
          : [];

      const mapa = new Map<string, string>();
      nuevas.forEach((x, i) => {
        if (urlsSubidas[i]) mapa.set(x.id, urlsSubidas[i]);
      });

      const urlsFinales = imagenes
        .map((x) => (x.tipo === "existente" ? x.url : mapa.get(x.id)))
        .filter((x): x is string => typeof x === "string" && x.trim() !== "");

      const resultado = await actualizarVehiculo(vehiculoId, {
        tipo_ingreso_id: form.tipo_ingreso_id || null,
        marca: marcaNombreDefinitiva.trim(),
marca_id: marcaIdDefinitiva,
modelo: modeloNombreDefinitivo.trim(),
modelo_id: modeloIdDefinitivo,
        version: form.version.trim() || null,
        version_id:
          form.version_id && form.version_id !== "__nueva__"
            ? form.version_id
            : null,
        tipo: form.tipo.trim() || null,
        tipo_vehiculo_id: form.tipo_vehiculo_id,
        estilo_moto_id:
          form.tipo === "Moto" ? form.estilo_moto_id || null : null,
        combustible: form.combustible.trim() || null,
        combustible_id: form.combustible_id || null,
        transmision: form.transmision.trim() || null,
        transmision_id: form.transmision_id || null,
        traccion_id: form.traccion_id || null,
        anio: form.anio ? Number(form.anio) : null,
        precio: form.precio ? Number(form.precio) : null,
        precio_compra: form.precio_compra ? Number(form.precio_compra) : null,
        kilometros: form.kilometros ? Number(form.kilometros) : null,
        color: form.color.trim() || null,
        estado: form.estado || null,
        condicion: form.condicion || null,
        dominio: form.dominio.trim().toUpperCase() || null,
        numero_chasis: form.numero_chasis.trim() || null,
        numero_motor: form.numero_motor.trim() || null,
        destacado: form.destacado,
        publicado: form.publicado,
        descripcion: form.descripcion.trim() || null,
        observaciones_internas: form.observaciones_internas.trim() || null,
        imagen_principal: urlsFinales[0] ?? null,
        imagenes: urlsFinales,
      });

      if (!resultado) {
        alert("No se pudieron guardar los cambios.");
        return;
      }

      alert("Vehículo actualizado correctamente.");
      router.push("/admin/vehiculos");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p>Cargando vehículo...</p>;
  }

  return (
    <section>
      <h1>Editar vehículo</h1>

      <form
        onSubmit={guardar}
        style={{ display: "grid", gap: 16, maxWidth: 900, marginTop: 22 }}
      >
        <select name="tipo_ingreso_id" value={form.tipo_ingreso_id} onChange={campo}>
          <option value="">Seleccionar tipo de ingreso</option>
          {tiposIngreso.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>

        <div
  style={{
    display: "grid",
    gap: 8,
  }}
>
  <select
    value={form.marca_id}
    onChange={cambiarMarca}
    required
  >
    <option value="">Seleccionar marca</option>

    {marcas.map((x) => (
      <option key={x.id} value={x.id}>
        {x.nombre}
      </option>
    ))}

    <option value={NUEVA_MARCA}>
      + Nueva marca
    </option>
  </select>

  {agregandoMarca && (
    <input
      value={marcaNueva}
      onChange={(event) => {
        setMarcaNueva(event.target.value);

        setForm((anterior) => ({
          ...anterior,
          marca: event.target.value,
        }));
      }}
      placeholder="Nombre de la nueva marca"
      autoFocus
    />
  )}
</div>

        <div
  style={{
    display: "grid",
    gap: 8,
  }}
>
  {agregandoMarca ? (
    <input
      value={modeloNuevo}
      onChange={(event) => {
        setModeloNuevo(event.target.value);

        setForm((anterior) => ({
          ...anterior,
          modelo_id: NUEVO_MODELO,
          modelo: event.target.value,
          version_id: "",
          version: "",
        }));
      }}
      placeholder="Nombre del nuevo modelo"
      required
    />
  ) : (
    <>
      <select
        value={form.modelo_id}
        onChange={cambiarModelo}
        required
        disabled={!form.marca_id}
      >
        <option value="">Seleccionar modelo</option>

        {modelos.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nombre}
          </option>
        ))}

        {form.marca_id && (
          <option value={NUEVO_MODELO}>
            + Nuevo modelo
          </option>
        )}
      </select>

      {agregandoModelo && (
        <input
          value={modeloNuevo}
          onChange={(event) => {
            setModeloNuevo(event.target.value);

            setForm((anterior) => ({
              ...anterior,
              modelo_id: NUEVO_MODELO,
              modelo: event.target.value,
              version_id: "",
              version: "",
            }));
          }}
          placeholder="Nombre del nuevo modelo"
          required
        />
      )}
    </>
  )}
</div>

        {agregandoModelo ? (
  <input
    value={form.version}
    onChange={(event) =>
      setForm((anterior) => ({
        ...anterior,
        version: event.target.value,
        version_id: "",
      }))
    }
    placeholder="Versión (opcional)"
  />
) : (
  <VersionSelector
    modeloId={form.modelo_id}
    versionId={form.version_id}
    versionNombre={form.version}
    onChange={(versionId, versionNombre) =>
      setForm((anterior) => ({
        ...anterior,
        version_id: versionId,
        version: versionNombre,
      }))
    }
  />
)}

        <select value={form.tipo_vehiculo_id} onChange={cambiarTipo} required>
          <option value="">Seleccionar tipo de vehículo</option>
          {tiposVehiculo.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>

        {form.tipo === "Moto" && (
          <select
            name="estilo_moto_id"
            value={form.estilo_moto_id}
            onChange={campo}
            required
          >
            <option value="">Seleccionar estilo de moto</option>
            {estilosMoto.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        )}

        <select value={form.combustible_id} onChange={cambiarCombustible}>
          <option value="">Seleccionar combustible</option>
          {combustibles.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>

        <select value={form.transmision_id} onChange={cambiarTransmision}>
          <option value="">Seleccionar transmisión</option>
          {transmisiones.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>

        <select name="traccion_id" value={form.traccion_id} onChange={campo}>
          <option value="">Seleccionar tracción</option>
          {tracciones.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </select>

        <select name="condicion" value={form.condicion} onChange={campo}>
          <option value="0km">0 km</option>
          <option value="usado">Usado</option>
        </select>

        <input name="anio" type="number" placeholder="Año" value={form.anio} onChange={campo} />
        <input name="kilometros" type="number" placeholder="Kilómetros" value={form.kilometros} onChange={campo} />
        <input name="color" placeholder="Color" value={form.color} onChange={campo} />
        <input name="precio" type="number" placeholder="Precio de venta" value={form.precio} onChange={campo} />
        <input name="precio_compra" type="number" placeholder="Precio de compra" value={form.precio_compra} onChange={campo} />
        <input name="dominio" placeholder="Dominio" value={form.dominio} onChange={campo} />
        <input name="numero_chasis" placeholder="Número de chasis" value={form.numero_chasis} onChange={campo} />
        <input name="numero_motor" placeholder="Número de motor" value={form.numero_motor} onChange={campo} />
        <input name="estado" placeholder="Estado" value={form.estado} onChange={campo} />

        <textarea name="descripcion" placeholder="Descripción comercial" rows={5} value={form.descripcion} onChange={campo} />
        <textarea name="observaciones_internas" placeholder="Observaciones internas" rows={4} value={form.observaciones_internas} onChange={campo} />

        <div style={{ display: "grid", gap: 12, padding: 16, border: "1px solid #d1d5db", borderRadius: 10 }}>
          <strong>Imágenes del vehículo</strong>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={agregarFotos} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
            {imagenes.map((imagen, index) => (
              <article key={imagen.id} style={{ border: index === 0 ? "3px solid #111827" : "1px solid #d1d5db", borderRadius: 8, overflow: "hidden" }}>
                <img src={imagen.url} alt="" style={{ width: "100%", height: 135, objectFit: "cover", display: "block" }} />

                <div style={{ display: "grid", gap: 7, padding: 9 }}>
                  {index !== 0 && (
                    <button type="button" onClick={() => portada(imagen.id)}>
                      Hacer portada
                    </button>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    <button type="button" disabled={index === 0} onClick={() => mover(imagen.id, -1)}>←</button>
                    <button type="button" disabled={index === imagenes.length - 1} onClick={() => mover(imagen.id, 1)}>→</button>
                  </div>

                  <button type="button" onClick={() => eliminarFoto(imagen.id)} style={{ color: "#b91c1c" }}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <label>
          <input type="checkbox" name="destacado" checked={form.destacado} onChange={campo} /> Destacado
        </label>

        <label>
          <input type="checkbox" name="publicado" checked={form.publicado} onChange={campo} /> Publicado en la web
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => router.push("/admin/vehiculos")}>
            Volver
          </button>

          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}