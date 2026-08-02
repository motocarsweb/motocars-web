import type {
  CSSProperties,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: ReactNode;
};

export default function Select({
  label,
  children,
  style,
  ...props
}: SelectProps) {
  return (
    <label
      style={{
        display: "grid",
        gap: 6,
        width: "100%",
      }}
    >
      {label && (
        <span
          style={{
            color: "#374151",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      )}

      <select
        {...props}
        style={{
          width: "100%",
          minHeight: 42,
          padding: "0 14px",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          outline: "none",
          backgroundColor: "#ffffff",
          color: "#111827",
          fontFamily: "inherit",
          fontSize: 14,
          cursor: props.disabled ? "not-allowed" : "pointer",
          opacity: props.disabled ? 0.7 : 1,
          ...style,
        }}
      >
        {children}
      </select>
    </label>
  );
}