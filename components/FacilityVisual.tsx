"use client";

import { useState } from "react";

interface Props {
  nama: string;
  kategori: string;
  fotoUrl: string | null;
  className?: string;
}

const ASET: Record<string, string> = {
  kesehatan: "/facilities/kesehatan-brick.svg",
  keamanan: "/facilities/keamanan-brick.svg",
  olahraga: "/facilities/olahraga-brick.svg",
  hiburan: "/facilities/hiburan-brick.svg",
};

export default function FacilityVisual({ nama, kategori, fotoUrl, className = "" }: Props) {
  const [gagalUrl, setGagalUrl] = useState<string | null>(null);
  const fallback = ASET[kategori.toLowerCase()] ?? ASET.kesehatan;
  const src = fotoUrl && fotoUrl !== gagalUrl ? fotoUrl : fallback;
  const nyata = src === fotoUrl;

  return (
    <div className={`relative overflow-hidden bg-[var(--mist)] ${className}`}>
      {/* URL foto dikelola admin dan dapat berasal dari host berbeda. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={nyata ? `Foto ${nama}` : `Ilustrasi brick untuk ${kategori.toLowerCase()}`}
        className={`absolute inset-0 h-full w-full object-cover ${nyata ? "" : "facility-brick-visual"}`}
        onError={() => setGagalUrl(src)}
      />
      {!nyata && (
        <span className="absolute bottom-2 left-2 bg-[var(--panel)]/90 px-2 py-1 text-[10px] font-bold text-[var(--tinta)]">
          Ilustrasi kategori
        </span>
      )}
    </div>
  );
}
