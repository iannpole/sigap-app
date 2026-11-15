"use client";

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
  `flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
    on ? "bg-brand text-white" : "bg-[var(--panel)] text-[var(--tinta)] hover:bg-[var(--mist)]"
  }`;

export default function CategoryTabs({ kategori, colors, filter, counts, onKategori, onSub }: Props) {
  const active = kategori.find((k) => k.id === filter.kategoriId) ?? null;
  const subs = active ? active.subKategori : kategori.flatMap((k) => k.subKategori);

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
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[k.id] }} aria-hidden="true" />
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
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold ${filter.subKategoriId === null ? "bg-mint text-ink" : "bg-[var(--panel)] text-[var(--tinta)]"}`}
          >
            Semua
          </button>
          {subs.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={filter.subKategoriId === s.id}
              onClick={() => onSub(s.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold ${filter.subKategoriId === s.id ? "bg-mint text-ink" : "bg-[var(--panel)] text-[var(--tinta)]"}`}
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
