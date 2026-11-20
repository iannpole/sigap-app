"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Navigation, Phone } from "lucide-react";
import PetunjukArahModal from "./PetunjukArahModal";

interface Props {
  tujuan: { lat: number; lng: number; alamat?: string | null };
  asal?: { lat: number; lng: number; label?: string } | null;
  nama: string;
  telepon?: string | null;
  ringkas?: boolean;
}

/** Tombol rute yang membuka modal petunjuk arah. Modal dirender ke body agar tidak terkurung popup peta. */
export default function TombolRute({ tujuan, asal, nama, telepon, ringkas = false }: Props) {
  const [bukaModal, setBukaModal] = useState(false);
  const tel = telepon?.replace(/[^\d+]/g, "") ?? null;

  return (
    <>
      <div className={ringkas ? "flex w-full flex-col gap-2" : "flex flex-wrap items-center gap-2"}>
        <button
          type="button"
          onClick={() => setBukaModal(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#005F50] font-bold text-white shadow-sm transition hover:bg-[#004A3E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] ${
            ringkas ? "min-h-11 w-full px-3 py-2 text-xs" : "min-h-12 flex-1 px-5 py-3 text-sm"
          }`}
        >
          <Navigation size={ringkas ? 14 : 17} aria-hidden="true" />
          Petunjuk arah<span className="sr-only"> ke {nama}</span>
        </button>

        {tel && (
          <a
            href={`tel:${tel}`}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white font-bold text-[#1B2433] hover:bg-[#F8FAFC] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] ${
              ringkas ? "min-h-11 w-full px-3 py-2 text-xs" : "min-h-12 px-5 py-3 text-sm"
            }`}
          >
            <Phone size={ringkas ? 14 : 17} aria-hidden="true" /> Hubungi
          </a>
        )}
      </div>

      {bukaModal &&
        createPortal(
          <PetunjukArahModal
            buka
            onTutup={() => setBukaModal(false)}
            tujuan={tujuan}
            asal={asal}
            nama={nama}
          />,
          document.body
        )}
    </>
  );
}
