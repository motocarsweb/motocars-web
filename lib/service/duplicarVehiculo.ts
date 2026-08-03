import { supabase } from "@/lib/supabase";

export type DatosFormularioDuplicado = {
  marca: string;
  modelo: string;
  version: string;
  combustible: string;
  transmision: string;
  tipo: string;

  marca_id: string;
  modelo_id: string;
  version_id: string;
  tipo_vehiculo_id: string;
  combustible_id: string;
  transmision_id: string;
  traccion_id: string;
  tipo_ingreso_id: string;

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

type RegistroVehiculo = Record<string, unknown>;

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor);
}

async function buscarCatalogoPorNombre(
  tabla: string,
  nombre: string
): Promise<string> {
  const nombreLimpio = nombre.trim();

  if (!nombreLimpio) {
    return "";
  }

  const { data, error } = await supabase
    .from(tabla)
    .select("id")
    .ilike("nombre", nombreLimpio)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      `No se pudo resolver ${tabla} por nombre:`,
      error.message
    );

    return "";
  }

  return texto(data?.id);
}

async function resolverMarcaId(
  vehiculo: RegistroVehiculo
): Promise<string> {
  const marcaId = texto(vehiculo.marca_id);

  if (marcaId) {
    return marcaId;
  }

  return buscarCatalogoPorNombre(
    "marcas",
    texto(vehiculo.marca)
  );
}

async function resolverModeloId(
  vehiculo: RegistroVehiculo,
  marcaId: string
): Promise<string> {
  const modeloId = texto(vehiculo.modelo_id);

  if (modeloId) {
    return modeloId;
  }

  const modeloNombre = texto(vehiculo.modelo).trim();

  if (!marcaId || !modeloNombre) {
    return "";
  }

  const { data, error } = await supabase
    .from("modelos")
    .select("id")
    .eq("marca_id", marcaId)
    .ilike("nombre", modeloNombre)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo resolver el modelo:",
      error.message
    );

    return "";
  }

  return texto(data?.id);
}

async function resolverVersionId(
  vehiculo: RegistroVehiculo,
  modeloId: string
): Promise<string> {
  const versionId = texto(vehiculo.version_id);

  if (versionId) {
    return versionId;
  }

  const versionNombre = texto(vehiculo.version).trim();

  if (!modeloId || !versionNombre) {
    return "";
  }

  const { data, error } = await supabase
    .from("versiones")
    .select("id")
    .eq("modelo_id", modeloId)
    .ilike("nombre", versionNombre)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "No se pudo resolver la versión:",
      error.message
    );

    return "";
  }

  return texto(data?.id);
}

async function resolverIdCatalogo(
  vehiculo: RegistroVehiculo,
  campoId: string,
  campoNombre: string,
  tabla: string
): Promise<string> {
  const idExistente = texto(vehiculo[campoId]);

  if (idExistente) {
    return idExistente;
  }

  return buscarCatalogoPorNombre(
    tabla,
    texto(vehiculo[campoNombre])
  );
}

export async function duplicarVehiculo(
  vehiculoId: number
): Promise<DatosFormularioDuplicado> {
  if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
    throw new Error(
      "El identificador del vehículo no es válido."
    );
  }

  const { data: vehiculo, error } = await supabase
    .from("vehiculos")
    .select("*")
    .eq("id", vehiculoId)
    .single();

  if (error || !vehiculo) {
    throw new Error(
      error?.message
        ? `No se pudo obtener el vehículo: ${error.message}`
        : "No se encontró el vehículo seleccionado."
    );
  }

  const marcaId = await resolverMarcaId(vehiculo);
  const modeloId = await resolverModeloId(
    vehiculo,
    marcaId
  );
  const versionId = await resolverVersionId(
    vehiculo,
    modeloId
  );

  const [
    tipoVehiculoId,
    combustibleId,
    transmisionId,
    traccionId,
    tipoIngresoId,
  ] = await Promise.all([
    resolverIdCatalogo(
      vehiculo,
      "tipo_vehiculo_id",
      "tipo",
      "tipos_vehiculo"
    ),
    resolverIdCatalogo(
      vehiculo,
      "combustible_id",
      "combustible",
      "combustibles"
    ),
    resolverIdCatalogo(
      vehiculo,
      "transmision_id",
      "transmision",
      "transmisiones"
    ),
    resolverIdCatalogo(
      vehiculo,
      "traccion_id",
      "traccion",
      "tracciones"
    ),
    resolverIdCatalogo(
      vehiculo,
      "tipo_ingreso_id",
      "tipo_ingreso",
      "tipos_ingreso"
    ),
  ]);

  return {
    marca: texto(vehiculo.marca),
    modelo: texto(vehiculo.modelo),
    version: texto(vehiculo.version),
    combustible: texto(vehiculo.combustible),
    transmision: texto(vehiculo.transmision),
    tipo: texto(vehiculo.tipo),

    marca_id: marcaId,
    modelo_id: modeloId,
    version_id: versionId,
    tipo_vehiculo_id: tipoVehiculoId,
    combustible_id: combustibleId,
    transmision_id: transmisionId,
    traccion_id: traccionId,
    tipo_ingreso_id: tipoIngresoId,

    // Datos reutilizables del modelo.
    anio: texto(vehiculo.anio),
    estado: texto(vehiculo.estado) || "Usado",
    condicion:
      texto(vehiculo.condicion) || "usado",

    // Datos propios de cada unidad: quedan vacíos.
    precio: "",
    precio_compra: "",
    kilometros: "",
    color: "",
    dominio: "",
    numero_chasis: "",
    numero_motor: "",

    // La copia debe revisarse antes de publicarse.
    destacado: false,
    publicado: false,

    descripcion: texto(vehiculo.descripcion),
    observaciones_internas: texto(
      vehiculo.observaciones_internas
    ),
  };
}