import Link from "next/link";

type VehicleDuplicateButtonProps = {
  vehiculoId: number;
};

export default function VehicleDuplicateButton({
  vehiculoId,
}: VehicleDuplicateButtonProps) {
  return (
    <Link
      href={`/admin/vehiculos/nuevo?duplicar=${vehiculoId}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 36,
        padding: "0 12px",
        border: "1px solid #7c3aed",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        color: "#6d28d9",
        textDecoration: "none",
        fontSize: 13,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      Duplicar
    </Link>
  );
}