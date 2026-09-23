"use client";

import { useState } from "react";
import { Menu, MapPinned, Siren, User, X } from "lucide-react";
import { useHello } from "./Toast";

const NAV = ["Beranda", "Peta", "Layanan", "Tentang"];

export default function Header() {
  const hello = useHello();
  const [active, setActive] = useState("Beranda");
  const [open, setOpen] = useState(false);

  const go = (label: string) => {
    setActive(label);
    setOpen(false);
    hello();
  };

  return (
    <header className="sticky top-0 z-[1500] border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <button onClick={hello} className="flex items-center gap-3 text-left">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-black/5 bg-mist text-brand shadow-card">
            <MapPinned size={20} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold tracking-tight">SEHAT &amp; REFRESH TANGSEL</span>
            <span className="hidden text-[11px] text-slate-600 sm:block">Sistem Informasi Geografis Kesehatan &amp; Rekreasi</span>
          </span>
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {NAV.map((n) => (
            <button
              key={n}
              onClick={() => go(n)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                active === n ? "bg-ink text-white" : "text-slate-700 hover:bg-mist"
              }`}
            >
              {n}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={hello}
            className="flex items-center gap-2 rounded-xl bg-alert px-3 py-2.5 text-xs font-extrabold tracking-wide text-white shadow-card transition hover:brightness-110 md:px-4 md:text-sm"
          >
            <Siren size={16} />
            DARURAT 119
          </button>
          <button onClick={hello} className="hidden text-sm font-bold text-brand lg:block">
            Portal Admin
          </button>
          <button
            onClick={hello}
            aria-label="Profil"
            className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white shadow-card"
          >
            <User size={18} />
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-black/5 bg-white px-4 py-3 md:hidden">
          {NAV.map((n) => (
            <button
              key={n}
              onClick={() => go(n)}
              className={`rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                active === n ? "bg-ink text-white" : "text-slate-700"
              }`}
            >
              {n}
            </button>
          ))}
          <button onClick={() => go("Portal Admin")} className="rounded-xl px-4 py-3 text-left text-sm font-bold text-brand">
            Portal Admin
          </button>
        </nav>
      )}
    </header>
  );
}