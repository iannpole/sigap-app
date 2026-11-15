import { TINGGI_BRICK, type Brick } from "../catalog";
import { isi, tinggiLayer } from "./isi";

export function buildKantorPolisi(): Brick[] {
  const out: Brick[] = [];
  for (let k = 0; k < 3; k++) {
    const warna = k === 1 ? "putih" : "biru";
    out.push(...isi(0, 0, 16, 12, k * TINGGI_BRICK, warna));
  }
  const atap = 3 * TINGGI_BRICK;
  out.push(...isi(0, 0, 16, 12, atap, "biru", { plat: true }));
  out.push(...isi(6, 4, 4, 4, atap + tinggiLayer(true), "putih", { layers: 2 }));
  out.push(...isi(6, 4, 4, 4, atap + tinggiLayer(true) + 2 * TINGGI_BRICK, "biru", { plat: true }));
  return out;
}

export function buildPosPolisi(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 8, 6, 0, "biru", { layers: 2 }));
  out.push(...isi(0, 0, 8, 6, 2 * TINGGI_BRICK, "putih", { plat: true }));
  return out;
}

export function buildMobilPatroli(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 8, 4, 0, "biru"));
  out.push(...isi(2, 0, 4, 4, TINGGI_BRICK, "putih"));
  return out;
}

export function buildTrukDamkar(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 10, 4, 0, "biru", { layers: 2 }));
  out.push(...isi(0, 0, 4, 4, 2 * TINGGI_BRICK, "putih"));
  return out;
}
