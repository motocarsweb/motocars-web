import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: number;
};

export default function Card({
  children,
  padding = 20,
  style,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      style={{
        width: "100%",
        padding,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        backgroundColor: "#ffffff",
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}