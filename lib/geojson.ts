import type { Feature, Point } from "geojson";
import type { LokasiLayanan } from "@/entities";

export function toFeature(
  lokasi: LokasiLayanan,
  jarak?: number
): Feature<Point, Record<string, unknown>> {
  const properties: Record<string, unknown> = {
    id: lokasi.id,
    nama: lokasi.nama,
    kategoriId: lokasi.subKategori.kategori.id,
    kategori: lokasi.subKategori.kategori.namaKategori,
    subKategoriId: lokasi.subKategoriId,
    sub: lokasi.subKategori.namaSubKategori,
    alamat: lokasi.alamat,
    wilayah: lokasi.wilayah,
    noKontak: lokasi.noKontak,
    jamOperasional: lokasi.jamOperasional,
    fotoUrl: lokasi.fotoUrl,
  };
  if (jarak !== undefined) properties.jarak = jarak;

  return {
    type: "Feature",
    properties,
    geometry: lokasi.koordinat,
  };
}
