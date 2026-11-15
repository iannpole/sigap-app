import type { Brick } from "../catalog";
import { jejakan } from "../catalog";
import { buildTuguKujang } from "./tugu-kujang";
import { buildKebunRaya } from "./kebun-raya";
import { buildGunungSalak } from "./gunung-salak";
import { buildRumahSakit, buildPuskesmas, buildApotek, buildAmbulans } from "./kesehatan";
import { buildKantorPolisi, buildPosPolisi, buildMobilPatroli, buildTrukDamkar } from "./keamanan";
import { buildGOR, buildKolamRenang, buildLapanganBasket, buildBola } from "./olahraga";
import { buildHutan } from "./hutan";

export interface Penempatan {
  id: string;
  nama: string;
  distrik: "kota" | "olahraga" | "kesehatan" | "keamanan";
  x: number;
  z: number;
  build: () => Brick[];
}

export interface Kotak {
  x: number;
  z: number;
  w: number;
  d: number;
}

export const UKURAN_KOTA = { w: 112, d: 64 } as const;

export const PENEMPATAN: readonly Penempatan[] = [
  { id: "kebun-raya", nama: "Kebun Raya", distrik: "kota", x: 2, z: 2, build: buildKebunRaya },
  { id: "tugu-kujang", nama: "Tugu Kujang", distrik: "kota", x: 48, z: 2, build: buildTuguKujang },
  { id: "gunung-salak", nama: "Gunung Salak", distrik: "kota", x: 88, z: 2, build: buildGunungSalak },
  { id: "hutan", nama: "Hutan", distrik: "kota", x: 20, z: 4, build: buildHutan },

  { id: "gor", nama: "GOR", distrik: "olahraga", x: 2, z: 28, build: buildGOR },
  { id: "kolam-renang", nama: "Kolam Renang", distrik: "olahraga", x: 24, z: 28, build: buildKolamRenang },
  { id: "lapangan-basket", nama: "Lapangan Basket", distrik: "olahraga", x: 2, z: 46, build: buildLapanganBasket },
  { id: "bola", nama: "Bola", distrik: "olahraga", x: 24, z: 46, build: buildBola },

  { id: "rumah-sakit", nama: "Rumah Sakit", distrik: "kesehatan", x: 42, z: 28, build: buildRumahSakit },
  { id: "puskesmas", nama: "Puskesmas", distrik: "kesehatan", x: 60, z: 28, build: buildPuskesmas },
  { id: "apotek", nama: "Apotek", distrik: "kesehatan", x: 42, z: 44, build: buildApotek },
  { id: "ambulans", nama: "Ambulans", distrik: "kesehatan", x: 52, z: 44, build: buildAmbulans },

  { id: "kantor-polisi", nama: "Kantor Polisi", distrik: "keamanan", x: 76, z: 28, build: buildKantorPolisi },
  { id: "pos-polisi", nama: "Pos Polisi", distrik: "keamanan", x: 94, z: 28, build: buildPosPolisi },
  { id: "mobil-patroli", nama: "Mobil Patroli", distrik: "keamanan", x: 76, z: 44, build: buildMobilPatroli },
  { id: "truk-damkar", nama: "Truk Damkar", distrik: "keamanan", x: 88, z: 44, build: buildTrukDamkar },
] as const;

export function kotakModel(build: () => Brick[]): Kotak {
  const bricks = build();
  const minX = Math.min(...bricks.map((b) => b.x));
  const minZ = Math.min(...bricks.map((b) => b.z));
  const maxX = Math.max(...bricks.map((b) => b.x + jejakan(b).w));
  const maxZ = Math.max(...bricks.map((b) => b.z + jejakan(b).d));
  return { x: minX, z: minZ, w: maxX - minX, d: maxZ - minZ };
}

export function kotakPenempatan(p: Penempatan): Kotak {
  const k = kotakModel(p.build);
  return { x: p.x + k.x, z: p.z + k.z, w: k.w, d: k.d };
}

export function bertabrakan(a: Kotak, b: Kotak): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.z < b.z + b.d && b.z < a.z + a.d;
}

export function validasiPenempatan(): string[] {
  const errors: string[] = [];
  PENEMPATAN.forEach((a, i) => {
    const ka = kotakPenempatan(a);
    if (ka.x < 0 || ka.z < 0 || ka.x + ka.w > UKURAN_KOTA.w || ka.z + ka.d > UKURAN_KOTA.d) {
      errors.push(`${a.id} keluar dari baseplate`);
    }
    PENEMPATAN.forEach((b, j) => {
      if (j <= i) return;
      if (bertabrakan(ka, kotakPenempatan(b))) errors.push(`${a.id} bertabrakan dengan ${b.id}`);
    });
  });
  return errors;
}
