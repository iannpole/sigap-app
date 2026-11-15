import { brick, TINGGI_BRICK, TINGGI_PLAT, type Brick } from "../catalog";

const POHON = [2, 5, 11, 14];
const KOLAM = [6, 8];

export function buildKebunRaya(): Brick[] {
  const bricks: Brick[] = [];

  for (let x = 0; x < 16; x += 2) {
    for (let z = 0; z < 16; z += 2) {
      bricks.push(brick("plat2x2", x, 0, z, "hijau"));
    }
  }

  for (const x of KOLAM) {
    for (const z of KOLAM) {
      bricks.push(brick("plat2x2", x, TINGGI_PLAT, z, "biru"));
    }
  }

  for (const x of POHON) {
    for (const z of POHON) {
      bricks.push(brick("brick1x1", x, TINGGI_PLAT, z, "tinta"));
      bricks.push(brick("brick2x2", x - 1, TINGGI_PLAT + TINGGI_BRICK, z - 1, "hijau"));
    }
  }

  return bricks;
}
