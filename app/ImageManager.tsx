"use client";

import { useEffect, useRef, useState } from "react";

type ImageManagerProps = {
  images: File[];
  onChange: (images: File[]) => void;
  maxImages?: number;
};

type ImageCardProps = {
  image: File;
  index: number;
  total: number;
  onMakePrimary: (index: number) => void;
  onMoveLeft: (index: number) => void;
  onMoveRight: (index: number) => void;
  onDelete: (index: number) => void;
};

const FORMATOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const LIMITE_POR_IMAGEN = 10 * 1024 * 1024;

function ImageCard({
  image,
  index,
  total,
  onMakePrimary,
  onMoveLeft,
  onMoveRight,
  onDelete,
}: ImageCardProps) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  return (
    <article
      style={{
        overflow: "hidden",
        border: index === 0 ? "3px solid #111827" : "1px solid #d1d5db",
        borderRadius: 10,
        backgroundColor: "#f9fafb",
      }}
    >
      <div style={{ position: "relative" }}>
        {preview ? (
          <img
            src={preview}
            alt={`Imagen ${index + 1} del vehículo`}
            style={{
              display: "block",
              width: "100%",
              height: 140,
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: 140, backgroundColor: "#e5e7eb" }} />
        )}

        {index === 0 && (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              padding: "5px 9px",
              borderRadius: 999,
              backgroundColor: "#111827",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            PORTADA
          </span>
        )}

        <span
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            minWidth: 28,
            padding: "4px 8px",
            borderRadius: 999,
            backgroundColor: "rgba(17, 24, 39, 0.85)",
            color: "#ffffff",
            textAlign: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {index + 1}
        </span>
      </div>

      <div style={{ display: "grid", gap: 10, padding: 12 }}>
        <small
          title={image.name}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#4b5563",
          }}
        >
          {image.name}
        </small>

        {index !== 0 && (
          <button
            type="button"
            onClick={() => onMakePrimary(index)}
            style={{
              padding: "8px 10px",
              border: "1px solid #111827",
              borderRadius: 7,
              backgroundColor: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Hacer portada
          </button>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button
            type="button"
            onClick={() => onMoveLeft(index)}
            disabled={index === 0}
            style={{
              padding: 8,
              border: "1px solid #d1d5db",
              borderRadius: 7,
              backgroundColor: "#ffffff",
              cursor: index === 0 ? "not-allowed" : "pointer",
              opacity: index === 0 ? 0.4 : 1,
            }}
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => onMoveRight(index)}
            disabled={index === total - 1}
            style={{
              padding: 8,
              border: "1px solid #d1d5db",
              borderRadius: 7,
              backgroundColor: "#ffffff",
              cursor: index === total - 1 ? "not-allowed" : "pointer",
              opacity: index === total - 1 ? 0.4 : 1,
            }}
          >
            →
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDelete(index)}
          style={{
            padding: "8px 10px",
            border: "1px solid #dc2626",
            borderRadius: 7,
            backgroundColor: "#ffffff",
            color: "#dc2626",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default function ImageManager({
  images,
  onChange,
  maxImages = 20,
}: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function seleccionarImagenes(event: React.ChangeEvent<HTMLInputElement>) {
    const nuevosArchivos = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (nuevosArchivos.length === 0) return;

    const formatoIncorrecto = nuevosArchivos.find(
      (archivo) => !FORMATOS_PERMITIDOS.includes(archivo.type)
    );
    if (formatoIncorrecto) {
      alert(`El archivo "${formatoIncorrecto.name}" no es JPG, PNG o WEBP.`);
      return;
    }

    const archivoGrande = nuevosArchivos.find(
      (archivo) => archivo.size > LIMITE_POR_IMAGEN
    );
    if (archivoGrande) {
      alert(`La imagen "${archivoGrande.name}" supera los 10 MB.`);
      return;
    }

    if (images.length + nuevosArchivos.length > maxImages) {
      alert(`Podés cargar como máximo ${maxImages} imágenes por vehículo.`);
      return;
    }

    const imagenesSinDuplicados = nuevosArchivos.filter(
      (nuevoArchivo) =>
        !images.some(
          (archivoExistente) =>
            archivoExistente.name === nuevoArchivo.name &&
            archivoExistente.size === nuevoArchivo.size &&
            archivoExistente.lastModified === nuevoArchivo.lastModified
        )
    );

    if (imagenesSinDuplicados.length === 0) {
      alert("Las imágenes seleccionadas ya fueron agregadas.");
      return;
    }

    onChange([...images, ...imagenesSinDuplicados]);
  }

  function hacerPrincipal(index: number) {
    if (index === 0) return;
    const nuevasImagenes = [...images];
    const [imagenSeleccionada] = nuevasImagenes.splice(index, 1);
    if (!imagenSeleccionada) return;
    nuevasImagenes.unshift(imagenSeleccionada);
    onChange(nuevasImagenes);
  }

  function moverIzquierda(index: number) {
    if (index === 0 || !images[index] || !images[index - 1]) return;
    const nuevasImagenes = [...images];
    [nuevasImagenes[index - 1], nuevasImagenes[index]] = [
      nuevasImagenes[index],
      nuevasImagenes[index - 1],
    ];
    onChange(nuevasImagenes);
  }

  function moverDerecha(index: number) {
    if (index >= images.length - 1 || !images[index] || !images[index + 1]) return;
    const nuevasImagenes = [...images];
    [nuevasImagenes[index], nuevasImagenes[index + 1]] = [
      nuevasImagenes[index + 1],
      nuevasImagenes[index],
    ];
    onChange(nuevasImagenes);
  }

  function eliminarImagen(index: number) {
    if (!images[index]) return;
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        padding: 18,
        border: "1px solid #d1d5db",
        borderRadius: 12,
        backgroundColor: "#ffffff",
      }}
    >
      <div>
        <strong style={{ display: "block", fontSize: 17 }}>Imágenes del vehículo</strong>
        <small style={{ color: "#4b5563" }}>
          La primera imagen será la portada. Máximo {maxImages} fotos y 10 MB por imagen.
        </small>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={seleccionarImagenes}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={images.length >= maxImages}
        style={{
          width: "fit-content",
          padding: "10px 16px",
          border: "1px solid #111827",
          borderRadius: 8,
          backgroundColor: images.length >= maxImages ? "#d1d5db" : "#111827",
          color: "#ffffff",
          fontWeight: 700,
          cursor: images.length >= maxImages ? "not-allowed" : "pointer",
        }}
      >
        Agregar imágenes
      </button>

      <strong>
        {images.length} de {maxImages} {images.length === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}
      </strong>

      {images.length === 0 ? (
        <div
          style={{
            padding: 24,
            border: "2px dashed #d1d5db",
            borderRadius: 10,
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          Todavía no seleccionaste imágenes.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {images.map((image, index) => (
            <ImageCard
              key={`${image.name}-${image.size}-${image.lastModified}`}
              image={image}
              index={index}
              total={images.length}
              onMakePrimary={hacerPrincipal}
              onMoveLeft={moverIzquierda}
              onMoveRight={moverDerecha}
              onDelete={eliminarImagen}
            />
          ))}
        </div>
      )}
    </div>
  );
}