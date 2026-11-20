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
  ["deskripsi", 500],
] as const;

export interface DetailFasilitas {
  statusOperasional?: string | null;
  terverifikasi?: boolean;
  namaVerifikator?: string | null;
  catatanStatus?: string | null;
  statusDiperbaruiPada?: string | null;
  kapasitasTempatTidur?: number | null;
  tempatTidurTersedia?: number | null;
  jumlahDokterJaga?: number | null;
  waktuResponsMenit?: number | null;
  aksesAmbulans?: string | null;
  dokumenKedatangan?: string | null;
  hotlineDarurat?: string | null;
  hotlineMedis?: string | null;
  layananUtama?: string[];
  galeri?: { url: string; caption?: string | null }[];
}

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
  deskripsi?: string | null;
  detailFasilitas?: DetailFasilitas | null;
}

const TEXT_DETAIL = ["statusOperasional", "namaVerifikator", "catatanStatus", "statusDiperbaruiPada", "aksesAmbulans", "dokumenKedatangan", "hotlineDarurat", "hotlineMedis"] as const;
const ANGKA_DETAIL = ["kapasitasTempatTidur", "tempatTidurTersedia", "jumlahDokterJaga", "waktuResponsMenit"] as const;

/** Membersihkan detail fasilitas: field kosong dibuang, batas panjang dan URL ditegakkan. */
export function parseDetailFasilitas(v: unknown): { value: DetailFasilitas | null } | { error: string } {
  if (v === null || v === undefined) return { value: null };
  if (typeof v !== "object" || Array.isArray(v)) return { error: "detailFasilitas harus berupa object" };
  const src = v as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const key of TEXT_DETAIL) {
    const val = src[key];
    if (val === undefined || val === null || val === "") continue;
    if (typeof val !== "string" || val.trim().length > 200) return { error: `${key} harus string maksimal 200 karakter` };
    out[key] = val.trim();
  }
  for (const key of ANGKA_DETAIL) {
    const val = src[key];
    if (val === undefined || val === null || val === "") continue;
    if (typeof val !== "number" || !Number.isInteger(val) || val < 0 || val > 100000) return { error: `${key} harus integer 0-100000` };
    out[key] = val;
  }
  if (src.terverifikasi !== undefined) {
    if (typeof src.terverifikasi !== "boolean") return { error: "terverifikasi harus boolean" };
    out.terverifikasi = src.terverifikasi;
  }
  if (src.layananUtama !== undefined) {
    if (!Array.isArray(src.layananUtama) || src.layananUtama.length > 12) return { error: "layananUtama maksimal 12 item" };
    const daftar = src.layananUtama.map((x) => (typeof x === "string" ? x.trim() : ""));
    if (daftar.some((x) => x === "" || x.length > 60)) return { error: "setiap layananUtama harus teks 1-60 karakter" };
    out.layananUtama = daftar;
  }
  if (src.galeri !== undefined) {
    if (!Array.isArray(src.galeri) || src.galeri.length > 8) return { error: "galeri maksimal 8 foto" };
    const galeri: { url: string; caption: string | null }[] = [];
    for (const g of src.galeri as unknown[]) {
      const item = g as { url?: unknown; caption?: unknown };
      if (typeof item.url !== "string" || item.url.trim() === "" || !isSafeImageUrl(item.url.trim())) {
        return { error: "url galeri harus https atau path lokal diawali /" };
      }
      const caption = typeof item.caption === "string" && item.caption.trim() !== "" ? item.caption.trim().slice(0, 120) : null;
      galeri.push({ url: item.url.trim(), caption });
    }
    out.galeri = galeri;
  }

  return { value: Object.keys(out).length === 0 ? null : (out as DetailFasilitas) };
}

function num(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function isSafeImageUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

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
    if (key === "fotoUrl" && t !== "" && !isSafeImageUrl(t)) {
      return { error: "fotoUrl harus berupa URL https atau path lokal diawali /" };
    }
    out[key] = t === "" ? null : t;
  }

  if (body.detailFasilitas !== undefined) {
    const detail = parseDetailFasilitas(body.detailFasilitas);
    if ("error" in detail) return detail;
    out.detailFasilitas = detail.value;
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
  return ds.getRepository<SubKategori>("SubKategori").existsBy({ id });
}

/** Ambil lokasi + relasi, kembalikan `properties` GeoJSON-nya (atau null). */
export async function loadLokasiProps(ds: DataSource, id: number) {
  const l = await ds
    .getRepository<LokasiLayanan>("LokasiLayanan")
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
