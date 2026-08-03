import VehicleForm from "@/componentes/admin/vehiculos/VehicleForm";

type NuevoVehiculoPageProps = {
  searchParams: Promise<{
    duplicar?: string;
  }>;
};

export default async function NuevoVehiculoPage({
  searchParams,
}: NuevoVehiculoPageProps) {
  const params = await searchParams;

  const duplicarId = params.duplicar
    ? Number(params.duplicar)
    : undefined;

  const duplicarIdValido =
    duplicarId !== undefined &&
    Number.isInteger(duplicarId) &&
    duplicarId > 0
      ? duplicarId
      : undefined;

  return <VehicleForm duplicarId={duplicarIdValido} />;
}