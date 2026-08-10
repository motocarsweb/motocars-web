import "./BrandsSection.css";
import "./RVMSection.css";

export default function RVMSection() {
  return (
    <section className="rvm-section">
      <div className="container">
        <h2>RVM Patagonia</h2>
      </div>
    </section>
  );
}

const categories = [
  {
    title: "Adventure",
    subtitle: "Grandes viajes. Sin límites.",
    brand: "RVM",
    order: 1,
    image: "/images/categories/adventure.webp",
    anchor: "#adventure",
  },
  {
    title: "Touring",
    subtitle: "Kilómetros de libertad.",
    brand: "RVM",
    order: 2,
    image: "/images/categories/touring.webp",
    anchor: "#touring",
  },
  {
    title: "Sport",
    subtitle: "Pura adrenalina.",
    brand: "RVM",
    order: 3,
    image: "/images/categories/sport.webp",
    anchor: "#sport",
  },
  {
    title: "Enduro",
    subtitle: "Donde termina el camino.",
    brand: "RVM",
    order: 4,
    image: "/images/categories/enduro.webp",
    anchor: "#enduro",
  },
  {
    title: "Custom",
    subtitle: "Tu estilo. Tu moto.",
    brand: "RVM / JAWA",
    order: 5,
    image: "/images/categories/custom.webp",
    anchor: "#custom",
  },
  {
    title: "Clásicas",
    subtitle: "La historia sobre ruedas.",
    brand: "JAWA",
    order: 6,
    image: "/images/categories/clasicas.webp",
    anchor: "#clasicas",
  },
];

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
          {categories.map((category) => (
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