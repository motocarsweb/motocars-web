
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";

export default function CreditoCTA() {
  return (
    <section
      aria-label="Financiación de vehículos"
      style={{
        padding: "24px 0",
        background: "#f5f5f5",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          padding: "22px 26px",
          background: "#111111",
          borderRadius: "14px",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flex: "1 1 260px",
          }}
        >
          <Wallet
            size={34}
            color="#ff0032"
            style={{ flexShrink: 0 }}
          />

          <div>
            <h2
              style={{
                fontSize: "clamp(19px, 2.5vw, 25px)",
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              ¿Necesitás financiación?
            </h2>

            <p
              style={{
                marginTop: "6px",
                fontSize: "14px",
                color: "#cccccc",
                lineHeight: 1.5,
              }}
            >
              Solicitá una cotización de crédito para
              comprar tu próximo auto o moto.
            </p>
          </div>
        </div>

        <Link
          href="/cotizar-credito"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "14px 22px",
            background: "#ff0032",
            color: "#ffffff",
            borderRadius: "9px",
            textDecoration: "none",
            fontSize: "15px",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          Cotizá tu crédito
          <ArrowRight size={19} />
        </Link>
      </div>
    </section>
  );
}
