"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Counts, Filter, Kategori } from "@/lib/types";

interface Props {
  kategori: Kategori[];
  colors: Record<number, string>;
  filter: Filter;
  counts: Counts;
  onKategori: (id: number | null) => void;
  onSub: (id: number | null) => void;
}

export default function LeftPanel({ kategori, colors, filter, counts, onKategori, onSub }: Props) {
  const [open, setOpen] = useState(false);

  const row = (active: boolean) =>
    `flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
      active ? "bg-ink text-white" : "hover:bg-[var(--mist)]"
    }`;

  return (
    <>
      <div className="absolute inset-y-0 left-0 z-[1000] hidden w-3 md:block" onMouseEnter={() => setOpen(true)} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="absolute left-4 top-4 z-[1001] flex items-center gap-2 rounded-full bg-[var(--panel)] px-4 py-2.5 text-xs font-bold text-[var(--tinta)] shadow-soft"
      >
        {open ? <X size={14} /> : <SlidersHorizontal size={14} />}
        Filter
      </button>

      <aside
        onMouseLeave={() => setOpen(false)}
        className={`absolute bottom-4 left-4 top-16 z-[1001] w-[280px] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl bg-[var(--panel)]/95 p-3 text-[var(--tinta)] shadow-soft backdrop-blur transition-transform duration-300 ${
          open ? "translate-x-0" : "pointer-events-none -translate-x-[115%]"
        }`}
      >
        <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--abu)]">Kategori</p>

        <button type="button" onClick={() => onKategori(null)} className={row(filter.kategoriId === null)}>
          <span>Semua</span>
          <span className="text-xs opacity-80">{counts.all}</span>
        </button>

        {kategori.map((k) => {
          const active = filter.kategoriId === k.id;
          return (
            <div key={k.id} className="mt-2">
              <button type="button" onClick={() => onKategori(k.id)} className={row(active && filter.subKategoriId === null)}>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[k.id] }} aria-hidden="true" />
                  {k.namaKategori}
                </span>
                <span className="text-xs opacity-80">{counts.kategori[k.id] ?? 0}</span>
              </button>
              {k.subKategori.length > 0 && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-black/10 pl-2">
                  {k.subKategori.map((s) => {
                    const on = filter.subKategoriId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSub(s.id)}
                        aria-pressed={on}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                          on ? "bg-mint font-bold text-ink" : "hover:bg-[var(--mist)]"
                        }`}
                      >
                        <span>{s.namaSubKategori}</span>
                        <span className="text-[var(--abu)]">{counts.sub[s.id] ?? 0}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </aside>
    </>
  );
}
