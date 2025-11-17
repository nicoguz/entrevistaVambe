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
