"use client";

import IkonBrick from "@/components/beranda/IkonBrick";
import type { Counts, Filter, Kategori } from "@/lib/types";

interface Props {
  kategori: Kategori[];
  colors: Record<number, string>;
  filter: Filter;
  counts: Counts;
  onKategori: (id: number | null) => void;
  onSub: (id: number | null) => void;
}

const chip = (on: boolean) =>
  `flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] ${
    on ? "bg-brand text-white" : "bg-[var(--panel)] text-[var(--tinta)] hover:bg-[var(--mist)]"
  }`;

const ikonKategori = (nama: string) => {
  const key = nama.toLowerCase();
  return ["kesehatan", "keamanan", "olahraga", "hiburan"].includes(key) ? key : "kategori";
};

export default function CategoryTabs({ kategori, colors, filter, counts, onKategori, onSub }: Props) {
  const active = kategori.find((k) => k.id === filter.kategoriId) ?? null;
  const subs = active?.subKategori.filter((s) => (counts.sub[s.id] ?? 0) > 0) ?? [];

  return (
    <section className="space-y-4" aria-label="Kategori layanan">
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        <button type="button" aria-pressed={filter.kategoriId === null} onClick={() => onKategori(null)} className={chip(filter.kategoriId === null)}>
          Semua
          <span className="text-xs opacity-80">{counts.all}</span>
        </button>
        {kategori.map((k) => (
          <button
            key={k.id}
            type="button"
            aria-pressed={filter.kategoriId === k.id}
            onClick={() => onKategori(k.id)}
            className={chip(filter.kategoriId === k.id)}
            style={filter.kategoriId === k.id ? { backgroundColor: colors[k.id] } : undefined}
          >
            <span className="grid h-6 w-6 place-items-center rounded border border-current" style={{ color: filter.kategoriId === k.id ? "currentColor" : colors[k.id] }} aria-hidden="true">
              <IkonBrick ikon={ikonKategori(k.namaKategori)} size={15} />
            </span>
            {k.namaKategori}
            <span className="text-xs opacity-80">{counts.kategori[k.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {subs.length > 0 && (
        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          <span className="shrink-0 pr-2 text-xs font-bold text-[var(--abu)]">Subkategori</span>
          <button
            type="button"
            aria-pressed={filter.subKategoriId === null}
            onClick={() => onSub(null)}
            className={`min-h-11 shrink-0 rounded-lg px-4 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] ${filter.subKategoriId === null ? "bg-mint text-ink" : "bg-[var(--panel)] text-[var(--tinta)]"}`}
          >
            Semua
          </button>
          {subs.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={filter.subKategoriId === s.id}
              onClick={() => onSub(s.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] ${filter.subKategoriId === s.id ? "bg-mint text-ink" : "bg-[var(--panel)] text-[var(--tinta)]"}`}
            >
              {s.namaSubKategori}
              <span className="text-[11px] font-semibold text-[var(--abu)]">{counts.sub[s.id] ?? 0}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
