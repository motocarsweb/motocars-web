"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useTheme } from "@/componentes/theme/ThemeProvider";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary,
      color: "#ffffff",
      border: `1px solid ${colors.primary}`,
    },

    secondary: {
      backgroundColor: colors.secondary,
      color: "#ffffff",
      border: `1px solid ${colors.secondary}`,
    },

    outline: {
      backgroundColor: "transparent",
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
    },

    danger: {
      backgroundColor: "#dc2626",
      color: "#ffffff",
      border: "1px solid #dc2626",
    },
  };

  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        minHeight: "42px",
        width: fullWidth ? "100%" : "auto",
        padding: "10px 18px",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: 1.2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "transform 150ms ease, opacity 150ms ease, box-shadow 150ms ease",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}