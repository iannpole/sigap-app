export const PALET = {
  krem: "#FAF7EC",
  tinta: "#1B2433",
  putih: "#FFFFFF",
  merah: "#C8261E",
  biru: "#1F5FD1",
  hijau: "#1B7F37",
  kuning: "#F5C400",
} as const;

export type Warna = keyof typeof PALET;

export const TINGGI_BRICK = 3;
export const TINGGI_PLAT = 1;

export const KATALOG = {
  brick1x1: { w: 1, d: 1, tinggi: TINGGI_BRICK },
  brick1x2: { w: 1, d: 2, tinggi: TINGGI_BRICK },
  brick2x2: { w: 2, d: 2, tinggi: TINGGI_BRICK },
  brick2x4: { w: 2, d: 4, tinggi: TINGGI_BRICK },
  plat1x1: { w: 1, d: 1, tinggi: TINGGI_PLAT },
  plat1x2: { w: 1, d: 2, tinggi: TINGGI_PLAT },
  plat2x2: { w: 2, d: 2, tinggi: TINGGI_PLAT },
  plat2x4: { w: 2, d: 4, tinggi: TINGGI_PLAT },
} as const;

export type JenisKatalog = keyof typeof KATALOG;

export interface Brick {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  tinggi: number;
  warna: Warna;
  rotasi: 0 | 90;
}

export function brick(jenis: JenisKatalog, x: number, y: number, z: number, warna: Warna, rotasi: 0 | 90 = 0): Brick {
  const { w, d, tinggi } = KATALOG[jenis];
  return { x, y, z, w, d, tinggi, warna, rotasi };
}

export function jejakan(b: Brick): { w: number; d: number } {
  return b.rotasi === 90 ? { w: b.d, d: b.w } : { w: b.w, d: b.d };
}
