import Link from "next/link";

export default function VenderAutoCTA() {
  return (
    <section className="w-full bg-zinc-950 px-4 py-14 text-white">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
          ¿TENÉS UN AUTO PARA VENDER?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-300 md:text-lg">
          Ofrecenos tu vehículo de forma rápida y sencilla.
          Completá el formulario y nuestro equipo se pondrá
          en contacto con vos.
        </p>

        <Link
          href="/vende-tu-auto"
          className="mt-7 inline-flex items-center justify-center rounded-lg bg-red-600 px-8 py-4 text-base font-bold text-white transition-colors hover:bg-red-700"
        >
          HACÉ CLIC ACÁ
        </Link>
      </div>
    </section>
  );
}
