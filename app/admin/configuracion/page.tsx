"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ConfiguracionEmpresa = {
  id: string;
  nombre_comercial: string;
  razon_social: string | null;
  slogan: string | null;
  cuit: string | null;
  direccion: string | null;
  localidad: string | null;
  provincia: string | null;
  codigo_postal: string | null;
  pais: string;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  sitio_web: string | null;
  instagram: string | null;
  facebook: string | null;
  color_primario: string | null;
  color_secundario: string | null;
  color_acento: string | null;
};

const configuracionInicial: ConfiguracionEmpresa = {
  id: "",
  nombre_comercial: "",
  razon_social: "",
  slogan: "",
  cuit: "",
  direccion: "",
  localidad: "",
  provincia: "",
  codigo_postal: "",
  pais: "Argentina",
  telefono: "",
  whatsapp: "",
  email: "",
  sitio_web: "",
  instagram: "",
  facebook: "",
  color_primario: "#111827",
  color_secundario: "#DC2626",
  color_acento: "#F59E0B",
};

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] =
    useState<ConfiguracionEmpresa>(configuracionInicial);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  async function cargarConfiguracion() {
    setCargando(true);
    setError("");

    const { data, error: errorSupabase } = await supabase
      .from("configuracion_empresa")
      .select(
        `
          id,
          nombre_comercial,
          razon_social,
          slogan,
          cuit,
          direccion,
          localidad,
          provincia,
          codigo_postal,
          pais,
          telefono,
          whatsapp,
          email,
          sitio_web,
          instagram,
          facebook,
          color_primario,
          color_secundario,
          color_acento
        `,
      )
      .eq("codigo", "principal")
      .single();

    if (errorSupabase) {
      setError(`No se pudo cargar la configuración: ${errorSupabase.message}`);
      setCargando(false);
      return;
    }

    setConfiguracion(data);
    setCargando(false);
  }

  function actualizarCampo(
    campo: keyof ConfiguracionEmpresa,
    valor: string,
  ) {
    setConfiguracion((configuracionActual) => ({
      ...configuracionActual,
      [campo]: valor,
    }));
  }

  async function guardarConfiguracion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!configuracion.id) {
      setError("No se encontró el registro de configuración.");
      return;
    }

    if (!configuracion.nombre_comercial.trim()) {
      setError("El nombre comercial es obligatorio.");
      return;
    }

    setGuardando(true);
    setMensaje("");
    setError("");

    const { error: errorSupabase } = await supabase
      .from("configuracion_empresa")
      .update({
        nombre_comercial: configuracion.nombre_comercial.trim(),
        razon_social: configuracion.razon_social?.trim() || null,
        slogan: configuracion.slogan?.trim() || null,
        cuit: configuracion.cuit?.trim() || null,
        direccion: configuracion.direccion?.trim() || null,
        localidad: configuracion.localidad?.trim() || null,
        provincia: configuracion.provincia?.trim() || null,
        codigo_postal: configuracion.codigo_postal?.trim() || null,
        pais: configuracion.pais.trim() || "Argentina",
        telefono: configuracion.telefono?.trim() || null,
        whatsapp: configuracion.whatsapp?.trim() || null,
        email: configuracion.email?.trim() || null,
        sitio_web: configuracion.sitio_web?.trim() || null,
        instagram: configuracion.instagram?.trim() || null,
        facebook: configuracion.facebook?.trim() || null,
        color_primario: configuracion.color_primario || "#111827",
        color_secundario: configuracion.color_secundario || "#DC2626",
        color_acento: configuracion.color_acento || "#F59E0B",
      })
      .eq("id", configuracion.id);

    if (errorSupabase) {
      setError(`No se pudo guardar la configuración: ${errorSupabase.message}`);
      setGuardando(false);
      return;
    }

    setMensaje("Configuración guardada correctamente.");
    setGuardando(false);
  }

  if (cargando) {
    return (
      <section>
        <h1 style={{ marginTop: 0 }}>Configuración</h1>
        <p style={{ color: "#6b7280" }}>Cargando datos de MotoCars...</p>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: "1150px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            color: "#111827",
          }}
        >
          Configuración
        </h1>

        <p
          style={{
            marginTop: "8px",
            marginBottom: 0,
            color: "#6b7280",
            fontSize: "16px",
          }}
        >
          Administrá los datos comerciales y la identidad de MotoCars.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {mensaje && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "8px",
            backgroundColor: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
          }}
        >
          {mensaje}
        </div>
      )}

      <form onSubmit={guardarConfiguracion}>
        <div style={tarjeta}>
          <div style={encabezadoSeccion}>
            <h2 style={tituloSeccion}>Identidad comercial</h2>
            <p style={descripcionSeccion}>
              Información principal utilizada en el panel y en los documentos.
            </p>
          </div>

          <div style={grilla}>
            <CampoTexto
              etiqueta="Nombre comercial"
              valor={configuracion.nombre_comercial}
              obligatorio
              onChange={(valor) =>
                actualizarCampo("nombre_comercial", valor)
              }
            />

            <CampoTexto
              etiqueta="Razón social"
              valor={configuracion.razon_social ?? ""}
              onChange={(valor) => actualizarCampo("razon_social", valor)}
            />

            <CampoTexto
              etiqueta="Slogan"
              valor={configuracion.slogan ?? ""}
              onChange={(valor) => actualizarCampo("slogan", valor)}
            />

            <CampoTexto
              etiqueta="CUIT"
              valor={configuracion.cuit ?? ""}
              placeholder="Ejemplo: 30-12345678-9"
              onChange={(valor) => actualizarCampo("cuit", valor)}
            />
          </div>
        </div>

        <div style={tarjeta}>
          <div style={encabezadoSeccion}>
            <h2 style={tituloSeccion}>Domicilio</h2>
            <p style={descripcionSeccion}>
              Datos que podrán aparecer en presupuestos y documentación.
            </p>
          </div>

          <div style={grilla}>
            <CampoTexto
              etiqueta="Dirección"
              valor={configuracion.direccion ?? ""}
              onChange={(valor) => actualizarCampo("direccion", valor)}
            />

            <CampoTexto
              etiqueta="Localidad"
              valor={configuracion.localidad ?? ""}
              onChange={(valor) => actualizarCampo("localidad", valor)}
            />

            <CampoTexto
              etiqueta="Provincia"
              valor={configuracion.provincia ?? ""}
              onChange={(valor) => actualizarCampo("provincia", valor)}
            />

            <CampoTexto
              etiqueta="Código postal"
              valor={configuracion.codigo_postal ?? ""}
              onChange={(valor) =>
                actualizarCampo("codigo_postal", valor)
              }
            />

            <CampoTexto
              etiqueta="País"
              valor={configuracion.pais}
              onChange={(valor) => actualizarCampo("pais", valor)}
            />
          </div>
        </div>

        <div style={tarjeta}>
          <div style={encabezadoSeccion}>
            <h2 style={tituloSeccion}>Contacto y redes</h2>
            <p style={descripcionSeccion}>
              Canales comerciales utilizados por MotoCars.
            </p>
          </div>

          <div style={grilla}>
            <CampoTexto
              etiqueta="Teléfono"
              valor={configuracion.telefono ?? ""}
              onChange={(valor) => actualizarCampo("telefono", valor)}
            />

            <CampoTexto
              etiqueta="WhatsApp"
              valor={configuracion.whatsapp ?? ""}
              placeholder="Ejemplo: 5492995133023"
              onChange={(valor) => actualizarCampo("whatsapp", valor)}
            />

            <CampoTexto
              etiqueta="Correo electrónico"
              valor={configuracion.email ?? ""}
              tipo="email"
              onChange={(valor) => actualizarCampo("email", valor)}
            />

            <CampoTexto
              etiqueta="Sitio web"
              valor={configuracion.sitio_web ?? ""}
              placeholder="https://..."
              onChange={(valor) => actualizarCampo("sitio_web", valor)}
            />

            <CampoTexto
              etiqueta="Instagram"
              valor={configuracion.instagram ?? ""}
              onChange={(valor) => actualizarCampo("instagram", valor)}
            />

            <CampoTexto
              etiqueta="Facebook"
              valor={configuracion.facebook ?? ""}
              onChange={(valor) => actualizarCampo("facebook", valor)}
            />
          </div>
        </div>

        <div style={tarjeta}>
          <div style={encabezadoSeccion}>
            <h2 style={tituloSeccion}>Colores institucionales</h2>
            <p style={descripcionSeccion}>
              Estos colores se utilizarán posteriormente en el sitio y los
              documentos comerciales.
            </p>
          </div>

          <div style={grillaColores}>
            <CampoColor
              etiqueta="Color primario"
              valor={configuracion.color_primario ?? "#111827"}
              onChange={(valor) => actualizarCampo("color_primario", valor)}
            />

            <CampoColor
              etiqueta="Color secundario"
              valor={configuracion.color_secundario ?? "#DC2626"}
              onChange={(valor) =>
                actualizarCampo("color_secundario", valor)
              }
            />

            <CampoColor
              etiqueta="Color de acento"
              valor={configuracion.color_acento ?? "#F59E0B"}
              onChange={(valor) => actualizarCampo("color_acento", valor)}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "24px",
          }}
        >
          <button
            type="submit"
            disabled={guardando}
            style={{
              minWidth: "190px",
              padding: "14px 22px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: guardando ? "#9ca3af" : "#111827",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </form>
    </section>
  );
}

