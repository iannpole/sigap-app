"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Menu, Phone, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = logoRef.current;
    if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      animate(el, { opacity: [0, 1], translateY: [-8, 0], duration: 700, ease: "outExpo" });
    }
  }, []);

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
        <Link ref={logoRef} href="/" className="flex items-center text-left" aria-label="SIGAP Bogor, beranda">
          <Image
            src="/logo/sigap-logo-trim.png"
            alt="SIGAP Bogor"
            width={1229}
            height={305}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Navigasi utama">
          <Link href="/#peta-hasil" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--tinta)] hover:bg-[var(--mist)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
            Peta layanan
          </Link>
          <Link href="/layanan" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--tinta)] hover:bg-[var(--mist)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
            Daftar layanan
          </Link>
          <Link href="/tentang" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--tinta)] hover:bg-[var(--mist)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]">
            Tentang
          </Link>
          <Link href="/darurat" className="flex min-h-11 items-center gap-2 rounded-xl bg-[#C8261E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#A91F19] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433]">
            <Phone size={16} aria-hidden="true" />
            Darurat 112
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/darurat" aria-label="Buka halaman darurat 112" className="grid h-11 w-11 place-items-center rounded-xl bg-[#C8261E] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433] md:hidden">
            <Phone size={18} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-xl border border-black/10 bg-[var(--panel)] text-[var(--tinta)] md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="grid gap-1 border-t border-black/5 bg-[var(--panel)] px-4 py-3 md:hidden" aria-label="Navigasi seluler">
          <Link href="/#peta-hasil" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--tinta)]">
            Peta layanan
          </Link>
          <Link href="/layanan" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--tinta)]">
            Daftar layanan
          </Link>
          <Link href="/tentang" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--tinta)]">
            Tentang
          </Link>
          <Link href="/darurat" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#C8261E] px-4 py-3 text-sm font-bold text-white">
            <Phone size={16} aria-hidden="true" />
            Darurat 112
          </Link>
        </nav>
      )}
    </header>
  );
}
