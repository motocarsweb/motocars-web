"use client";

import type { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  padding?: number;
  style?: CSSProperties;
};

export default function Card({
  children,
  title,
  subtitle,
  padding = 24,
  style,
}: CardProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        padding,
        boxShadow: "0 4px 18px rgba(0,0,0,.06)",
        ...style,
      }}
    >
      {(title || subtitle) && (
        <header style={{ marginBottom: 20 }}>
          {title && (
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {title}
            </h2>
          )}

          {subtitle && (
            <p
              style={{
                marginTop: 8,
                marginBottom: 0,
                color: "#6b7280",
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
        </header>
      )}

      {children}
    </section>
  );
}