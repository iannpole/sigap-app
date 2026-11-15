import type { Warna } from "../catalog";

export interface Titik {
  x: number;
  z: number;
}

export interface Npc {
  id: string;
  nama: string;
  warna: Warna;
  jalur: Titik[];
  kecepatan: number;
}

export const NPC: readonly Npc[] = [
  { id: "kes-a", nama: "Petugas kesehatan", warna: "merah", kecepatan: 4, jalur: [{ x: 44, z: 22 }, { x: 68, z: 22 }] },
  { id: "kes-b", nama: "Petugas puskesmas", warna: "merah", kecepatan: 3.5, jalur: [{ x: 39, z: 26 }, { x: 39, z: 44 }] },
  { id: "kam-a", nama: "Petugas keamanan", warna: "biru", kecepatan: 4.5, jalur: [{ x: 76, z: 22 }, { x: 100, z: 22 }] },
  { id: "kam-b", nama: "Patroli polisi", warna: "biru", kecepatan: 3, jalur: [{ x: 73, z: 26 }, { x: 73, z: 46 }] },
  { id: "or-a", nama: "Petugas olahraga", warna: "hijau", kecepatan: 4, jalur: [{ x: 4, z: 22 }, { x: 34, z: 22 }] },
  { id: "or-b", nama: "Pelatih", warna: "kuning", kecepatan: 3.5, jalur: [{ x: 39, z: 46 }, { x: 39, z: 60 }] },
] as const;

export function panjangJalur(jalur: Titik[]): number {
  let total = 0;
  for (let i = 1; i < jalur.length; i++) {
    total += Math.hypot(jalur[i].x - jalur[i - 1].x, jalur[i].z - jalur[i - 1].z);
  }
  return total;
}

export interface PosisiNpc {
  x: number;
  z: number;
  hadap: number;
  langkah: number;
}

export function posisiNpc(npc: Npc, t: number): PosisiNpc {
  const total = panjangJalur(npc.jalur);
  if (total === 0) {
    return { x: npc.jalur[0].x, z: npc.jalur[0].z, hadap: 0, langkah: 0 };
  }

  const siklus = total * 2;
  const mentah = ((t * npc.kecepatan) % siklus + siklus) % siklus;
  const maju = mentah <= total;
  const jarak = maju ? mentah : siklus - mentah;

  let sisa = jarak;
  for (let i = 1; i < npc.jalur.length; i++) {
    const a = npc.jalur[i - 1];
    const b = npc.jalur[i];
    const seg = Math.hypot(b.x - a.x, b.z - a.z);
    if (sisa <= seg || i === npc.jalur.length - 1) {
      const p = seg === 0 ? 0 : Math.min(1, sisa / seg);
      const arah = maju ? 1 : -1;
      return {
        x: a.x + (b.x - a.x) * p,
        z: a.z + (b.z - a.z) * p,
        hadap: Math.atan2((b.x - a.x) * arah, (b.z - a.z) * arah),
        langkah: jarak * 1.6,
      };
    }
    sisa -= seg;
  }

  const akhir = npc.jalur[npc.jalur.length - 1];
  return { x: akhir.x, z: akhir.z, hadap: 0, langkah: 0 };
}
