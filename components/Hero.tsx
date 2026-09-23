"use client";

import { LocateFixed, Search, ArrowRight, Radar, HeartPulse, Leaf } from "lucide-react";
import { RADIUS_KM, USER } from "@/data/facilities";
import type { Group } from "@/lib/types";
import { useHello } from "./Toast";

interface Props {
  query: string;
  setQuery: (v: string) => void;
  total: number;
  onGroup: (g: Group) => void;
}

export default function Hero({ query, setQuery, total, onGroup }: Props) {
  const hello = useHello();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            <Radar size={14} />
            Sistem Navigasi &amp; Pemetaan Kesehatan dan Rekreasi Tangerang Selatan
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
            Temukan Klinik &amp; Tempat Refresh di Sekitar Anda
          </h1>
          <p className="mt-4 text-[15px] text-slate-600">
            Cari klinik, puskesmas, rumah sakit, apotek, serta taman dan ruang rekreasi terdekat di Kota Tangerang Selatan.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 rounded-2xl bg-mist px-5 py-4 shadow-card">
          <div>
            <p className="text-[11px] text-slate-600">Fasilitas Aktif</p>
            <p className="text-2xl font-extrabold text-brand">{total}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-600">Radius Default</p>
            <p className="text-2xl font-extrabold">{RADIUS_KM.toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-600">Status Jaringan</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-brand">
              <span className="h-2.5 w-2.5 rounded-full bg-brand" />
              Sinkron
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          hello();
        }}
        className="flex flex-col gap-3 rounded-2xl bg-white p-2.5 shadow-soft md:flex-row md:items-center"
      >
        <div className="flex flex-1 items-center gap-3 px-4">
          <Search size={20} className="shrink-0 text-brand" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari klinik, taman, atau alamat (misal: RS Eka Hospital, Taman Kota 2)..."
            className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={hello}
          className="flex items-center justify-center gap-2 rounded-xl bg-mist px-4 py-3 text-xs font-bold text-slate-700 transition hover:bg-healthsoft"
        >
          <LocateFixed size={14} />
          {USER.label}
        </button>
        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-ink px-8 py-4 text-sm font-extrabold text-white transition hover:brightness-125"
        >
          Cari <ArrowRight size={16} />
        </button>
      </form>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            onGroup("kesehatan");
            hello();
          }}
          className="flex items-center gap-2 rounded-full bg-healthsoft px-4 py-2 text-sm font-bold text-health transition hover:brightness-95"
        >
          <HeartPulse size={16} />
          Cari klinik terdekat
        </button>
        <button
          onClick={() => {
            onGroup("rekreasi");
            hello();
          }}
          className="flex items-center gap-2 rounded-full bg-refreshsoft px-4 py-2 text-sm font-bold text-refresh transition hover:brightness-95"
        >
          <Leaf size={16} />
          Cari tempat refresh
        </button>
      </div>
    </section>
  );
}