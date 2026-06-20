"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/gastos", label: "Gastos" },
  { href: "/ingresos", label: "Ingresos" },
  { href: "/importar", label: "Importar CSV" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-bold text-sky-600 text-lg">💰 FDP</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm font-medium transition-colors ${
              path === l.href
                ? "text-sky-600 border-b-2 border-sky-600 pb-0.5"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
