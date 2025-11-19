"use client";

import React, { useState } from "react";

type Client = {
  id: number;
  name: string;
  salesRep: string | null;
  meetingDate: string; // llega serializado desde el server
  closed: boolean;
  insight?: {
    industry?: string | null;
    leadSource?: string | null;
    engagementScore?: number | null;
    interactionVolumeRaw?: string | null;
    mainGoal?: string | null;
    transcriptWordCount?: number | null;
  } | null;
};

export function ClientsTable({ clients }: { clients: Client[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const total = clients.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const pageClients = clients.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  const handleNext = () => {
    setPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <section className="dashboard-table-section">
      <div className="dashboard-table-header-row">
        <h2 className="dashboard-card-title">Detalle de clientes</h2>
        <p className="dashboard-table-hint">
          {total} registros totales
        </p>
      </div>
      <div className="table-pagination">
        <div className="table-pagination-info">
          Mostrando{" "}
          {total === 0 ? 0 : startIndex + 1}–{startIndex + pageClients.length} de{" "}
          {total}
        </div>
        <div className="table-pagination-controls">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="table-pagination-button"
          >
            Anterior
          </button>
          <span className="table-pagination-current">
            Página {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="table-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>

      <div className="table-scroll-outer">
        <div className="dashboard-table-wrapper table-scroll-inner">
          <table className="dashboard-table">
            <thead>
              <tr>
                <Th>Cliente</Th>
                <Th>Vendedor</Th>
                <Th>Fecha reunión</Th>
                <Th>¿Cerró?</Th>
                <Th>Industria</Th>
                <Th>Lead source</Th>
                <Th>Engagement</Th>
                <Th>Volumen</Th>
                <Th>Objetivo principal</Th>
                <Th>Largo Transcripción</Th>
              </tr>
            </thead>
            <tbody>
              {pageClients.map((c) => (
                <tr key={c.id} className="dashboard-row">
                  <Td className="font-medium">{c.name}</Td>
                  <Td>{c.salesRep}</Td>
                  <Td>
                    {new Date(c.meetingDate).toISOString().slice(0, 10)}
                  </Td>
                  <Td>
                    <span
                      className={
                        c.closed
                          ? "status-pill status-pill--closed"
                          : "status-pill status-pill--open"
                      }
                    >
                      {c.closed ? "✅ Sí" : "❌ No"}
                    </span>
                  </Td>
                  <Td>{c.insight?.industry ?? "—"}</Td>
                  <Td>{c.insight?.leadSource ?? "—"}</Td>
                  <Td>{c.insight?.engagementScore ?? "—"}</Td>
                  <Td>{c.insight?.interactionVolumeRaw ?? "—"}</Td>
                  <Td className="max-w-xs truncate">
                    {c.insight?.mainGoal ?? "—"}
                  </Td>
                  {/* <Td className="max-w-sm truncate">
                    {Array.isArray(c.insight?.topKeywords)
                      ? (c.insight!.topKeywords as string[]).join(", ")
                      : "—"}
                  </Td> */}
                  <Td className="max-w-xs truncate">
                    {c.insight?.transcriptWordCount ?? "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controles de paginación */}
      <div className="table-pagination">
        <div className="table-pagination-info">
          Mostrando{" "}
          {total === 0 ? 0 : startIndex + 1}–{startIndex + pageClients.length} de{" "}
          {total}
        </div>
        <div className="table-pagination-controls">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="table-pagination-button"
          >
            Anterior
          </button>
          <span className="table-pagination-current">
            Página {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="table-pagination-button"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="dashboard-th">{children}</th>;
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`dashboard-td ${className ?? ""}`}>{children}</td>;
}
