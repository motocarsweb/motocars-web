import {
  BadgeCheck,
  CarFront,
  Handshake,
  ShieldCheck,
} from "lucide-react";

const stats = [
  {
    icon: Handshake,
    value: "30+",
    title: "Años de trayectoria",
    description: "Experiencia y respaldo en cada operación.",
  },
  {
    icon: ShieldCheck,
    value: "100%",
    title: "Operaciones transparentes",
    description: "Información clara y atención personalizada.",
  },
  {
    icon: CarFront,
    value: "+5000",
    title: "Vehículos comercializados",
    description: "Una trayectoria construida junto a nuestros clientes.",
  },
  {
    icon: BadgeCheck,
    value: "Multimarca",
    title: "Autos y pickups",
    description: "Vehículos nacionales e importados seleccionados.",
  },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article className="stat-card" key={stat.title}>
                <div className="stat-icon">
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                <div className="stat-content">
                  <strong className={stat.value === "Multimarca" ? "stat-value-long" : ""}>
  {stat.value}
</strong>
                  <h2>{stat.title}</h2>
                  <p>{stat.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}