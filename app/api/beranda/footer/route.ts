import { ok, serverError } from "@/lib/api";
import { getFooterPublik } from "@/lib/beranda/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getFooterPublik());
  } catch (err) {
    console.error("GET /api/beranda/footer", err);
    return serverError();
  }
}
