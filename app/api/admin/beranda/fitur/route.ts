import { getAuthAdmin, authorizeWrite } from "@/lib/auth";
import { ok, fail, readJson, unauthorized, serverError } from "@/lib/api";
import { fiturSchema } from "@/lib/beranda/validasi";
import { listFiturAdmin, tulisFitur, fiturData, pesanBatas, BatasFiturError } from "@/lib/beranda/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!(await getAuthAdmin(req))) return unauthorized();
    return ok(await listFiturAdmin());
  } catch (err) {
    console.error("GET /api/admin/beranda/fitur", err);
    return serverError();
  }
}

export async function POST(req: Request) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;

    const parsed = fiturSchema.safeParse(await readJson(req));
    if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

    const saved = await tulisFitur((repo) => repo.save(repo.create(fiturData(parsed.data))));
    return ok(saved, "", 201);
  } catch (err) {
    if (err instanceof BatasFiturError) return fail(pesanBatas(err.jumlah), 409);
    console.error("POST /api/admin/beranda/fitur", err);
    return serverError();
  }
}

