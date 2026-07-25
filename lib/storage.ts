import { supabase } from "@/lib/supabase";

export async function subirImagenVehiculo(file: File) {
  const extension = file.name.split(".").pop();

  const nombre = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${extension}`;

  const ruta = `vehiculos/${nombre}`;

  const { error } = await supabase.storage
    .from("vehiculos")
    .upload(ruta, file);

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