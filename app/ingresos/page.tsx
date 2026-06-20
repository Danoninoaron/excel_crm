"use client";
import { useEffect, useState } from "react";

const CONCEPTOS = ["Trabajo", "Dietas", "Extras"];

type Ingreso = { id: number; concepto: string; importe: number; mes: number; anio: number };

function fmt(n: number) {
  return new Intl.NumberFormat("es-CH", { style: "currency", currency: "CHF" }).format(n);
}

export default function IngresosPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [form, setForm] = useState({ concepto: "Trabajo", importe: "" });

  const load = () => {
    fetch(`/api/ingresos?mes=${mes}&anio=${anio}`)
      .then((r) => r.json())
      .then(setIngresos);
  };

  useEffect(() => { load(); }, [mes, anio]);

  const del = async (id: number) => {
    await fetch(`/api/ingresos?id=${id}`, { method: "DELETE" });
    setIngresos((p) => p.filter((x) => x.id !== id));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/ingresos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, importe: Number(form.importe), mes, anio }),
    });
    setForm({ concepto: "Trabajo", importe: "" });
    load();
  };

  const total = ingresos.reduce((s, i) => s + i.importe, 0);
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ingresos</h1>

      <div className="flex gap-2 mb-6">
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white">
          {meses.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white">
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Registrar ingreso</h2>
        <form onSubmit={submit} className="flex gap-3">
          <select value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white flex-1">
            {CONCEPTOS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input required type="number" step="0.01" placeholder="Importe CHF" value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-40" />
          <button type="submit"
            className="bg-green-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-green-700 transition-colors">
            Añadir
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Concepto</th>
              <th className="px-4 py-3 text-right">Importe CHF</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((i) => (
              <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-700">{i.concepto}</td>
                <td className="px-4 py-3 text-right text-green-600 font-semibold">{fmt(i.importe)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => del(i.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </td>
              </tr>
            ))}
            {ingresos.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Sin ingresos este mes</td></tr>
            )}
            {ingresos.length > 0 && (
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-4 py-3 font-bold text-gray-700">Total</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">{fmt(total)}</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
