import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { ym: string } }) {
  const [anio, mes] = params.ym.split("-").map(Number);
  const start = new Date(anio, mes - 1, 1);
  const end = new Date(anio, mes, 1);

  const [gastos, ingresos] = await Promise.all([
    prisma.gasto.findMany({ where: { fecha: { gte: start, lt: end } } }),
    prisma.ingreso.findMany({ where: { mes, anio } }),
  ]);

  const totalGastos = gastos.reduce((s, g) => s + g.costeChf, 0);
  const totalIngresos = ingresos.reduce((s, i) => s + i.importe, 0);
  const porCategoria: Record<string, number> = {};
  for (const g of gastos) {
    porCategoria[g.tema] = (porCategoria[g.tema] ?? 0) + g.costeChf;
  }

  return NextResponse.json({ totalGastos, totalIngresos, balance: totalIngresos - totalGastos, porCategoria });
}
