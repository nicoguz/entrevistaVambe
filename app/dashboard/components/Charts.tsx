"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";

export function IndustryChart({ data }: { data: any[] }) {
  return (
    <div className="chart-card industry-chart">
      <h3 className="chart-title">Ventas por Industria</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="industry" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#93c5fd" name="Reuniones Totales" />
          <Bar dataKey="closed" fill="#2563eb" name="Ventas Cerradas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadSourceChart({ data }: { data: any[] }) {
  return (
    <div className="chart-card lead-source-chart">
      <h3 className="chart-title">Ventas por Canal de Origen</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="leadSource" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill="#93c5fd" name="Reuniones Totales" />
          <Bar dataKey="closed" fill="#2563eb" name="Ventas Cerradas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


export function FamiliarityChart({ data }: { data: any[] }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Ventas por Familiaridad</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="familiarity"
            label={{
              value: "Nivel de familiaridad",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: "Ventas cerradas",
              angle: -90,
              position: "insideLeft",
              textAnchor: "middle",
              offset: 10,
            }}
          />
          <Tooltip />
          <Bar dataKey="closed" fill="#22c55e" name="Ventas Cerradas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MeetingLengthChart({
  data,
}: {
  data: { words: number; closed: number }[];
}) {
  // --- Ordenar por eje X para evitar ruido visual ---
  const sorted = [...data].sort((a, b) => a.words - b.words);

  // --- Calcular regresión lineal ---
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  sorted.forEach((d) => {
    sumX += d.words;
    sumY += d.closed;
    sumXY += d.words * d.closed;
    sumXX += d.words * d.words;
  });

  const n = sorted.length;
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = sumY / n - (m * sumX) / n;

  // --- Puntos de tendencia ---
  const xMin = sorted[0]?.words ?? 0;
  const xMax = sorted[sorted.length - 1]?.words ?? 1;

  const trendLineData = [
    { words: xMin, trend: m * xMin + b },
    { words: xMax, trend: m * xMax + b },
  ];

  return (
    <div className="chart-card meeting-length-chart">
      <h3 className="chart-title">Relación entre largo de reunión y cierre</h3>

      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

          <XAxis
            dataKey="words"
            type="number"
            domain={["auto", "auto"]}
            label={{
              value: "Cantidad de palabras en la reunión",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis
            dataKey="closed"
            type="number"
            domain={[0, 1]}
            ticks={[0, 1]}
            label={{
              value: "Venta cerrada",
              angle: -90,
              position: "insideLeft",
              textAnchor: "middle",
              offset: 10,
            }}
          />

          <Tooltip cursor={{ stroke: "#22c55e", strokeWidth: 1 }} />

          <Scatter data={sorted} fill="#2563eb" name="Reuniones" />

          {/* Línea de tendencia */}
          <Line
            type="linear"
            dataKey="trend"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={false}
            data={trendLineData}
            name="Tendencia"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InteractionVolumeChart({ data }: { data: any[] }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Ventas por Volumen de Interacciones</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="volume"
            label={{
              value: "Volumen de interacciones",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: "Ventas cerradas",
              angle: -90,
              position: "insideLeft",
              textAnchor: "middle",
              offset: 10,
            }}
          />
          <Tooltip />
          <Bar dataKey="closed" fill="#2563eb" name="Ventas Cerradas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MainGoalChart({ data }: { data: any[] }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Objetivos Principales (Agrupados)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 40, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis type="number" />
          <YAxis type="category" dataKey="category" width={130} />
          <Tooltip />
          <Bar dataKey="count" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}