import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    border: "1px solid #111827",
    backgroundColor: "#111827",
    color: "#ffffff",
  },

  secondary: {
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
  },

  danger: {
    border: "1px solid #dc2626",
    backgroundColor: "#ffffff",
    color: "#dc2626",
  },

  success: {
    border: "1px solid #059669",
    backgroundColor: "#ffffff",
    color: "#047857",
  },
};

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  style,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : "auto",
        minHeight: 42,
        padding: "0 18px",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 700,
        opacity: disabled ? 0.65 : 1,
        transition:
          "background-color 150ms ease, border-color 150ms ease, opacity 150ms ease",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}