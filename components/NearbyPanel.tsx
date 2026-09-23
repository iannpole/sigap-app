"use client";

import { ChevronRight, Navigation } from "lucide-react";
import { GROUPS, SUB_META } from "@/lib/meta";
import { formatKm } from "@/lib/geo";
import type { Facility } from "@/lib/types";
import { useHello } from "./Toast";

interface Props {
  items: Facility[];
  selectedId: string | null;
  onPick: (id: string) => void;
  radiusKm: number;
  origin: string;
}

export default function NearbyPanel({ items, selectedId, onPick, radiusKm, origin }: Props) {
  const hello = useHello();
  const list = items.slice(0, 5);

  return (
    <aside className="z-[1000] mt-4 flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft lg:absolute lg:bottom-4 lg:right-4 lg:top-4 lg:mt-0 lg:w-[410px]">
      <div className="bg-mist px-6 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em]">
            <Navigation size={16} className="text-brand" />
            Layanan Terdekat
          </h2>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold text-brand">Radius {radiusKm} km</span>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Titik acuan: <span className="font-semibold text-ink">{origin}</span>
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {list.length === 0 && (
          <p className="rounded-2xl bg-mist p-6 text-center text-sm text-slate-600">
            Tidak ada fasilitas dalam radius ini untuk filter yang dipilih.
          </p>
        )}
        {list.map((f) => {
          const G = GROUPS[f.group];
          const Icon = SUB_META[f.sub].icon;
          const selected = selectedId === f.id;
          return (
            <div
              key={f.id}
              onClick={() => onPick(f.id)}
              className={`cursor-pointer rounded-2xl border p-4 shadow-card transition hover:-translate-y-0.5 ${
                selected ? "border-brand bg-mist" : "border-black/5 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: G.soft, color: G.color }}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-[15px] font-bold">{f.name}</h3>
                    <span className="shrink-0 rounded-md bg-mist px-2 py-0.5 text-[11px] font-extrabold" style={{ color: G.color }}>
                      {formatKm(f.distance)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {G.label} • {f.sub}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{f.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className={`flex items-center gap-1.5 text-[11px] font-bold ${f.open ? "text-brand" : "text-alert"}`}>
                      <span className={`h-2 w-2 rounded-full ${f.open ? "bg-brand" : "bg-alert"}`} />
                      {f.hours}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        hello();
                      }}
                      className="rounded-lg bg-ink px-3 py-1.5 text-[11px] font-extrabold text-white transition hover:brightness-125"
                    >
                      Lihat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 pt-0">
        <button
          onClick={hello}
          className="flex w-full items-center justify-center gap-1 rounded-xl bg-healthsoft/70 py-3 text-sm font-bold text-health transition hover:bg-healthsoft"
        >
          Lihat Semua Fasilitas Terdekat <ChevronRight size={16} />
        </button>
      </div>
    </aside>
  );
}