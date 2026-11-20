import { authorizeWrite } from "@/lib/auth";
import { ok, fail, readJson, serverError } from "@/lib/api";
import { ubahLabelGambar, hapusGambar } from "@/lib/beranda/section";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;
    const id = parseId((await params).id);
    if (!id) return fail("ID tidak valid", 400);

    const body = await readJson(req);
    const label = String(body?.label ?? "").trim();
    if (label.length > 80) return fail("Label maksimal 80 karakter", 400);

    await ubahLabelGambar(id, label);
    return ok(null, "Label tersimpan");
  } catch (err) {
    console.error("PATCH /api/admin/beranda/section/gambar/[id]", err);
    return serverError();
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;
    const id = parseId((await params).id);
    if (!id) return fail("ID tidak valid", 400);

    await hapusGambar(id);
    return ok(null, "Gambar dihapus");
  } catch (err) {
    console.error("DELETE /api/admin/beranda/section/gambar/[id]", err);
    return serverError();
  }
}
