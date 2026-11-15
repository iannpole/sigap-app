import { brick, TINGGI_BRICK, TINGGI_PLAT, type Brick } from "../catalog";

const TITIK = [1, 5, 9, 13];

export function buildHutan(): Brick[] {
  const bricks: Brick[] = [];

  for (let x = 0; x < 14; x += 2) {
    for (let z = 0; z < 14; z += 2) {
      bricks.push(brick("plat2x2", x, 0, z, "hijau"));
    }
  }

  for (const x of TITIK) {
    for (const z of TITIK) {
      bricks.push(brick("brick1x1", x, TINGGI_PLAT, z, "tinta"));
      bricks.push(brick("brick2x2", x - 1, TINGGI_PLAT + TINGGI_BRICK, z - 1, "hijau"));
    }
  }

  return bricks;
}
