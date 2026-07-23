"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  // La pantalla de acceso no debe mostrar el menú administrativo.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
      }}
    >
      <aside
        style={{
          width: "250px",
          padding: "30px 20px",
          backgroundColor: "#111827",
          color: "white",
        }}
      >
        <h1 style={{ marginBottom: "35px", fontSize: "22px" }}>
          MotoCars Admin
        </h1>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <Link href="/admin/dashboard" style={{ color: "white" }}>
            Inicio
          </Link>

          <Link href="/admin/vehiculos" style={{ color: "white" }}>
            Vehículos
          </Link>

          <button
            type="button"
            onClick={cerrarSesion}
            style={{
              marginTop: "25px",
              padding: "10px",
              cursor: "pointer",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "35px",
        }}
      >
        {children}
      </main>
    </div>
  );
}