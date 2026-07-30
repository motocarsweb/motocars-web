"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = true,
    id,
    disabled,
    required,
    style,
    ...props
  },
  ref,
) {
  const inputId =
    id ??
    label
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <label
      htmlFor={inputId}
      style={{
        display: "flex",
        width: fullWidth ? "100%" : "auto",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {label && (
        <span
          style={{
            color: "#374151",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {label}
          {required ? " *" : ""}
        </span>
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {leftIcon && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "12px",
              display: "flex",
              alignItems: "center",
              color: "#6b7280",
              pointerEvents: "none",
            }}
          >
            {leftIcon}
          </span>
        )}

        <input
          {...props}
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          style={{
            width: "100%",
            minHeight: "44px",
            boxSizing: "border-box",
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: leftIcon ? "40px" : "12px",
            paddingRight: rightIcon ? "40px" : "12px",
            border: error
              ? "1px solid #dc2626"
              : "1px solid #d1d5db",
            borderRadius: "8px",
            backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
            color: "#111827",
            fontSize: "15px",
            lineHeight: 1.4,
            outline: "none",
            opacity: disabled ? 0.7 : 1,
            cursor: disabled ? "not-allowed" : "text",
            transition:
              "border-color 150ms ease, box-shadow 150ms ease",
            ...style,
          }}
        />

        {rightIcon && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              right: "12px",
              display: "flex",
              alignItems: "center",
              color: "#6b7280",
              pointerEvents: "none",
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <span
          id={`${inputId}-error`}
          style={{
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          {error}
        </span>
      ) : (
        helperText && (
          <span
            id={`${inputId}-helper`}
            style={{
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            {helperText}
          </span>
        )
      )}
    </label>
  );
});

export default Input;