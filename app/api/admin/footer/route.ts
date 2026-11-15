import { getAuthAdmin, authorizeWrite } from "@/lib/auth";
import { ok, fail, readJson, unauthorized, serverError } from "@/lib/api";
import { footerSchema } from "@/lib/beranda/validasi";
import { getFooterAdmin, simpanFooter } from "@/lib/beranda/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!(await getAuthAdmin(req))) return unauthorized();
    return ok(await getFooterAdmin());
  } catch (err) {
    console.error("GET /api/admin/footer", err);
    return serverError();
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;

    const parsed = footerSchema.safeParse(await readJson(req));
    if (!parsed.success) return fail(parsed.error.issues[0].message, 400);

    await simpanFooter(parsed.data);
    return ok(await getFooterAdmin(), "Footer disimpan");
  } catch (err) {
    console.error("PUT /api/admin/footer", err);
    return serverError();
  }
}
