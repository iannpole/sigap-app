"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KUNCI = "sigap-tema";

export default function ThemeToggle() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains("dark"));
  }, []);

  const pilih = () => {
    const next = !gelap;
    setGelap(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KUNCI, next ? "gelap" : "terang");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={pilih}
      aria-pressed={gelap}
      aria-label={gelap ? "Matikan mode gelap" : "Aktifkan mode gelap"}
      className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-[var(--panel)] text-[var(--tinta)] transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      {gelap ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
