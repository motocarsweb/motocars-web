"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
};

type ThemeContextValue = {
  colors: ThemeColors;
  loading: boolean;
  refreshTheme: () => Promise<void>;
};

type ThemeProviderProps = {
  children: ReactNode;
};

const defaultColors: ThemeColors = {
  primary: "#111827",
  secondary: "#dc2626",
  accent: "#f59e0b",
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [loading, setLoading] = useState(true);

  async function loadTheme() {
    setLoading(true);

    const { data, error } = await supabase
      .from("configuracion_empresa")
      .select("color_primario, color_secundario, color_acento")
      .eq("codigo", "principal")
      .single();

    if (error) {
      console.error("No se pudieron cargar los colores:", error.message);
      setColors(defaultColors);
      setLoading(false);
      return;
    }

    setColors({
      primary: data.color_primario || defaultColors.primary,
      secondary: data.color_secundario || defaultColors.secondary,
      accent: data.color_acento || defaultColors.accent,
    });

    setLoading(false);
  }

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-accent", colors.accent);
  }, [colors]);

  const contextValue = useMemo(
    () => ({
      colors,
      loading,
      refreshTheme: loadTheme,
    }),
    [colors, loading],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe utilizarse dentro de un componente ThemeProvider.",
    );
  }

  return context;
}