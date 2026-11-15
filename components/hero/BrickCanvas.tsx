"use client";

import { useEffect, useRef } from "react";
import { MODEL } from "@/bricks/generators";
import type { Kontrol } from "@/bricks/render/mount";

const MODEL_UTAMA = MODEL.find((m) => m.id === "kota-sigap") ?? MODEL[0];

function perangkatLemah(): boolean {
  const n = navigator as Navigator & { deviceMemory?: number };
  return (n.hardwareConcurrency ?? 8) <= 2 || (n.deviceMemory ?? 8) <= 2;
}

function heroAktif(): boolean {
  return window.scrollY < window.innerHeight * 0.45;
}

export default function BrickCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const kontrolRef = useRef<Kontrol | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const probe = document.createElement("canvas");
    const webgl = !!(probe.getContext("webgl2") ?? probe.getContext("webgl"));
    if (!webgl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = !reduce && !perangkatLemah();
    let batal = false;
    let kontrol: Kontrol | undefined;
    let lepas: (() => void) | undefined;
    let lepasTema: (() => void) | undefined;

    import("@/bricks/render/mount").then(({ mount }) => {
      if (batal) return;
      kontrol = mount({ canvas, bricks: MODEL_UTAMA.build(), animate });
      kontrolRef.current = kontrol;
      if (animate) kontrol.play();

      const terapkanTema = () => kontrol?.setMalam(document.documentElement.classList.contains("dark"));
      terapkanTema();
      const pengamat = new MutationObserver(terapkanTema);
      pengamat.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      lepasTema = () => pengamat.disconnect();

      const onScroll = () => {
        if (!heroAktif()) kontrolRef.current?.aim(0, 0);
      };
      const onMove = (e: PointerEvent) => {
        const k = kontrolRef.current;
        if (!k || !animate || !heroAktif()) return;
        const r = canvas.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
        k.aim(nx, ny);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onMove, { passive: true });
      lepas = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onMove);
      };
    });

    return () => {
      batal = true;
      lepas?.();
      lepasTema?.();
      kontrol?.dispose();
      kontrolRef.current = null;
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="block h-full w-full" />;
}
