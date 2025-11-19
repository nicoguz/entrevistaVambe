// app/page.tsx
"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Vambe Sales Insights</h1>
      <p>Hola 👋 Este es el Hello World del desafío.</p>
      <p>
        Más adelante aquí podemos dejar una breve explicación del producto y un
        botón para ir al <code>/dashboard</code>.
      </p>
      <button
        onClick={() => router.push("/upload")}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Ir a subir CSV
      </button>
      <button
        onClick={() => router.push("/dashboard")}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Ir al Dashboard
      </button>
    </main>
  );
}

