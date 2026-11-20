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
      jumlahLokasi: typeof k.jumlahLokasi === "number" ? k.jumlahLokasi : 0,
      subKategori: k.subKategori.map((s) => {
        if (!isObj(s) || typeof s.id !== "number" || typeof s.namaSubKategori !== "string") throw invalid("subkategori");
        return {
          id: s.id,
          namaSubKategori: s.namaSubKategori,
          jumlahLokasi: typeof s.jumlahLokasi === "number" ? s.jumlahLokasi : 0,
        };
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
      deskripsi: strOrNull(p.deskripsi),
      detailFasilitas: isObj(p.detailFasilitas) ? p.detailFasilitas : null,
      jarakMeter: typeof p.jarak === "number" && Number.isFinite(p.jarak) ? p.jarak : null,
      lat: coords[1],
      lng: coords[0],
    };
  });
}

export async function fetchKategori(signal?: AbortSignal): Promise<Kategori[]> {
  return parseKategori(await getJson("/api/kategori", signal));
}

export async function fetchLokasi(
  signal?: AbortSignal,
  origin?: { lat: number; lng: number }
): Promise<Lokasi[]> {
  const params = new URLSearchParams({ limit: "100" });
  if (origin) {
    params.set("lat", String(origin.lat));
    params.set("lng", String(origin.lng));
    params.set("urut", "jarak");
  }
  return parseLokasi(await getJson(`/api/lokasi?${params}`, signal));
}

export interface LokasiPage {
  items: Lokasi[];
  nextCursor: number | null;
}

export async function fetchLokasiPage(
  params: {
    q?: string;
    kategori?: number | null;
    subkategori?: number | null;
    cursor?: number | null;
    limit?: number;
  },
  signal?: AbortSignal
): Promise<LokasiPage> {
  const sp = new URLSearchParams({ limit: String(params.limit ?? 12) });
  if (params.q) sp.set("q", params.q);
  if (params.kategori != null) sp.set("kategori", String(params.kategori));
  if (params.subkategori != null) sp.set("subkategori", String(params.subkategori));
  if (params.cursor != null) sp.set("cursor", String(params.cursor));

  const body = await getJson(`/api/lokasi?${sp}`, signal);
  const items = parseLokasi(body);
  const meta = isObj(body) && isObj(body.metadata) ? body.metadata : null;
  const nextCursor =
    meta && typeof meta.nextCursor === "number" && Number.isSafeInteger(meta.nextCursor) ? meta.nextCursor : null;
  return { items, nextCursor };
}
