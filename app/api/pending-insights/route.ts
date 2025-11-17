// app/api/pending-insights/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const pendingClients = await prisma.client.findMany({
    where: { insight: null },
    select: { id: true },
  });

  return NextResponse.json({
    totalPending: pendingClients.length,
    clientIds: pendingClients.map((c) => c.id),
  });
}
