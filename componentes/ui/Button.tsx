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
    border: "1px solid var(--mc-red)",
    backgroundColor: "var(--mc-red)",
    color: "#ffffff",
  },

  secondary: {
    border: "1px solid var(--mc-black)",
    backgroundColor: "var(--mc-black)",
    color: "#ffffff",
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
        gap: 8,
        width: fullWidth ? "100%" : "auto",
        minHeight: 44,
        padding: "0 20px",
        borderRadius: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1,
        opacity: disabled ? 0.55 : 1,
        transition:
          "background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease, transform 150ms ease",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}