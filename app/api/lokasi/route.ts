import { NextResponse, type NextRequest } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { LokasiLayanan } from "@/entities";
import { toFeature } from "@/lib/geojson";

export const dynamic = "force-dynamic";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

function parseInt32(v: string): number | null {
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return Number.isSafeInteger(n) && n <= 2147483647 ? n : null;
}

function parseNum(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const kategoriRaw = sp.get("kategoriId");
  const subRaw = sp.get("subKategoriId");
  const search = sp.get("search")?.trim() || null;
  const latRaw = sp.get("lat");
  const lngRaw = sp.get("lng");
  const radiusRaw = sp.get("radius");

  let kategoriId: number | null = null;
  let subKategoriId: number | null = null;
  if (kategoriRaw !== null) {
    kategoriId = parseInt32(kategoriRaw);
    if (kategoriId === null) return bad("kategoriId harus berupa integer valid");
  }
  if (subRaw !== null) {
    subKategoriId = parseInt32(subRaw);
    if (subKategoriId === null) return bad("subKategoriId harus berupa integer valid");
  }

  if ((latRaw === null) !== (lngRaw === null)) {
    return bad("lat dan lng harus dikirim bersamaan");
  }
  let lat: number | null = null;
  let lng: number | null = null;
  if (latRaw !== null && lngRaw !== null) {
    lat = parseNum(latRaw);
    lng = parseNum(lngRaw);
    if (lat === null || lat < -90 || lat > 90) return bad("lat harus angka antara -90 dan 90");
    if (lng === null || lng < -180 || lng > 180) return bad("lng harus angka antara -180 dan 180");
  }

  let radius: number | null = null;
  if (radiusRaw !== null) {
    if (lat === null) return bad("radius hanya valid jika lat dan lng dikirim");
    radius = parseNum(radiusRaw);
    if (radius === null || radius <= 0) return bad("radius harus angka positif");
  }

  try {
    const ds = await getDataSource();
    const qb = ds
      .getRepository(LokasiLayanan)
      .createQueryBuilder("l")
      .innerJoinAndSelect("l.subKategori", "s")
      .innerJoinAndSelect("s.kategori", "k");

    if (kategoriId !== null) qb.andWhere("k.id = :kategoriId", { kategoriId });
    if (subKategoriId !== null) qb.andWhere("l.subKategoriId = :subKategoriId", { subKategoriId });
    if (search) {
      const escaped = search.replace(/[\\%_]/g, "\\$&");
      qb.andWhere("(l.nama ILIKE :q OR l.alamat ILIKE :q)", { q: `%${escaped}%` });
    }

    const hasGeo = lat !== null && lng !== null;
    if (hasGeo) {
      const point = "ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography";
      qb.setParameters({ lat, lng });
      qb.addSelect(`ST_Distance(l.koordinat::geography, ${point})`, "jarak");
      if (radius !== null) {
        qb.andWhere(`ST_DWithin(l.koordinat::geography, ${point}, :radius)`, { radius });
      }
      qb.orderBy("jarak", "ASC").addOrderBy("l.id", "ASC");
    } else {
      qb.orderBy("l.id", "ASC");
    }

    const { entities, raw } = await qb.getRawAndEntities();
    const features = entities.map((e, i) =>
      toFeature(e, hasGeo ? Number(raw[i].jarak) : undefined)
    );

    return NextResponse.json({ type: "FeatureCollection", features });
  } catch (err) {
    console.error("GET /api/lokasi", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
