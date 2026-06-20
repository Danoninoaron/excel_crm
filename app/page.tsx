"use client";
import { useEffect, useState } from "react";

const CATEGORIAS = ["Básicos", "Ahorro", "Ocio", "Extras", "Transporte", "Salud", "Suscripciones"];

type DashboardData = {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  porCategoria: Record<string, number>;
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 2 }).format(n);
}

export default function DashboardPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/${anio}-${String(mes).padStart(2, "0")}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [mes, anio]);

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex gap-2 items-center">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
          >
            {meses.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando…</p>}

      {data && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card label="Ingresos" value={fmt(data.totalIngresos)} color="text-green-600" />
            <Card label="Gastos" value={fmt(data.totalGastos)} color="text-red-500" />
            <Card
              label="Balance"
              value={fmt(data.balance)}
              color={data.balance >= 0 ? "text-sky-600" : "text-red-600"}
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mb-3">Por categoría</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Total CHF</th>
                  <th className="px-4 py-3 text-right">% Gastos</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS.filter((c) => (data.porCategoria[c] ?? 0) > 0).map((cat) => (
                  <tr key={cat} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{cat}</td>
                    <td className="px-4 py-3 text-right text-gray-800">{fmt(data.porCategoria[cat] ?? 0)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {data.totalGastos > 0
                        ? ((data.porCategoria[cat] / data.totalGastos) * 100).toFixed(1) + "%"
                        : "—"}
                    </td>
                  </tr>
                ))}
                {CATEGORIAS.every((c) => !data.porCategoria[c]) && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">Sin gastos este mes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
