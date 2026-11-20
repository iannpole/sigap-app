import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Phone, ShieldAlert, Siren, Ambulance } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Darurat 112 | SIGAP Bogor",
  description: "Hubungi layanan darurat di Kota dan Kabupaten Bogor: Polisi 110, Pemadam Kebakaran 113, Ambulans 119, dan Call Center 112.",
};

const LAYANAN = [
  {
    nama: "Kepolisian",
    nomor: "110",
    ikon: ShieldAlert,
    kantor: "(0251) 8311414",
    keterangan: "Kejahatan, kecelakaan lalu lintas, dan gangguan keamanan.",
  },
  {
    nama: "Pemadam Kebakaran",
    nomor: "113",
    ikon: Flame,
    kantor: "(0251) 8322100",
    keterangan: "Kebakaran, pohon tumbang, dan penyelamatan darurat.",
  },
  {
    nama: "Ambulans",
    nomor: "119",
    ikon: Ambulance,
    kantor: "RS PMI (0251) 8324080",
    keterangan: "Kondisi medis darurat dan rujukan pasien ke rumah sakit.",
  },
];

export default function DaruratPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1100px] space-y-8 px-4 pb-16 pt-24 md:px-8">
        <section className="overflow-hidden rounded-3xl bg-[#C8261E] p-6 text-white shadow-card sm:p-10">
          <div className="flex items-center gap-3">
            <Siren size={28} aria-hidden="true" />
            <p className="text-xs font-extrabold uppercase tracking-[0.14em]">Layanan darurat</p>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Butuh Bantuan Darurat?</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">
            Pilih layanan yang sesuai dengan kejadian. Tombol akan langsung membuka panggilan ke nomor tujuan di perangkat Anda.
          </p>
        </section>

        <ul className="grid gap-4 md:grid-cols-3">
          {LAYANAN.map((l) => (
            <li key={l.nomor} className="flex flex-col rounded-2xl bg-[var(--panel)] p-6 shadow-card">
              <l.ikon size={28} className="text-[#C8261E]" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-extrabold text-[var(--tinta)]">{l.nama}</h2>
              <p className="mt-1 text-4xl font-extrabold text-[#C8261E]">{l.nomor}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--abu)]">{l.keterangan}</p>
              <p className="mb-6 mt-3 text-xs text-[var(--abu)]">
                Kantor: <a href={`tel:${l.kantor.replace(/[^\d+]/g, "")}`} className="font-bold text-[var(--tinta)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-[#1F5FD1]">{l.kantor}</a>
              </p>
              <a
                href={`tel:${l.nomor}`}
                className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#C8261E] px-4 py-3 text-sm font-bold text-white hover:bg-[#A91F19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433]"
              >
                <Phone size={16} aria-hidden="true" /> Hubungi {l.nomor}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#1B2433] p-6 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-bold">Tidak tahu harus menghubungi siapa?</p>
            <p className="text-xs text-white/80">Hubungi Call 112, layanan bebas pulsa.</p>
          </div>
          <a
            href="tel:112"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F5C400] px-6 py-2.5 text-sm font-extrabold text-[#1B2433] hover:bg-[#E0B200] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <Phone size={16} aria-hidden="true" /> CALL 112
          </a>
        </div>

        <p className="text-center">
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-bold text-[#1F5FD1] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
            Tutup dan kembali ke peta
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
