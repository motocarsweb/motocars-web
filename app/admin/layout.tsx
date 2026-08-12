"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Car,
  CircleDollarSign,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Settings,
  SlidersHorizontal,
  UserRound,
  Wrench,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type MenuItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const menuItems: MenuItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={19} strokeWidth={2} />,
  },
  {
    href: "/admin/vehiculos",
    label: "Vehículos",
    icon: <Car size={19} strokeWidth={2} />,
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    icon: <UserRound size={19} strokeWidth={2} />,
  },
  {
  href: "/admin/operaciones",
  label: "Operaciones",
  icon: <Gauge size={19} strokeWidth={2} />,
},
  {
    href: "/admin/catalogos",
    label: "Catálogos",
    icon: <SlidersHorizontal size={19} strokeWidth={2} />,
  },
  {
    href: "/admin/documentos",
    label: "Documentos",
    icon: <FileText size={19} strokeWidth={2} />,
  },
  {
    href: "/admin/gestoria",
    label: "Gestoría",
    icon: <Wrench size={19} strokeWidth={2} />,
  },
  {
    href: "/admin/caja",
    label: "Caja",
    icon: <CircleDollarSign size={19} strokeWidth={2} />,
  },
  {
    href: "/admin/configuracion",
    label: "Configuración",
    icon: <Settings size={19} strokeWidth={2} />,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function estaActivo(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

   if (href === "/admin/operaciones") {
  return pathname.startsWith("/admin/operaciones");
}

    return pathname.startsWith(href);
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <aside
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          width: 270,
          height: "100vh",
          padding: "24px 18px",
          backgroundColor: "var(--mc-black)",
          color: "#ffffff",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "4px 8px 26px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Image
            src="/logos/Horizontal-3000px-blanco.png"
            alt="MotoCars"
            width={220}
            height={74}
            priority
            style={{
              display: "block",
              width: 190,
              height: "auto",
            }}
          />

          <div
            style={{
              marginTop: 10,
              color: "rgba(255,255,255,0.46)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
            }}
          >
            Gestión integral
          </div>
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginTop: 24,
          }}
        >
          {menuItems.map((item) => {
            const activo = estaActivo(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 46,
                  padding: "0 14px",
                  borderRadius: 9,
                  color: activo
                    ? "#ffffff"
                    : "rgba(255,255,255,0.68)",
                  backgroundColor: activo
                    ? "var(--mc-red)"
                    : "transparent",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: activo ? 700 : 600,
                  transition:
                    "background-color 150ms ease, color 150ms ease",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: activo
                      ? "#ffffff"
                      : "rgba(255,255,255,0.6)",
                  }}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            type="button"
            onClick={cerrarSesion}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              width: "100%",
              minHeight: 44,
              padding: "0 14px",
              border: "none",
              borderRadius: 9,
              backgroundColor: "transparent",
              color: "rgba(255,255,255,0.68)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <LogOut size={19} strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 74,
            padding: "0 32px",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#ffffff",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--mc-black)",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              MotoCars
            </div>

            <div
              style={{
                marginTop: 2,
                color: "#8a8a8a",
                fontSize: 12,
              }}
            >
              Sistema de gestión
            </div>
          </div>

          <div
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: "var(--mc-red)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            MC
          </div>
        </header>

        <main
          style={{
            padding: "30px 32px 44px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}