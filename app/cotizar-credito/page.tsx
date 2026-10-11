
"use client";

import { useState } from "react";
import Link from "next/link";

type DatosFormulario = {
  nombre: string;
  dni: string;
  cuil: string;
  localidad: string;
  tipoVehiculo: string;
  vehiculo: string;
  actividadLaboral: string;
  celular: string;
};

const datosIniciales: DatosFormulario = {
  nombre: "",
  dni: "",
  cuil: "",
  localidad: "",
  tipoVehiculo: "",
  vehiculo: "",
  actividadLaboral: "",
  celular: "",
};

export default function CotizarCreditoPage() {
  const [datos, setDatos] =
    useState<DatosFormulario>(datosIniciales);

  const [aceptaContacto, setAceptaContacto] =
    useState(false);

  function actualizar(
    campo: keyof DatosFormulario,
    valor: string
  ) {
    setDatos((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  
async function enviarFormulario(
  evento: React.FormEvent<HTMLFormElement>
) {
  evento.preventDefault();

  try {
    const respuesta = await fetch(
      "/api/solicitudes-credito",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...datos,
          aceptaContacto,
        }),
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      alert(
        resultado.error ||
          "No pudimos registrar tu solicitud."
      );
      return;
    }

    alert(
      "¡Tu solicitud fue registrada correctamente! " +
        "Un asesor de MotoCars se comunicará con vos."
    );

    setDatos(datosIniciales);
    setAceptaContacto(false);
  } catch {
    alert(
      "Ocurrió un problema de conexión. " +
        "Intentá nuevamente."
    );
  }
}


  const estiloCampo: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #d4d4d4",
    borderRadius: "8px",
    fontSize: "15px",
    color: "#111111",
    background: "#ffffff",
  };

  const estiloEtiqueta: React.CSSProperties = {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: 700,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "50px 20px",
        fontFamily: "var(--font-exo2), Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "660px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: "25px",
            color: "#111111",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Volver a MotoCars
        </Link>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "clamp(22px, 5vw, 40px)",
            boxShadow: "0 8px 35px rgba(0,0,0,0.07)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "5px",
              background: "#ff0032",
              borderRadius: "4px",
              marginBottom: "18px",
            }}
          />

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 34px)",
              fontWeight: 800,
              marginBottom: "10px",
            }}
          >
            Cotizá tu crédito
          </h1>

          <p
            style={{
              color: "#666666",
              lineHeight: 1.6,
              marginBottom: "28px",
            }}
          >
            Completá tus datos y un asesor de MotoCars
            se comunicará con vos para evaluar las
            alternativas de financiación disponibles.
          </p>

          <form
            onSubmit={enviarFormulario}
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <div>
              <label htmlFor="nombre" style={estiloEtiqueta}>
                Nombre y apellido *
              </label>
              <input
                id="nombre"
                required
                maxLength={120}
                autoComplete="name"
                value={datos.nombre}
                onChange={(e) =>
                  actualizar("nombre", e.target.value)
                }
                style={estiloCampo}
              />
            </div>

            <div>
              <label htmlFor="dni" style={estiloEtiqueta}>
                DNI *
              </label>
              <input
                id="dni"
                required
                inputMode="numeric"
                pattern="[0-9]{7,8}"
                title="Ingresá 7 u 8 números, sin puntos"
                value={datos.dni}
                onChange={(e) =>
                  actualizar("dni", e.target.value)
                }
                style={estiloCampo}
              />
            </div>

            <div>
              <label htmlFor="cuil" style={estiloEtiqueta}>
                CUIL *
              </label>
              <input
                id="cuil"
                required
                inputMode="numeric"
                pattern="[0-9]{11}"
                title="Ingresá los 11 números, sin guiones"
                value={datos.cuil}
                onChange={(e) =>
                  actualizar("cuil", e.target.value)
                }
                style={estiloCampo}
              />
            </div>

            <div>
              <label
                htmlFor="localidad"
                style={estiloEtiqueta}
              >
                Localidad *
              </label>
              <input
                id="localidad"
                required
                maxLength={100}
                value={datos.localidad}
                onChange={(e) =>
                  actualizar("localidad", e.target.value)
                }
                style={estiloCampo}
              />
            </div>

            <div>
              <label
                htmlFor="tipoVehiculo"
                style={estiloEtiqueta}
              >
                Tipo de vehículo *
              </label>
              <select
                id="tipoVehiculo"
                required
                value={datos.tipoVehiculo}
                onChange={(e) =>
                  actualizar(
                    "tipoVehiculo",
                    e.target.value
                  )
                }
                style={estiloCampo}
              >
                <option value="">
                  Seleccioná una opción
                </option>
                <option value="auto">
                  Auto / Pickup
                </option>
                <option value="moto">
                  Moto
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="vehiculo"
                style={estiloEtiqueta}
              >
                Vehículo de interés
              </label>
              <input
                id="vehiculo"
                maxLength={150}
                placeholder="Marca y modelo"
                value={datos.vehiculo}
                onChange={(e) =>
                  actualizar("vehiculo", e.target.value)
                }
                style={estiloCampo}
              />
            </div>

            <div>
              <label
                htmlFor="actividadLaboral"
                style={estiloEtiqueta}
              >
                Actividad laboral *
              </label>
              <input
                id="actividadLaboral"
                required
                maxLength={150}
                placeholder="Ej.: empleado, independiente, comerciante"
                value={datos.actividadLaboral}
                onChange={(e) =>
                  actualizar(
                    "actividadLaboral",
                    e.target.value
                  )
                }
                style={estiloCampo}
              />
            </div>

            <div>
              <label
                htmlFor="celular"
                style={estiloEtiqueta}
              >
                Celular *
              </label>
              <input
                id="celular"
                type="tel"
                required
                maxLength={25}
                autoComplete="tel"
                placeholder="Ej.: 299 1234567"
                value={datos.celular}
                onChange={(e) =>
                  actualizar("celular", e.target.value)
                }
                style={estiloCampo}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "#555555",
              }}
            >
              <input
                type="checkbox"
                required
                checked={aceptaContacto}
                onChange={(e) =>
                  setAceptaContacto(e.target.checked)
                }
                style={{ marginTop: "4px" }}
              />
              Autorizo a MotoCars a utilizar los datos
              proporcionados para evaluar mi consulta
              de financiación y contactarme por los
              medios informados.
            </label>

            <button
              type="submit"
              style={{
                padding: "16px 24px",
                border: "none",
                borderRadius: "9px",
                background: "#ff0032",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Solicitar cotización
            </button>

            <p
              style={{
                fontSize: "12px",
                color: "#777777",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              La solicitud está sujeta a evaluación.
              Completar este formulario no implica
              aprobación del crédito.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
