"use client";

import { useEffect, useState } from "react";
import CardSwap from "./CardSwap";

type Gambar = { id: number; label: string };
type Section = { eyebrow: string; judul: string; deskripsi: string; gambar: Gambar[] };

export default function SectionGambar() {
  const [data, setData] = useState<Section | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/beranda/section", { signal: ac.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setData(json?.success ? (json.data as Section) : null))
      .catch(() => setData(null));
    return () => ac.abort();
  }, []);

  if (!data) return null;
  const punyaTeks = Boolean(data.judul || data.deskripsi);
  const punyaGambar = data.gambar.length > 0;
  if (!punyaTeks && !punyaGambar) return null;

  const items = data.gambar.map((g) => ({
    title: g.label || undefined,
    image: `/api/beranda/section/gambar/${g.id}`,
    alt: g.label || data.judul || "Gambar SIGAP Bogor",
  }));

  return (
    <section
      aria-labelledby="judul-section-gambar"
      className={`grid items-center gap-8 ${punyaGambar && punyaTeks ? "md:grid-cols-2" : ""}`}
    >
      {punyaTeks && (
        <div className="space-y-4">
          {data.eyebrow && (
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1F5FD1]">{data.eyebrow}</p>
          )}
          {data.judul && (
            <h2
              id="judul-section-gambar"
              className="text-3xl font-extrabold leading-tight tracking-tight text-[var(--tinta)] md:text-4xl"
            >
              {data.judul}
            </h2>
          )}
          {data.deskripsi && (
            <p className="whitespace-pre-line text-base leading-relaxed text-[var(--abu)]">{data.deskripsi}</p>
          )}
        </div>
      )}

      {punyaGambar && (
        <div className="h-[340px] md:h-[460px]">
          <CardSwap
            items={items}
            width={440}
            height={330}
            cardDistance={52}
            verticalDistance={44}
            depth={70}
            skewAmount={5}
            visibleCards={Math.min(4, items.length)}
            cardRadius={20}
            theme="light"
            pauseOnHover
            draggable
            delay={4000}
          />
        </div>
      )}
    </section>
  );
}
