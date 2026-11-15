"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";

const BrickCanvas = dynamic(() => import("./BrickCanvas"), {
  ssr: false,
  loading: () => <div className="h-full w-full" aria-hidden="true" />,
});

interface Props {
  total: number | null;
  jumlahKategori: number | null;
}

export default function HeroSection({ total, jumlahKategori }: Props) {
  const scrollToMap = () => {
    document.getElementById("peta-hasil")?.scrollIntoView({ behavior: "smooth" });
  };

  const ringkas =
    total === null || jumlahKategori === null
      ? "Memuat data lokasi"
      : `${total} lokasi · ${jumlahKategori} kategori`;

  return (
    <section
      aria-label="Beranda SIGAP Bogor"
      className="relative isolate min-h-screen overflow-hidden bg-[var(--latar)] pt-16"
    >
      <div className="absolute inset-0 z-0">
        <BrickCanvas />
      </div>

      <div
        aria-hidden="true"
        className="hero-scrim absolute inset-0 z-10"
      />

      <div className="relative z-30 mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1400px] items-start px-4 pb-16 pt-12 md:items-center md:px-8 md:py-10">
        <div className="max-w-xl">
          <h1 className="text-[clamp(3.5rem,8vw,6.75rem)] font-extrabold leading-[0.88] tracking-tight text-[var(--tinta)]">
            SIGAP
            <br />
            <span className="hero-judul-biru text-blue">Bogor</span>
          </h1>
          <p className="mt-6 max-w-md text-base font-semibold leading-relaxed text-[var(--tinta)] md:text-lg">
            Kesehatan, keamanan, dan olahraga dalam satu peta.
          </p>
          <button
            type="button"
            onClick={scrollToMap}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-ink bg-yellow px-7 py-3 font-extrabold text-ink shadow-[4px_4px_0_0_#1B2433] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#1B2433] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
          >
            Buka peta layanan
            <ArrowUpRight size={18} aria-hidden="true" />
          </button>
          <p className="mt-5 text-sm font-extrabold text-[var(--tinta)]" role="status">
            {ringkas}
          </p>
        </div>
      </div>
    </section>
  );
}
