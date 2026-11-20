import { authorizeWrite } from "@/lib/auth";
import { ok, fail, serverError } from "@/lib/api";
import { simpanSection } from "@/lib/beranda/section";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;

    const form = await req.formData().catch(() => null);
    if (!form) return fail("Form tidak valid", 400);

    const eyebrow = String(form.get("eyebrow") ?? "").trim();
    const judul = String(form.get("judul") ?? "").trim();
    const deskripsi = String(form.get("deskripsi") ?? "").trim();
    if (eyebrow.length > 40 || judul.length > 120 || deskripsi.length > 400) {
      return fail("Teks melebihi batas panjang", 400);
    }

    await simpanSection({ eyebrow, judul, deskripsi });
    return ok(null, "Tersimpan");
  } catch (err) {
    console.error("PUT /api/admin/beranda/section", err);
    return serverError();
  }
}
