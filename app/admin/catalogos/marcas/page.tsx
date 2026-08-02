"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";

type Marca = {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  orden: number;
};

function crearSlug(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(
    null
  );

  const [form, setForm] = useState({
    nombre: "",
    orden: "0",
    activo: true,
  });

  async function cargarMarcas() {
    setCargando(true);

    const { data, error } = await supabase
      .from("marcas")
      .select("id, nombre, slug, activo, orden")
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error al cargar marcas:", error);
      alert("No se pudieron cargar las marcas.");
      setMarcas([]);
    } else {
      setMarcas(data ?? []);
    }

    setCargando(false);
  }

  useEffect(() => {
    cargarMarcas();
  }, []);

  const marcasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return marcas;
    }

    return marcas.filter((marca) =>
      marca.nombre.toLowerCase().includes(texto)
    );
  }, [busqueda, marcas]);

  function actualizarCampo(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value, type, checked } = event.target;

    setForm((anterior) => ({
      ...anterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function limpiarFormulario() {
    setEditandoId(null);

    setForm({
      nombre: "",
      orden: "0",
      activo: true,
    });
  }

  function editarMarca(marca: Marca) {
    setEditandoId(marca.id);

    setForm({
      nombre: marca.nombre,
      orden: marca.orden.toString(),
      activo: marca.activo,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function guardarMarca(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (guardando) {
      return;
    }

    const nombre = form.nombre.trim();

    if (!nombre) {
      alert("Ingresá el nombre de la marca.");
      return;
    }

    const slug = crearSlug(nombre);

    if (!slug) {
      alert("El nombre de la marca no es válido.");
      return;
    }

    const orden = Number(form.orden);

    if (!Number.isInteger(orden) || orden < 0) {
      alert("El orden debe ser un número entero igual o mayor a 0.");
      return;
    }

    setGuardando(true);

    try {
      if (editandoId) {
        const { error } = await supabase
          .from("marcas")
          .update({
            nombre,
            slug,
            orden,
            activo: form.activo,
          })
          .eq("id", editandoId);

        if (error) {
          throw error;
        }

        alert("Marca actualizada correctamente.");
      } else {
        const { error } = await supabase
          .from("marcas")
          .insert({
            nombre,
            slug,
            orden,
            activo: form.activo,
          });

        if (error) {
          throw error;
        }

        alert("Marca creada correctamente.");
      }

      limpiarFormulario();
      await cargarMarcas();
    } catch (error) {
      console.error("Error al guardar la marca:", error);

      alert(
        "No se pudo guardar la marca. Verificá que no exista otra con el mismo nombre."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(marca: Marca) {
    const accion = marca.activo ? "desactivar" : "activar";

    const confirmado = window.confirm(
      `¿Querés ${accion} la marca ${marca.nombre}?`
    );

    if (!confirmado) {
      return;
    }

    const { error } = await supabase
      .from("marcas")
      .update({
        activo: !marca.activo,
      })
      .eq("id", marca.id);

    if (error) {
      console.error("Error al cambiar el estado:", error);
      alert("No se pudo cambiar el estado de la marca.");
      return;
    }

    await cargarMarcas();
  }

  return (
    <section style={styles.seccion}>
      <div style={styles.encabezado}>
        <div>
          <p style={styles.etiqueta}>CATÁLOGOS</p>
          <h1 style={styles.titulo}>Marcas</h1>

          <p style={styles.descripcion}>
            Creá, editá y activá las marcas utilizadas en el
            stock.
          </p>
        </div>

        <Link
          href="/admin/catalogos"
          style={styles.botonVolver}
        >
          ← Volver a catálogos
        </Link>
      </div>

      <form onSubmit={guardarMarca} style={styles.formulario}>
        <h2 style={styles.subtitulo}>
          {editandoId ? "Editar marca" : "Nueva marca"}
        </h2>

        <div style={styles.formularioGrid}>
          <label style={styles.campo}>
            <span style={styles.label}>Nombre</span>

            <input
              name="nombre"
              value={form.nombre}
              onChange={actualizarCampo}
              placeholder="Ejemplo: Toyota"
              style={styles.input}
              required
            />
          </label>

          <label style={styles.campo}>
            <span style={styles.label}>Orden</span>

            <input
              type="number"
              name="orden"
              min="0"
              step="1"
              value={form.orden}
              onChange={actualizarCampo}
              style={styles.input}
            />
          </label>

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={actualizarCampo}
            />

            Marca activa
          </label>
        </div>

        <div style={styles.botonesFormulario}>
          <button
            type="submit"
            disabled={guardando}
            style={styles.botonGuardar}
          >
            {guardando
              ? "Guardando..."
              : editandoId
                ? "Guardar cambios"
                : "Crear marca"}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              style={styles.botonCancelar}
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div style={styles.buscador}>
        <label style={styles.campo}>
          <span style={styles.label}>Buscar marca</span>

          <input
            type="search"
            value={busqueda}
            onChange={(event) =>
              setBusqueda(event.target.value)
            }
            placeholder="Escribí el nombre..."
            style={styles.input}
          />
        </label>
      </div>

      {cargando ? (
        <p>Cargando marcas...</p>
      ) : marcasFiltradas.length === 0 ? (
        <div style={styles.estadoVacio}>
          No se encontraron marcas.
        </div>
      ) : (
        <div style={styles.tablaContenedor}>
          <table style={styles.tabla}>
            <thead>
              <tr>
                <th style={styles.encabezadoTabla}>Marca</th>
                <th style={styles.encabezadoTabla}>Orden</th>
                <th style={styles.encabezadoTabla}>Estado</th>
                <th style={styles.encabezadoAcciones}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {marcasFiltradas.map((marca) => (
                <tr key={marca.id} style={styles.fila}>
                  <td style={styles.celda}>
                    <strong>{marca.nombre}</strong>

                    <span style={styles.slug}>
                      {marca.slug}
                    </span>
                  </td>

                  <td style={styles.celda}>{marca.orden}</td>

                  <td style={styles.celda}>
                    <span
                      style={{
                        ...styles.estado,
                        ...(marca.activo
                          ? styles.estadoActivo
                          : styles.estadoInactivo),
                      }}
                    >
                      {marca.activo ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  <td style={styles.celdaAcciones}>
                    <button
                      type="button"
                      onClick={() => editarMarca(marca)}
                      style={styles.botonEditar}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => cambiarEstado(marca)}
                      style={
                        marca.activo
                          ? styles.botonDesactivar
                          : styles.botonActivar
                      }
                    >
                      {marca.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  seccion: {
    width: "100%",
  },

  encabezado: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 26,
  },

  etiqueta: {
    margin: "0 0 8px",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.12em",
  },

  titulo: {
    margin: 0,
    color: "#111827",
    fontSize: 32,
  },

  descripcion: {
    margin: "8px 0 0",
    color: "#6b7280",
  },

  botonVolver: {
    padding: "11px 15px",
    border: "1px solid #d1d5db",
    borderRadius: 9,
    color: "#374151",
    textDecoration: "none",
    fontWeight: 700,
  },

  formulario: {
    marginBottom: 22,
    padding: 20,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  subtitulo: {
    margin: "0 0 18px",
    fontSize: 19,
  },

  formularioGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(220px, 2fr) minmax(100px, 1fr) auto",
    gap: 16,
    alignItems: "end",
  },

  campo: {
    display: "grid",
    gap: 7,
  },

  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: 700,
  },

  input: {
    width: "100%",
    minHeight: 43,
    padding: "0 13px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 15,
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minHeight: 43,
    fontWeight: 600,
  },

  botonesFormulario: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },

  botonGuardar: {
    minHeight: 42,
    padding: "0 18px",
    border: 0,
    borderRadius: 8,
    backgroundColor: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  botonCancelar: {
    minHeight: 42,
    padding: "0 18px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  buscador: {
    marginBottom: 18,
    padding: 16,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  estadoVacio: {
    padding: 28,
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    color: "#64748b",
    textAlign: "center",
  },

  tablaContenedor: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  tabla: {
    width: "100%",
    minWidth: 680,
    borderCollapse: "collapse",
  },

  encabezadoTabla: {
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: 12,
    textAlign: "left",
    textTransform: "uppercase",
  },

  encabezadoAcciones: {
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    fontSize: 12,
    textAlign: "right",
    textTransform: "uppercase",
  },

  fila: {
    borderTop: "1px solid #e5e7eb",
  },

  celda: {
    padding: 16,
    verticalAlign: "middle",
  },

  slug: {
    display: "block",
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 12,
  },

  celdaAcciones: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    padding: 16,
  },

  estado: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },

  estadoActivo: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
  },

  estadoInactivo: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },

  botonEditar: {
    minHeight: 35,
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: 7,
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  botonDesactivar: {
    minHeight: 35,
    padding: "0 12px",
    border: "1px solid #dc2626",
    borderRadius: 7,
    backgroundColor: "#ffffff",
    color: "#dc2626",
    cursor: "pointer",
    fontWeight: 700,
  },

  botonActivar: {
    minHeight: 35,
    padding: "0 12px",
    border: "1px solid #059669",
    borderRadius: 7,
    backgroundColor: "#ffffff",
    color: "#059669",
    cursor: "pointer",
    fontWeight: 700,
  },
};