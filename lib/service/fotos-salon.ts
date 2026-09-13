import { supabase } from "@/lib/supabase";

export type FotoSalon = {
  id: number;
  url: string;
  orden: number;
  activo: boolean;
  created_at: string;
};

const BUCKET = "salon";

export async function obtenerFotosSalon() {
  const { data, error } = await supabase
    .from("fotos_salon")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as FotoSalon[];
}

async function convertirAWebP(
  archivo: File
): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);

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

export async function subirFotoSalon(
  archivo: File,
  orden: number
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
          contentType:
            "image/webp",
          upsert: false,
        }
      );

  if (errorSubida) {
    throw errorSubida;
  }

  const { data: urlData } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(
        nombreArchivo
      );

  const { data, error } =
    await supabase
      .from("fotos_salon")
      .insert({
        url: urlData.publicUrl,
        orden,
        activo: true,
      })
      .select()
      .single();

  if (error) {
    await supabase.storage
      .from(BUCKET)
      .remove([
        nombreArchivo,
      ]);

    throw error;
  }

  return data as FotoSalon;
}

export async function eliminarFotoSalon(
  foto: FotoSalon
) {
  const nombreArchivo =
    foto.url.split("/").pop();

  if (nombreArchivo) {
    const {
      error: errorStorage,
    } =
      await supabase.storage
        .from(BUCKET)
        .remove([
          nombreArchivo,
        ]);

    if (errorStorage) {
      throw errorStorage;
    }
  }

  const { error } =
    await supabase
      .from("fotos_salon")
      .delete()
      .eq("id", foto.id);

  if (error) {
    throw error;
  }
}

export async function actualizarOrdenFotosSalon(
  fotos: FotoSalon[]
) {
  for (
    let indice = 0;
    indice < fotos.length;
    indice++
  ) {
    const foto =
      fotos[indice];

    if (!foto) {
      continue;
    }

    const { error } =
      await supabase
        .from("fotos_salon")
        .update({
          orden: indice,
        })
        .eq(
          "id",
          foto.id
        );

    if (error) {
      throw error;
    }
  }
}