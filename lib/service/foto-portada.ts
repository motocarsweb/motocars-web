import { supabase } from "@/lib/supabase";

const BUCKET = "portada";

export type FotoPortada = {
  id: number;
  url: string;
  created_at: string;
};

async function convertirAWebP(
  archivo: File
): Promise<Blob> {
  const bitmap =
    await createImageBitmap(archivo);

  const maxAncho = 1920;

  const escala =
    bitmap.width > maxAncho
      ? maxAncho / bitmap.width
      : 1;

  const ancho = Math.round(
    bitmap.width * escala
  );

  const alto = Math.round(
    bitmap.height * escala
  );

  const canvas =
    document.createElement("canvas");

  canvas.width = ancho;
  canvas.height = alto;

  const contexto =
    canvas.getContext("2d");

  if (!contexto) {
    bitmap.close();

    throw new Error(
      "No se pudo procesar la imagen."
    );
  }

  contexto.drawImage(
    bitmap,
    0,
    0,
    ancho,
    alto
  );

  bitmap.close();

  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "No se pudo convertir la imagen a WebP."
              )
            );

            return;
          }

          resolve(blob);
        },
        "image/webp",
        0.82
      );
    }
  );
}

export async function obtenerFotoPortada() {
  const { data, error } =
    await supabase
      .from("foto_portada")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data as FotoPortada | null;
}

export async function subirFotoPortada(
  archivo: File
) {
  const webp =
    await convertirAWebP(archivo);

  const nombreArchivo =
    `${Date.now()}-${crypto.randomUUID()}.webp`;

  const { error: errorSubida } =
    await supabase.storage
      .from(BUCKET)
      .upload(
        nombreArchivo,
        webp,
        {
          contentType: "image/webp",
          upsert: false,
        }
      );

  if (errorSubida) {
    throw errorSubida;
  }

  const { data: urlData } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(nombreArchivo);

  const fotoAnterior =
    await obtenerFotoPortada();

  const { data, error } =
    await supabase
      .from("foto_portada")
      .insert({
        url: urlData.publicUrl,
      })
      .select()
      .single();

  if (error) {
    await supabase.storage
      .from(BUCKET)
      .remove([nombreArchivo]);

    throw error;
  }

  if (fotoAnterior) {
    await eliminarFotoPortada(
      fotoAnterior
    );
  }

  return data as FotoPortada;
}

export async function eliminarFotoPortada(
  foto: FotoPortada
) {
  const nombreArchivo =
    foto.url.split("/").pop();

  if (nombreArchivo) {
    const { error: errorStorage } =
      await supabase.storage
        .from(BUCKET)
        .remove([nombreArchivo]);

    if (errorStorage) {
      throw errorStorage;
    }
  }

  const { error } =
    await supabase
      .from("foto_portada")
      .delete()
      .eq("id", foto.id);

  if (error) {
    throw error;
  }
}