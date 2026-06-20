import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rows: Array<{
    concepto: string;
    coste: string | number;
    moneda: string;
    fecha: string;
    tema: string;
    eurChf: string | number;
    costeChf: string | number;
  }> = body.rows;

  if (!rows || !Array.isArray(rows)) {
    return NextResponse.json({ error: "rows requerido" }, { status: 400 });
  }

  const created = await prisma.gasto.createMany({
    data: rows.map((r) => ({
      concepto: String(r.concepto ?? ""),
      coste: Number(r.coste) || 0,
      moneda: String(r.moneda ?? "CHF"),
      fecha: new Date(r.fecha),
      tema: String(r.tema ?? "Extras"),
      eurChf: Number(r.eurChf) || 1,
      costeChf: Number(r.costeChf) || 0,
    })),
    skipDuplicates: false,
  });

  return NextResponse.json({ imported: created.count }, { status: 201 });
}
