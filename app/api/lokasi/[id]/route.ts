import { NextResponse, type NextRequest } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { LokasiLayanan } from "@/entities";
import { toFeature } from "@/lib/geojson";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: raw } = await ctx.params;
  const id = /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isSafeInteger(id) || id > 2147483647) {
    return NextResponse.json({ error: "id harus berupa integer valid" }, { status: 400 });
  }

  try {
    const ds = await getDataSource();
    const lokasi = await ds
      .getRepository(LokasiLayanan)
      .createQueryBuilder("l")
      .innerJoinAndSelect("l.subKategori", "s")
      .innerJoinAndSelect("s.kategori", "k")
      .where("l.id = :id", { id })
      .getOne();

    if (!lokasi) {
      return NextResponse.json({ error: "Lokasi tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(toFeature(lokasi));
  } catch (err) {
    console.error("GET /api/lokasi/[id]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
