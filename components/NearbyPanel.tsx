"use client";

import { Navigation } from "lucide-react";
import { formatKm } from "@/lib/geo";
import type { LokasiView } from "@/lib/types";

interface Props {
  items: LokasiView[];
  selectedId: number | null;
  onPick: (id: number) => void;
  radiusKm: number;
  origin: string;
  colors: Record<number, string>;
}

export default function NearbyPanel({ items, selectedId, onPick, radiusKm, origin, colors }: Props) {
  const list = items.slice(0, 5);

  return (
    <aside className="z-[1000] mt-4 flex flex-col overflow-hidden rounded-3xl bg-[var(--panel)] shadow-soft lg:absolute lg:bottom-4 lg:right-4 lg:top-4 lg:mt-0 lg:w-[410px]">
      <div className="bg-[var(--mist)] px-6 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[var(--tinta)]">
            <Navigation size={16} className="text-brand" />
            Layanan Terdekat
          </h2>
          <span className="rounded-full bg-[var(--panel)] px-3 py-1 text-[11px] font-bold text-brand">Radius {radiusKm} km</span>
        </div>
        <p className="mt-1 text-xs text-[var(--abu)]">
          Titik acuan: <span className="font-semibold text-[var(--tinta)]">{origin}</span>
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {list.length === 0 && (
          <p className="rounded-2xl bg-[var(--mist)] p-6 text-center text-sm text-[var(--abu)]">
            Tidak ada lokasi dalam radius ini untuk filter yang dipilih.
          </p>
        )}
        {list.map((f) => {
          const selected = selectedId === f.id;
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => onPick(f.id)}
              aria-pressed={selected}
              className={`block w-full rounded-2xl border p-4 text-left shadow-card transition hover:-translate-y-0.5 ${
                selected ? "border-brand bg-[var(--mist)]" : "border-black/5 bg-[var(--panel)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-[15px] font-bold text-[var(--tinta)]">{f.nama}</h3>
                <span className="shrink-0 rounded-md bg-[var(--mist)] px-2 py-0.5 text-[11px] font-bold text-[var(--tinta)]">
                  {formatKm(f.distance)}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 text-[11px] text-[var(--abu)]">
                <span className="h-2 w-2 rounded-full" style={{ background: colors[f.kategoriId] }} aria-hidden="true" />
                {f.kategori} • {f.sub}
              </p>
              {f.alamat && <p className="mt-2 line-clamp-2 text-xs text-[var(--abu)]">{f.alamat}</p>}
              {f.jamOperasional && <p className="mt-2 text-[11px] font-semibold text-[var(--tinta)]">{f.jamOperasional}</p>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
