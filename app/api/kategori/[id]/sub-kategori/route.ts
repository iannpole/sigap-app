import { getDataSource } from "@/lib/data-source";
import { getAuthAdmin } from "@/lib/auth";
import { Kategori, SubKategori } from "@/entities";
import { ok, fail, readJson, intId, isPgUnique, unauthorized, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    if (!(await getAuthAdmin(req))) return unauthorized();

    const { id: rawId } = await ctx.params;
    const kategoriId = intId(rawId);
    if (kategoriId === null) return fail("id kategori harus integer valid", 400);

    const body = await readJson(req);
    const nama = typeof body?.namaSubKategori === "string" ? body.namaSubKategori.trim() : "";
    if (!nama) return fail("namaSubKategori wajib diisi", 400);
    if (nama.length > 50) return fail("namaSubKategori maksimal 50 karakter", 400);

    const ds = await getDataSource();
    if (!(await ds.getRepository(Kategori).existsBy({ id: kategoriId }))) {
      return fail("Kategori tidak ditemukan", 404);
    }
    const repo = ds.getRepository(SubKategori);
    if (await repo.existsBy({ kategoriId, namaSubKategori: nama })) {
      return fail("Sub-kategori sudah ada pada kategori ini", 409);
    }

    try {
      const saved = await repo.save(repo.create({ kategoriId, namaSubKategori: nama }));
      return ok({ id: saved.id, namaSubKategori: saved.namaSubKategori, kategoriId }, "", 201);
    } catch (err) {
      if (isPgUnique(err)) return fail("Sub-kategori sudah ada pada kategori ini", 409);
      throw err;
    }
  } catch (err) {
    console.error("POST /api/kategori/[id]/sub-kategori", err);
    return serverError();
  }
}
