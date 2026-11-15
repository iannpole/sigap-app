import { brick, TINGGI_BRICK, type Brick } from "../catalog";
import { isi, tinggiLayer } from "./isi";

export function buildRumahSakit(): Brick[] {
  const out: Brick[] = [];
  for (let k = 0; k < 4; k++) {
    const warna = k === 1 || k === 3 ? "merah" : "putih";
    out.push(...isi(0, 0, 16, 12, k * TINGGI_BRICK, warna));
  }
  const atap = 4 * TINGGI_BRICK;
  out.push(...isi(0, 0, 16, 12, atap, "putih", { plat: true }));
  for (const [x, z] of [[6, 2], [6, 4], [6, 6], [4, 4], [8, 4]]) {
    out.push(...isi(x, z, 2, 2, atap + tinggiLayer(true), "merah", { plat: true }));
  }
  return out;
}

export function buildPuskesmas(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 10, 8, 0, "putih", { layers: 2 }));
  const atap = 2 * TINGGI_BRICK;
  out.push(...isi(0, 0, 10, 8, atap, "merah", { plat: true }));
  for (const [x, z] of [[4, 2], [4, 0], [4, 4], [2, 2], [6, 2]]) {
    out.push(...isi(x, z, 2, 2, atap + tinggiLayer(true), "putih", { plat: true }));
  }
  return out;
}

export function buildApotek(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 6, 4, 0, "putih"));
  out.push(...isi(0, 0, 6, 4, TINGGI_BRICK, "merah", { plat: true }));
  for (const [x, z] of [[2, 1], [1, 1], [3, 1], [2, 0], [2, 2]]) {
    out.push(brick("plat1x1", x, TINGGI_BRICK + 1, z, "putih"));
  }
  return out;
}

export function buildAmbulans(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 8, 4, 0, "merah"));
  out.push(...isi(0, 0, 8, 4, TINGGI_BRICK, "putih"));
  for (const [x, z] of [[3, 1], [2, 1], [4, 1], [3, 0], [3, 2]]) {
    out.push(brick("plat1x1", x, 2 * TINGGI_BRICK, z, "merah"));
  }
  return out;
}
