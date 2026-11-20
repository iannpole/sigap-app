type Kotak = [x: number, y: number, w: number, h: number, warna: string];

const K = "#070A18";
const W = "#F7F5ED";
const B = "#1F5FD1";
const R = "#C8261E";
const G = "#9FB8E8";
const Y = "#F5C400";
const H = "#8D97B4";
const KULIT = "#F2C6A0";

export const SPRITE_POLISI: { w: number; h: number; kotak: Kotak[] } = {
  w: 24,
  h: 14,
  kotak: [
    [9, 0, 2, 1, R],
    [11, 0, 2, 1, B],
    [5, 2, 12, 1, K],
    [4, 3, 14, 1, K],
    [4, 3, 14, 4, W],
    [6, 4, 4, 2, G],
    [14, 4, 4, 2, G],
    [1, 7, 22, 3, W],
    [1, 7, 22, 1, K],
    [0, 8, 24, 1, K],
    [1, 8, 22, 1, B],
    [2, 10, 20, 1, K],
    [3, 9, 5, 5, K],
    [4, 10, 3, 3, H],
    [16, 9, 5, 5, K],
    [17, 10, 3, 3, H],
    [11, 4, 1, 3, K],
  ],
};

export const SPRITE_AMBULANS: { w: number; h: number; kotak: Kotak[] } = {
  w: 26,
  h: 14,
  kotak: [
    [9, 0, 4, 1, Y],
    [1, 3, 18, 8, W],
    [19, 6, 6, 5, W],
    [20, 7, 4, 2, G],
    [0, 4, 1, 6, K],
    [1, 2, 18, 1, K],
    [19, 5, 6, 1, K],
    [25, 6, 1, 5, K],
    [7, 4, 4, 4, R],
    [8, 3, 2, 6, R],
    [5, 8, 20, 1, R],
    [4, 11, 6, 1, K],
    [3, 9, 5, 5, K],
    [4, 10, 3, 3, H],
    [19, 9, 5, 5, K],
    [20, 10, 3, 3, H],
  ],
};

type Frame = "A" | "B" | "C";

function pelari(warna: string, frame: Frame): { w: number; h: number; kotak: Kotak[] } {
  const naik = frame === "B" ? 1 : 0;
  const badan: Kotak[] = [
    [2, 0 + naik, 4, 4, KULIT],
    [2, 4 + naik, 4, 5, warna],
  ];
  const tangan: Kotak[] =
    frame === "A"
      ? [
          [1, 5, 1, 4, warna],
          [6, 5, 1, 3, warna],
        ]
      : frame === "B"
        ? [
            [1, 6, 1, 3, warna],
            [6, 4, 1, 4, warna],
          ]
        : [
            [0, 5, 1, 3, warna],
            [7, 5, 1, 4, warna],
          ];
  const kaki: Kotak[] =
    frame === "A"
      ? [
          [1, 9, 2, 4, W],
          [5, 9, 2, 4, W],
          [0, 13, 3, 1, K],
          [5, 13, 3, 1, K],
        ]
      : frame === "C"
        ? [
            [0, 9, 2, 4, W],
            [6, 9, 2, 4, W],
            [0, 13, 3, 1, K],
            [6, 13, 3, 1, K],
          ]
        : [
          [2, 9, 2, 4, W],
          [4, 9, 2, 4, W],
          [1, 13, 3, 1, K],
          [4, 13, 3, 1, K],
        ];
  return { w: 8, h: 14, kotak: [...badan, ...tangan, ...kaki] };
}

export const SPRITE_PELARI = {
  merah: { A: pelari(R, "A"), B: pelari(R, "B"), C: pelari(R, "C") },
  kuning: { A: pelari(Y, "A"), B: pelari(Y, "B"), C: pelari(Y, "C") },
  hijau: { A: pelari("#1B7F37", "A"), B: pelari("#1B7F37", "B"), C: pelari("#1B7F37", "C") },
};

export function PixelSprite({
  sprite,
  skala = 3,
  className,
}: {
  sprite: { w: number; h: number; kotak: Kotak[] };
  skala?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${sprite.w} ${sprite.h}`}
      width={sprite.w * skala}
      height={sprite.h * skala}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {sprite.kotak.map(([x, y, w, h, warna], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={warna} />
      ))}
    </svg>
  );
}
