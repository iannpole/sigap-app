"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import HeroSection from "@/components/hero/HeroSection";
import CategoryTabs from "@/components/CategoryTabs";
import LeftPanel from "@/components/LeftPanel";
import NearbyPanel from "@/components/NearbyPanel";
import Footer from "@/components/Footer";
import FiturBeranda from "@/components/beranda/FiturBeranda";
import { fetchKategori, fetchLokasi } from "@/lib/api-client";
import { colorById } from "@/lib/category-color";
import { ORIGIN, RADIUS_KM } from "@/lib/config";
import { withDistance } from "@/lib/geo";
import type { Counts, Filter, Kategori, Lokasi } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[var(--mist)]" />,
});

type Status = "loading" | "ready" | "error";

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

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([fetchKategori(ac.signal), fetchLokasi(ac.signal)])
      .then(([k, l]) => {
        setKategori(k);
        setLokasi(l);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setErrorMsg(err instanceof Error ? err.message : "Gagal memuat data");
        setStatus("error");
      });
    return () => ac.abort();
  }, [attempt]);

  const colors = useMemo(() => colorById(kategori), [kategori]);
  const all = useMemo(() => withDistance(lokasi, ORIGIN), [lokasi]);

  const counts = useMemo<Counts>(() => {
    const c: Counts = { all: all.length, kategori: {}, sub: {} };
    all.forEach((f) => {
      c.kategori[f.kategoriId] = (c.kategori[f.kategoriId] ?? 0) + 1;
      c.sub[f.subKategoriId] = (c.sub[f.subKategoriId] ?? 0) + 1;
    });
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (f) =>
        (filter.kategoriId === null || f.kategoriId === filter.kategoriId) &&
        (filter.subKategoriId === null || f.subKategoriId === filter.subKategoriId) &&
        (!q || `${f.nama} ${f.alamat ?? ""} ${f.sub}`.toLowerCase().includes(q))
    );
  }, [all, filter, query]);

  const nearby = useMemo(() => filtered.filter((f) => f.distance <= RADIUS_KM), [filtered]);

  const setKategoriFilter = (id: number | null) => {
    setFilter({ kategoriId: id, subKategoriId: null });
    setSelectedId(null);
  };

  const setSubFilter = (id: number | null) => {
    if (id === null) {
      setFilter((prev) => ({ kategoriId: prev.kategoriId, subKategoriId: null }));
    } else {
      const parent = kategori.find((k) => k.subKategori.some((s) => s.id === id));
      setFilter({ kategoriId: parent?.id ?? null, subKategoriId: id });
    }
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
        jumlahKategori={status === "ready" ? kategori.length : null}
      />
      <main id="peta-hasil" className="mx-auto max-w-[1400px] scroll-mt-20 space-y-8 px-4 py-8 md:px-8">
        <FiturBeranda />

        <div className="flex flex-col gap-3 rounded-2xl bg-[var(--panel)] p-2.5 shadow-soft md:flex-row md:items-center">
          <label className="flex flex-1 items-center gap-3 px-4">
            <Search size={20} className="shrink-0 text-brand" aria-hidden="true" />
            <span className="sr-only">Cari lokasi</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau alamat lokasi"
              className="w-full bg-transparent py-3 text-[15px] text-[var(--tinta)] outline-none placeholder:text-[var(--abu)]"
            />
          </label>
        </div>

        {status === "loading" && <p className="text-sm text-[var(--abu)]" role="status">Memuat data lokasi…</p>}

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
              kategori={kategori}
              colors={colors}
              filter={filter}
              counts={counts}
              onKategori={setKategoriFilter}
              onSub={setSubFilter}
            />

            <div ref={stageRef} className="relative rounded-[2rem] bg-[var(--mist)] shadow-soft lg:h-[740px] [&:fullscreen]:overflow-auto [&:fullscreen]:bg-white [&:fullscreen]:p-4">
              <div className="relative h-[480px] overflow-hidden rounded-[2rem] lg:absolute lg:inset-0 lg:h-full">
                <MapView
                  facilities={filtered}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  user={ORIGIN}
                  radiusKm={RADIUS_KM}
                  focus={focus}
                  onFullscreen={toggleFullscreen}
                  colors={colors}
                />
                <LeftPanel
                  kategori={kategori}
                  colors={colors}
                  filter={filter}
                  counts={counts}
                  onKategori={setKategoriFilter}
                  onSub={setSubFilter}
                />
              </div>
              <NearbyPanel
                items={nearby}
                selectedId={selectedId}
                onPick={pick}
                radiusKm={RADIUS_KM}
                origin={ORIGIN.label}
                colors={colors}
              />
            </div>
          </>
        )}

      </main>
      <Footer />
    </>
  );
}
