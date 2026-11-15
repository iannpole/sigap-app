import { brick, TINGGI_PLAT, type Brick, type Warna } from "../catalog";
import { geser } from "./isi";
import { PENEMPATAN, UKURAN_KOTA, validasiPenempatan } from "./kota-layout";

export function warnaBaseplate(x: number, z: number): Warna {
  if (z >= 20 && z < 24) return "tinta";
  if (z >= 24 && x >= 38 && x < 40) return "tinta";
  if (z >= 24 && x >= 72 && x < 74) return "tinta";
  if (z < 24 && x >= 20 && x < 36) return "hijau";
  if (z >= 24 && x < 38 && (x < 2 || z < 26)) return "hijau";
  if (z >= 24 && x >= 40 && x < 72 && (x < 42 || z < 26)) return "merah";
  if (z >= 24 && x >= 74 && (x < 76 || z < 26)) return "biru";
  return "krem";
}

export function buildKotaSigap(): Brick[] {
  const errors = validasiPenempatan();
  if (errors.length) throw new Error(errors.join("; "));

  const out: Brick[] = [];
  for (let x = 0; x < UKURAN_KOTA.w; x += 2) {
    for (let z = 0; z < UKURAN_KOTA.d; z += 2) {
      out.push(brick("plat2x2", x, 0, z, warnaBaseplate(x, z)));
    }
  }

  for (const p of PENEMPATAN) {
    out.push(...geser(p.build(), p.x, TINGGI_PLAT, p.z));
  }
  return out;
}
