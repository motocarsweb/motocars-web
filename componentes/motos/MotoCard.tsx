"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { VehiculoSupabase } from "@/lib/supabase-vehicles";

type MotoCardProps = {
  moto: VehiculoSupabase;
  estiloSlug: string;
};

function formatearPrecio(precio: number | null) {
  if (precio === null) return "Consultar";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(precio);
}

function nombreMoto(moto: VehiculoSupabase) {
  return [moto.marca, moto.modelo, moto.version]
    .filter(Boolean)
    .join(" ");
}

function normalizarImagenes(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    );
  }

  if (typeof valor === "string") {
    try {
      const parsed = JSON.parse(valor);

      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0
        );
      }
    } catch {
      if (valor.trim()) return [valor.trim()];
    }
  }

  return [];
}

export default function MotoCard({
  moto,
  estiloSlug,
}: MotoCardProps) {
  const guardadas = normalizarImagenes(moto.imagenes as unknown);
  const principal = moto.imagen_principal?.trim() || "";

  const imagenes = Array.from(
    new Set(
      [principal, ...guardadas].filter(
        (url): url is string =>
          typeof url === "string" && url.trim().length > 0
      )
    )
  );

  if (imagenes.length === 0) {
    imagenes.push("/images/placeholder-vehicle.jpg");
  }

  const [indice, setIndice] = useState(0);
  const imagenActual = imagenes[indice] ?? imagenes[0];
  const detalleHref = `/motos/${estiloSlug}/${moto.id}`;

  function anterior() {
    setIndice((actual) =>
      actual === 0 ? imagenes.length - 1 : actual - 1
    );
  }

  function siguiente() {
    setIndice((actual) =>
      actual === imagenes.length - 1 ? 0 : actual + 1
    );
  }

  return (
    <article
      style={{
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        background: "#ffffff",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          background: "#f1f5f9",
        }}
      >
        <Link href={detalleHref}>
          <Image
            src={imagenActual}
            alt={nombreMoto(moto) || "Motocicleta"}
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            style={{ objectFit: "cover" }}
          />
        </Link>

        {moto.destacado && (
          <span
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 2,
              padding: "6px 10px",
              borderRadius: 999,
              background: "#111827",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            Destacada
          </span>
        )}

        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Foto anterior"
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                zIndex: 3,
                width: 36,
                height: 36,
                transform: "translateY(-50%)",
                border: 0,
                borderRadius: "50%",
                background: "rgba(15,23,42,.78)",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={siguiente}
              aria-label="Foto siguiente"
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                zIndex: 3,
                width: 36,
                height: 36,
                transform: "translateY(-50%)",
                border: 0,
                borderRadius: "50%",
                background: "rgba(15,23,42,.78)",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              ›
            </button>

            <span
              style={{
                position: "absolute",
                right: 12,
                bottom: 10,
                zIndex: 3,
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(15,23,42,.78)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {indice + 1} / {imagenes.length}
            </span>
          </>
        )}
      </div>

      <Link
        href={detalleHref}
        style={{
          display: "block",
          padding: "20px 20px 0",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        <span
          style={{
            display: "block",
            marginBottom: 5,
            color: "#64748b",
            fontSize: 12,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {moto.marca || "Moto"}
        </span>

        <h4
          style={{
            margin: 0,
            color: "#111827",
            fontSize: 22,
            lineHeight: 1.2,
          }}
        >
          {[moto.modelo, moto.version].filter(Boolean).join(" ")}
        </h4>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 14,
            color: "#475569",
            fontSize: 13,
          }}
        >
          {moto.anio && <span>{moto.anio}</span>}
          {moto.condicion && (
            <span>
              · {moto.condicion === "0km" ? "0 km" : "Usada"}
            </span>
          )}
          {moto.color && <span>· {moto.color}</span>}
        </div>

        <div
          style={{
            marginTop: 18,
            color: "#111827",
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          {formatearPrecio(moto.precio)}
        </div>

        <div
          style={{
            marginTop: 12,
            color: "#2563eb",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Ver fotos y detalle →
        </div>
      </Link>

      <div style={{ padding: "18px 20px 20px" }}>
        <a
          href={`https://wa.me/5492995133023?text=${encodeURIComponent(
            `Hola, quiero consultar por la ${nombreMoto(moto)}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: 44,
            borderRadius: 10,
            background: "#111827",
            color: "#ffffff",
            fontSize: 14,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Consultar por WhatsApp
        </a>
      </div>
    </article>
  );
}