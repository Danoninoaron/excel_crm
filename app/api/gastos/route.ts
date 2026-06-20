import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes") ? Number(searchParams.get("mes")) : null;
  const anio = searchParams.get("anio") ? Number(searchParams.get("anio")) : null;
  const tema = searchParams.get("tema") ?? undefined;

  const where: Record<string, unknown> = {};
  if (mes && anio) {
    where.fecha = { gte: new Date(anio, mes - 1, 1), lt: new Date(anio, mes, 1) };
  }
  if (tema) where.tema = tema;

  const gastos = await prisma.gasto.findMany({ where, orderBy: { fecha: "desc" } });
  return NextResponse.json(gastos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const gasto = await prisma.gasto.create({
    data: {
      concepto: body.concepto,
      coste: Number(body.coste),
      moneda: body.moneda ?? "CHF",
      fecha: new Date(body.fecha),
      tema: body.tema,
      eurChf: Number(body.eurChf ?? 1),
      costeChf: Number(body.costeChf),
    },
  });
  return NextResponse.json(gasto, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await prisma.gasto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
