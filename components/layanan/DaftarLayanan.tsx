"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { animate, stagger } from "animejs";
import Link from "next/link";
import TombolRute from "@/components/TombolRute";
import FacilityVisual from "@/components/FacilityVisual";
import { fetchKategori, fetchLokasiPage } from "@/lib/api-client";
import { colorById, warnaKategori, warnaKategoriGelap } from "@/lib/category-color";
import type { Kategori, Lokasi } from "@/lib/types";

type Status = "loading" | "ready" | "error";

const PUBLIK = ["kesehatan", "keamanan", "olahraga", "hiburan"];

export default function DaftarLayanan() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [items, setItems] = useState<Lokasi[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const daftarRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ul = daftarRef.current;
    if (!ul || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const kartu = ul.querySelectorAll("li");
    const anim = animate(kartu, {
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 480,
      ease: "outCubic",
      delay: stagger(70),
    });
    return () => {
      anim.revert();
    };
  }, [items]);
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const ac = new AbortController();
    fetchKategori(ac.signal)
      .then((data) => setKategori(data.filter((k) => PUBLIK.includes(k.namaKategori.toLowerCase()))))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setStatus("loading");
    fetchLokasiPage({ q: debounced, kategori: kategoriId, limit: 12 }, ac.signal)
      .then((page) => {
        setItems(page.items);
        setCursor(page.nextCursor);
        setErrorMsg("");
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setErrorMsg(err instanceof Error ? err.message : "Daftar layanan gagal dimuat.");
        setStatus("error");
      });
    return () => ac.abort();
  }, [debounced, kategoriId, attempt]);

  const colors = useMemo(() => colorById(kategori), [kategori]);

  const loadMore = async () => {
    if (cursor === null) return;
    setLoadingMore(true);
    try {
      const page = await fetchLokasiPage({ q: debounced, kategori: kategoriId, cursor, limit: 12 });
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Halaman berikutnya gagal dimuat.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-[var(--panel)] px-5 shadow-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#1F5FD1]">
          <Search size={20} className="shrink-0 text-brand" aria-hidden="true" />
          <span className="sr-only">Cari nama atau alamat layanan</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama atau alamat layanan"
            maxLength={100}
            className="w-full bg-transparent py-4 text-[15px] text-[var(--tinta)] outline-none placeholder:text-[var(--abu)]"
          />
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-[var(--panel)] px-4 shadow-soft">
          <span className="shrink-0 text-xs font-bold text-[var(--abu)]">Kategori</span>
          <select
            value={kategoriId ?? ""}
            onChange={(event) => setKategoriId(event.target.value ? Number(event.target.value) : null)}
            className="min-h-14 bg-transparent pr-2 text-sm font-bold text-[var(--tinta)] outline-none"
          >
            <option value="">Semua</option>
            {kategori.map((k) => <option key={k.id} value={k.id}>{k.namaKategori}</option>)}
          </select>
        </label>
      </div>

      {status === "loading" && <p role="status" className="text-sm text-[var(--abu)]">Memuat daftar layanan…</p>}

      {status === "error" && (
        <div role="alert" className="flex flex-col items-start gap-3 border border-[#C8261E] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--tinta)]">{errorMsg}</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="min-h-11 rounded-lg bg-[#1F5FD1] px-4 py-2 text-sm font-bold text-white">
            Coba lagi
          </button>
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <div role="status" className="border border-black/10 bg-[var(--panel)] p-6">
          <h2 className="font-bold text-[var(--tinta)]">Layanan tidak ditemukan</h2>
          <p className="mt-1 text-sm text-[var(--abu)]">Coba kata lain atau pilih kategori berbeda.</p>
        </div>
      )}

      {status === "ready" && items.length > 0 && (
        <>
          <p className="text-sm text-[var(--abu)]" aria-live="polite">
            <span className="font-bold text-[var(--tinta)]">{items.length}</span> layanan ditampilkan.
          </p>
          <ul ref={daftarRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col overflow-hidden rounded-2xl bg-[var(--panel)] shadow-card">
                <span className="block h-1.5 w-full" style={{ background: colors[item.kategoriId] }} aria-hidden="true" />
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="kategori-label text-[11px] font-bold uppercase tracking-wider" style={{ "--kategori": warnaKategori(item.kategori), "--kategori-gelap": warnaKategoriGelap(item.kategori) } as React.CSSProperties}>
                      {item.kategori} / <span className="text-[var(--tinta)]">{item.sub}</span>
                    </p>
                    <span className="shrink-0 rounded-full bg-[var(--mist)] px-2.5 py-1 text-[10px] font-bold text-[var(--tinta)]">{item.wilayah}</span>
                  </div>
                  <FacilityVisual nama={item.nama} kategori={item.kategori} fotoUrl={item.fotoUrl} className="h-36 w-full rounded-xl" />
                  <h2 className="text-lg font-extrabold leading-snug text-[var(--tinta)]">{item.nama}</h2>
                  {item.deskripsi && <p className="line-clamp-3 text-sm leading-relaxed text-[var(--abu)]">{item.deskripsi}</p>}
                  <p className="text-xs leading-relaxed text-[var(--abu)]">{item.alamat ?? item.wilayah}</p>
                  {item.jamOperasional && <p className="text-xs font-semibold text-[var(--tinta)]">{item.jamOperasional}</p>}
                  <div className="mt-auto flex flex-col gap-2">
                    <TombolRute tujuan={{ lat: item.lat, lng: item.lng, alamat: item.alamat }} nama={item.nama} telepon={item.noKontak} />
                    <Link
                      href={`/layanan/${item.id}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold text-[var(--tinta)] hover:bg-[var(--mist)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
                    >
                      Detail lengkap
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {cursor !== null && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="min-h-11 rounded-lg border border-black/10 bg-[var(--panel)] px-5 py-2 text-sm font-bold text-[var(--tinta)] disabled:opacity-60"
        >
          {loadingMore ? "Memuat…" : "Muat lebih banyak"}
        </button>
      )}

      {errorMsg && status === "ready" && <p role="alert" className="text-sm text-[#C8261E]">{errorMsg}</p>}
    </div>
  );
}
