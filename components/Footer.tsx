"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera, ExternalLink, Globe2, Mail, MapPin, Music2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import FooterJalur from "@/components/FooterJalur";

type Tautan = { label: string; url: string; urutan: number };
type Sosial = { platform: string; url: string; urutan: number };
type FooterData = {
  nama: string;
  tagline: string;
  email: string | null;
  hakCipta: string;
  alamat: string | null;
  tautan: Tautan[];
  sosial: Sosial[];
};

const IKON_SOSIAL = {
  instagram: Camera,
  youtube: Video,
  tiktok: Music2,
  x: ExternalLink,
  facebook: ExternalLink,
} as const;

const LABEL_SOSIAL: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  facebook: "Facebook",
};

const kategori = [
  { label: "Kesehatan", warna: "#C8261E" },
  { label: "Keamanan", warna: "#1F5FD1" },
  { label: "Hiburan", warna: "#F5C400" },
];

export default function Footer() {
  const [data, setData] = useState<FooterData | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/beranda/footer", { signal: ac.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json.data) setData(json.data as FooterData);
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const tautan = [...(data?.tautan ?? [])].sort((a, b) => a.urutan - b.urutan);
  const sosial = [...(data?.sosial ?? [])].sort((a, b) => a.urutan - b.urutan);

  return (
    <footer className="mt-10 bg-[#11152E] text-[#F7F5ED]">
      <div className="relative mx-auto max-w-[1400px] px-4 pb-8 pt-12 md:px-8 md:pt-16">
        <div className="pointer-events-none absolute right-4 top-4 hidden gap-2 md:flex md:right-8" aria-hidden="true">
          <span className="h-5 w-5 rotate-[-8deg] rounded-sm border-2 border-[#070A18] bg-[#C8261E] shadow-[2px_2px_0_#070A18]" />
          <span className="h-5 w-5 rotate-[6deg] rounded-sm border-2 border-[#070A18] bg-[#1F5FD1] shadow-[2px_2px_0_#070A18]" />
          <span className="h-5 w-5 rotate-[-4deg] rounded-sm border-2 border-[#070A18] bg-[#F5C400] shadow-[2px_2px_0_#070A18]" />
        </div>
        <div className="isolate relative grid gap-10 border-b border-white/15 pb-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_0.8fr_1fr] lg:gap-14">
          <Image
            src="/logo/sigap-logo-siluet.png"
            alt=""
            aria-hidden="true"
            width={1229}
            height={305}
            className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-auto w-[min(92%,980px)] -translate-x-1/2 brightness-0 opacity-[0.4]"
          />
          <div>
            <Image
              src="/logo/sigap-logo-trim.png"
              alt="SIGAP Bogor"
              width={1229}
              height={305}
              className="h-14 w-auto"
              loading="eager"
            />
            <p className="mt-5 max-w-xs text-base font-bold leading-7 text-[#D8DCEE]">{data?.tagline ?? "Layanan publik Bogor dalam satu peta."}</p>
            {data?.alamat && <p className="mt-3 max-w-sm text-sm leading-6 text-[#ABB5D3]">{data.alamat}</p>}
            <div className="mt-6 flex flex-wrap gap-3" aria-label="Media sosial SIGAP">
              {sosial.map((item) => {
                const Ikon = IKON_SOSIAL[item.platform as keyof typeof IKON_SOSIAL] ?? ExternalLink;
                const label = LABEL_SOSIAL[item.platform] ?? item.platform;
                return (
                  <a key={`${item.urutan}-${item.url}`} href={item.url} aria-label={label} rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#272D52] text-white transition hover:-translate-y-0.5 hover:bg-[#343B69] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">
                    <Ikon size={20} aria-hidden="true" />
                  </a>
                );
              })}
              <a href="https://www.openstreetmap.org/copyright" aria-label="OpenStreetMap" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-[#272D52] text-white transition hover:-translate-y-0.5 hover:bg-[#343B69] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">
                <Globe2 size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          <nav aria-label="Kategori layanan">
            <h2 className="flex items-center gap-3 text-lg font-extrabold"><span className="h-7 w-7 rotate-[-15deg] rounded-sm border-2 border-[#11152E] bg-[#C8261E] shadow-[3px_3px_0_#070A18]" aria-hidden="true" /> Layanan</h2>
            <ul className="mt-6 space-y-4 text-sm font-semibold text-[#BEC6DF]">
              {kategori.map((item) => (
                <li key={item.label}>
                  <Link href={`/layanan?kategori=${encodeURIComponent(item.label)}`} className="group inline-flex min-h-11 items-center gap-3 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">
                    <span className="h-2.5 w-2.5 rounded-sm border border-white/50" style={{ background: item.warna }} aria-hidden="true" />
                    {item.label}<span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Jelajahi SIGAP">
            <h2 className="flex items-center gap-3 text-lg font-extrabold"><span className="h-7 w-7 rotate-[10deg] rounded-sm border-2 border-[#11152E] bg-[#1F5FD1] shadow-[3px_3px_0_#070A18]" aria-hidden="true" /> Jelajahi</h2>
            <ul className="mt-6 space-y-1 text-sm font-semibold text-[#BEC6DF]">
              <li><Link href="/" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">Beranda&nbsp; →</Link></li>
              <li><Link href="/#peta-hasil" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">Peta layanan&nbsp; →</Link></li>
              <li><Link href="/layanan" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">Daftar layanan&nbsp; →</Link></li>
              <li><Link href="/tentang" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">Tentang SIGAP&nbsp; →</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="flex items-center gap-3 text-lg font-extrabold"><span className="h-7 w-7 rotate-[-8deg] rounded-sm border-2 border-[#11152E] bg-[#1B7F37] shadow-[3px_3px_0_#070A18]" aria-hidden="true" /> Informasi</h2>
            <ul className="mt-6 space-y-1 text-sm font-semibold text-[#BEC6DF]">
              {data?.email && <li><a href={`mailto:${data.email}`} className="inline-flex min-h-11 items-center gap-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]"><Mail size={16} aria-hidden="true" /> Hubungi kami</a></li>}
              {tautan.map((item) => <li key={`${item.urutan}-${item.url}`}><a href={item.url} rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">{item.label}&nbsp; →</a></li>)}
              <li><Link href="/admin" className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]">Portal admin&nbsp; →</Link></li>
              <li><a href="/darurat" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#C8261E] px-4 py-2 font-bold text-white hover:bg-[#A91F19] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F5C400]"><MapPin size={16} aria-hidden="true" /> Darurat 112</a></li>
            </ul>
          </div>
        </div>
        <FooterJalur />
      </div>

      <div className="border-t border-white/15 bg-[#0B0E21]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-4 text-[11px] text-[#ABB5D3] md:flex-row md:items-center md:justify-between md:px-8">
          <p>{data?.hakCipta ?? "© 2026 SIGAP Bogor"}</p>
          <p>SIGAP bukan layanan tanggap darurat. Data peta © <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C400]">OpenStreetMap contributors</a></p>
        </div>
      </div>
    </footer>
  );
}
