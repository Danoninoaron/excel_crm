import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes") ? Number(searchParams.get("mes")) : undefined;
  const anio = searchParams.get("anio") ? Number(searchParams.get("anio")) : undefined;

  const where: Record<string, unknown> = {};
  if (mes) where.mes = mes;
  if (anio) where.anio = anio;

  const ingresos = await prisma.ingreso.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(ingresos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ingreso = await prisma.ingreso.create({
    data: {
      concepto: body.concepto,
      importe: Number(body.importe),
      mes: Number(body.mes),
      anio: Number(body.anio),
    },
  });
  return NextResponse.json(ingreso, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await prisma.ingreso.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
