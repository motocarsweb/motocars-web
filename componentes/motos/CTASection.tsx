import Link from "next/link";

export default function CTASection() {
  return (
    <section
      style={{
        background: "#101014",
        padding: "56px 20px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ color: "var(--mc-red)", fontWeight: 800 }}>
          RVM PATAGONIA | GRUPO MOTOCARS
        </p>

        <h2
          style={{
            color: "#ffffff",
            fontSize: "clamp(26px, 4vw, 42px)",
            fontWeight: 900,
          }}
        >
          FINANCIÁ TU PRÓXIMA AVENTURA
        </h2>

        <p style={{ color: "#b9b9c2", marginBottom: 28 }}>
          Tu próxima moto está más cerca de lo que imaginás.
        </p>

        <Link
          href="/cotizar-credito"
          style={{
            display: "inline-block",
            padding: "16px 34px",
            borderRadius: 8,
            background: "var(--mc-red)",
            color: "#ffffff",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          COTIZÁ TU CRÉDITO →
        </Link>
      </div>
    </section>
  );
}
