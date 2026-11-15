import { brick, TINGGI_BRICK, TINGGI_PLAT, type Brick, type Warna } from "../catalog";

interface Gunung {
  x: number;
  z: number;
  lebar: number;
  layers: number;
}

export const LEBAR_SALAK = 24;
export const DALAM_SALAK = 18;

const GUNUNG: Gunung[] = [
  { x: 0, z: 4, lebar: 6, layers: 2 },
  { x: 6, z: 2, lebar: 12, layers: 4 },
  { x: 18, z: 4, lebar: 6, layers: 2 },
];

function warnaGunung(k: number, layers: number): Warna {
  if (k === layers - 1) return "putih";
  if (k >= layers - 2) return "tinta";
  return "hijau";
}

export function buildGunungSalak(): Brick[] {
  const bricks: Brick[] = [];

  for (let x = 0; x < LEBAR_SALAK; x += 2) {
    for (let z = 0; z < DALAM_SALAK; z += 2) {
      bricks.push(brick("plat2x2", x, 0, z, "hijau"));
    }
  }

  for (const g of GUNUNG) {
    for (let k = 0; k < g.layers; k++) {
      const inset = 2 * k;
      const sisi = g.lebar - inset * 2;
      const y = TINGGI_PLAT + k * TINGGI_BRICK;
      for (let x = g.x + inset; x < g.x + inset + sisi; x += 2) {
        for (let z = g.z + inset; z < g.z + inset + sisi; z += 2) {
          bricks.push(brick("brick2x2", x, y, z, warnaGunung(k, g.layers)));
        }
      }
    }
  }

  return bricks;
}
