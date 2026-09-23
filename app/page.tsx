"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CategoryTabs from "@/components/CategoryTabs";
import LeftPanel from "@/components/LeftPanel";
import NearbyPanel from "@/components/NearbyPanel";
import InfoCards from "@/components/InfoCards";
import Footer from "@/components/Footer";
import { useHello } from "@/components/Toast";
import { RADIUS_KM, USER, facilities } from "@/data/facilities";
import { toFacilities } from "@/lib/geo";
import { SUB_META } from "@/lib/meta";
import type { Filter, Group, Sub } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-mist" />,
});

export default function Page() {
  const hello = useHello();
  const stageRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>({ group: "all", sub: "all" });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; n: number } | null>(null);

  // BACKEND: derive this list from your API response instead of the local GeoJSON
  const all = useMemo(() => toFacilities(facilities, USER), []);

  const counts = useMemo(() => {
    const c = { all: all.length, kesehatan: 0, rekreasi: 0, subs: {} as Record<string, number> };
    all.forEach((f) => {
      c[f.group] += 1;
      c.subs[f.sub] = (c.subs[f.sub] ?? 0) + 1;
    });
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (f) =>
        (filter.group === "all" || f.group === filter.group) &&
        (filter.sub === "all" || f.sub === filter.sub) &&
        (!q || `${f.name} ${f.address} ${f.sub}`.toLowerCase().includes(q))
    );
  }, [all, filter, query]);

  const nearby = useMemo(() => filtered.filter((f) => f.distance <= RADIUS_KM), [filtered]);

  const setGroup = (g: "all" | Group) => {
    setFilter({ group: g, sub: "all" });
    setSelectedId(null);
    hello();
  };

  const setSub = (s: "all" | Sub) => {
    setFilter((prev) => (s === "all" ? { group: prev.group, sub: "all" } : { group: SUB_META[s].group, sub: s }));
    setSelectedId(null);
    hello();
  };

  const pick = (id: string) => {
    setSelectedId(id);
    const f = all.find((x) => x.id === id);
    if (f) setFocus({ lat: f.lat, lng: f.lng, n: Date.now() });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stageRef.current?.requestFullscreen();
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 md:px-8">
        <Hero query={query} setQuery={setQuery} total={all.length} onGroup={setGroup} />

        <CategoryTabs filter={filter} counts={counts} onGroup={setGroup} onSub={setSub} />

        <div ref={stageRef} className="relative rounded-[2rem] bg-mist shadow-soft lg:h-[740px] [&:fullscreen]:overflow-auto [&:fullscreen]:bg-white [&:fullscreen]:p-4">
          <div className="relative h-[480px] overflow-hidden rounded-[2rem] lg:absolute lg:inset-0 lg:h-full">
            <MapView
              facilities={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
              user={USER}
              radiusKm={RADIUS_KM}
              focus={focus}
              onFullscreen={toggleFullscreen}
            />
            <LeftPanel filter={filter} counts={counts} onGroup={setGroup} onSub={(s) => setSub(s)} />
          </div>
          <NearbyPanel items={nearby} selectedId={selectedId} onPick={pick} radiusKm={RADIUS_KM} origin={USER.label} />
        </div>

        <InfoCards />
      </main>
      <Footer />
    </>
  );
}