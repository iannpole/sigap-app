import type { DataSource } from "typeorm";
import { LokasiLayanan, SubKategori } from "@/entities";
import { toFeature } from "@/lib/geojson";

export const WILAYAH = ["Kota Bogor", "Kabupaten Bogor"];

const TEXT_FIELDS = [
  ["nama", 150],
  ["alamat", null],
  ["noKontak", 30],
  ["jamOperasional", 100],
  ["fotoUrl", 255],
] as const;

export interface LokasiInput {
  subKategoriId?: number;
  nama?: string;
  wilayah?: string;
  lat?: number;
  lng?: number;
  alamat?: string | null;
  noKontak?: string | null;
  jamOperasional?: string | null;
  fotoUrl?: string | null;
}

function num(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Validasi body. `partial` = PUT (semua field opsional); POST mewajibkan field inti. */
export function parseLokasiBody(
  body: Record<string, unknown>,
  partial: boolean
): { value: LokasiInput } | { error: string } {
  const out: LokasiInput = {};

  if (body.subKategoriId !== undefined) {
    const n = typeof body.subKategoriId === "number" ? body.subKategoriId : num(body.subKategoriId);
    if (n === null || !Number.isInteger(n) || n <= 0 || n > 2147483647) {
      return { error: "subKategoriId harus integer valid" };
    }
    out.subKategoriId = n;
  } else if (!partial) return { error: "subKategoriId wajib diisi" };

  if (body.wilayah !== undefined) {
    if (typeof body.wilayah !== "string" || !WILAYAH.includes(body.wilayah)) {
      return { error: `wilayah harus salah satu dari: ${WILAYAH.join(", ")}` };
    }
    out.wilayah = body.wilayah;
  } else if (!partial) return { error: "wilayah wajib diisi" };

  for (const [key, max] of TEXT_FIELDS) {
    const v = body[key];
    if (v === undefined) {
      if (!partial && key === "nama") return { error: "nama wajib diisi" };
      continue;
    }
    if (v === null && key !== "nama") {
      out[key] = null;
      continue;
    }
    if (typeof v !== "string") return { error: `${key} harus berupa string` };
    const t = v.trim();
    if (key === "nama" && !t) return { error: "nama tidak boleh kosong" };
    if (max !== null && t.length > max) return { error: `${key} maksimal ${max} karakter` };
    out[key] = t === "" ? null : t;
  }

  const hasLat = body.lat !== undefined;
  const hasLng = body.lng !== undefined;
  if (hasLat !== hasLng) return { error: "lat dan lng harus dikirim bersamaan" };
  if (hasLat) {
    const lat = num(body.lat);
    const lng = num(body.lng);
    if (lat === null || lat < -90 || lat > 90) return { error: "lat harus angka antara -90 dan 90" };
    if (lng === null || lng < -180 || lng > 180) return { error: "lng harus angka antara -180 dan 180" };
    out.lat = lat;
    out.lng = lng;
  } else if (!partial) return { error: "lat dan lng wajib diisi" };

  return { value: out };
}

export async function subKategoriExists(ds: DataSource, id: number) {
  return ds.getRepository(SubKategori).existsBy({ id });
}

/** Ambil lokasi + relasi, kembalikan `properties` GeoJSON-nya (atau null). */
export async function loadLokasiProps(ds: DataSource, id: number) {
  const l = await ds
    .getRepository(LokasiLayanan)
    .createQueryBuilder("l")
    .innerJoinAndSelect("l.subKategori", "s")
    .innerJoinAndSelect("s.kategori", "k")
    .where("l.id = :id", { id })
    .getOne();
  return l ? toFeature(l).properties : null;
}

// lat/lng sudah divalidasi sebagai number finite, aman diinterpolasi.
export const pointSql = (lng: number, lat: number) => () =>
  `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
