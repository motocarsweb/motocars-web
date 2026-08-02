import Link from "next/link";

const catalogos = [
  {
    titulo: "Marcas",
    descripcion: "Administrar las marcas disponibles.",
    href: "/admin/catalogos/marcas",
  },
  {
    titulo: "Modelos",
    descripcion: "Administrar los modelos por marca.",
    href: "/admin/catalogos/modelos",
  },
  {
    titulo: "Versiones",
    descripcion: "Administrar las versiones por modelo.",
    href: "/admin/catalogos/versiones",
  },
  {
    titulo: "Tipos de vehículo",
    descripcion: "SUV, Sedan, Pick-Up, Hatchback, etc.",
    href: "/admin/catalogos/tipos-vehiculo",
  },
  {
    titulo: "Combustibles",
    descripcion: "Nafta, Diésel, Híbrido, Eléctrico...",
    href: "/admin/catalogos/combustibles",
  },
  {
    titulo: "Transmisiones",
    descripcion: "Manual, Automática, CVT...",
    href: "/admin/catalogos/transmisiones",
  },
  {
    titulo: "Tracciones",
    descripcion: "4x2, 4x4, AWD...",
    href: "/admin/catalogos/tracciones",
  },
  {
    titulo: "Tipos de ingreso",
    descripcion: "Compra, Consignación, Permuta.",
    href: "/admin/catalogos/tipos-ingreso",
  },
];

export default function CatalogosPage() {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          marginBottom: 10,
        }}
      >
        Catálogos
      </h1>

      <p
        style={{
          color: "#6b7280",
          marginBottom: 30,
        }}
      >
        Administrá todos los datos maestros del sistema.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(260px,1fr))",
          gap: 20,
        }}
      >
        {catalogos.map((catalogo) => (
          <Link
            key={catalogo.href}
            href={catalogo.href}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 20,
                height: "100%",
                transition: ".2s",
                cursor: "pointer",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                }}
              >
                {catalogo.titulo}
              </h2>

              <p
                style={{
                  color: "#666",
                  marginBottom: 0,
                }}
              >
                {catalogo.descripcion}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}