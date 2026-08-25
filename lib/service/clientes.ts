import { supabase } from "@/lib/supabase";

export type TipoPersona =
  | "fisica"
  | "juridica";

export type Cliente = {
  id: number;

  tipo_persona: TipoPersona;

  nombre: string | null;
  apellido: string | null;
  razon_social: string | null;

  dni: string | null;
  cuit: string | null;

  telefono: string | null;
  whatsapp: string | null;
  email: string | null;

  provincia: string | null;
  ciudad: string | null;
  direccion: string | null;

 fecha_nacimiento: string | null;
profesion: string | null;
estado_civil: string | null;

  conyuge_nombre: string | null;
  conyuge_dni: string | null;

  observaciones: string | null;

  activo: boolean;

  created_at: string;
  updated_at: string;
};

export type ClienteFormulario = {
  tipo_persona: TipoPersona;

  nombre: string;
  apellido: string;
  razon_social: string;

  dni: string;
  cuit: string;

  telefono: string;
  whatsapp: string;
  email: string;

  provincia: string;
  ciudad: string;
  direccion: string;

  fecha_nacimiento: string;
profesion: string;
estado_civil: string;

  conyuge_nombre: string;
  conyuge_dni: string;

  observaciones: string;

  activo: boolean;
};

export const CLIENTE_FORMULARIO_INICIAL: ClienteFormulario = {
  tipo_persona: "fisica",

  nombre: "",
  apellido: "",
  razon_social: "",

  dni: "",
  cuit: "",

  telefono: "",
  whatsapp: "",
  email: "",

  provincia: "Neuquén",
  ciudad: "Neuquén",
  direccion: "",

  fecha_nacimiento: "",
profesion: "",
estado_civil: "",

  conyuge_nombre: "",
  conyuge_dni: "",

  observaciones: "",

  activo: true,
};

function valorOpcional(
  valor: string
): string | null {
  const valorLimpio =
    valor.trim();

  return valorLimpio
    ? valorLimpio
    : null;
}

function prepararCliente(
  cliente: ClienteFormulario
) {
  return {
    tipo_persona:
      cliente.tipo_persona,

    nombre:
      cliente.tipo_persona ===
      "fisica"
        ? valorOpcional(
            cliente.nombre
          )
        : null,

    apellido:
      cliente.tipo_persona ===
      "fisica"
        ? valorOpcional(
            cliente.apellido
          )
        : null,

    razon_social:
      cliente.tipo_persona ===
      "juridica"
        ? valorOpcional(
            cliente.razon_social
          )
        : null,

    dni:
      cliente.tipo_persona ===
      "fisica"
        ? valorOpcional(
            cliente.dni
          )
        : null,

    cuit:
      valorOpcional(
        cliente.cuit
      ),

    telefono:
      valorOpcional(
        cliente.telefono
      ),

    whatsapp:
      valorOpcional(
        cliente.whatsapp
      ),

    email:
      valorOpcional(
        cliente.email
      ),

    provincia:
      valorOpcional(
        cliente.provincia
      ),

    ciudad:
      valorOpcional(
        cliente.ciudad
      ),

    direccion:
      valorOpcional(
        cliente.direccion
      ),

    fecha_nacimiento:
  cliente.tipo_persona ===
    "fisica" &&
  cliente.fecha_nacimiento
    ? cliente.fecha_nacimiento
    : null,

profesion:
  cliente.tipo_persona ===
  "fisica"
    ? valorOpcional(
        cliente.profesion
      )
    : null,

estado_civil:
  cliente.tipo_persona ===
  "fisica"
    ? valorOpcional(
        cliente.estado_civil
      )
    : null,

    conyuge_nombre:
      cliente.tipo_persona ===
      "fisica"
        ? valorOpcional(
            cliente.conyuge_nombre
          )
        : null,

    conyuge_dni:
      cliente.tipo_persona ===
      "fisica"
        ? valorOpcional(
            cliente.conyuge_dni
          )
        : null,

    observaciones:
      valorOpcional(
        cliente.observaciones
      ),

    activo:
      cliente.activo,
  };
}

export async function listarClientes(): Promise<
  Cliente[]
> {
  const { data, error } =
    await supabase
      .from("clientes")
      .select("*")
      .order(
        "activo",
        {
          ascending: false,
        }
      )
      .order(
        "apellido",
        {
          ascending: true,
        }
      )
      .order(
        "nombre",
        {
          ascending: true,
        }
      )
      .order(
        "razon_social",
        {
          ascending: true,
        }
      );

  if (error) {
    throw new Error(
      `No se pudieron cargar los clientes: ${error.message}`
    );
  }

  return (data ?? []) as Cliente[];
}

export async function obtenerCliente(
  clienteId: number
): Promise<Cliente> {
  const { data, error } =
    await supabase
      .from("clientes")
      .select("*")
      .eq(
        "id",
        clienteId
      )
      .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      error?.message
        ? `No se pudo obtener el cliente: ${error.message}`
        : "No se encontró el cliente."
    );
  }

  return data as Cliente;
}

export async function crearCliente(
  cliente: ClienteFormulario
): Promise<Cliente> {
  const { data, error } =
    await supabase
      .from("clientes")
      .insert(
        prepararCliente(
          cliente
        )
      )
      .select("*")
      .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      error?.message
        ? `No se pudo crear el cliente: ${error.message}`
        : "No se pudo crear el cliente."
    );
  }

  return data as Cliente;
}

export async function actualizarCliente(
  clienteId: number,
  cliente: ClienteFormulario
): Promise<Cliente> {
  const { data, error } =
    await supabase
      .from("clientes")
      .update(
        prepararCliente(
          cliente
        )
      )
      .eq(
        "id",
        clienteId
      )
      .select("*")
      .single();

  if (
    error ||
    !data
  ) {
    throw new Error(
      error?.message
        ? `No se pudo actualizar el cliente: ${error.message}`
        : "No se pudo actualizar el cliente."
    );
  }

  return data as Cliente;
}

export async function cambiarEstadoCliente(
  clienteId: number,
  activo: boolean
): Promise<void> {
  const { error } =
    await supabase
      .from("clientes")
      .update({
        activo,
      })
      .eq(
        "id",
        clienteId
      );

  if (error) {
    throw new Error(
      `No se pudo cambiar el estado del cliente: ${error.message}`
    );
  }
}