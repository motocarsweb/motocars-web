export async function optimizarFotoWebp(archivo: File): Promise<File> {
  if (!archivo.type.startsWith("image/")) throw new Error("El archivo no es una imagen.");
  if (archivo.size > 20 * 1024 * 1024) throw new Error("La imagen original supera los 20 MB.");
  const imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  try {
    const escala = Math.min(1, 1280 / Math.max(imagen.width, imagen.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(imagen.width * escala));
    canvas.height = Math.max(1, Math.round(imagen.height * escala));
    const contexto = canvas.getContext("2d");
    if (!contexto) throw new Error("No se pudo procesar la fotografía.");
    contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((resultado) => resultado ? resolve(resultado) : reject(new Error("No se pudo convertir a WebP.")), "image/webp", 0.76);
    });
    if (blob.type !== "image/webp") throw new Error("Tu navegador no permite convertir imágenes a WebP.");
    if (blob.size > 1024 * 1024) throw new Error("La fotografía optimizada supera 1 MB. Elegí otra imagen.");
    return new File([blob], "foto-" + crypto.randomUUID() + ".webp", { type: "image/webp" });
  } finally {
    imagen.close();
  }
}
