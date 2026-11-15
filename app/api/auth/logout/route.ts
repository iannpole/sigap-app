import { authorizeWrite, clearAdminCookie } from "@/lib/auth";
import { ok, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sesi berupa cookie HttpOnly. Server menghapusnya lewat Set-Cookie. JWT tetap stateless, tanpa blacklist.
export async function POST(req: Request) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;
    const res = ok(null, "Logout berhasil");
    clearAdminCookie(res);
    return res;
  } catch (err) {
    console.error("POST /api/auth/logout", err);
    return serverError();
  }
}
