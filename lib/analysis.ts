// lib/analysis.ts
export function getTranscriptWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function getTopKeywords(text: string, topN = 10) {
  const stopwords = new Set([
    "el","la","los","las","de","y","que","a","en","lo","un","una","por",
    "con","se","para","del","al","es","su","sus","le","les"
  ]);

  const counts: Record<string, number> = {};

  text
    .toLowerCase()
    .replace(/[^a-záéíóúüñ0-9\s]/gi, "")
    .split(/\s+/)
    .forEach((word) => {
      if (!stopwords.has(word) && word.length > 2) {
        counts[word] = (counts[word] ?? 0) + 1;
      }
    });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
}

export function normalizeIndustry(raw: string): string {
  const text = raw.toLowerCase();

  if (
    text.includes("financ")
    || text.includes("banca")
  ) return "Finanzas";

  if (
    text.includes("salud")
    || text.includes("clinic")
    || text.includes("clínic")
    || text.includes("medic")
    || text.includes("odonto")
  ) return "Salud";

  if (text.includes("e-commerce") || text.includes("retail") || text.includes("tienda"))
    return "E-Commerce / Retail";

  if (text.includes("logist") || text.includes("logíst")) return "Logística";

  if (text.includes("viajes") || text.includes("turismo")) return "Turismo";

  if (text.includes("tecno") || text.includes("software")) return "Tecnología";

  if (text.includes("educ")) return "Educación";

  if (text.includes("legal") || text.includes("jurid")) return "Legal";

  if (
    text.includes("belleza")
    || text.includes("cosméti")
    || text.includes("fashion")
  ) return "Estética";

  if (
    text.includes("catering")
    || text.includes("restaurant")
    || text.includes("pastel")
  ) return "Alimentos";

  if (
    text.includes("consult")
    // || text.includes("restaurant")
    // || text.includes("pastel")
  ) return "Consultorías";

  return "Otros";
}

export function normalizeLeadSource(raw: string): string {
  const t = raw.toLowerCase();

  if (t.includes("google") || t.includes("búsqueda") || t.includes("online") || t.includes("linea") || t.includes("linkedin"))
    return "Búsqueda web / Online";

  if (
    t.includes("conferencia")
    || t.includes("seminario")
    || t.includes("charla")
    || t.includes("webinar")
    || t.includes("evento")
    || t.includes("feria")
    || t.includes("taller")
    || t.includes("conferen")
  ) {
    return "Evento";
  }

  if (t.includes("artículo") || t.includes("blog") || t.includes("foro"))
    return "Artículo / Blog";

  if (t.includes("podcast"))
    return "Podcast / Media";

  if (t.includes("amigo") || t.includes("colega") || t.includes("refer") || t.includes("recomenda"))
    return "Referencia";

  return raw;
}

export function categorizeGoal(goal: string): string {
  const g = goal.toLowerCase();

  if (g.includes("automat") || g.includes("tiempo") || g.includes("eficiencia") || g.includes("opti") || g.includes("agiliz"))
    return "Productividad / Automatización";

  if (g.includes("insight") || g.includes("anal") || g.includes("report"))
    return "Insights / Reporting";

  if (g.includes("venta") || g.includes("prospect") || g.includes("pipeline"))
    return "Ventas y Pipeline";

  if (g.includes("cliente") || g.includes("soporte"))
    return "Atención al Cliente / Soporte";

  if (g.includes("compet") || g.includes("benchmark"))
    return "Competencia / Benchmarking";

  return "Otro";
}