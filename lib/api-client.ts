import type { Kategori, Lokasi } from "./types";

export class ApiError extends Error {}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const strOrNull = (v: unknown): string | null => (typeof v === "string" ? v : null);

function errorMessage(body: unknown, status: number): string {
  if (isObj(body)) {
    if (typeof body.error === "string" && body.error) return body.error;
    if (typeof body.message === "string" && body.message) return body.message;
  }
  return `Permintaan gagal (${status})`;
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal, cache: "no-store", headers: { Accept: "application/json" } });
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorMessage(body, res.status));
  return body;
}

const invalid = (what: string) => new ApiError(`Format respons ${what} tidak valid`);

function parseKategori(body: unknown): Kategori[] {
  if (!isObj(body) || body.success !== true || !Array.isArray(body.data)) throw invalid("kategori");
  return body.data.map((k) => {
    if (!isObj(k) || typeof k.id !== "number" || typeof k.namaKategori !== "string" || !Array.isArray(k.subKategori)) {
      throw invalid("kategori");
    }
    return {
      id: k.id,
      namaKategori: k.namaKategori,
      subKategori: k.subKategori.map((s) => {
        if (!isObj(s) || typeof s.id !== "number" || typeof s.namaSubKategori !== "string") throw invalid("subkategori");
        return { id: s.id, namaSubKategori: s.namaSubKategori };
      }),
    };
  });
}

function parseLokasi(body: unknown): Lokasi[] {
  if (!isObj(body) || body.type !== "FeatureCollection" || !Array.isArray(body.features)) throw invalid("lokasi");
  return body.features.map((f) => {
    if (!isObj(f) || !isObj(f.properties) || !isObj(f.geometry)) throw invalid("lokasi");
    const coords = f.geometry.coordinates;
    const p = f.properties;
    if (
      !Array.isArray(coords) ||
      typeof coords[0] !== "number" ||
      typeof coords[1] !== "number" ||
      typeof p.id !== "number" ||
      typeof p.nama !== "string" ||
      typeof p.kategoriId !== "number" ||
      typeof p.kategori !== "string" ||
      typeof p.subKategoriId !== "number" ||
      typeof p.sub !== "string" ||
      typeof p.wilayah !== "string"
    ) {
      throw invalid("lokasi");
    }
    return {
      id: p.id,
      nama: p.nama,
      kategoriId: p.kategoriId,
      kategori: p.kategori,
      subKategoriId: p.subKategoriId,
      sub: p.sub,
      alamat: strOrNull(p.alamat),
      wilayah: p.wilayah,
      noKontak: strOrNull(p.noKontak),
      jamOperasional: strOrNull(p.jamOperasional),
      fotoUrl: strOrNull(p.fotoUrl),
      lat: coords[1],
      lng: coords[0],
    };
  });
}

export async function fetchKategori(signal?: AbortSignal): Promise<Kategori[]> {
  return parseKategori(await getJson("/api/kategori", signal));
}

export async function fetchLokasi(signal?: AbortSignal): Promise<Lokasi[]> {
  return parseLokasi(await getJson("/api/lokasi", signal));
}
