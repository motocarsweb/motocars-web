"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import BasicData from "./vehicle-form/BasicData";
import TechnicalData from "./vehicle-form/TechnicalData";
import PricesSection from "./vehicle-form/PricesSection";
import IdentitySection from "./vehicle-form/IdentitySection";
import DescriptionSection from "./vehicle-form/DescriptionSection";
import PublicationSection from "./vehicle-form/PublicationSection";
import ImagesSection from "./vehicle-form/ImagesSection";

import { useVehicleForm } from "./hooks/useVehicleForm";

import { supabase } from "@/lib/supabase";
import { crearVehiculo } from "@/lib/supabase-vehicles";
import { subirImagenesVehiculo } from "@/lib/storage";
import { duplicarVehiculo } from "@/lib/service/duplicarVehiculo";

type Marca = {
  id: string;
  nombre: string;
};

type Modelo = {
  id: string;
  nombre: string;
  marca_id: string;
};

type Catalogo = {
  id: string;
  nombre: string;
};

type VehicleFormProps = {
  duplicarId?: number;
};

const VALOR_MODELO_NUEVO = "__nuevo__";
const VALOR_MARCA_NUEVA = "__nueva_marca__";
const VALOR_COMBUSTIBLE_NUEVO = "__nuevo_combustible__";

function crearSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function VehicleForm({
  duplicarId,
}: VehicleFormProps) {
  const router = useRouter();

  const [guardando, setGuardando] = useState(false);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargandoModelos, setCargandoModelos] = useState(false);
  const [cargandoDuplicado, setCargandoDuplicado] = useState(false);

  const [imagenes, setImagenes] = useState<File[]>([]);

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tiposVehiculo, setTiposVehiculo] = useState<Catalogo[]>([]);
  const [estilosMoto, setEstilosMoto] = useState<Catalogo[]>([]);
  const [combustibles, setCombustibles] = useState<Catalogo[]>([]);
  const [transmisiones, setTransmisiones] = useState<Catalogo[]>([]);
  const [tracciones, setTracciones] = useState<Catalogo[]>([]);
  const [tiposIngreso, setTiposIngreso] = useState<Catalogo[]>([]);

  const [marcaNueva, setMarcaNueva] = useState("");
  const [agregandoMarca, setAgregandoMarca] = useState(false);

  const [modeloNuevo, setModeloNuevo] = useState("");
  const [agregandoModelo, setAgregandoModelo] = useState(false);

  const [combustibleNuevo, setCombustibleNuevo] = useState("");
  const [agregandoCombustible, setAgregandoCombustible] = useState(false);

  const {
    form,
    setForm,
    actualizar,
    actualizarMarca: actualizarMarcaDesdeHook,
  } = useVehicleForm();

  const marcasParaSelector = useMemo<Marca[]>(
    () => [
      ...marcas,
      {
        id: VALOR_MARCA_NUEVA,
        nombre: "+ Agregar marca nueva",
      },
    ],
    [marcas]
  );

  const combustiblesParaSelector = useMemo<Catalogo[]>(
    () => [
      ...combustibles,
      {
        id: VALOR_COMBUSTIBLE_NUEVO,
        nombre: "+ Agregar combustible nuevo",
      },
    ],
    [combustibles]
  );

  useEffect(() => {
    async function cargarCatalogos() {
      setCargandoCatalogos(true);

      const [
        respuestaMarcas,
        respuestaTiposVehiculo,
        respuestaEstilosMoto,
        respuestaCombustibles,
        respuestaTransmisiones,
        respuestaTracciones,
        respuestaTiposIngreso,
      ] = await Promise.all([
        supabase
          .from("marcas")
          .select("id, nombre")
          .eq("activo", true)
          .order("orden", { ascending: true })
          .order("nombre", { ascending: true }),

        supabase
          .from("tipos_vehiculo")
          .select("id, nombre")
          .eq("activo", true)
          .order("orden", { ascending: true })
          .order("nombre", { ascending: true }),

        supabase
          .from("estilos_moto")
          .select("id, nombre")
          .eq("activo", true)
          .order("orden", { ascending: true })
          .order("nombre", { ascending: true }),

        supabase
          .from("combustibles")
          .select("id, nombre")
          .eq("activo", true)
          .order("orden", { ascending: true })
          .order("nombre", { ascending: true }),

        supabase
          .from("transmisiones")
          .select("id, nombre")
          .eq("activo", true)
          .order("orden", { ascending: true })
          .order("nombre", { ascending: true }),

        supabase
          .from("tracciones")
          .select("id, nombre")
          .eq("activo", true)
          .order("orden", { ascending: true })
          .order("nombre", { ascending: true }),

        supabase
          .from("tipos_ingreso")
          .select("id, nombre")
          .eq("activo", true)
          .order("orden", { ascending: true })
          .order("nombre", { ascending: true }),
      ]);

      if (respuestaMarcas.error) {
        console.error("Error al cargar marcas:", respuestaMarcas.error.message);
      }

      if (respuestaTiposVehiculo.error) {
        console.error(
          "Error al cargar tipos de vehículo:",
          respuestaTiposVehiculo.error.message
        );
      }

      if (respuestaEstilosMoto.error) {
        console.error(
          "Error al cargar estilos de moto:",
          respuestaEstilosMoto.error.message
        );
      }

      if (respuestaCombustibles.error) {
        console.error(
          "Error al cargar combustibles:",
          respuestaCombustibles.error.message
        );
      }

      if (respuestaTransmisiones.error) {
        console.error(
          "Error al cargar transmisiones:",
          respuestaTransmisiones.error.message
        );
      }

      if (respuestaTracciones.error) {
        console.error(
          "Error al cargar tracciones:",
          respuestaTracciones.error.message
        );
      }

      if (respuestaTiposIngreso.error) {
        console.error(
          "Error al cargar tipos de ingreso:",
          respuestaTiposIngreso.error.message
        );
      }

      setMarcas(respuestaMarcas.data ?? []);
      setTiposVehiculo(respuestaTiposVehiculo.data ?? []);
      setEstilosMoto(respuestaEstilosMoto.data ?? []);
      setCombustibles(respuestaCombustibles.data ?? []);
      setTransmisiones(respuestaTransmisiones.data ?? []);
      setTracciones(respuestaTracciones.data ?? []);
      setTiposIngreso(respuestaTiposIngreso.data ?? []);

      setCargandoCatalogos(false);
    }

    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (!duplicarId) {
      return;
    }

    const vehiculoIdDuplicado = duplicarId;
    let componenteActivo = true;

    async function cargarVehiculoParaDuplicar() {
      setCargandoDuplicado(true);

      try {
        const datosDuplicados = await duplicarVehiculo(vehiculoIdDuplicado);

        if (!componenteActivo) {
          return;
        }

        if (datosDuplicados.marca_id) {
          await cargarModelosPorMarca(datosDuplicados.marca_id);
        }

        if (!componenteActivo) {
          return;
        }

        setMarcaNueva("");
        setAgregandoMarca(false);

        setModeloNuevo("");
        setAgregandoModelo(false);

        setCombustibleNuevo("");
        setAgregandoCombustible(false);

        setImagenes([]);
        setForm(datosDuplicados);
      } catch (error) {
        console.error("Error al cargar el vehículo para duplicar:", error);

        alert(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el vehículo para duplicar."
        );
      } finally {
        if (componenteActivo) {
          setCargandoDuplicado(false);
        }
      }
    }

    cargarVehiculoParaDuplicar();

    return () => {
      componenteActivo = false;
    };
  }, [duplicarId, setForm]);

  async function cargarModelosPorMarca(marcaId: string) {
    setModelos([]);

    if (!marcaId || marcaId === VALOR_MARCA_NUEVA) {
      setCargandoModelos(false);
      return;
    }

    setCargandoModelos(true);

    const { data, error } = await supabase
      .from("modelos")
      .select("id, nombre, marca_id")
      .eq("marca_id", marcaId)
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error al cargar modelos:", error.message);
      setModelos([]);
    } else {
      setModelos(data ?? []);
    }

    setCargandoModelos(false);
  }

  async function actualizarMarca(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const marcaId = event.target.value;

    if (marcaId === VALOR_MARCA_NUEVA) {
      setAgregandoMarca(true);
      setMarcaNueva("");
      setModelos([]);
      setAgregandoModelo(true);
      setModeloNuevo("");

      setForm((formAnterior) => ({
        ...formAnterior,
        marca_id: VALOR_MARCA_NUEVA,
        marca: "",
        modelo_id: VALOR_MODELO_NUEVO,
        modelo: "",
        version_id: "",
        version: "",
      }));

      return;
    }

    setAgregandoMarca(false);
    setMarcaNueva("");

    await actualizarMarcaDesdeHook({
      event,
      marcas,
      cargarModelosPorMarca,
      limpiarModeloNuevo: () => {
        setModeloNuevo("");
        setAgregandoModelo(false);
      },
    });
  }

  function actualizarMarcaNueva(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const nombre = event.target.value;

    setMarcaNueva(nombre);

    setForm((formAnterior) => ({
      ...formAnterior,
      marca: nombre,
    }));
  }

  function actualizarModelo(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const modeloId = event.target.value;

    if (modeloId === VALOR_MODELO_NUEVO) {
      setAgregandoModelo(true);
      setModeloNuevo("");

      setForm((formAnterior) => ({
        ...formAnterior,
        modelo_id: VALOR_MODELO_NUEVO,
        modelo: "",
        version_id: "",
        version: "",
      }));

      return;
    }

    setAgregandoModelo(false);
    setModeloNuevo("");

    const modeloSeleccionado = modelos.find(
      (modelo) => modelo.id === modeloId
    );

    setForm((formAnterior) => ({
      ...formAnterior,
      modelo_id: modeloId,
      modelo: modeloSeleccionado?.nombre ?? "",
      version_id: "",
      version: "",
    }));
  }

  function actualizarModeloNuevo(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const nombre = event.target.value;

    setModeloNuevo(nombre);

    setForm((formAnterior) => ({
      ...formAnterior,
      modelo: nombre,
    }));
  }

  function actualizarTipoVehiculo(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const tipoId = event.target.value;

    const tipoSeleccionado = tiposVehiculo.find(
      (tipo) => tipo.id === tipoId
    );

    setForm((formAnterior) => ({
      ...formAnterior,
      tipo_vehiculo_id: tipoId,
      tipo: tipoSeleccionado?.nombre ?? "",
      estilo_moto_id:
        tipoSeleccionado?.nombre === "Moto"
          ? formAnterior.estilo_moto_id
          : "",
    }));
  }

  function actualizarEstiloMoto(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const estiloMotoId = event.target.value;

    setForm((formAnterior) => ({
      ...formAnterior,
      estilo_moto_id: estiloMotoId,
    }));
  }

  function actualizarCombustible(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const combustibleId = event.target.value;

    if (combustibleId === VALOR_COMBUSTIBLE_NUEVO) {
      setAgregandoCombustible(true);
      setCombustibleNuevo("");

      setForm((formAnterior) => ({
        ...formAnterior,
        combustible_id: VALOR_COMBUSTIBLE_NUEVO,
        combustible: "",
      }));

      return;
    }

    setAgregandoCombustible(false);
    setCombustibleNuevo("");

    const combustibleSeleccionado = combustibles.find(
      (combustible) => combustible.id === combustibleId
    );

    setForm((formAnterior) => ({
      ...formAnterior,
      combustible_id: combustibleId,
      combustible: combustibleSeleccionado?.nombre ?? "",
    }));
  }

  function actualizarCombustibleNuevo(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const nombre = event.target.value;

    setCombustibleNuevo(nombre);

    setForm((formAnterior) => ({
      ...formAnterior,
      combustible: nombre,
    }));
  }

  function actualizarTransmision(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const transmisionId = event.target.value;

    const transmisionSeleccionada = transmisiones.find(
      (transmision) => transmision.id === transmisionId
    );

    setForm((formAnterior) => ({
      ...formAnterior,
      transmision_id: transmisionId,
      transmision: transmisionSeleccionada?.nombre ?? "",
    }));
  }

  async function crearMarcaSiCorresponde() {
    if (!agregandoMarca) {
      return {
        marcaId: form.marca_id,
        marcaNombre: form.marca,
      };
    }

    const nombre = marcaNueva.trim();

    if (!nombre) {
      throw new Error("Ingresá el nombre de la marca nueva.");
    }

    const marcaExistente = marcas.find(
      (marca) =>
        marca.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (marcaExistente) {
      return {
        marcaId: marcaExistente.id,
        marcaNombre: marcaExistente.nombre,
      };
    }

    const slug = crearSlug(nombre);

    if (!slug) {
      throw new Error("El nombre de la marca nueva no es válido.");
    }

    const { data, error } = await supabase
      .from("marcas")
      .insert({
        nombre,
        slug,
      })
      .select("id, nombre")
      .single();

    if (error) {
      throw new Error(
        `No se pudo crear la marca nueva: ${error.message}`
      );
    }

    return {
      marcaId: data.id,
      marcaNombre: data.nombre,
    };
  }

  async function crearModeloSiCorresponde(
    marcaIdDefinitiva: string
  ) {
    if (!agregandoModelo) {
      return {
        modeloId: form.modelo_id,
        modeloNombre: form.modelo,
      };
    }

    const nombre = modeloNuevo.trim();

    if (!nombre) {
      throw new Error("Ingresá el nombre del modelo nuevo.");
    }

    const slug = crearSlug(nombre);

    if (!slug) {
      throw new Error("El nombre del modelo nuevo no es válido.");
    }

    const modeloExistente = modelos.find(
      (modelo) =>
        modelo.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (modeloExistente) {
      return {
        modeloId: modeloExistente.id,
        modeloNombre: modeloExistente.nombre,
      };
    }

    const { data, error } = await supabase
      .from("modelos")
      .insert({
        marca_id: marcaIdDefinitiva,
        nombre,
        slug,
      })
      .select("id, nombre, marca_id")
      .single();

    if (error) {
      throw new Error(
        `No se pudo crear el modelo nuevo: ${error.message}`
      );
    }

    return {
      modeloId: data.id,
      modeloNombre: data.nombre,
    };
  }

  async function crearCombustibleSiCorresponde() {
    if (!agregandoCombustible) {
      return {
        combustibleId: form.combustible_id || null,
        combustibleNombre: form.combustible || "",
      };
    }

    const nombre = combustibleNuevo.trim();

    if (!nombre) {
      throw new Error("Ingresá el nombre del combustible nuevo.");
    }

    const combustibleExistente = combustibles.find(
      (combustible) =>
        combustible.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (combustibleExistente) {
      return {
        combustibleId: combustibleExistente.id,
        combustibleNombre: combustibleExistente.nombre,
      };
    }

    const slug = crearSlug(nombre);

    if (!slug) {
      throw new Error("El nombre del combustible nuevo no es válido.");
    }

    const { data, error } = await supabase
      .from("combustibles")
      .insert({
        nombre,
        slug,
      })
      .select("id, nombre")
      .single();

    if (error) {
      throw new Error(
        `No se pudo crear el combustible nuevo: ${error.message}`
      );
    }

    return {
      combustibleId: data.id,
      combustibleNombre: data.nombre,
    };
  }

  async function crearVersionSiCorresponde(
    modeloIdDefinitivo: string
  ) {
    const nombre = form.version.trim();

    if (!nombre) {
      return {
        versionId: null as string | null,
        versionNombre: "",
      };
    }

    if (
      form.version_id &&
      form.version_id !== "__nueva__"
    ) {
      return {
        versionId: form.version_id,
        versionNombre: nombre,
      };
    }

    const slug = crearSlug(nombre);

    if (!slug) {
      throw new Error(
        "El nombre de la versión nueva no es válido."
      );
    }

    const { data: existente, error: errorBusqueda } =
      await supabase
        .from("versiones")
        .select("id, nombre")
        .eq("modelo_id", modeloIdDefinitivo)
        .ilike("nombre", nombre)
        .maybeSingle();

    if (errorBusqueda) {
      throw new Error(
        `No se pudo verificar la versión: ${errorBusqueda.message}`
      );
    }

    if (existente) {
      return {
        versionId: existente.id,
        versionNombre: existente.nombre,
      };
    }

    const { data, error } = await supabase
      .from("versiones")
      .insert({
        modelo_id: modeloIdDefinitivo,
        nombre,
        slug,
      })
      .select("id, nombre")
      .single();

    if (error) {
      throw new Error(
        `No se pudo crear la versión nueva: ${error.message}`
      );
    }

    return {
      versionId: data.id,
      versionNombre: data.nombre,
    };
  }

  async function guardar(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (guardando) {
      return;
    }

    if (!form.marca_id) {
      alert("Seleccioná una marca.");
      return;
    }

    if (agregandoMarca && !marcaNueva.trim()) {
      alert("Escribí el nombre de la marca nueva.");
      return;
    }

    if (!form.modelo_id) {
      alert("Seleccioná un modelo.");
      return;
    }

    if (agregandoModelo && !modeloNuevo.trim()) {
      alert("Escribí el nombre del modelo nuevo.");
      return;
    }

    if (!form.tipo_vehiculo_id) {
      alert("Seleccioná un tipo de vehículo.");
      return;
    }

    if (!form.tipo_ingreso_id) {
      alert("Seleccioná el tipo de ingreso.");
      return;
    }

    if (form.tipo === "Moto" && !form.estilo_moto_id) {
      alert("Seleccioná el estilo de la moto.");
      return;
    }

    if (agregandoCombustible && !combustibleNuevo.trim()) {
      alert("Escribí el nombre del combustible nuevo.");
      return;
    }

    setGuardando(true);

    try {
      const marcaDefinitiva = await crearMarcaSiCorresponde();

      const modeloDefinitivo = await crearModeloSiCorresponde(
        marcaDefinitiva.marcaId
      );

      const versionDefinitiva =
        await crearVersionSiCorresponde(
          modeloDefinitivo.modeloId
        );

      const combustibleDefinitivo =
        await crearCombustibleSiCorresponde();

      let urlsImagenes: string[] = [];

      if (imagenes.length > 0) {
        urlsImagenes = await subirImagenesVehiculo(imagenes);
      }

      const imagenPrincipal =
        urlsImagenes.length > 0 ? urlsImagenes[0] : null;

      const resultado = await crearVehiculo({
        marca: marcaDefinitiva.marcaNombre.trim(),
        modelo: modeloDefinitivo.modeloNombre.trim(),
        version:
          versionDefinitiva.versionNombre.trim() || null,
        combustible:
          combustibleDefinitivo.combustibleNombre.trim() || null,
        transmision: form.transmision.trim() || null,
        tipo:
  form.tipo.trim() ||
  tiposVehiculo.find(
    (tipo) => tipo.id === form.tipo_vehiculo_id
  )?.nombre ||
  "",

        marca_id: marcaDefinitiva.marcaId,
        modelo_id: modeloDefinitivo.modeloId,
        version_id: versionDefinitiva.versionId,
        tipo_vehiculo_id: form.tipo_vehiculo_id,
        estilo_moto_id:
          form.tipo === "Moto"
            ? form.estilo_moto_id || null
            : null,
        combustible_id: combustibleDefinitivo.combustibleId,
        transmision_id: form.transmision_id || null,
        traccion_id: form.traccion_id || null,
        tipo_ingreso_id: form.tipo_ingreso_id,

        anio: form.anio ? Number(form.anio) : null,
        precio: form.precio ? Number(form.precio) : null,
        precio_compra: form.precio_compra
          ? Number(form.precio_compra)
          : null,
        kilometros: form.kilometros
          ? Number(form.kilometros)
          : null,

        color: form.color.trim() || null,
        estado: form.estado || null,
        condicion: form.condicion || null,

        dominio: form.dominio.trim().toUpperCase() || null,
        numero_chasis: form.numero_chasis.trim() || null,
        numero_motor: form.numero_motor.trim() || null,

        destacado: form.destacado,
        publicado: form.publicado,

        descripcion: form.descripcion.trim() || null,
        observaciones_internas:
          form.observaciones_internas.trim() || null,

        imagen_principal: imagenPrincipal,
        imagenes: urlsImagenes,
      });

      if (!resultado) {
        alert("Ocurrió un error al guardar el vehículo.");
        return;
      }

      alert("Vehículo guardado correctamente.");

      router.push("/admin/vehiculos");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar el vehículo:", error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el vehículo."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section>
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: "0 0 8px",
            color: "#2563eb",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.12em",
          }}
        >
          ADMINISTRACIÓN DE STOCK
        </p>

        <h1 style={{ margin: 0 }}>
          {duplicarId ? "Duplicar vehículo" : "Nuevo vehículo"}
        </h1>

        <p style={{ marginTop: 8, color: "#6b7280" }}>
          {cargandoDuplicado
            ? "Cargando datos del vehículo original..."
            : duplicarId
              ? "Revisá los datos copiados y completá los identificadores de la nueva unidad."
              : "Cargá una unidad para incorporarla al stock de MotoCars."}
        </p>
      </div>

      <form
        onSubmit={guardar}
        style={{
          display: "grid",
          gap: 18,
          maxWidth: 900,
        }}
      >
        <BasicData
          form={form}
          marcas={marcasParaSelector}
          modelos={modelos}
          tiposVehiculo={tiposVehiculo}
          estilosMoto={estilosMoto}
          tiposIngreso={tiposIngreso}
          cargandoCatalogos={cargandoCatalogos}
          cargandoModelos={cargandoModelos}
          agregandoModelo={agregandoModelo}
          modeloNuevo={modeloNuevo}
          valorModeloNuevo={VALOR_MODELO_NUEVO}
          agregandoMarca={agregandoMarca}
          marcaNueva={marcaNueva}
          onMarcaNuevaChange={actualizarMarcaNueva}
          onChange={actualizar}
          onMarcaChange={actualizarMarca}
          onModeloChange={actualizarModelo}
          onModeloNuevoChange={actualizarModeloNuevo}
          onVersionChange={(versionId, versionNombre) =>
            setForm((anterior) => ({
              ...anterior,
              version_id: versionId,
              version: versionNombre,
            }))
          }
          onTipoVehiculoChange={actualizarTipoVehiculo}
          onEstiloMotoChange={actualizarEstiloMoto}
        />

        <TechnicalData
          form={form}
          combustibles={combustiblesParaSelector}
          transmisiones={transmisiones}
          tracciones={tracciones}
          cargandoCatalogos={cargandoCatalogos}
          onChange={actualizar}
          onCombustibleChange={actualizarCombustible}
          onTransmisionChange={actualizarTransmision}
        />

        {agregandoCombustible && (
          <input
            type="text"
            value={combustibleNuevo}
            onChange={actualizarCombustibleNuevo}
            placeholder="Escribí el combustible nuevo"
            required
            autoFocus
            style={{
              minHeight: 42,
              padding: "0 12px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
        )}

        <PricesSection
          form={form}
          onChange={actualizar}
        />

        <IdentitySection
          form={form}
          onChange={actualizar}
        />

        <ImagesSection
          imagenes={imagenes}
          onChange={setImagenes}
        />

        <DescriptionSection
          form={form}
          onChange={actualizar}
        />

        <PublicationSection
          form={form}
          onChange={actualizar}
        />

        <label>
          <input
            type="checkbox"
            name="publicado"
            checked={form.publicado}
            onChange={actualizar}
          />{" "}
          Publicado en la web
        </label>

        <button
          type="submit"
          disabled={
            guardando ||
            cargandoCatalogos ||
            cargandoDuplicado
          }
          style={{
            padding: "13px 18px",
            border: 0,
            borderRadius: 8,
            backgroundColor: "#111827",
            color: "#ffffff",
            cursor:
              guardando ||
              cargandoCatalogos ||
              cargandoDuplicado
                ? "not-allowed"
                : "pointer",
            fontWeight: 700,
            opacity:
              guardando ||
              cargandoCatalogos ||
              cargandoDuplicado
                ? 0.7
                : 1,
          }}
        >
          {guardando
            ? imagenes.length > 0
              ? `Subiendo ${imagenes.length} imágenes...`
              : "Guardando..."
            : "Guardar vehículo"}
        </button>
      </form>
    </section>
  );
}