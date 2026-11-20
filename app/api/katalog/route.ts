import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { LokasiLayanan } from "@/entities";
import { toFeature } from "@/lib/geojson";
import { serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KOLOM: { kunci: string; kategori: string[] }[] = [
  { kunci: "kesehatan", kategori: ["kesehatan"] },
  { kunci: "keselamatan", kategori: ["keselamatan", "keamanan"] },
  { kunci: "hiburan", kategori: ["hiburan", "olahraga"] },
];

export async function GET() {
  try {
    const ds = await getDataSource();
    const semua = await ds
      .getRepository<LokasiLayanan>("LokasiLayanan")
      .createQueryBuilder("l")
      .innerJoinAndSelect("l.subKategori", "s")
      .innerJoinAndSelect("s.kategori", "k")
      .orderBy("l.id", "ASC")
      .getMany();

    const kolom = KOLOM.map(({ kunci, kategori }) => ({
      kolom: kunci,
      features: semua
        .filter((l) => kategori.includes(l.subKategori.kategori.namaKategori.toLowerCase()))
        .map((l) => toFeature(l)),
    }));

    const features = kolom.flatMap((k) => k.features);
    const body = {
      type: "FeatureCollection",
      name: "katalog-sigap-bogor",
      metadata: {
        jumlah: features.length,
        kolom: kolom.map((k) => ({ kolom: k.kolom, jumlah: k.features.length })),
        dibuat: new Date().toISOString(),
      },
      features,
    };

    return new NextResponse(JSON.stringify(body), {
      headers: {
        "Content-Type": "application/geo+json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="katalog-sigap-bogor.geojson"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("GET /api/katalog", err);
    return serverError();
  }
}
