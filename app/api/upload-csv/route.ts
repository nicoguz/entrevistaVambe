// app/api/upload-csv/route.ts
import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import prisma from "@/lib/prisma";

// helper para leer columnas con nombres distintos (por si vienen en español)
function getField(row: Record<string, string>, options: string[]) {
  for (const key of options) {
    if (key in row && row[key] !== undefined) {
      return row[key];
    }
  }
  return undefined;
}

function parseDate(value: string | undefined): Date {
  if (!value) return new Date();
  return new Date(value);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No se recibió archivo 'file' en el formulario" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const text = buffer.toString("utf-8");

    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    let createdCount = 0;

    for (const row of records) {
      const name = row["Nombre"];
      const email = row["Correo Electronico"];
      const phone = row["Numero de Telefono"];
      const salesRep = row["Vendedor asignado"];
      const meetingDateStr = row["Fecha de la Reunion"];
      const closedStr = row["closed"];
      const transcript = row["Transcripcion"];

      if (!name || !email || !salesRep || !meetingDateStr || !closedStr || !transcript) {
        // podrías loguear los rows inválidos
        console.warn("Fila inválida, faltan campos requeridos:", row);
        continue;
      }

      const meetingDate = parseDate(meetingDateStr);
      const closed = Number(closedStr) === 1;

      await prisma.client.create({
        data: {
          name,
          email,
          phone: phone ?? null,
          salesRep,
          meetingDate,
          closed,
          transcript,
          // insight lo llenaremos después con el LLM
        },
      });

      createdCount++;
    }

    return NextResponse.json({
      ok: true,
      created: createdCount,
      totalRows: records.length,
    });
  } catch (error) {
    console.error("Error procesando CSV:", error);
    return NextResponse.json(
      { error: "Error al procesar el CSV" },
      { status: 500 }
    );
  }
}
