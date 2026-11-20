"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchKategori } from "@/lib/api-client";
import type { Kategori } from "@/lib/types";

const KOLOM = [
  { nama: "Kesehatan", warna: "#C8261E", cocok: ["kesehatan"] },
  { nama: "Keselamatan", warna: "#1F5FD1", cocok: ["keselamatan", "keamanan"] },
  { nama: "Hiburan", warna: "#F5C400", cocok: ["hiburan", "olahraga"] },
];

export default function KatalogData() {
  const [kategori, setKategori] = useState<Kategori[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetchKategori(ac.signal).then(setKategori).catch(() => setKategori([]));
    return () => ac.abort();
  }, []);

  const total = kategori.reduce((n, k) => n + k.jumlahLokasi, 0);
  const hitung = (cocok: string[]) =>
    kategori
      .filter((k) => cocok.includes(k.namaKategori.toLowerCase()))
      .reduce((n, k) => n + k.jumlahLokasi, 0);

  return (
    <section aria-labelledby="judul-katalog" className="rounded-2xl bg-[var(--panel)] p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="judul-katalog" className="text-lg font-extrabold text-[var(--tinta)]">Katalog data fasilitas</h2>
          <p className="mt-1 text-sm text-[var(--abu)]">
            {total} fasilitas terdaftar, dalam format GeoJSON dengan tiga kolom kategori.
          </p>
        </div>
        <a
          href="/api/katalog"
          download="katalog-sigap-bogor.geojson"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F5FD1] px-5 py-2.5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433]"
        >
          <Download size={16} aria-hidden="true" /> Unduh katalog (GeoJSON)
        </a>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {KOLOM.map((k) => (
          <div key={k.nama} className="rounded-xl border border-black/10 p-4">
            <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--abu)]">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: k.warna }} aria-hidden="true" />
              {k.nama}
            </dt>
            <dd className="mt-2 text-2xl font-extrabold text-[var(--tinta)]">{hitung(k.cocok)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
