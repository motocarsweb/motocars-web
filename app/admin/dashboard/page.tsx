"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  const menu = [
    {
      titulo: "Dashboard",
      href: "/admin/dashboard",
      icono: "🏠",
    },
    {
      titulo: "Vehículos",
      href: "/admin/vehiculos",
      icono: "🚗",
    },
    {
      titulo: "Agregar vehículo",
      href: "/admin/vehiculos/nuevo",
      icono: "➕",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <aside
        style={{
          width: 260,
          background: "#1f2937",
          color: "#fff",
          padding: 25,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 35,
          }}
        >
          MotoCars Admin
        </h2>

        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "block",
              padding: "12px 16px",
              marginBottom: 8,
              borderRadius: 8,
              textDecoration: "none",
              color: "#fff",
              background:
                pathname === item.href ? "#374151" : "transparent",
            }}
          >
            {item.icono} {item.titulo}
          </Link>
        ))}

        <button
          onClick={cerrarSesion}
          style={{
            marginTop: 40,
            width: "100%",
            padding: 12,
            border: "none",
            borderRadius: 8,
            background: "#c62828",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Cerrar sesión
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          padding: 40,
        }}
      >
        {children}
      </main>
    </div>
  );
}