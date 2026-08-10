import Image from "next/image";
import { jawaData } from "@/lib/motos/jawa";
import "./JAWASection.css";

export default function JAWASection() {
  return (
    <section className="jawa-section" id="jawa">
      <div className="container jawa-section-grid">
        <div className="jawa-section-media">
          <div className="jawa-section-image">
            <Image
              src={jawaData.image}
              alt="JAWA Patagonia"
              width={1600}
              height={900}
              unoptimized
            />
          </div>

          <div className="jawa-section-location">
            <span>Neuquén Capital</span>
            <strong>Representante Oficial JAWA Patagonia</strong>
          </div>
        </div>

        <div className="jawa-section-content">
          <span className="jawa-section-eyebrow">
            {jawaData.eyebrow}
          </span>

          <h2>{jawaData.title}</h2>

          <p>{jawaData.description}</p>

          <div className="jawa-section-categories">
            {jawaData.categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>

          <div className="jawa-section-benefits">
            {jawaData.benefits.map((benefit) => (
              <span key={benefit}>{benefit}</span>
            ))}
          </div>

          <a
            href={jawaData.buttonHref}
            className="jawa-section-button"
          >
            {jawaData.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}