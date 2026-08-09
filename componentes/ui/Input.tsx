import type {
  InputHTMLAttributes,
  CSSProperties,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({
  label,
  style,
  ...props
}: InputProps) {
  return (
    <label
      style={{
        display: "grid",
        gap: 7,
        width: "100%",
      }}
    >
      {label && (
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--mc-black)",
          }}
        >
          {label}
        </span>
      )}

      <input
        {...props}
        style={{
          width: "100%",
          minHeight: 44,
          padding: "0 14px",
          border: "1px solid #d8d8d8",
          borderRadius: 8,
          outline: "none",
          fontFamily: "inherit",
          fontSize: 14,
          backgroundColor: "#ffffff",
          color: "var(--mc-black)",
          transition:
            "border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease",
          ...style,
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderColor =
            "var(--mc-red)";
          event.currentTarget.style.boxShadow =
            "0 0 0 3px rgba(255, 0, 50, 0.10)";

          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderColor =
            "#d8d8d8";
          event.currentTarget.style.boxShadow = "none";

          props.onBlur?.(event);
        }}
      />
    </label>
  );
}