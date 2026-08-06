type PageHeaderProps = {
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
};

export default function PageHeader({
  titulo,
  descripcion,
  acciones,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          {titulo}
        </h1>

        {descripcion && (
          <p className="mt-1 text-gray-500">
            {descripcion}
          </p>
        )}
      </div>

      {acciones}
    </div>
  );
}