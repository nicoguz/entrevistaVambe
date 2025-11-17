// app/api/process-insights/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTranscriptWordCount, getTopKeywords } from "@/lib/analysis";
import { classifyTranscript } from "@/lib/llm";

interface RouteParams {
  params: { id: string };
}

export async function POST(_req: Request, { params }: RouteParams) {
  const clientId = Number(params.id);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  console.log("Processing insights...");
  const existing = await prisma.clientInsight.findUnique({
    where: { clientId },
  });

  if (existing) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

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

  return NextResponse.json({
    ok: true,
    processed: true,
  });
}
