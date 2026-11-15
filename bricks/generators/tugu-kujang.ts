import { brick, TINGGI_BRICK, TINGGI_PLAT, type Brick } from "../catalog";

const PUSAT = 7;

const TUBUH = [
  { sisi: 6, layers: 4 },
  { sisi: 4, layers: 6 },
  { sisi: 2, layers: 6 },
];

export function buildTuguKujang(): Brick[] {
  const bricks: Brick[] = [];

  for (let x = 0; x < 14; x += 2) {
    for (let z = 0; z < 14; z += 2) {
      bricks.push(brick("plat2x2", x, 0, z, "hijau"));
    }
  }

  for (let z = 0; z <= 14; z++) {
    bricks.push(brick("plat1x1", 14, 0, z, z % 2 ? "putih" : "tinta"));
  }
  for (let x = 0; x < 14; x++) {
    bricks.push(brick("plat1x1", x, 0, 14, x % 2 ? "putih" : "tinta"));
  }

  let y = TINGGI_PLAT;
  for (const { sisi, layers } of TUBUH) {
    const awal = PUSAT - sisi / 2;
    for (let k = 0; k < layers; k++, y += TINGGI_BRICK) {
      for (let x = awal; x < awal + sisi; x += 2) {
        for (let z = awal; z < awal + sisi; z += 2) {
          bricks.push(brick("brick2x2", x, y, z, "putih"));
        }
      }
    }
  }

  for (let k = 0; k < 4; k++) {
    bricks.push(brick("brick1x1", 6, y + k * TINGGI_BRICK, 6, "kuning"));
  }
  bricks.push(brick("plat1x1", 6, y + 4 * TINGGI_BRICK, 6, "kuning"));

  return bricks;
}
