// app/api/process-insights/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTranscriptWordCount, getTopKeywords } from "@/lib/analysis";
import { classifyTranscript } from "@/lib/llm";

interface RouteParams {
  params: { id: string };
}

export async function POST() {
  // const clientId = Number(params.id);
  const clientId = 1;
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  console.log("Processing insights...");
  const clients = await prisma.client.findMany({
    where: { insight: null }
  });

  let processed = 0;

  for (const client of clients) {
    const { transcript } = client;

    const transcriptWordCount = getTranscriptWordCount(transcript);
    const topKeywords = getTopKeywords(transcript);

    const llmInsights = await classifyTranscript(transcript);

    if (!llmInsights) {
      console.error("LLM result is null, skipping client:", client.id);
      throw new Error("LLM result is null");
      // continue;
    }

    await prisma.clientInsight.create({
      data: {
        clientId: client.id,
        transcriptWordCount,
        topKeywords,
        ...llmInsights
      }
    });

    processed++;
  }

  return NextResponse.json({
    ok: true,
    processed,
    total: clients.length,
  });
}
