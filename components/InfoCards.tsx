"use client";

import { ArrowRight, Route, ShieldCheck, Siren, TreePine } from "lucide-react";
import { useHello } from "./Toast";

const CARDS = [
  {
    icon: Siren,
    bg: "bg-red-100",
    fg: "text-alert",
    title: "Tanggap Darurat 119",
    text: "Terhubung langsung ke layanan ambulans dan gawat darurat Tangerang Selatan.",
    action: "Hubungi Bebas Pulsa",
    actionColor: "text-alert",
  },
  {
    icon: ShieldCheck,
    bg: "bg-healthsoft",
    fg: "text-health",
    title: "Data Terverifikasi",
    text: "Data spasial fasilitas kesehatan diperbarui berkala bersama Dinas Kesehatan dan Diskominfo.",
    action: "Pembaruan: Hari Ini, 08.30 WIB",
    actionColor: "text-health",
  },
  {
    icon: Route,
    bg: "bg-mist",
    fg: "text-brand",
    title: "Rute Efisien",
    text: "Estimasi waktu tempuh menuju fasilitas terdekat dengan mempertimbangkan kondisi lalu lintas.",
    action: "Realtime Routing Aktif",
    actionColor: "text-brand",
  },
  {
    icon: TreePine,
    bg: "bg-refreshsoft",
    fg: "text-refresh",
    title: "Ruang Hijau & Rekreasi",
    text: "Temukan taman aktif, ruang publik, dan area olahraga untuk melepas penat di akhir pekan.",
    action: "Jelajahi Taman Kota",
    actionColor: "text-refresh",
  },
];

export default function InfoCards() {
  const hello = useHello();

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <article key={c.title} className="flex flex-col rounded-3xl bg-white p-6 shadow-card">
            <span className={`mb-5 grid h-11 w-11 place-items-center rounded-xl ${c.bg} ${c.fg}`}>
              <Icon size={20} />
            </span>
            <h3 className="text-sm font-extrabold">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.text}</p>
            <button
              onClick={hello}
              className={`mt-5 flex items-center justify-between text-left text-xs font-bold ${c.actionColor}`}
            >
              {c.action}
              <ArrowRight size={14} />
            </button>
          </article>
        );
      })}
    </section>
  );
}