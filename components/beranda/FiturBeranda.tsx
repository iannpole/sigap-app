"use client";

import { useEffect, useState } from "react";
import IkonBrick from "./IkonBrick";

type Fitur = {
  id: number;
  judul: string;
  deskripsi: string;
  ikonKey: string;
  tautan: string | null;
};

type Status = "memuat" | "siap" | "gagal";

export default function FiturBeranda() {
  const [items, setItems] = useState<Fitur[]>([]);
  const [status, setStatus] = useState<Status>("memuat");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    setStatus("memuat");
    fetch("/api/beranda/fitur", { signal: ac.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!json?.success || !Array.isArray(json.data)) throw new Error("format");
        setItems(json.data as Fitur[]);
        setStatus("siap");
      })
      .catch(() => {
        if (!ac.signal.aborted) setStatus("gagal");
      });
    return () => ac.abort();
  }, [attempt]);

  if (status === "memuat") {
    return <p role="status" className="text-sm text-[var(--abu)]">Memuat fitur…</p>;
  }

  if (status === "gagal") {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl bg-[var(--panel)] p-6 shadow-soft">
        <p className="text-sm text-[var(--tinta)]">Fitur belum bisa dimuat.</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  // Kosong: bagian disembunyikan, tidak diisi placeholder palsu (R-38).
  if (items.length === 0) return null;

  return (
    <section aria-label="Fitur utama" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f) => {
        const isi = (
          <>
            <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[var(--mist)] text-brand">
              <IkonBrick ikon={f.ikonKey} />
            </span>
            <h3 className="text-sm font-extrabold">{f.judul}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--abu)]">{f.deskripsi}</p>
          </>
        );
        const kelas =
          "flex flex-col rounded-3xl bg-[var(--panel)] p-6 text-[var(--tinta)] shadow-card";
        return f.tautan ? (
          <a
            key={f.id}
            href={f.tautan}
            rel="noopener noreferrer"
            className={`${kelas} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]`}
          >
            {isi}
          </a>
        ) : (
          <article key={f.id} className={kelas}>
            {isi}
          </article>
        );
      })}
    </section>
  );
}
