"use client";

import { BadgeCheck } from "lucide-react";
import { useHello } from "./Toast";

export default function Footer() {
  const hello = useHello();

  return (
    <footer className="mt-10 border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-slate-600 md:flex-row md:items-center md:px-8">
        <button onClick={hello} className="flex items-center gap-2 text-left">
          <BadgeCheck size={16} className="text-brand" />
          © 2026 SEHAT &amp; REFRESH TANGSEL. Data Spasial Kesehatan &amp; Rekreasi Kota Tangerang Selatan.
        </button>
        <div className="flex items-center gap-4">
          <span>Sistem Informasi Geografis Terintegrasi v1.0</span>
          <span className="flex items-center gap-1.5 font-bold text-brand">
            <span className="h-2 w-2 rounded-full bg-brand" />
            Sistem Aktif
          </span>
        </div>
      </div>
    </footer>
  );
}