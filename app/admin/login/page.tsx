"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensaje("");
    setCargando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setMensaje("Correo electrónico o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    router.replace("/admin/dashboard");
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="admin-login-heading">
          <span className="admin-login-brand">MotoCars</span>

          <h1>Panel de administración</h1>

          <p>Ingresá con tu usuario administrador.</p>
        </div>

        <form onSubmit={iniciarSesion} className="admin-login-form">
          <label htmlFor="email">Correo electrónico</label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nombre@correo.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Contraseña</label>

          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            required
          />

          {mensaje && <p className="admin-login-error">{mensaje}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}