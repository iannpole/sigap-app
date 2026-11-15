"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dasar = scrolled
    ? "border-b border-black/5 bg-[var(--panel)] shadow-soft"
    : "border-b border-transparent bg-transparent";

  return (
    <header className={`fixed inset-x-0 top-0 z-[1500] transition-colors duration-200 ${dasar}`}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center text-left" aria-label="SIGAP Bogor, beranda">
          <Image
            src="/logo/sigap-logo.png"
            alt="SIGAP Bogor"
            width={240}
            height={120}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navigasi utama">
          <a href="#peta-hasil" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--tinta)] hover:bg-[var(--mist)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
            Peta layanan
          </a>
          <Link href="/admin" className="rounded-xl bg-[#1F5FD1] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1B7F37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433]">
            Portal admin
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-[var(--panel)] text-[var(--tinta)] md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-black/5 bg-[var(--panel)] px-4 py-3 md:hidden" aria-label="Navigasi seluler">
          <a href="#peta-hasil" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--tinta)]">
            Peta layanan
          </a>
          <Link href="/admin" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold text-[#1F5FD1]">
            Portal admin
          </Link>
        </nav>
      )}
    </header>
  );
}
