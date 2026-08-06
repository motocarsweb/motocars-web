type PrimaryButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  children,
  className = "",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 ${className}`}
    >
      {children}
    </button>
  );
}