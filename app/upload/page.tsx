// app/upload/page.tsx
"use client";

import { useState, FormEvent } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<null | string>(null);
  const [uploadError, setUploadError] = useState<null | string>(null);

  const [processStatus, setProcessStatus] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleProcessInsights = async () => {
    setProcessStatus(null);
    setProcessError(null);
    setProcessing(true);

    try {
      const res = await fetch("/api/process-insights", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setProcessError(data.error || "Error procesando insights.");
      } else {
        setProcessStatus(
          `Insights procesados: ${data.processed}.`
        );
      }
    } catch (err) {
      console.error(err);
      setProcessError("Error de red al procesar insights.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);
    setUploadError(null);

    if (!file) {
      setUploadError("Por favor selecciona un archivo CSV.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-csv", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Error subiendo el CSV");
      } else {
        setUploadStatus(
          `CSV procesado correctamente. Filas totales: ${data.totalRows}, clientes creados: ${data.created}.`
        );
      }
    } catch (err) {
      console.error(err);
      setUploadError("Error de red al subir el archivo.");
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Subir CSV de clientes</h1>
      <p style={{ marginBottom: "1rem" }}>
        Selecciona el archivo CSV para cargar los clientes en la base de datos.
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <input
          type="file"
          accept=".csv,text/csv"
          style={{
            border: "1px solid #bdbdbdff",
            borderRadius: "4px",
            textAlign: "center",
            alignSelf: "center",
          }}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: "0.75rem",
            padding: "0.4rem 0.9rem",
            cursor: "pointer",
            border: "1px solid #bdbdbdff",
            borderRadius: "4px",
          }}
        >
          Subir
        </button>
      </form>

      {uploadStatus && (
        <p style={{ marginTop: "1rem", color: "green" }}>
          {uploadStatus}
        </p>
      )}
      {uploadError && (
        <p style={{ marginTop: "1rem", color: "red" }}>
          {uploadError}
        </p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h2>Procesar insights con LLM</h2>
      <p style={{ marginBottom: "0.75rem" }}>
        Esto analizará las transcripciones de los clientes que todavía no tengan insights generados.
      </p>

      <button
        onClick={handleProcessInsights}
        disabled={processing}
        style={{
          padding: "0.4rem 0.9rem",
          cursor: processing ? "not-allowed" : "pointer",
          opacity: processing ? 0.7 : 1,
          border: "1px solid #bdbdbdff",
          borderRadius: "4px",
        }}
      >
        {processing ? "Procesando..." : "Procesar insights"}
      </button>

      {processStatus && (
        <p style={{ marginTop: "0.5rem", color: "green" }}>{processStatus}</p>
      )}
      {processError && (
        <p style={{ marginTop: "0.5rem", color: "red" }}>{processError}</p>
      )}
    </main>
  );
}