type CampoTextoProps = {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  obligatorio?: boolean;
  placeholder?: string;
  tipo?: "text" | "email";
};

function CampoTexto({
  etiqueta,
  valor,
  onChange,
  obligatorio = false,
  placeholder,
  tipo = "text",
}: CampoTextoProps) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <span
        style={{
          color: "#374151",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {etiqueta}
        {obligatorio ? " *" : ""}
      </span>

      <input
        type={tipo}
        value={valor}
        required={obligatorio}
        placeholder={placeholder}
        onChange={(evento) => onChange(evento.target.value)}
        style={input}
      />
    </label>
  );
}

type CampoColorProps = {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
};

function CampoColor({ etiqueta, valor, onChange }: CampoColorProps) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <span
        style={{
          color: "#374151",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {etiqueta}
      </span>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="color"
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          style={{
            width: "52px",
            height: "44px",
            padding: "3px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        />

        <input
          type="text"
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
          style={{
            ...input,
            flex: 1,
          }}
        />
      </div>
    </label>
  );
}

const tarjeta = {
  marginBottom: "24px",
  padding: "26px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.07)",
};

const encabezadoSeccion = {
  marginBottom: "22px",
};

const tituloSeccion = {
  margin: 0,
  color: "#111827",
  fontSize: "21px",
};

const descripcionSeccion = {
  marginTop: "6px",
  marginBottom: 0,
  color: "#6b7280",
  lineHeight: 1.5,
};

const grilla = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
};

const grillaColores = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
};