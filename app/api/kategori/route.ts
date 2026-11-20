import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { authorizeWrite } from "@/lib/auth";
import { Kategori } from "@/entities";
import { ok, fail, readJson, isPgUnique, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;

    const body = await readJson(req);
    const nama = typeof body?.namaKategori === "string" ? body.namaKategori.trim() : "";
    if (!nama) return fail("namaKategori wajib diisi", 400);
    if (nama.length > 50) return fail("namaKategori maksimal 50 karakter", 400);

    const ds = await getDataSource();
    const repo = ds.getRepository<Kategori>("Kategori");
    if (await repo.existsBy({ namaKategori: nama })) {
      return fail("Kategori sudah ada", 409);
    }
    try {
      const saved = await repo.save(repo.create({ namaKategori: nama }));
      return ok({ id: saved.id, namaKategori: saved.namaKategori, jumlahLokasi: 0, subKategori: [] }, "", 201);
    } catch (err) {
      if (isPgUnique(err)) return fail("Kategori sudah ada", 409);
      throw err;
    }
  } catch (err) {
    console.error("POST /api/kategori", err);
    return serverError();
  }
}

export async function GET() {
  try {
    const ds = await getDataSource();
    const rows = await ds
      .getRepository<Kategori>("Kategori")
      .createQueryBuilder("k")
      .leftJoin("k.subKategori", "s")
      .leftJoin("s.lokasiLayanan", "l")
      .select("k.id", "kategoriId")
      .addSelect("k.namaKategori", "namaKategori")
      .addSelect("s.id", "subKategoriId")
      .addSelect("s.namaSubKategori", "namaSubKategori")
      .addSelect("COUNT(l.id)::int", "jumlahLokasi")
      .groupBy("k.id")
      .addGroupBy("k.namaKategori")
      .addGroupBy("s.id")
      .addGroupBy("s.namaSubKategori")
      .orderBy("k.id", "ASC")
      .addOrderBy("s.id", "ASC")
      .getRawMany<{
        kategoriId: number | string;
        namaKategori: string;
        subKategoriId: number | string | null;
        namaSubKategori: string | null;
        jumlahLokasi: number | string;
      }>();

    const grouped = new Map<number, {
      id: number;
      namaKategori: string;
      jumlahLokasi: number;
      subKategori: { id: number; namaSubKategori: string; jumlahLokasi: number }[];
    }>();

    for (const row of rows) {
      const id = Number(row.kategoriId);
      const jumlahLokasi = Number(row.jumlahLokasi);
      const kategori = grouped.get(id) ?? {
        id,
        namaKategori: row.namaKategori,
        jumlahLokasi: 0,
        subKategori: [],
      };
      kategori.jumlahLokasi += jumlahLokasi;
      if (row.subKategoriId !== null && row.namaSubKategori !== null) {
        kategori.subKategori.push({
          id: Number(row.subKategoriId),
          namaSubKategori: row.namaSubKategori,
          jumlahLokasi,
        });
      }
      grouped.set(id, kategori);
    }

    const data = [...grouped.values()];

    return NextResponse.json({ success: true, data, message: "" });
  } catch (err) {
    console.error("GET /api/kategori", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
