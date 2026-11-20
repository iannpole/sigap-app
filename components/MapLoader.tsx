"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export default function MapLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pin = root.querySelectorAll("[data-pin]");
    const anim = animate(pin, {
      translateY: [-14, 0],
      opacity: [0.2, 1],
      duration: 620,
      ease: "outBounce",
      delay: stagger(140),
      loop: true,
      loopDelay: 400,
    });
    return () => {
      anim.revert();
    };
  }, []);

  return (
    <div ref={ref} role="status" aria-label="Memuat peta" className="flex h-full w-full items-center justify-center gap-3 bg-[var(--mist)]">
      {["#C8261E", "#1F5FD1", "#F5C400"].map((warna) => (
        <span key={warna} data-pin className="block h-5 w-5 rotate-45 rounded-tl-full rounded-tr-full rounded-br-full border-2 border-[#070A18]" style={{ background: warna }} />
      ))}
    </div>
  );
}
