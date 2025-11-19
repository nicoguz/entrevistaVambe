"use client";

import { useState, FormEvent } from "react";
import NavBar from "@/app/components/navbar";

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
      const pendingRes = await fetch("/api/pending-insights");
      const pendingData = await pendingRes.json();

      if (!pendingRes.ok) {
        setProcessError(
          pendingData.error || "Error obteniendo clientes pendientes."
        );
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

    try {
      const pendingRes = await fetch("/api/pending-insights");
      const pendingData = await pendingRes.json();

      if (!pendingRes.ok) {
        setProcessError(
          pendingData.error || "Error obteniendo clientes pendientes."
        );
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

      const id = clientIds[0];

      const res = await fetch(`/api/process-insight/${id}`, {
        method: "POST",
      });

      if (res.ok) {
        setProcessStatus(`Insight procesado! ID: ${id}`);
      } else {
        const errJson = await res.json().catch(() => null);
        console.error("Error procesando insight para cliente", id, errJson);
      }

      setProcessStatus(`Insight procesado! ID: ${id}`);
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
    totalToProcess > 0
      ? Math.round((processedCount / totalToProcess) * 100)
      : 0;

  return (
    <main className="upload-main">
      <NavBar />
      <section className="upload-card">
        <header className="upload-header">
          <h1 className="upload-title">Subir CSV de clientes</h1>
          <p className="upload-subtitle">
            Carga tus reuniones de ventas en formato CSV y procesa insights con el
            modelo.
          </p>
        </header>

        {/* Subida de CSV */}
        <section className="upload-section">
          <h2 className="upload-section-title">1. Cargar archivo CSV</h2>
          <p className="upload-section-text">
            Selecciona el archivo CSV para cargar los clientes en la base de datos.
          </p>

          <form onSubmit={handleSubmit} className="upload-form">
            <label className="upload-file-label">
              <span className="upload-file-text">
                {file ? file.name : "Seleccionar archivo CSV"}
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="upload-file-input"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                }}
              />
            </label>

            <button
              type="submit"
              className="upload-button upload-button--primary"
            >
              Subir y procesar CSV
            </button>
          </form>

          {uploadStatus && (
            <p className="upload-message upload-message--success">
              {uploadStatus}
            </p>
          )}
          {uploadError && (
            <p className="upload-message upload-message--error">
              {uploadError}
            </p>
          )}
        </section>

        <hr className="upload-divider" />

        {/* Procesar insights */}
        <section className="upload-section">
          <h2 className="upload-section-title">2. Procesar insights con LLM</h2>
          <p className="upload-section-text">
            Analiza las transcripciones de los clientes que todavía no tengan
            insights generados.
          </p>

          <div className="upload-actions">
            <button
              onClick={handleProcessInsights}
              disabled={processing}
              className="upload-button upload-button--secondary"
            >
              {processing ? "Procesando..." : "Procesar todos los pendientes"}
            </button>

            <button
              onClick={handleSingleProcessInsights}
              disabled={processing}
              className="upload-button upload-button--ghost"
            >
              {processing ? "Procesando..." : "Procesar solo uno"}
            </button>
          </div>

          {/* Barra de progreso */}
          {totalToProcess > 0 && (
            <div className="upload-progress">
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="upload-progress-text">
                Procesados {processedCount} de {totalToProcess} (
                {progressPercent}%)
              </div>
            </div>
          )}

          {processStatus && (
            <p className="upload-message upload-message--success">
              {processStatus}
            </p>
          )}
          {processError && (
            <p className="upload-message upload-message--error">
              {processError}
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
