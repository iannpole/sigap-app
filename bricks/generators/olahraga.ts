import { brick, TINGGI_BRICK, TINGGI_PLAT, type Brick } from "../catalog";
import { isi } from "./isi";

export function buildGOR(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 20, 14, 0, "kuning", { layers: 2 }));
  out.push(...isi(0, 0, 20, 14, 2 * TINGGI_BRICK, "hijau", { plat: true }));
  return out;
}

export function buildKolamRenang(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 14, 10, 0, "putih", { plat: true }));
  out.push(...isi(1, 1, 12, 8, TINGGI_PLAT, "biru", { plat: true }));
  return out;
}

export function buildLapanganBasket(): Brick[] {
  const out: Brick[] = [];
  out.push(...isi(0, 0, 10, 16, 0, "hijau", { plat: true }));
  for (let k = 0; k < 5; k++) {
    out.push(brick("brick1x1", 4, TINGGI_PLAT + k * TINGGI_BRICK, 0, "tinta"));
  }
  return out;
}

export function buildBola(): Brick[] {
  return [brick("brick1x1", 0, 0, 0, "putih"), brick("plat1x1", 0, TINGGI_BRICK, 0, "tinta")];
}
