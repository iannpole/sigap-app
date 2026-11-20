"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPinned, Navigation, Phone } from "lucide-react";
import FacilityVisual from "@/components/FacilityVisual";
import TombolRute from "@/components/TombolRute";
import { warnaKategori, warnaKategoriGelap } from "@/lib/category-color";
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

const routeUrl = (item: LokasiView) =>
  `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;

const phoneUrl = (value: string) => `tel:${value.replace(/[^\d+]/g, "")}`;

export default function NearbyPanel({ items, selectedId, onPick, radiusKm, origin, colors }: Props) {
  const [mobileDetailId, setMobileDetailId] = useState<number | null>(null);
  const list = items.slice(0, 5);
  const mobileDetail = list.find((item) => item.id === mobileDetailId) ?? null;

  const header = (
    <div className="border-b border-black/5 bg-[var(--mist)] px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--tinta)]">
          <Navigation size={16} className="text-brand" aria-hidden="true" />
          Layanan terdekat
        </h2>
        <span className="shrink-0 text-xs font-bold text-brand">{radiusKm} km</span>
      </div>
      <p className="mt-1 text-xs text-[var(--abu)]">
        Dari <span className="font-semibold text-[var(--tinta)]">{origin}</span>
      </p>
    </div>
  );

  const cards = (mobile: boolean) => (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {list.length === 0 && (
        <div className="bg-[var(--mist)] p-5 text-center">
          <MapPinned size={24} className="mx-auto text-[var(--abu)]" aria-hidden="true" />
          <p className="mt-2 text-sm font-bold text-[var(--tinta)]">Belum ada lokasi terdekat</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--abu)]">Lokasi mungkin berada di luar radius {radiusKm} km. Peta tetap menampilkan semua hasil filter.</p>
        </div>
      )}
      {list.map((f, index) => {
        const selected = selectedId === f.id;
        return (
          <article
            key={f.id}
            style={{ animationDelay: `${index * 45}ms` }}
            className={`facility-result border p-4 transition hover:border-brand ${
              selected ? "border-brand bg-[var(--mist)]" : "border-black/10 bg-[var(--panel)]"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onPick(f.id);
                if (mobile) setMobileDetailId(f.id);
              }}
              aria-label={`Lihat ${f.nama} di peta${mobile ? " dan buka detail" : ""}`}
              className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
            >
              <div className="flex gap-3">
                <FacilityVisual nama={f.nama} kategori={f.kategori} fotoUrl={f.fotoUrl} className="h-20 w-24 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[15px] font-bold leading-snug text-[var(--tinta)]">{f.nama}</h3>
                    <span className="shrink-0 text-[11px] font-bold text-[var(--tinta)]">{formatKm(f.distance)}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-[11px] text-[var(--abu)]">
                    <span className="h-2 w-2 rounded-full" style={{ background: colors[f.kategoriId] }} aria-hidden="true" />
                    {f.kategori} · {f.sub}
                  </p>
                  {f.jamOperasional && <p className="mt-2 text-[11px] font-semibold text-[var(--tinta)]">{f.jamOperasional}</p>}
                </div>
              </div>
              {f.deskripsi && <p className="mt-3 text-xs leading-relaxed text-[var(--tinta)]">{f.deskripsi}</p>}
              {f.alamat && <p className="mt-2 text-xs leading-relaxed text-[var(--abu)]">{f.alamat}</p>}
            </button>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-black/5 pt-3">
              <button type="button" onClick={() => onPick(f.id)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold text-[var(--tinta)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
                <MapPinned size={15} aria-hidden="true" />
                Lihat di peta
              </button>
              <TombolRute tujuan={{ lat: f.lat, lng: f.lng, alamat: f.alamat }} nama={f.nama} telepon={f.noKontak} ringkas />
              <Link href={`/layanan/${f.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold text-[var(--tinta)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
                Detail lengkap
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );

  const detail = mobileDetail && (
    <div className="overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-black/5 bg-[var(--panel)] px-4 py-2">
        <button type="button" onClick={() => setMobileDetailId(null)} className="grid h-11 w-11 place-items-center rounded-lg text-[var(--tinta)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]" aria-label="Kembali ke daftar layanan">
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <p className="font-bold text-[var(--tinta)]">Detail fasilitas</p>
      </div>
      <FacilityVisual nama={mobileDetail.nama} kategori={mobileDetail.kategori} fotoUrl={mobileDetail.fotoUrl} className="h-40 w-full" />
      <div className="space-y-3 p-5">
        <div>
          <p className="kategori-label text-xs font-bold" style={{ "--kategori": warnaKategori(mobileDetail.kategori), "--kategori-gelap": warnaKategoriGelap(mobileDetail.kategori) } as React.CSSProperties}>{mobileDetail.kategori} · {mobileDetail.sub}</p>
          <h3 className="mt-1 text-lg font-extrabold text-[var(--tinta)]">{mobileDetail.nama}</h3>
          <p className="mt-1 text-xs text-[var(--abu)]">{formatKm(mobileDetail.distance)} · {mobileDetail.wilayah}</p>
        </div>
        {mobileDetail.deskripsi && <p className="text-sm leading-relaxed text-[var(--tinta)]">{mobileDetail.deskripsi}</p>}
        {mobileDetail.alamat && <p className="text-sm leading-relaxed text-[var(--abu)]">{mobileDetail.alamat}</p>}
        {mobileDetail.jamOperasional && <p className="text-sm font-semibold text-[var(--tinta)]">{mobileDetail.jamOperasional}</p>}
        <div className="flex flex-wrap gap-2 pt-2">
          <a href={routeUrl(mobileDetail)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1F5FD1] px-4 py-2 text-sm font-bold text-white">
            <Navigation size={16} aria-hidden="true" />
            Buka rute
          </a>
          {mobileDetail.noKontak && (
            <a href={phoneUrl(mobileDetail.noKontak)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-bold text-[var(--tinta)]">
              <Phone size={16} aria-hidden="true" />
              Telepon
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden min-h-0 flex-col overflow-hidden bg-[var(--panel)] shadow-soft lg:flex">
        {header}
        {cards(false)}
      </aside>

      <details className="group absolute inset-x-3 bottom-3 z-[1400] max-h-[55dvh] overflow-hidden rounded-2xl bg-[var(--panel)] shadow-soft lg:hidden" onToggle={(event) => { if (!(event.currentTarget as HTMLDetailsElement).open) setMobileDetailId(null); }}>
        <summary className="flex min-h-12 list-none items-center justify-between gap-3 px-5 py-3 font-bold text-[var(--tinta)] marker:content-none">
          <span className="flex items-center gap-2">
            <Navigation size={16} className="text-brand" aria-hidden="true" />
            Layanan terdekat
          </span>
          <span className="text-xs text-[var(--abu)] group-open:hidden">{list.length} lokasi · Buka</span>
          <span className="hidden text-xs text-[var(--abu)] group-open:inline">Tutup</span>
        </summary>
        <div className="flex max-h-[calc(55dvh-3rem)] flex-col border-t border-black/5">
          {mobileDetail ? detail : <>{header}{cards(true)}</>}
        </div>
      </details>
    </>
  );
}
