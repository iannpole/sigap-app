import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { getAuthAdmin } from "@/lib/auth";
import { Kategori } from "@/entities";
import { ok, fail, readJson, isPgUnique, unauthorized, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!(await getAuthAdmin(req))) return unauthorized();

    const body = await readJson(req);
    const nama = typeof body?.namaKategori === "string" ? body.namaKategori.trim() : "";
    if (!nama) return fail("namaKategori wajib diisi", 400);
    if (nama.length > 50) return fail("namaKategori maksimal 50 karakter", 400);

    const ds = await getDataSource();
    const repo = ds.getRepository(Kategori);
    if (await repo.existsBy({ namaKategori: nama })) {
      return fail("Kategori sudah ada", 409);
    }
    try {
      const saved = await repo.save(repo.create({ namaKategori: nama }));
      return ok({ id: saved.id, namaKategori: saved.namaKategori, subKategori: [] }, "", 201);
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
