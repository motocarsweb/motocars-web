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
        border: "1px solid #e5e5e5",
        borderRadius: 14,
        backgroundColor: "#ffffff",
        boxShadow: "0 10px 30px rgba(17, 17, 17, 0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}