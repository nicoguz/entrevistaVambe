"use client";

import { useRouter } from "next/navigation";
import { NavButton } from "./components/NavButton";

export default function Home() {
  const router = useRouter();

  return (
    <main className="landing-main">
      <section className="landing-hero">
        <h1 className="landing-title">Vambe Sales Insights</h1>
        <p className="landing-subtitle">
          Convierte tus reuniones de ventas en información procesable, automatizada
          y lista para analizar.
        </p>

        <div className="landing-actions">
          <button
            onClick={() => router.push("/upload")}
            className="landing-button landing-button--secondary"
          >
            Subir CSV
          </button>

          <NavButton href="/dashboard" className="landing-button landing-button--primary">
            Dashboard
          </NavButton>
        </div>
      </section>

      <section className="landing-info">
        <h2 className="landing-info-title">¿Qué puedes hacer aquí?</h2>
        <p className="landing-info-text">
          Esta app procesa transcripciones de reuniones de venta, genera insights
          automáticos y permite analizarlos en un dashboard detallado.
        </p>
      </section>
    </main>
  );
}
