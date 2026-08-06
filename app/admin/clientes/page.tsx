import PageHeader from "@/componentes/admin/PageHeader";
import PrimaryButton from "@/componentes/admin/PrimaryButton";
import EmptyState from "@/componentes/admin/EmptyState";

export default function ClientesPage() {
  return (
    <main className="p-6">
      <PageHeader
        titulo="Clientes"
        descripcion="Administración de clientes"
        acciones={
          <PrimaryButton>
            + Nuevo Cliente
          </PrimaryButton>
        }
      />

      <EmptyState
  titulo="No hay clientes"
  descripcion="Cuando registres el primer cliente aparecerá aquí."
/>
    </main>
  );
}