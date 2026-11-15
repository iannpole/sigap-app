import { brick, TINGGI_BRICK, TINGGI_PLAT, type Brick, type Warna } from "../catalog";

export function tinggiLayer(plat: boolean): number {
  return plat ? TINGGI_PLAT : TINGGI_BRICK;
}

export function isi(
  x0: number,
  z0: number,
  w: number,
  d: number,
  y: number,
  warna: Warna,
  opts: { layers?: number; plat?: boolean } = {},
): Brick[] {
  const out: Brick[] = [];
  const plat = opts.plat ?? false;
  const layers = opts.layers ?? 1;
  const h = tinggiLayer(plat);
  for (let k = 0; k < layers; k++) {
    const yy = y + k * h;
    for (let i = 0; i < w; i += 2) {
      for (let j = 0; j < d; j += 2) {
        const bw = Math.min(2, w - i);
        const bd = Math.min(2, d - j);
        if (bw === 2 && bd === 2) {
          out.push(brick(plat ? "plat2x2" : "brick2x2", x0 + i, yy, z0 + j, warna));
          continue;
        }
        for (let a = 0; a < bw; a++) {
          for (let b = 0; b < bd; b++) {
            out.push(brick(plat ? "plat1x1" : "brick1x1", x0 + i + a, yy, z0 + j + b, warna));
          }
        }
      }
    }
  }
  return out;
}

export function geser(bricks: Brick[], dx: number, dy: number, dz: number): Brick[] {
  return bricks.map((b) => ({ ...b, x: b.x + dx, y: b.y + dy, z: b.z + dz }));
}
