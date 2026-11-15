import { authorizeWrite } from "@/lib/auth";
import { ok, fail, readJson, intId, serverError } from "@/lib/api";
import { fiturSchema } from "@/lib/beranda/validasi";
import { tulisFitur, fiturData, pesanBatas, BatasFiturError } from "@/lib/beranda/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;

    const id = intId((await params).id);
    if (id === null) return fail("ID tidak valid", 400);

    const parsed = fiturSchema.safeParse(await readJson(req));
    if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

    const hasil = await tulisFitur(async (repo) => {
      const ada = await repo.findOneBy({ id });
      if (!ada) return null;
      return repo.save(repo.merge(ada, fiturData(parsed.data)));
    });
    if (!hasil) return fail("Fitur tidak ditemukan", 404);
    return ok(hasil);
  } catch (err) {
    if (err instanceof BatasFiturError) return fail(pesanBatas(err.jumlah), 409);
    console.error("PUT /api/admin/beranda/fitur/[id]", err);
    return serverError();
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;

    const id = intId((await params).id);
    if (id === null) return fail("ID tidak valid", 400);

    const hasil = await tulisFitur(async (repo) => {
      const res = await repo.delete({ id });
      return (res.affected ?? 0) > 0;
    });
    if (!hasil) return fail("Fitur tidak ditemukan", 404);
    return ok(null, "Fitur dihapus");
  } catch (err) {
    if (err instanceof BatasFiturError) return fail(pesanBatas(err.jumlah), 409);
    console.error("DELETE /api/admin/beranda/fitur/[id]", err);
    return serverError();
  }
}
