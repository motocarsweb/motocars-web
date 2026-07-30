import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/componentes/theme/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://motocars.com.ar"),

  title: {
    default: "MotoCars Concesionaria | Autos Usados y 0 km en Neuquén",
    template: "%s | MotoCars Concesionaria",
  },

  description:
    "Encontrá autos usados seleccionados y vehículos 0 km en Neuquén. Más de 30 años de trayectoria, financiación y atención personalizada.",

  keywords: [
    "MotoCars",
    "Autos Neuquén",
    "Concesionaria",
    "Usados",
    "0 km",
    "Toyota",
    "Volkswagen",
    "Ford",
    "Chevrolet",
    "Financiación",
  ],

  openGraph: {
    title: "MotoCars Concesionaria",
    description:
      "Encontrá tu próximo vehículo con el respaldo de más de 30 años de experiencia.",
    url: "https://motocars.com.ar",
    siteName: "MotoCars Concesionaria",
    locale: "es_AR",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}