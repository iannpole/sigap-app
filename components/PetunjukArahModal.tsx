"use client";

import { useEffect, useState } from "react";
import { Bike, Bus, Car, ExternalLink, Footprints, MapPin, Navigation, X } from "lucide-react";
import { ruteGoogle, ruteOsm, type Moda } from "@/lib/rute";
import { distanceKm, formatKm } from "@/lib/geo";

interface Props {
  buka: boolean;
  onTutup: () => void;
  tujuan: { lat: number; lng: number; alamat?: string | null };
  asal?: { lat: number; lng: number; label?: string } | null;
  nama: string;
}

const MODA_LIST: { id: Moda; label: string; icon: typeof Car; desc: string }[] = [
  { id: "driving", label: "Berkendara", icon: Car, desc: "Mobil / Taksi" },
  { id: "bicycling", label: "Sepeda / Motor", icon: Bike, desc: "Roda dua" },
  { id: "transit", label: "Angkutan Umum", icon: Bus, desc: "Biskita / Angkot" },
  { id: "walking", label: "Jalan Kaki", icon: Footprints, desc: "Rute pejalan" },
];

export default function PetunjukArahModal({ buka, onTutup, tujuan, asal, nama }: Props) {
  const [moda, setModa] = useState<Moda>("driving");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onTutup();
    };
    if (buka) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [buka, onTutup]);

  if (!buka) return null;

  const urlGoogle = ruteGoogle(tujuan, asal, moda);
  const urlOsm = ruteOsm(tujuan, asal);
  const jarak = asal ? distanceKm(asal.lat, asal.lng, tujuan.lat, tujuan.lng) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-petunjuk-arah"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onTutup}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[#DFE5F1] bg-white p-6 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EFEEE6] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#005F50] text-white">
              <Navigation size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 id="judul-petunjuk-arah" className="text-lg font-extrabold text-[#1B2433]">
                Petunjuk Arah
              </h2>
              <p className="text-xs text-[#5A6478]">Navigasi ke fasilitas layanan publik Bogor</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup petunjuk arah"
            className="grid h-9 w-9 place-items-center rounded-full text-[#5A6478] hover:bg-[#F4F6FB] focus-visible:outline-2 focus-visible:outline-[#1F5FD1]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Titik rute */}
        <div className="mt-4 space-y-3 rounded-2xl bg-[#F8FAFC] p-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1F5FD1] text-white">
              <span className="text-[10px] font-bold">A</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1B2433]">Titik Keberangkatan</p>
              <p className="truncate text-[#5A6478]">{asal?.label ?? "Lokasi Anda saat ini (Pusat Kota Bogor)"}</p>
            </div>
          </div>
          <div className="ml-3 h-4 border-l-2 border-dashed border-[#C3CADA]" />
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#C8261E] text-white">
              <MapPin size={13} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#1B2433]">{nama}</p>
              <p className="text-[#5A6478]">{tujuan.alamat ?? `${tujuan.lat.toFixed(4)}, ${tujuan.lng.toFixed(4)}`}</p>
            </div>
          </div>
          {jarak != null && (
            <p className="border-t border-[#DFE5F1] pt-2 text-[11px] font-bold text-[#005F50]">
              Perkiraan jarak garis lurus: {formatKm(jarak)}
            </p>
          )}
        </div>

        {/* Pemilihan moda */}
        <div className="mt-5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A6478]">Pilih Moda Transportasi</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Moda transportasi">
            {MODA_LIST.map(({ id, label, icon: Icon, desc }) => {
              const aktif = moda === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={aktif}
                  onClick={() => setModa(id)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                    aktif
                      ? "border-[#1F5FD1] bg-[#EFF4FF] text-[#1F5FD1] shadow-sm"
                      : "border-[#DFE5F1] bg-white text-[#5A6478] hover:border-[#C3CADA] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <Icon size={22} aria-hidden="true" />
                  <span className="text-xs font-bold text-[#1B2433]">{label}</span>
                  <span className="text-[10px] text-[#5A6478]">{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tindakan */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <a
            href={urlGoogle}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#005F50] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#004A3E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
          >
            <Navigation size={18} aria-hidden="true" />
            Buka di Google Maps
          </a>
          <a
            href={urlOsm}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DFE5F1] bg-white px-4 py-3 text-xs font-bold text-[#1B2433] hover:bg-[#F8FAFC]"
          >
            <ExternalLink size={14} aria-hidden="true" />
            OpenStreetMap
          </a>
        </div>
      </div>
    </div>
  );
}
