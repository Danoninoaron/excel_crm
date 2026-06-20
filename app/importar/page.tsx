"use client";
import { useState } from "react";

type ParsedRow = {
  concepto: string;
  coste: number;
  moneda: string;
  fecha: string;
  tema: string;
  eurChf: number;
  costeChf: number;
};

export default function ImportarPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file, "utf-8");
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) { setStatus("CSV vacío o sin datos"); return; }
    const header = lines[0].split(";").map((h) => h.trim().toLowerCase().replace(/\r/g, ""));
    const idx = (name: string) => header.findIndex((h) => h.includes(name));
    const iConcepto = idx("concepto");
    const iCoste = idx("coste");
    const iMoneda = idx("moneda");
    const iFecha = idx("fecha");
    const iTema = idx("tema");
    const iEurChf = header.findIndex((h) => h === "eur/chf" || h === "eurochf" || h.includes("eur/chf"));
    const iCosteChf = header.findIndex((h) => h.includes("coste chf") || h.includes("costechf") || (h.includes("chf") && h !== "moneda"));

    const parsed: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(";").map((c) => c.trim().replace(/\r/g, "").replace(/"/g, ""));
      if (cols.every((c) => !c)) continue;
      const fechaRaw = cols[iFecha] ?? "";
      let fecha = fechaRaw;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaRaw)) {
        const [d, m, y] = fechaRaw.split("/");
        fecha = `${y}-${m}-${d}`;
      } else if (/^\d{2}-\d{2}-\d{4}$/.test(fechaRaw)) {
        const [d, m, y] = fechaRaw.split("-");
        fecha = `${y}-${m}-${d}`;
      }
      parsed.push({
        concepto: cols[iConcepto] ?? "",
        coste: parseFloat((cols[iCoste] ?? "0").replace(",", ".")) || 0,
        moneda: cols[iMoneda] ?? "CHF",
        fecha,
        tema: cols[iTema] ?? "Extras",
        eurChf: iEurChf >= 0 ? parseFloat((cols[iEurChf] ?? "1").replace(",", ".")) || 1 : 1,
        costeChf: iCosteChf >= 0 ? parseFloat((cols[iCosteChf] ?? "0").replace(",", ".")) || 0 : 0,
      });
    }
    setRows(parsed);
    setStatus(`${parsed.length} filas parseadas — revisa y confirma`);
  };

  const importar = async () => {
    setImporting(true);
    const res = await fetch("/api/importar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    setStatus(`✅ ${data.imported} gastos importados`);
    setRows([]);
    setImporting(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Importar CSV</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-500 mb-4">
          Formato esperado (separado por <code className="bg-gray-100 px-1 rounded">;</code>):<br />
          <span className="font-mono text-xs text-gray-600">Concepto; Coste; Moneda; Fecha; Tema; EUR/CHF; Coste CHF</span>
        </p>
        <input type="file" accept=".csv,.txt" onChange={onFile}
          className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer" />
      </div>

      {status && (
        <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${status.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
          {status}
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-auto mb-4 max-h-80">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Concepto</th>
                  <th className="px-3 py-2 text-right">Coste</th>
                  <th className="px-3 py-2 text-left">Moneda</th>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Categoría</th>
                  <th className="px-3 py-2 text-right">CHF</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-1.5">{r.concepto}</td>
                    <td className="px-3 py-1.5 text-right">{r.coste}</td>
                    <td className="px-3 py-1.5">{r.moneda}</td>
                    <td className="px-3 py-1.5">{r.fecha}</td>
                    <td className="px-3 py-1.5">{r.tema}</td>
                    <td className="px-3 py-1.5 text-right font-medium">{r.costeChf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={importar} disabled={importing}
            className="bg-sky-600 text-white rounded-md px-5 py-2 text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors">
            {importing ? "Importando…" : `Importar ${rows.length} gastos`}
          </button>
        </>
      )}
    </div>
  );
}
