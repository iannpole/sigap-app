"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate } from "animejs";

export default function SplashLoader() {
  const [tampil, setTampil] = useState(true);
  const [persen, setPersen] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const isiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const isi = isiRef.current;
    if (!root || !isi) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hitung = { v: 0 };

    const anim = animate(hitung, {
      v: [0, 100],
      duration: reduce ? 0 : 1600,
      ease: "inOutQuad",
      onUpdate: () => {
        isi.style.clipPath = `inset(0 ${100 - hitung.v}% 0 0)`;
        setPersen(Math.round(hitung.v));
      },
      onComplete: () => {
        animate(root, {
          opacity: [1, 0],
          duration: reduce ? 0 : 450,
          ease: "outQuad",
          onComplete: () => setTampil(false),
        });
      },
    });

    return () => {
      anim.revert();
    };
  }, []);

  if (!tampil) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[var(--panel)]"
    >
      <span className="sr-only">Memuat SIGAP Bogor</span>
      <div className="relative w-[min(70vw,520px)]" aria-hidden="true">
        <Image
          src="/logo/sigap-logo-trim.png"
          alt=""
          width={1229}
          height={305}
          priority
          className="block h-auto w-full opacity-20 grayscale"
        />
        <div ref={isiRef} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
          <Image
            src="/logo/sigap-logo-trim.png"
            alt=""
            width={1229}
            height={305}
            priority
            className="block h-auto w-full"
          />
        </div>
        <p className="absolute -bottom-8 right-0 text-sm font-bold tabular-nums text-[var(--tinta)]">
          memuat... {persen}%
        </p>
      </div>
    </div>
  );
}
