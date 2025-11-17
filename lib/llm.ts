// lib/llm.ts
import { GoogleGenAI } from "@google/genai";

const systemPrompt = `
Eres un analista de ventas B2B.

Dada la transcripción de una conversación con un potencial cliente,
extrae SOLO la información que esté explícita o sea razonable inferir
directamente del texto. No inventes detalles que no estén soportados.

Debes responder ÚNICAMENTE con un JSON válido. 
NO uses bloques de código, NO uses markdown, 
NO uses backticks, NO pongas \`\`\`json, 
NO agregues texto antes ni después del JSON.

El JSON debe tener exactamente este esquema:

{
  "industry": "string o null",
  "useCase": ["string"],                        // lista corta, frases como "automatizar consultas repetitivas"
  "primaryPainPoints": ["string"],              // problemas principales que el cliente describe
  "sentiment": "NEGATIVO" | "NEUTRO" | "POSITIVO",
  "productFamiliarity": "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN",
  "leadSource": "string o null",                // cómo conoció Vambe (webinar, conferencia, google, amigo, etc.)
  "mainGoal": "string o null",                    // objetivo principal al contratar Vambe
  "engagementScore": 1,                           // número de 1 a 5 según qué tan interesado/comprometido se muestra
  "interactionVolumeRaw": "string o null"         // frase del tipo "500 interacciones semanales", o null si no se menciona
  "interactionVolumeLevel": "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN" // nivel de volumen de interacciones
}

Si un campo no es claro, usa null o "unknown".
NO agregues comentarios, explicaciones ni texto alrededor.
Tu salida debe ser SOLO JSON válido.
`;

function extractJson(raw: string): string {
  // 1) Quitar backticks/bloques de código si vienen
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // 2) Buscar el primer "{" y el último "}"
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No se encontró un objeto JSON válido en la respuesta del LLM");
  }

  return cleaned.slice(start, end + 1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function classifyTranscript(transcript: string) {
  const result = await genAI.models.generateContent(
      {
        model: "gemini-2.5-flash",
        contents: transcript,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0,
        },
      }
    );

  const raw = result.text?.trim() ?? "{}";

  try {
    const classification = JSON.parse(extractJson(raw));
    return {
      industry: classification.industry ?? null,
      useCase: classification.useCase ?? [],
      primaryPainPoints: classification.primaryPainPoints ?? [],
      sentiment: classification.sentiment ?? "NEUTRO",
      productFamiliarity: classification.productFamiliarity ?? "UNKNOWN",
      leadSource: classification.leadSource ?? null,
      mainGoal: classification.mainGoal ?? null,
      engagementScore: classification.engagementScore ?? null,
      interactionVolumeRaw: classification.interactionVolumeRaw ?? null,
      interactionVolumeLevel: classification.interactionVolumeLevel ?? "UNKNOWN",
    }
  } catch (err) {
    console.error("❌ Error parseando JSON del LLM:\n", raw);
    return null;
  }
}
