import { NextResponse } from "next/server";

export const ok = (data: unknown, message = "", status = 200) =>
  NextResponse.json({ success: true, data, message }, { status });

export const fail = (message: string, status: number) =>
  NextResponse.json({ success: false, data: null, message }, { status });

export const unauthorized = () => fail("Unauthorized", 401);
export const serverError = () => fail("Terjadi kesalahan server", 500);

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === "object" && !Array.isArray(b) ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function isPgUnique(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === "23505" || e?.driverError?.code === "23505";
}

export function isPgFk(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === "23503" || e?.driverError?.code === "23503";
}

export function intId(v: unknown): number | null {
  const s = typeof v === "number" ? String(v) : v;
  if (typeof s !== "string" || !/^\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) && n <= 2147483647 ? n : null;
}
