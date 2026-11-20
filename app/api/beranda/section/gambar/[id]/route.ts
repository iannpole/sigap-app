import { NextResponse } from "next/server";
import { bacaGambar } from "@/lib/beranda/section";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return new NextResponse(null, { status: 400 });
  try {
    const g = await bacaGambar(n);
    if (!g?.gambar || !g.gambarMime) return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(g.gambar), {
      headers: { "Content-Type": g.gambarMime, "Cache-Control": "no-cache" },
    });
  } catch (err) {
    console.error("GET /api/beranda/section/gambar/[id]", err);
    return new NextResponse(null, { status: 500 });
  }
}
