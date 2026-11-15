export const DURASI_LAYER = 0.2;

export function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

export function sisaJatuh(layer: number, layers: number, t: number): number {
  const mulai = (layer / layers) * (1 - DURASI_LAYER);
  const p = clamp01((t - mulai) / DURASI_LAYER);
  return 1 - easeOutCubic(p);
}
