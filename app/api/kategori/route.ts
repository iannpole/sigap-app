import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { Kategori } from "@/entities";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ds = await getDataSource();
    const rows = await ds
      .getRepository(Kategori)
      .createQueryBuilder("k")
      .leftJoinAndSelect("k.subKategori", "s")
      .orderBy("k.id", "ASC")
      .addOrderBy("s.id", "ASC")
      .getMany();

    const data = rows.map((k) => ({
      id: k.id,
      namaKategori: k.namaKategori,
      subKategori: (k.subKategori ?? []).map((s) => ({
        id: s.id,
        namaSubKategori: s.namaSubKategori,
      })),
    }));

    return NextResponse.json({ success: true, data, message: "" });
  } catch (err) {
    console.error("GET /api/kategori", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
