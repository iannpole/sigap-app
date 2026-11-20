"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, Search } from "lucide-react";
import Header from "@/components/Header";
import HeroSection from "@/components/hero/HeroSection";
import CategoryTabs from "@/components/CategoryTabs";
import NearbyPanel from "@/components/NearbyPanel";
import Footer from "@/components/Footer";
import FiturBeranda from "@/components/beranda/FiturBeranda";
import SectionGambar from "@/components/beranda/SectionGambar";
import { fetchKategori, fetchLokasi } from "@/lib/api-client";
import { colorById } from "@/lib/category-color";
import { ORIGIN, RADIUS_KM } from "@/lib/config";
import { withDistance } from "@/lib/geo";
import type { Counts, Filter, Kategori, Lokasi } from "@/lib/types";

import MapLoader from "@/components/MapLoader";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <MapLoader />,
});

type Status = "loading" | "ready" | "error";
type LocationStatus = "idle" | "loading" | "active" | "denied" | "error";

const RADIUS_OPTIONS = [3, 5, 10, 20, 50];

export default function Page() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [lokasi, setLokasi] = useState<Lokasi[]>([]);
  const [filter, setFilter] = useState<Filter>({ kategoriId: null, subKategoriId: null });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; n: number } | null>(null);
  const [origin, setOrigin] = useState(ORIGIN);
  const [radiusKm, setRadiusKm] = useState(RADIUS_KM);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [urlSiap, setUrlSiap] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const kat = Number(sp.get("kategori"));
    const sub = Number(sp.get("subkategori"));
    const rad = Number(sp.get("radius"));
    setFilter({
      kategoriId: Number.isInteger(kat) && kat > 0 ? kat : null,
      subKategoriId: Number.isInteger(sub) && sub > 0 ? sub : null,
    });
    setQuery(sp.get("q")?.slice(0, 100) ?? "");
    if (RADIUS_OPTIONS.includes(rad)) setRadiusKm(rad);
    setUrlSiap(true);
  }, []);

  useEffect(() => {
    if (!urlSiap) return;
    const sp = new URLSearchParams();
    if (query.trim()) sp.set("q", query.trim());
    if (filter.kategoriId !== null) sp.set("kategori", String(filter.kategoriId));
    if (filter.subKategoriId !== null) sp.set("subkategori", String(filter.subKategoriId));
    if (radiusKm !== RADIUS_KM) sp.set("radius", String(radiusKm));
    const search = sp.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }, [urlSiap, query, filter, radiusKm]);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      fetchKategori(ac.signal).catch((err: unknown) => {
        throw new Error(`Kategori gagal dimuat. ${err instanceof Error ? err.message : "Coba lagi."}`);
      }),
      fetchLokasi(ac.signal, origin).catch((err: unknown) => {
        throw new Error(`Lokasi gagal dimuat. ${err instanceof Error ? err.message : "Coba lagi."}`);
      }),
    ])
      .then(([k, l]) => {
        setKategori(k);
        setLokasi(l);
        setErrorMsg("");
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setErrorMsg(err instanceof Error ? err.message : "Data gagal dimuat. Coba lagi.");
        setStatus("error");
      });
    return () => ac.abort();
  }, [attempt, origin]);

  const kategoriPublik = useMemo(
    () => kategori.filter((k) => ["kesehatan", "keamanan", "olahraga", "hiburan"].includes(k.namaKategori.toLowerCase())),
    [kategori]
  );
  const lokasiPublik = useMemo(
    () => lokasi.filter((item) => ["kesehatan", "keamanan", "olahraga", "hiburan"].includes(item.kategori.toLowerCase())),
    [lokasi]
  );
  const colors = useMemo(() => colorById(kategoriPublik), [kategoriPublik]);
  const all = useMemo(() => withDistance(lokasiPublik, origin), [lokasiPublik, origin]);

  const counts = useMemo<Counts>(() => {
    const c: Counts = { all: 0, kategori: {}, sub: {} };
    kategoriPublik.forEach((k) => {
      c.kategori[k.id] = k.jumlahLokasi;
      c.all += k.jumlahLokasi;
      k.subKategori.forEach((s) => {
        c.sub[s.id] = s.jumlahLokasi;
      });
    });
    return c;
  }, [kategoriPublik]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (f) =>
        (filter.kategoriId === null || f.kategoriId === filter.kategoriId) &&
        (filter.subKategoriId === null || f.subKategoriId === filter.subKategoriId) &&
        (!q || `${f.nama} ${f.alamat ?? ""} ${f.sub}`.toLowerCase().includes(q))
    );
  }, [all, filter, query]);

  const nearby = useMemo(() => filtered.filter((f) => f.distance <= radiusKm), [filtered, radiusKm]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Lokasi Anda",
        };
        setOrigin(next);
        setFocus({ lat: next.lat, lng: next.lng, n: Date.now() });
        setLocationStatus("active");
      },
      (error) => setLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 60_000 }
    );
  };

  useEffect(() => {
    if (status !== "ready" || filter.kategoriId === null) return;
    const active = kategoriPublik.find((item) => item.id === filter.kategoriId);
    if (!active) {
      setFilter({ kategoriId: null, subKategoriId: null });
      return;
    }
    if (filter.subKategoriId !== null && !active.subKategori.some((item) => item.id === filter.subKategoriId)) {
      setFilter({ kategoriId: active.id, subKategoriId: null });
    }
  }, [status, kategoriPublik, filter]);

  const setKategoriFilter = (id: number | null) => {
    setFilter({ kategoriId: id, subKategoriId: null });
    setSelectedId(null);
  };

  const setSubFilter = (id: number | null) => {
    if (id === null) {
      setFilter((prev) => ({ kategoriId: prev.kategoriId, subKategoriId: null }));
    } else {
      const parent = kategoriPublik.find((k) => k.subKategori.some((s) => s.id === id));
      setFilter({ kategoriId: parent?.id ?? null, subKategoriId: id });
    }
    setSelectedId(null);
  };

  const resetFilter = () => {
    setQuery("");
    setFilter({ kategoriId: null, subKategoriId: null });
    setSelectedId(null);
  };

  const pick = useCallback(
    (id: number) => {
      setSelectedId(id);
      const f = all.find((x) => x.id === id);
      if (f) setFocus({ lat: f.lat, lng: f.lng, n: Date.now() });
    },
    [all]
  );

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen();
  };

  return (
    <>
      <Header />
      <HeroSection
        total={status === "ready" ? all.length : null}
        jumlahKategori={status === "ready" ? kategoriPublik.length : null}
      />
      <main id="peta-hasil" className="mx-auto max-w-[1400px] scroll-mt-20 space-y-8 px-4 py-8 md:px-8">
        <SectionGambar />
        <section aria-labelledby="judul-peta" className="space-y-2">
          <h2 id="judul-peta" className="text-2xl font-extrabold tracking-tight text-[var(--tinta)] md:text-3xl">
            Temukan layanan publik
          </h2>
          <p className="text-sm text-[var(--abu)]">Cari nama atau alamat, lalu pilih kategori untuk mempersempit hasil.</p>
        </section>

        <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-[var(--panel)] px-5 shadow-soft focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#1F5FD1]">
          <Search size={20} className="shrink-0 text-brand" aria-hidden="true" />
          <span className="sr-only">Cari nama atau alamat lokasi</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau alamat lokasi"
            className="w-full bg-transparent py-4 text-[15px] text-[var(--tinta)] outline-none placeholder:text-[var(--abu)]"
          />
        </label>

        <section aria-label="Pengaturan lokasi terdekat" className="flex flex-col gap-3 border border-black/10 bg-[var(--panel)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--tinta)]">Titik acuan: {origin.label}</p>
            <p className="mt-1 text-xs text-[var(--abu)]">
              {locationStatus === "denied" && "Izin lokasi ditolak. Pencarian tetap memakai pusat Kota Bogor."}
              {locationStatus === "error" && "Lokasi tidak dapat dibaca. Pencarian tetap dapat digunakan."}
              {locationStatus !== "denied" && locationStatus !== "error" && "Lokasi hanya diminta setelah Anda menekan tombol."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="radius" className="text-xs font-bold text-[var(--tinta)]">Radius</label>
            <select id="radius" value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} className="min-h-11 rounded-lg border border-black/10 bg-[var(--panel)] px-3 text-sm font-bold text-[var(--tinta)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
              {RADIUS_OPTIONS.map((radius) => <option key={radius} value={radius}>{radius} km</option>)}
            </select>
            <button type="button" onClick={useMyLocation} disabled={locationStatus === "loading"} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1F5FD1] px-4 py-2 text-sm font-bold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433]">
              <LocateFixed size={17} aria-hidden="true" />
              {locationStatus === "loading" ? "Mencari lokasi" : locationStatus === "active" ? "Perbarui lokasi" : "Gunakan lokasi saya"}
            </button>
          </div>
        </section>

        {status === "loading" && (
          <div className="grid gap-5 lg:h-[740px] lg:grid-cols-[minmax(0,1fr)_360px]" role="status" aria-live="polite">
            <div className="grid h-[480px] place-items-center rounded-2xl bg-[var(--mist)] lg:h-full">
              <div className="text-center">
                <span className="brick-loader mx-auto block" aria-hidden="true" />
                <p className="mt-4 text-sm font-semibold text-[var(--tinta)]">Menyiapkan peta dan lokasi</p>
              </div>
            </div>
            <div className="hidden space-y-3 bg-[var(--panel)] p-4 shadow-soft lg:block">
              <div className="h-16 animate-pulse bg-[var(--mist)]" />
              <div className="h-28 animate-pulse bg-[var(--mist)]" />
              <div className="h-28 animate-pulse bg-[var(--mist)]" />
            </div>
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-[var(--panel)] p-6 shadow-soft">
            <p className="text-sm text-[var(--tinta)]">Data lokasi belum bisa dimuat. {errorMsg}</p>
            <button
              type="button"
              onClick={() => {
                setStatus("loading");
                setAttempt((n) => n + 1);
              }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white"
            >
              Coba lagi
            </button>
          </div>
        )}

        {status === "ready" && (
          <>
            <CategoryTabs
              kategori={kategoriPublik}
              colors={colors}
              filter={filter}
              counts={counts}
              onKategori={setKategoriFilter}
              onSub={setSubFilter}
            />

            {filtered.length === 0 && (
              <div role="status" className="flex flex-col items-start gap-3 border border-black/10 bg-[var(--panel)] p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-[var(--tinta)]">Lokasi tidak ditemukan</h3>
                  <p className="mt-1 text-sm text-[var(--abu)]">
                    {query.trim() ? `Tidak ada hasil untuk “${query.trim()}”.` : "Tidak ada lokasi untuk filter yang dipilih."} Coba pencarian lain atau hapus filter.
                  </p>
                </div>
                <button type="button" onClick={resetFilter} className="min-h-11 rounded-lg bg-[#1F5FD1] px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433]">
                  Hapus filter
                </button>
              </div>
            )}

            {filtered.length > 0 && (
              <p className="text-sm text-[var(--abu)]" aria-live="polite">
                <span className="font-bold text-[var(--tinta)]">{filtered.length}</span> lokasi ditemukan, {nearby.length} dalam radius {radiusKm} km.
              </p>
            )}

            <div ref={stageRef} className="relative grid gap-5 lg:h-[740px] lg:grid-cols-[minmax(0,1fr)_360px] [&:fullscreen]:overflow-auto [&:fullscreen]:bg-[var(--latar)] [&:fullscreen]:p-4">
              <div className="relative h-[480px] overflow-hidden rounded-2xl bg-[var(--mist)] shadow-soft lg:h-full">
                <MapView
                  facilities={filtered}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  user={origin}
                  radiusKm={radiusKm}
                  focus={focus}
                  onFullscreen={toggleFullscreen}
                  colors={colors}
                />
              </div>
              <NearbyPanel
                items={nearby}
                selectedId={selectedId}
                onPick={pick}
                radiusKm={radiusKm}
                origin={origin.label}
                colors={colors}
              />
            </div>
          </>
        )}

        <FiturBeranda />
      </main>
      <Footer />
    </>
  );
}
