import { jejakan, type Brick } from "../catalog";

export interface Statistik {
  brick: number;
  stud: number;
  layer: number;
}

export interface Hasil {
  ok: boolean;
  errors: string[];
  stats: Statistik;
}

export interface Stud {
  x: number;
  y: number;
  z: number;
}

function tumpangTindih(a: Brick, b: Brick): boolean {
  const ja = jejakan(a);
  const jb = jejakan(b);
  return a.x < b.x + jb.w && b.x < a.x + ja.w && a.z < b.z + jb.d && b.z < a.z + ja.d;
}

function menopang(a: Brick, b: Brick): boolean {
  return b.y + b.tinggi === a.y && tumpangTindih(a, b);
}

export function studSlots(bricks: Brick[]): Stud[] {
  const slots: Stud[] = [];
  for (const a of bricks) {
    const { w, d } = jejakan(a);
    const puncak = a.y + a.tinggi;
    for (let x = a.x; x < a.x + w; x++) {
      for (let z = a.z; z < a.z + d; z++) {
        const tertutup = bricks.some((b) => {
          if (b.y !== puncak) return false;
          const jb = jejakan(b);
          return x >= b.x && x < b.x + jb.w && z >= b.z && z < b.z + jb.d;
        });
        if (!tertutup) slots.push({ x, y: puncak, z });
      }
    }
  }
  return slots;
}

export function validate(bricks: Brick[], maxBrick: number): Hasil {
  const errors: string[] = [];

  bricks.forEach((a, i) => {
    bricks.forEach((b, j) => {
      if (j <= i) return;
      const vertikal = a.y < b.y + b.tinggi && b.y < a.y + a.tinggi;
      if (vertikal && tumpangTindih(a, b)) errors.push(`overlap: brick ${i} dan ${j}`);
    });
    if (a.y > 0 && !bricks.some((b) => menopang(a, b))) {
      errors.push(`melayang: brick ${i} di layer ${a.y}`);
    }
  });

  if (bricks.length > maxBrick) errors.push(`melebihi anggaran: ${bricks.length} > ${maxBrick}`);

  const layer = new Set(bricks.map((b) => b.y)).size;

  return {
    ok: errors.length === 0,
    errors,
    stats: { brick: bricks.length, stud: studSlots(bricks).length, layer },
  };
}
