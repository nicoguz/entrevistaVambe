// app/dashboard/page.tsx
import prisma from "@/lib/prisma";
import { normalizeIndustry, normalizeLeadSource } from "@/lib/analysis";
import "@/app/globals.css";

export default async function DashboardPage() {
  const clients = await prisma.client.findMany({
    include: { insight: true },
    orderBy: { meetingDate: "asc" },
  });

  const totalClients = clients.length;
  const withInsights = clients.filter((c) => c.insight).length;
  const closedCount = clients.filter((c) => c.closed).length;
  const openCount = totalClients - closedCount;

  const avgEngagement =
    withInsights === 0
      ? 0
      : clients.reduce((sum, c) => sum + (c.insight?.engagementScore ?? 0), 0) /
        withInsights;

  const industries = new Map<string, number>();
  for (const c of clients) {
    const ind = normalizeIndustry(c.insight?.industry || "Otro");
    industries.set(ind, (industries.get(ind) ?? 0) + 1);
  }

  const leadSources = new Map<string, number>();
  for (const c of clients) {
    const src = normalizeLeadSource(c.insight?.leadSource || "Otro");
    leadSources.set(src, (leadSources.get(src) ?? 0) + 1);
  }

  // Ventas por vendedor
  const salesByRepMap = new Map<
    string,
    { total: number; closed: number }
  >();

  for (const c of clients) {
    const rep = c.salesRep || "Sin vendedor";
    const current = salesByRepMap.get(rep) ?? { total: 0, closed: 0 };
    current.total += 1;
    if (c.closed) current.closed += 1;
    salesByRepMap.set(rep, current);
  }

  const salesByRep = [...salesByRepMap.entries()]
    .map(([rep, { total, closed }]) => ({
      rep,
      total,
      closed,
      rate: total === 0 ? 0 : closed / total,
    }))
    .sort((a, b) => {
      // Ordenar por cantidad de cerradas y luego por tasa
      if (b.closed !== a.closed) return b.closed - a.closed;
      return b.rate - a.rate;
    });

  // Ordenar industrias (descendente por cantidad)
  const sortedIndustries = [...industries.entries()]
    .sort((a, b) => b[1] - a[1]);

  // Ordenar leadSources (descendente por cantidad)
  const sortedLeadSources = [...leadSources.entries()]
    .sort((a, b) => b[1] - a[1]);

  return (
    <main className="dashboard-main">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard de clientes</h1>
          <p className="dashboard-subtitle">
            Resumen de clientes procesados a partir de transcripciones de reuniones de
            ventas.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <section className="kpi-section">
        <div className="kpi-grid">
          <KpiCard label="Total clientes" value={totalClients} />
          <KpiCard label="Clientes con insights" value={withInsights} />
          <KpiCard label="Ventas cerradas" value={closedCount} />
          <KpiCard label="Ventas no cerradas" value={openCount} />
          <KpiCard
            label="Engagement promedio"
            value={avgEngagement.toFixed(1)}
            helper="Escala 1 a 5"
          />
        </div>
      </section>

      {/* Distribuciones simples */}
      <section className="dashboard-categories">
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Clientes por industria</h2>
          <ul className="dashboard-list">
            {sortedIndustries.map(([ind, count]) => (
              <li key={ind} className="dashboard-list-item">
                <span className="dashboard-list-label">{ind}</span>
                <span className="dashboard-list-value">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Canal de origen (lead source)</h2>
          <ul className="dashboard-list">
            {sortedLeadSources.map(([src, count]) => (
              <li key={src} className="dashboard-list-item">
                <span className="dashboard-list-label">{src}</span>
                <span className="dashboard-list-value">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ventas cerradas por vendedor */}
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Ventas cerradas por vendedor</h2>
          <ul className="dashboard-list">
            {salesByRep.map(({ rep, total, closed, rate }) => (
              <li
                key={rep}
                className="dashboard-list-item dashboard-list-item--stacked"
              >
                <div className="dashboard-list-top">
                  <span className="dashboard-list-label">{rep}</span>
                  <span className="dashboard-list-value">
                    {closed} / {total} cerradas ({Math.round(rate * 100)}%)
                  </span>
                </div>
                <div className="dashboard-bar">
                  <div
                    className="dashboard-bar-fill"
                    style={{ width: `${Math.round(rate * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tabla detalle */}
      <section className="dashboard-table-section">
        <div className="dashboard-table-header-row">
          <h2 className="dashboard-card-title">Detalle de clientes</h2>
          <p className="dashboard-table-hint">
            {totalClients} registros totales · {withInsights} con insights
          </p>
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
                  <Th>Keywords</Th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="dashboard-row">
                    <Td className="font-medium">{c.name}</Td>
                    <Td>{c.salesRep}</Td>
                    <Td>{c.meetingDate.toISOString().slice(0, 10)}</Td>
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
                    <Td className="max-w-sm truncate">
                      {Array.isArray(c.insight?.topKeywords)
                        ? (c.insight!.topKeywords as string[]).join(", ")
                        : "—"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function KpiCard(props: {
  label: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{props.label}</div>
      <div className="kpi-value">{props.value}</div>
      {props.helper && <div className="kpi-helper">{props.helper}</div>}
    </div>
  );
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="dashboard-th">
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`dashboard-td ${className ?? ""}`}>
      {children}
    </td>
  );
}
