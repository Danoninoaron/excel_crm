"use client";
import { useEffect, useState } from "react";

const CATEGORIAS = ["Básicos", "Ahorro", "Ocio", "Extras", "Transporte", "Salud", "Suscripciones"];
const MONEDAS = ["CHF", "EUR", "USD"];

type Gasto = {
  id: number;
  concepto: string;
  coste: number;
  moneda: string;
  fecha: string;
  tema: string;
  costeChf: number;
};

function fmt(n: number) {
  return n.toFixed(2);
}

export default function GastosPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [tema, setTema] = useState("");
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    concepto: "", coste: "", moneda: "CHF", fecha: now.toISOString().split("T")[0],
    tema: "Básicos", eurChf: "1", costeChf: "",
  });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ mes: String(mes), anio: String(anio) });
    if (tema) params.set("tema", tema);
    fetch(`/api/gastos?${params}`)
      .then((r) => r.json())
      .then((d) => { setGastos(d); setLoading(false); });
  };

  useEffect(() => { load(); }, [mes, anio, tema]);

  const del = async (id: number) => {
    await fetch(`/api/gastos?id=${id}`, { method: "DELETE" });
    setGastos((g) => g.filter((x) => x.id !== id));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chf = form.moneda === "CHF"
      ? Number(form.coste)
      : Number(form.coste) * Number(form.eurChf);
    await fetch("/api/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, costeChf: chf }),
    });
    setForm({ concepto: "", coste: "", moneda: "CHF", fecha: now.toISOString().split("T")[0], tema: "Básicos", eurChf: "1", costeChf: "" });
    load();
  };

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gastos</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Añadir gasto</h2>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <input required placeholder="Concepto" value={form.concepto}
            onChange={(e) => setForm({ ...form, concepto: e.target.value })}
            className="col-span-2 border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <input required type="number" step="0.01" placeholder="Coste" value={form.coste}
            onChange={(e) => setForm({ ...form, coste: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <select value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            {MONEDAS.map((m) => <option key={m}>{m}</option>)}
          </select>
          {form.moneda !== "CHF" && (
            <input type="number" step="0.0001" placeholder="Tipo cambio (ej: 0.93)" value={form.eurChf}
              onChange={(e) => setForm({ ...form, eurChf: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          )}
          <input required type="date" value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm" />
          <select value={form.tema} onChange={(e) => setForm({ ...form, tema: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white">
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button type="submit"
            className="col-span-2 bg-sky-600 text-white rounded-md py-2 text-sm font-medium hover:bg-sky-700 transition-colors">
            Añadir gasto
          </button>
        </form>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white">
          {meses.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select value={anio} onChange={(e) => setAnio(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white">
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={tema} onChange={(e) => setTema(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white">
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-400 py-8 text-sm">Cargando…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-right">Coste</th>
                <th className="px-4 py-3 text-right">CHF</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-500">{new Date(g.fecha).toLocaleDateString("es-ES")}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-700">{g.concepto}</td>
                  <td className="px-4 py-2.5">
                    <span className="bg-sky-50 text-sky-700 text-xs px-2 py-0.5 rounded-full">{g.tema}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{fmt(g.coste)} {g.moneda}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-800">{fmt(g.costeChf)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => del(g.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </td>
                </tr>
              ))}
              {gastos.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin gastos</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
