"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Version = {
  id: string;
  modelo_id: string;
  nombre: string;
};

type VersionSelectorProps = {
  modeloId: string;
  versionId: string;
  versionNombre: string;
  disabled?: boolean;
  onChange: (versionId: string, versionNombre: string) => void;
};

const VALOR_VERSION_NUEVA = "__nueva__";

function crearSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function VersionSelector({
  modeloId,
  versionId,
  versionNombre,
  disabled = false,
  onChange,
}: VersionSelectorProps) {
  const [versiones, setVersiones] = useState<Version[]>([]);
  const [cargando, setCargando] = useState(false);
  const [agregandoVersion, setAgregandoVersion] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState("");

  useEffect(() => {
    async function cargarVersiones() {
      setVersiones([]);
      setAgregandoVersion(false);
      setNombreNuevo("");

      if (!modeloId) {
        return;
      }

      setCargando(true);

      const { data, error } = await supabase
        .from("versiones")
        .select("id, modelo_id, nombre")
        .eq("modelo_id", modeloId)
        .eq("activo", true)
        .order("orden", { ascending: true })
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error al cargar versiones:", error.message);
        setVersiones([]);
      } else {
        setVersiones(data ?? []);
      }

      setCargando(false);
    }

    cargarVersiones();
  }, [modeloId]);

  function seleccionarVersion(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const valor = event.target.value;

    if (valor === VALOR_VERSION_NUEVA) {
      setAgregandoVersion(true);
      setNombreNuevo("");
      onChange(VALOR_VERSION_NUEVA, "");
      return;
    }

    setAgregandoVersion(false);
    setNombreNuevo("");

    const versionSeleccionada = versiones.find(
      (version) => version.id === valor
    );

    onChange(
      valor,
      versionSeleccionada?.nombre ?? ""
    );
  }

  function escribirVersionNueva(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const nombre = event.target.value;

    setNombreNuevo(nombre);
    onChange(VALOR_VERSION_NUEVA, nombre);
  }

  async function crearVersionNueva() {
    const nombre = nombreNuevo.trim();

    if (!modeloId) {
      alert("Primero seleccioná un modelo.");
      return;
    }

    if (!nombre) {
      alert("Escribí el nombre de la versión.");
      return;
    }

    const versionExistente = versiones.find(
      (version) =>
        version.nombre.trim().toLowerCase() ===
        nombre.toLowerCase()
    );

    if (versionExistente) {
      setAgregandoVersion(false);
      setNombreNuevo("");
      onChange(versionExistente.id, versionExistente.nombre);
      return;
    }

    const slug = crearSlug(nombre);

    if (!slug) {
      alert("El nombre de la versión no es válido.");
      return;
    }

    const { data, error } = await supabase
      .from("versiones")
      .insert({
        modelo_id: modeloId,
        nombre,
        slug,
      })
      .select("id, modelo_id, nombre")
      .single();

    if (error) {
      console.error("Error al crear la versión:", error);
      alert(
        "No se pudo crear la versión. Verificá que no exista previamente."
      );
      return;
    }

    setVersiones((anteriores) =>
      [...anteriores, data].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      )
    );

    setAgregandoVersion(false);
    setNombreNuevo("");
    onChange(data.id, data.nombre);
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
      }}
    >
      <select
        value={versionId}
        onChange={seleccionarVersion}
        disabled={disabled || !modeloId || cargando}
        style={{
          width: "100%",
          minHeight: 42,
          padding: "0 14px",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          backgroundColor: "#ffffff",
          color: "#111827",
          fontSize: 14,
        }}
      >
        <option value="">
          {!modeloId
            ? "Primero seleccioná un modelo"
            : cargando
              ? "Cargando versiones..."
              : "Seleccionar versión"}
        </option>

        {versiones.map((version) => (
          <option key={version.id} value={version.id}>
            {version.nombre}
          </option>
        ))}

        {modeloId && (
          <option value={VALOR_VERSION_NUEVA}>
            + Agregar versión nueva
          </option>
        )}
      </select>

      {agregandoVersion && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 10,
          }}
        >
          <input
            value={nombreNuevo}
            onChange={escribirVersionNueva}
            placeholder="Ejemplo: XEI 2.0 CVT"
            autoFocus
            style={{
              width: "100%",
              minHeight: 42,
              padding: "0 14px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
            }}
          />

          <button
            type="button"
            onClick={crearVersionNueva}
            style={{
              minHeight: 42,
              padding: "0 16px",
              border: 0,
              borderRadius: 8,
              backgroundColor: "#111827",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Agregar
          </button>
        </div>
      )}

      {versionId && versionId !== VALOR_VERSION_NUEVA && (
        <small style={{ color: "#6b7280" }}>
          Versión seleccionada: {versionNombre}
        </small>
      )}
    </div>
  );
}