type EmptyStateProps = {
  titulo: string;
  descripcion: string;
};

export default function EmptyState({
  titulo,
  descripcion,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed p-12 text-center">
      <h2 className="text-xl font-semibold">
        {titulo}
      </h2>

      <p className="mt-2 text-gray-500">
        {descripcion}
      </p>
    </div>
  );
}