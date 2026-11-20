"use client";

import { useEffect, useRef } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { PixelSprite, SPRITE_AMBULANS, SPRITE_PELARI, SPRITE_POLISI } from "@/components/PixelSprite";

function Pelari({ warna }: { warna: keyof typeof SPRITE_PELARI }) {
  return (
    <span className="relative block" data-pelari style={{ width: 24, height: 42 }}>
      <span className="absolute inset-0" data-frame="A"><PixelSprite sprite={SPRITE_PELARI[warna].A} /></span>
      <span className="absolute inset-0 opacity-0" data-frame="B"><PixelSprite sprite={SPRITE_PELARI[warna].B} /></span>
      <span className="absolute inset-0 opacity-0" data-frame="C"><PixelSprite sprite={SPRITE_PELARI[warna].C} /></span>
      <span className="absolute bottom-1 -right-2 block h-1 w-1 rounded-full bg-white/50" data-debu />
    </span>
  );
}

export default function FooterJalur() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lebar = root.clientWidth;
    const [kendaraan, lari] = root.querySelectorAll<HTMLElement>("[data-jalur]");
    const sirene = root.querySelectorAll<HTMLElement>("[data-sirene]");
    const pelari = root.querySelectorAll<HTMLElement>("[data-pelari]");
    const debu = root.querySelectorAll<HTMLElement>("[data-debu]");
    const frames = ["A", "B", "C"].map((f) => root.querySelectorAll<HTMLElement>(`[data-frame="${f}"]`));

    const langkah = createTimeline({ loop: true, defaults: { ease: "steps(1)" } });
    frames.forEach((set, i) => {
      langkah.add(set, { opacity: 1, duration: 0 }, i * 110);
      langkah.add(set, { opacity: 0, duration: 0 }, i * 110 + 110);
    });
    langkah.init();

    const anims = [
      animate(kendaraan, { translateX: [-260, lebar], duration: 9000, ease: "linear", loop: true }),
      animate(lari, { translateX: [-180, lebar], duration: 10000, ease: "linear", loop: true }),
      animate(pelari, { translateY: [0, -4, 0], duration: 330, ease: "inOutQuad", loop: true, delay: stagger(60) }),
      animate(debu, { translateX: [0, -18], translateY: [0, -6], opacity: [0.7, 0], scale: [1, 0.4], duration: 500, ease: "outQuad", loop: true, delay: stagger(120) }),
      animate(sirene, { opacity: [1, 0.15], duration: 320, ease: "steps(1)", alternate: true, loop: true }),
    ];

    const pengamat = new IntersectionObserver(([entri]) => {
      const jalan = entri.isIntersecting;
      anims.forEach((a) => (jalan ? a.play() : a.pause()));
      if (jalan) langkah.play();
      else langkah.pause();
    });
    pengamat.observe(root);

    return () => {
      pengamat.disconnect();
      langkah.revert();
      anims.forEach((a) => a.revert());
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none relative hidden h-16 overflow-hidden md:block motion-reduce:hidden"
    >
      <div className="absolute inset-x-0 bottom-3 border-t border-dashed border-white/25" />

      <div data-jalur className="absolute bottom-3 left-0 flex items-end gap-[10px]">
        <PixelSprite sprite={SPRITE_POLISI} />
        <PixelSprite sprite={SPRITE_AMBULANS} />
      </div>

      <div data-jalur className="absolute bottom-3 left-0 flex items-end gap-6">
        <Pelari warna="merah" />
        <Pelari warna="kuning" />
        <Pelari warna="hijau" />
      </div>
    </div>
  );
}
