import { ok, serverError } from "@/lib/api";
import { listFiturPublik } from "@/lib/beranda/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await listFiturPublik();
    return ok(
      rows.map((f) => ({
        id: f.id,
        judul: f.judul,
        deskripsi: f.deskripsi,
        ikonKey: f.ikonKey,
        tautan: f.tautan,
      }))
    );
  } catch (err) {
    console.error("GET /api/beranda/fitur", err);
    return serverError();
  }
}
