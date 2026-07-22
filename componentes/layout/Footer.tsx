export default function Footer() {
  return (
    <footer
      id="contacto"
      style={{
        background: "#0f172a",
        color: "#fff",
        padding: "70px 0 25px",
        marginTop: "80px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "50px",
          }}
        >
          <div>
            <h2 style={{ marginBottom: 18 }}>MotoCars Concesionaria</h2>

            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.8,
                maxWidth: 450,
              }}
            >
              Más de 30 años acompañando a nuestros clientes en la compra
              de autos y motos. Vehículos seleccionados, financiación,
              permutas y atención personalizada.
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: 18 }}>Contacto</h3>

            <p>📍 Primeros Pobladores 1400</p>
            <p>Neuquén Capital</p>
            <p>📞 +54 9 299 513 3023</p>
            <p>✉ motocars.concesionaria@gmail.com</p>
          </div>

          <div>
            <h3 style={{ marginBottom: 18 }}>Horarios</h3>

            <p>Lunes a Viernes</p>
            <p>09:00 - 13:00</p>
            <p>16:00 - 20:00</p>

            <br />

            <p>Sábados</p>
            <p>09:00 - 13:00</p>
          </div>
        </div>

        <hr
          style={{
            margin: "45px 0 25px",
            borderColor: "rgba(255,255,255,.12)",
          }}
        />

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          © {new Date().getFullYear()} MotoCars Concesionaria · Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}