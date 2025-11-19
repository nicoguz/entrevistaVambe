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

  const [totalToProcess, setTotalToProcess] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const handleProcessInsights = async () => {
    setProcessStatus(null);
    setProcessError(null);
    setProcessing(true);
    setProcessedCount(0);
    setTotalToProcess(0);

    try {
      // 1) obtener lista de clientes pendientes
      const pendingRes = await fetch("/api/pending-insights");
      const pendingData = await pendingRes.json();

      if (!pendingRes.ok) {
        setProcessError(pendingData.error || "Error obteniendo clientes pendientes.");
        setProcessing(false);
        return;
      }

      const clientIds: number[] = pendingData.clientIds || [];
      const total = clientIds.length;

      if (total === 0) {
        setProcessStatus("No hay clientes pendientes de procesar.");
        setProcessing(false);
        return;
      }

      setTotalToProcess(total);

      // 2) procesar uno por uno
      let successCount = 0;

      for (let i = 0; i < clientIds.length; i++) {
        const id = clientIds[i];

        const res = await fetch(`/api/process-insight/${id}`, {
          method: "POST",
        });

        if (res.ok) {
          successCount++;
        } else {
          const errJson = await res.json().catch(() => null);
          console.error("Error procesando insight para cliente", id, errJson);
        }

        setProcessedCount((prev) => prev + 1);
      }

      setProcessStatus(
        `Insights procesados para ${successCount} de ${total} clientes pendientes.`
      );

    } catch (err) {
      console.error(err);
      setProcessError("Error de red al procesar insights.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSingleProcessInsights = async () => {
    setProcessStatus(null);
    setProcessError(null);
    setProcessing(true);
    // setProcessedCount(0);
    // setTotalToProcess(0);

    try {
      // 1) obtener lista de clientes pendientes
      const pendingRes = await fetch("/api/pending-insights");
      const pendingData = await pendingRes.json();

      if (!pendingRes.ok) {
        setProcessError(pendingData.error || "Error obteniendo clientes pendientes.");
        setProcessing(false);
        return;
      }

      const clientIds: number[] = pendingData.clientIds || [];
      const total = clientIds.length;

      if (total === 0) {
        setProcessStatus("No hay clientes pendientes de procesar.");
        setProcessing(false);
        return;
      }

      // setTotalToProcess(total);

      // 2) procesar uno por uno
      // let successCount = 0;

      // for (let i = 0; i < clientIds.length; i++) {
      const id = clientIds[0];

      const res = await fetch(`/api/process-insight/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        setProcessStatus(
          `Insight procesado! ID: ${id}`
        );
      } else {
        const errJson = await res.json().catch(() => null);
        console.error("Error procesando insight para cliente", id, errJson);
      }

      // setProcessedCount((prev) => prev + 1);
      // }

      setProcessStatus(
        `Insight procesado! ID: ${id}`
      );

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

  const progressPercent =
    totalToProcess > 0 ? Math.round((processedCount / totalToProcess) * 100) : 0;

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

      <button
        onClick={handleSingleProcessInsights}
        disabled={processing}
        style={{
          padding: "0.4rem 0.9rem",
          cursor: processing ? "not-allowed" : "pointer",
          opacity: processing ? 0.7 : 1,
          border: "1px solid #bdbdbdff",
          borderRadius: "4px",
        }}
      >
        {processing ? "Procesando..." : "Procesar un insight"}
      </button>

      {/* Barra de progreso */}
      {totalToProcess > 0 && (
        <div style={{ marginTop: "0.5rem", maxWidth: "400px" }}>
          <div
            style={{
              height: "10px",
              borderRadius: "999px",
              border: "1px solid #ccc",
              overflow: "hidden",
              background: "#f5f5f5",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                transition: "width 0.2s ease-out",
                background: "#4caf50",
              }}
            />
          </div>
          <div style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Procesados {processedCount} de {totalToProcess} ({progressPercent}%)
          </div>
        </div>
      )}

      {processStatus && (
        <p style={{ marginTop: "0.5rem", color: "green" }}>{processStatus}</p>
      )}
      {processError && (
        <p style={{ marginTop: "0.5rem", color: "red" }}>{processError}</p>
      )}
    </main>
  );
}
