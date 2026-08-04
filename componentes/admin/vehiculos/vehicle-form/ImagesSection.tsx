import ImageManager from "@/app/ImageManager";

type ImagesSectionProps = {
  imagenes: File[];
  onChange: (imagenes: File[]) => void;
};

export default function ImagesSection({
  imagenes,
  onChange,
}: ImagesSectionProps) {
  return (
    <ImageManager
      images={imagenes}
      onChange={onChange}
    />
  );
}