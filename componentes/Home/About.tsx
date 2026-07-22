const showroomImages = [
  "/images/salon1.jpeg",
  "/images/salon2.jpeg",
  "/images/salon3.JPG",
  "/images/salon4.jpeg",
  "/images/salon5.jpg",
  "/images/salon6.jpeg",
];

export default function About() {
  return (
    <section className="about" id="nosotros">
      <div className="container">
        <div className="about-header">
          <div>
            <span className="about-subtitle">NUESTRA CONCESIONARIA</span>

            <h2>Un espacio pensado para elegir tu próximo vehículo</h2>
          </div>

          <p>
            En MotoCars combinamos experiencia, atención personalizada y una
            selección multimarca para acompañarte en cada etapa de la compra.
          </p>
        </div>

        <div className="showroom-grid">
          {showroomImages.map((image, index) => (
            <div
              className={`showroom-card showroom-card-${index + 1}`}
              key={image}
            >
              <img
                src={image}
                alt={`Salón MotoCars ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}