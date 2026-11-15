"use client";

import { useEffect, useState } from "react";

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

const SOSIAL_LABEL: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  tiktok: "TikTok",
};

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
    <footer className="mt-10 border-t border-black/5 bg-[var(--panel)] text-[var(--tinta)]">
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 text-xs md:grid-cols-3 md:px-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold">{data?.nama ?? "SIGAP Bogor"}</p>
          {data?.tagline && <p className="text-[var(--abu)]">{data.tagline}</p>}
          {data?.alamat && <p className="text-[var(--abu)]">{data.alamat}</p>}
          {data?.email && (
            <a href={`mailto:${data.email}`} className="font-bold text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
              {data.email}
            </a>
          )}
        </div>

        {tautan.length > 0 && (
          <nav aria-label="Tautan footer">
            <ul className="flex flex-col gap-2">
              {tautan.map((t) => (
                <li key={`${t.urutan}-${t.url}`}>
                  <a href={t.url} rel="noopener noreferrer" className="font-bold text-[var(--tinta)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {sosial.length > 0 && (
          <nav aria-label="Media sosial">
            <ul className="flex flex-col gap-2">
              {sosial.map((s) => (
                <li key={`${s.urutan}-${s.url}`}>
                  <a href={s.url} rel="noopener noreferrer" className="font-bold text-[var(--tinta)] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
                    {SOSIAL_LABEL[s.platform] ?? s.platform}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 border-t border-black/5 px-4 py-4 text-[11px] text-[var(--abu)] md:flex-row md:items-center md:justify-between md:px-8">
        <p>{data?.hakCipta ?? "© 2026 SIGAP Bogor"}</p>
        <p>
          Data peta: © <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">OpenStreetMap contributors</a>
        </p>
      </div>
    </footer>
  );
}
