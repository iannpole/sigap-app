import { NextResponse, type NextRequest } from "next/server";
import { getDataSource } from "@/lib/data-source";
import { authorizeWrite } from "@/lib/auth";
import { LokasiLayanan } from "@/entities";
import { toFeature } from "@/lib/geojson";
import { ok, fail, readJson, serverError } from "@/lib/api";
import { parseLokasiBody, subKategoriExists, loadLokasiProps, pointSql } from "@/lib/lokasi-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await authorizeWrite(req);
    if ("denied" in auth) return auth.denied;
    const admin = auth.admin;

    const body = await readJson(req);
    if (!body) return fail("Body harus berupa JSON object", 400);
    const parsed = parseLokasiBody(body, false);
    if ("error" in parsed) return fail(parsed.error, 400);
    const v = parsed.value;

    const ds = await getDataSource();
    if (!(await subKategoriExists(ds, v.subKategoriId!))) {
      return fail("subKategoriId tidak ditemukan", 400);
    }

    const result = await ds
      .createQueryBuilder()
      .insert()
      .into(LokasiLayanan)
      .values({
        subKategoriId: v.subKategoriId,
        nama: v.nama,
        wilayah: v.wilayah,
        koordinat: pointSql(v.lng!, v.lat!),
        alamat: v.alamat ?? null,
        noKontak: v.noKontak ?? null,
        jamOperasional: v.jamOperasional ?? null,
        fotoUrl: v.fotoUrl ?? null,
        deskripsi: v.deskripsi ?? null,
        createdById: admin.id,
      } as Record<string, unknown>)
      .execute();

    const id = result.identifiers[0].id as number;
    return ok(await loadLokasiProps(ds, id), "", 201);
  } catch (err) {
    console.error("POST /api/lokasi", err);
    return serverError();
  }
}

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

  const kategoriRaw = sp.get("kategori") ?? sp.get("kategoriId");
  const subRaw = sp.get("subkategori") ?? sp.get("subKategoriId");
  const search = (sp.get("q") ?? sp.get("search"))?.trim() || null;
  const latRaw = sp.get("lat");
  const lngRaw = sp.get("lng");
  const radiusRaw = sp.get("radius");
  const bboxRaw = sp.get("bbox");
  const limitRaw = sp.get("limit");
  const cursorRaw = sp.get("cursor");
  const urut = sp.get("urut");

  if (search && search.length > 100) return bad("q maksimal 100 karakter");

  let kategoriId: number | null = null;
  let subKategoriId: number | null = null;
  if (kategoriRaw !== null) {
    kategoriId = parseInt32(kategoriRaw);
    if (kategoriId === null) return bad("kategori harus berupa integer valid");
  }
  if (subRaw !== null) {
    subKategoriId = parseInt32(subRaw);
    if (subKategoriId === null) return bad("subkategori harus berupa integer valid");
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
    if (radius === null || radius <= 0 || radius > 100_000) {
      return bad("radius harus angka antara 0 dan 100000 meter");
    }
  }

  let limit = 100;
  if (limitRaw !== null) {
    const parsed = parseInt32(limitRaw);
    if (parsed === null || parsed < 1 || parsed > 100) return bad("limit harus integer antara 1 dan 100");
    limit = parsed;
  }

  let bbox: [number, number, number, number] | null = null;
  if (bboxRaw !== null) {
    const values = bboxRaw.split(",").map(parseNum);
    if (values.length !== 4 || values.some((value) => value === null)) {
      return bad("bbox harus berformat minLng,minLat,maxLng,maxLat");
    }
    const [minLng, minLat, maxLng, maxLat] = values as number[];
    if (
      minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90 ||
      minLng >= maxLng || minLat >= maxLat
    ) {
      return bad("bbox berada di luar rentang atau urutannya tidak valid");
    }
    bbox = [minLng, minLat, maxLng, maxLat];
  }

  if (urut !== null && urut !== "jarak") return bad('urut yang didukung hanya "jarak"');
  if (urut === "jarak" && lat === null) return bad("urut=jarak memerlukan lat dan lng");

  let cursor: number | null = null;
  if (cursorRaw !== null) {
    cursor = parseInt32(cursorRaw);
    if (cursor === null) return bad("cursor harus berupa integer valid");
    if (urut === "jarak") return bad("cursor belum didukung bersama urut=jarak");
  }

  try {
    const ds = await getDataSource();
    const qb = ds
      .getRepository<LokasiLayanan>("LokasiLayanan")
      .createQueryBuilder("l")
      .innerJoinAndSelect("l.subKategori", "s")
      .innerJoinAndSelect("s.kategori", "k");

    if (kategoriId !== null) qb.andWhere("k.id = :kategoriId", { kategoriId });
    if (subKategoriId !== null) qb.andWhere("l.subKategoriId = :subKategoriId", { subKategoriId });
    if (search) {
      const escaped = search.replace(/[\\%_]/g, "\\$&");
      qb.andWhere("(l.nama ILIKE :q OR l.alamat ILIKE :q)", { q: `%${escaped}%` });
    }
    if (bbox) {
      qb.andWhere(
        "ST_Intersects(l.koordinat::geometry, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))",
        { minLng: bbox[0], minLat: bbox[1], maxLng: bbox[2], maxLat: bbox[3] }
      );
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
      if (cursor !== null) qb.andWhere("l.id > :cursor", { cursor });
      qb.orderBy("l.id", "ASC");
    }

    qb.take(limit + 1);
    const { entities, raw } = await qb.getRawAndEntities();
    const page = entities.slice(0, limit);
    const features = page.map((e, i) =>
      toFeature(e, hasGeo ? Number(raw[i].jarak) : undefined)
    );

    return NextResponse.json({
      type: "FeatureCollection",
      features,
      metadata: {
        jumlah: features.length,
        limit,
        nextCursor: entities.length > limit ? page[page.length - 1]?.id ?? null : null,
      },
    });
  } catch (err) {
    console.error("GET /api/lokasi", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
