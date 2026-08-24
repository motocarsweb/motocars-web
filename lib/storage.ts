import { supabase } from "@/lib/supabase";

const ANCHO_MAXIMO = 1920;
const ALTO_MAXIMO = 1920;
const CALIDAD_WEBP = 0.82;

function calcularDimensiones(ancho: number, alto: number) {
  if (ancho <= ANCHO_MAXIMO && alto <= ALTO_MAXIMO) {
    return { ancho, alto };
  }

  const proporcion = Math.min(
    ANCHO_MAXIMO / ancho,
    ALTO_MAXIMO / alto
  );

  return {
    ancho: Math.round(ancho * proporcion),
    alto: Math.round(alto * proporcion),
  };
}

async function convertirAWebP(file: File): Promise<File> {
  if (typeof window === "undefined") {
    return file;
  }

  const bitmap = await createImageBitmap(file);

  try {
    const dimensiones = calcularDimensiones(
      bitmap.width,
      bitmap.height
    );

    const canvas = document.createElement("canvas");
    canvas.width = dimensiones.ancho;
    canvas.height = dimensiones.alto;

    const contexto = canvas.getContext("2d");

    if (!contexto) {
      throw new Error("No se pudo procesar la imagen.");
    }

    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = "high";

    contexto.drawImage(
      bitmap,
      0,
      0,
      dimensiones.ancho,
      dimensiones.alto
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (resultado) => {
          if (!resultado) {
            reject(
              new Error(
                "No se pudo convertir la imagen a WebP."
              )
            );
            return;
          }

          resolve(resultado);
        },
        "image/webp",
        CALIDAD_WEBP
      );
    });

    const base = file.name.replace(/\.[^/.]+$/, "");

    return new File(
      [blob],
      `${base}.webp`,
      {
        type: "image/webp",
        lastModified: Date.now(),
      }
    );
  } finally {
    bitmap.close();
  }
}

export async function subirImagenVehiculo(file: File) {
  const archivoOptimizado = await convertirAWebP(file);

  const nombre = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.webp`;

  const ruta = `vehiculos/${nombre}`;

  const { error } = await supabase.storage
    .from("vehiculos")
    .upload(ruta, archivoOptimizado, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("vehiculos")
    .getPublicUrl(ruta);

  return data.publicUrl;
}

export async function subirImagenesVehiculo(files: File[]) {
  const urls: string[] = [];

  for (const file of files) {
    const url = await subirImagenVehiculo(file);
    urls.push(url);
  }

  return urls;
}