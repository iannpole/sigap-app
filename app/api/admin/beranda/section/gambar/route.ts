import { authorizeWrite } from "@/lib/auth";
import { ok, fail, serverError } from "@/lib/api";
import { tambahGambar, BatasGambarError, MAX_GAMBAR } from "@/lib/beranda/section";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME = ["image/png", "image/jpeg", "image/webp"];
const MAKS_BYTE = 2 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;

    const form = await req.formData().catch(() => null);
    if (!form) return fail("Form tidak valid", 400);

    const label = String(form.get("label") ?? "").trim().slice(0, 80);
    const file = form.get("gambar");
    if (!(file instanceof File) || file.size === 0) return fail("Pilih gambar dulu", 400);
    if (!MIME.includes(file.type)) return fail("Gambar harus PNG, JPG, atau WebP", 400);
    if (file.size > MAKS_BYTE) return fail("Ukuran gambar maksimal 2 MB", 400);

    const saved = await tambahGambar({
      label,
      data: Buffer.from(await file.arrayBuffer()),
      mime: file.type,
    });
    return ok({ id: saved.id, label: saved.label }, "Gambar ditambahkan", 201);
  } catch (err) {
    if (err instanceof BatasGambarError) return fail(`Gambar maksimal ${MAX_GAMBAR}. Hapus salah satu dulu.`, 409);
    console.error("POST /api/admin/beranda/section/gambar", err);
    return serverError();
  }
}
