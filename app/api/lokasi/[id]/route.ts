import { NextResponse, type NextRequest } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { getAuthAdmin } from "@/lib/auth";
import { LokasiLayanan } from "@/entities";
import { toFeature } from "@/lib/geojson";
import { ok, fail, readJson, intId, unauthorized, serverError } from "@/lib/api";
import { parseLokasiBody, subKategoriExists, loadLokasiProps, pointSql } from "@/lib/lokasi-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  try {
    if (!(await getAuthAdmin(req))) return unauthorized();

    const id = intId((await ctx.params).id);
    if (id === null) return fail("id harus integer valid", 400);

    const body = await readJson(req);
    if (!body) return fail("Body harus berupa JSON object", 400);
    const parsed = parseLokasiBody(body, true);
    if ("error" in parsed) return fail(parsed.error, 400);
    const { lat, lng, ...rest } = parsed.value;

    const set: Record<string, unknown> = { ...rest };
    if (lat !== undefined && lng !== undefined) set.koordinat = pointSql(lng, lat);
    if (Object.keys(set).length === 0) return fail("Tidak ada field yang diubah", 400);

    const ds = await getDataSource();
    const repo = ds.getRepository(LokasiLayanan);
    if (!(await repo.existsBy({ id }))) return fail("Lokasi tidak ditemukan", 404);
    if (rest.subKategoriId !== undefined && !(await subKategoriExists(ds, rest.subKategoriId))) {
      return fail("subKategoriId tidak ditemukan", 400);
    }

    await repo.createQueryBuilder().update().set(set as any).where("id = :id", { id }).execute();
    return ok(await loadLokasiProps(ds, id));
  } catch (err) {
    console.error("PUT /api/lokasi/[id]", err);
    return serverError();
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    if (!(await getAuthAdmin(req))) return unauthorized();

    const id = intId((await ctx.params).id);
    if (id === null) return fail("id harus integer valid", 400);

    const ds = await getDataSource();
    const res = await ds.getRepository(LokasiLayanan).delete({ id });
    if (!res.affected) return fail("Lokasi tidak ditemukan", 404);
    return ok(null, "Lokasi dihapus");
  } catch (err) {
    console.error("DELETE /api/lokasi/[id]", err);
    return serverError();
  }
}

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
