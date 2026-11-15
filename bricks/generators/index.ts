import type { Brick } from "../catalog";
import { buildTuguKujang } from "./tugu-kujang";
import { buildKebunRaya } from "./kebun-raya";
import { buildGunungSalak } from "./gunung-salak";
import { buildKotaSigap } from "./kota-sigap";

export const MODEL = [
  { id: "tugu-kujang", nama: "Tugu Kujang", build: buildTuguKujang, anggaran: 400 },
  { id: "kebun-raya", nama: "Kebun Raya", build: buildKebunRaya, anggaran: 400 },
  { id: "gunung-salak", nama: "Gunung Salak", build: buildGunungSalak, anggaran: 400 },
  { id: "kota-sigap", nama: "Kota SIGAP", build: buildKotaSigap, anggaran: 4000 },
] as const satisfies readonly { id: string; nama: string; build: () => Brick[]; anggaran: number }[];

export type ModelId = (typeof MODEL)[number]["id"];
