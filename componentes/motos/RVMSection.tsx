import Image from "next/image";
import { rvmData } from "@/lib/motos/rvm";
import "./RVMSection.css";

export default function RVMSection() {
  return (
    <section className="rvm-section" id="rvm">
      <div className="container rvm-section-grid">
        <div className="rvm-section-content">
          <span className="rvm-section-eyebrow">
            {rvmData.eyebrow}
          </span>

          <h2>{rvmData.title}</h2>

          <p>{rvmData.description}</p>

          <div className="rvm-section-categories">
            {rvmData.categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>

          <div className="rvm-section-benefits">
            {rvmData.benefits.map((benefit) => (
              <span key={benefit}>{benefit}</span>
            ))}
          </div>

          <a
            href={rvmData.buttonHref}
            className="rvm-section-button"
          >
            {rvmData.buttonLabel}
          </a>
        </div>

        <div className="rvm-section-media">
          <div className="rvm-section-image">
            <Image
              src={rvmData.image}
              alt="RVM Patagonia"
              width={1600}
              height={900}
              unoptimized
            />
          </div>

          <div className="rvm-section-location">
            <span>Neuquén Capital</span>
            <strong>Representante Oficial RVM Patagonia</strong>
          </div>
        </div>
      </div>
    </section>
  );
}