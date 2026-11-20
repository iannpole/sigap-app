import { ok, serverError } from "@/lib/api";
import { bacaSection, bacaGambarList } from "@/lib/beranda/section";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [s, gambar] = await Promise.all([bacaSection(), bacaGambarList()]);
    const daftar = gambar.map((g) => ({ id: g.id, label: g.label }));
    if (!s) return ok({ eyebrow: "", judul: "", deskripsi: "", gambar: daftar });
    return ok({ eyebrow: s.eyebrow, judul: s.judul, deskripsi: s.deskripsi, gambar: daftar });
  } catch (err) {
    console.error("GET /api/beranda/section", err);
    return serverError();
  }
}
