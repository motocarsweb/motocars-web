import "./BrandsSection.css";
import "./RVMSection.css";
import { motoCategories } from "@/lib/motos/categories";

export default function BrandsSection() {
  return (
    <section className="brands-section">
      <div className="container">
        <span className="brands-eyebrow">
          EXPLORÁ
        </span>

        <h2 className="brands-title">
          Tu próxima moto
        </h2>

        <div className="brands-grid">
          {motoCategories.map((category) => (
            <a
              key={category.title}
              href={category.anchor}
              className="brand-card"
            >
              <div
                className="brand-card-image"
                style={{
                  backgroundImage: `url(${category.image})`,
                }}
              />

              <div className="brand-card-content">
                <span className="brand-card-brand">
                  {category.brand}
                </span>

                <h3>
                  {category.title}
                </h3>

                <p>
                  {category.subtitle}
                </p>

                <small>
                  Explorar →
                </small>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}