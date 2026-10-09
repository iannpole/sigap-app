import { getAuthAdmin } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sengaja tidak ada blacklist: JWT bersifat stateless, jadi endpoint ini hanya
// memvalidasi token. Invalidasi sesungguhnya terjadi di client (hapus token tersimpan).
export async function POST(req: Request) {
  try {
    if (!(await getAuthAdmin(req))) return unauthorized();
    return ok(null, "Logout berhasil");
  } catch (err) {
    console.error("POST /api/auth/logout", err);
    return serverError();
  }
}
