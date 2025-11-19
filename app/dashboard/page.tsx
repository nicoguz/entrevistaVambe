// app/dashboard/page.tsx
import prisma from "@/lib/prisma";
import { normalizeIndustry, normalizeLeadSource, categorizeGoal } from "@/lib/analysis";
import "@/app/globals.css";
import NavBar from "@/app/components/navbar";
import {
  IndustryChart,
  FamiliarityChart,
  MeetingLengthChart,
  InteractionVolumeChart,
  MainGoalChart,
  LeadSourceChart
} from "./components/Charts";
import { ClientsTable } from "./components/ClientsTable";

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
  
  // --- Gráfico 1: Ventas por industria ---
  const industryChartData = [...industries.entries()].map(([industry, total]) => {
    const closed = clients.filter(c => normalizeIndustry(c.insight?.industry || "Otro") === industry && c.closed).length;

    return { industry, total, closed };
  });

  // --- Gráfico 2: Lead source ---
  const leadSourceChartData = [...leadSources.entries()].map(
    ([leadSource, total]) => {
      const closed = clients.filter(
        (c) =>
          c.closed &&
          normalizeLeadSource(c.insight?.leadSource || "Otro") === leadSource
      ).length;

      return {
        leadSource,
        total,
        closed,
      };
    }
  );

  // --- Gráfico 3: Ventas por familiaridad ---
  const familiarityCounts = new Map<string, { total: number; closed: number }>();

  for (const c of clients) {
    const fam = c.insight?.productFamiliarity || "unknown";
    const current = familiarityCounts.get(fam) ?? { total: 0, closed: 0 };
    current.total += 1;
    if (c.closed) current.closed += 1;
    familiarityCounts.set(fam, current);
  }

  const orderedLevels = ["UNKNOWN", "LOW", "MEDIUM", "HIGH"];
  const familiarityChartData = [...familiarityCounts.entries()].map(
    ([familiarity, { total, closed }]) => ({
      familiarity,
      total,
      closed,
    })
  ).sort(
    (a, b) =>
      orderedLevels.indexOf(a.familiarity.toUpperCase()) -
      orderedLevels.indexOf(b.familiarity.toUpperCase())
  );

  // --- Gráfico 4: Largo de reunión vs cierre ---
  const meetingLengthData = clients.map(c => ({
    words: c.insight?.transcriptWordCount ?? 0,
    closed: c.closed ? 1 : 0,
  })).sort((a, b) => a.words - b.words);

  // --- Gráfico 5: Volumen de interacciones ---
  const volumeCounts = new Map<string, { total: number; closed: number }>();

  for (const c of clients) {
    const vol = c.insight?.interactionVolumeLevel || "UNKNOWN";
    const current = volumeCounts.get(vol) ?? { total: 0, closed: 0 };
    current.total++;
    if (c.closed) current.closed++;
    volumeCounts.set(vol, current);
  }

  const interactionVolumeChartData = [...volumeCounts.entries()].map(
    ([volume, { total, closed }]) => ({
      volume,
      total,
      closed,
    })
  ).sort(
    (a, b) =>
      orderedLevels.indexOf(a.volume.toUpperCase()) -
      orderedLevels.indexOf(b.volume.toUpperCase())
  );;

  // --- Gráfico 6: Objetivos principales agrupados ---
  const goalCounts = new Map<string, number>();

  for (const c of clients) {
    const rawGoal = c.insight?.mainGoal;
    if (!rawGoal) continue;

    const category = categorizeGoal(rawGoal);
    goalCounts.set(category, (goalCounts.get(category) ?? 0) + 1);
  }

  const mainGoalChartData = [...goalCounts.entries()].map(
    ([category, count]) => ({
      category,
      count
    })
  );

  // Ordenar industrias (descendente por cantidad)
  const sortedIndustries = [...industries.entries()]
    .sort((a, b) => b[1] - a[1]);

  // Ordenar leadSources (descendente por cantidad)
  const sortedLeadSources = [...leadSources.entries()]
    .sort((a, b) => b[1] - a[1]);

  return (
    <main className="dashboard-main">
      <NavBar />
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
          <KpiCard label="N° de clientes" value={totalClients} />
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

      {/* Gráficos */}
      <section className="dashboard-graphs">
        <IndustryChart data={industryChartData} />
        <LeadSourceChart data={leadSourceChartData} />
        <FamiliarityChart data={familiarityChartData} />
        <MeetingLengthChart data={meetingLengthData} />
        <InteractionVolumeChart data={interactionVolumeChartData} />
        <MainGoalChart data={mainGoalChartData} />
      </section>

      {/* Tabla detalle */}
      <ClientsTable clients={clients as any} />
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
