import { NextResponse, type NextRequest } from "next/server";
import { LokasiLayanan } from "@/entities";
import { getDataSource } from "@/lib/data-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_RADIUS_METERS = 10_000;
const MAX_RADIUS_METERS = 100_000;
const DEFAULT_LIMIT = 1;
const MAX_LIMIT = 50;

const facilityTypes = ["medical", "safety", "sport"] as const;
type FacilityType = (typeof facilityTypes)[number];

type Facility = {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  address: string | null;
  region: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  phone: string | null;
  operatingHours: string | null;
  photoUrl: string | null;
};

type RawFacility = {
  id: string | number;
  name: string;
  category: string;
  subcategory: string;
  address: string | null;
  region: string;
  lat: string | number;
  lng: string | number;
  distanceMeters: string | number;
  phone: string | null;
  operatingHours: string | null;
  photoUrl: string | null;
};

function queryError(message: string) {
  return NextResponse.json(
    { success: false, data: null, message, code: "INVALID_QUERY" },
    { status: 400 }
  );
}

function parseNumber(value: string | null, name: string): number | NextResponse {
  if (value === null || value.trim() === "") return queryError(`${name} wajib diisi`);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : queryError(`${name} harus berupa angka valid`);
}

function parseOptionalPositiveNumber(
  value: string | null,
  fallback: number,
  name: string,
  maximum: number
): number | NextResponse {
  if (value === null) return fallback;
  if (value.trim() === "") return queryError(`${name} harus berupa angka valid`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > maximum) {
    return queryError(`${name} harus lebih dari 0 dan maksimal ${maximum}`);
  }
  return parsed;
}

function parseLimit(value: string | null): number | NextResponse {
  if (value === null) return DEFAULT_LIMIT;
  if (!/^\d+$/.test(value)) return queryError("limit harus berupa integer positif");
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_LIMIT) {
    return queryError(`limit harus antara 1 dan ${MAX_LIMIT}`);
  }
  return parsed;
}

function isErrorResponse(value: number | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const typeRaw = params.get("type");
  if (!typeRaw || !facilityTypes.includes(typeRaw as FacilityType)) {
    return queryError("type harus salah satu dari medical, safety, atau sport");
  }
  const type = typeRaw as FacilityType;

  const lat = parseNumber(params.get("lat"), "lat");
  if (isErrorResponse(lat)) return lat;
  if (lat < -90 || lat > 90) return queryError("lat harus antara -90 dan 90");

  const lng = parseNumber(params.get("lng"), "lng");
  if (isErrorResponse(lng)) return lng;
  if (lng < -180 || lng > 180) return queryError("lng harus antara -180 dan 180");

  const radiusMeters = parseOptionalPositiveNumber(
    params.get("radius"),
    DEFAULT_RADIUS_METERS,
    "radius",
    MAX_RADIUS_METERS
  );
  if (isErrorResponse(radiusMeters)) return radiusMeters;

  const limit = parseLimit(params.get("limit"));
  if (isErrorResponse(limit)) return limit;

  try {
    const dataSource = await getDataSource();
    const point = "ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography";
    const query = dataSource
      .getRepository<LokasiLayanan>("LokasiLayanan")
      .createQueryBuilder("location")
      .innerJoin("location.subKategori", "subcategory")
      .innerJoin("subcategory.kategori", "category")
      .select("location.id", "id")
      .addSelect("location.nama", "name")
      .addSelect("category.namaKategori", "category")
      .addSelect("subcategory.namaSubKategori", "subcategory")
      .addSelect("location.alamat", "address")
      .addSelect("location.wilayah", "region")
      .addSelect("ST_Y(location.koordinat::geometry)", "lat")
      .addSelect("ST_X(location.koordinat::geometry)", "lng")
      .addSelect(`ST_Distance(location.koordinat, ${point})`, "distanceMeters")
      .addSelect("location.noKontak", "phone")
      .addSelect("location.jamOperasional", "operatingHours")
      .addSelect("location.fotoUrl", "photoUrl")
      .where(`ST_DWithin(location.koordinat, ${point}, :radiusMeters)`)
      .setParameters({ lat, lng, radiusMeters })
      .orderBy("distanceMeters", "ASC")
      .addOrderBy("location.id", "ASC")
      .limit(limit);

    if (type === "medical") {
      query.andWhere("LOWER(category.namaKategori) = LOWER(:medicalCategory)", {
        medicalCategory: "Kesehatan",
      });
    } else if (type === "safety") {
      query.andWhere("LOWER(category.namaKategori) IN (:...safetyCategories)", {
        safetyCategories: ["keamanan", "keselamatan"],
      });
    } else {
      const searchable =
        "LOWER(CONCAT_WS(' ', location.nama, category.namaKategori, subcategory.namaSubKategori))";
      query.andWhere(`${searchable} LIKE ANY(:sportPatterns)`, {
        sportPatterns: [
          "%lapangan%",
          "%gor%",
          "%stadion%",
          "%futsal%",
          "%badminton%",
          "%kolam renang%",
          "%olahraga%",
          "%sport%",
        ],
      });
    }

    const rows = await query.getRawMany<RawFacility>();
    const facilities: Facility[] = rows.map((row) => ({
      ...row,
      id: Number(row.id),
      lat: Number(row.lat),
      lng: Number(row.lng),
      distanceMeters: Number(row.distanceMeters),
    }));

    const result = {
      type,
      origin: { lat, lng },
      radiusMeters,
      ...(limit === 1
        ? { facility: facilities[0] ?? null }
        : { facilities }),
      metadata: { incompleteDataWarning: type === "sport" },
    };

    return NextResponse.json({
      success: true,
      data: result,
      message:
        facilities.length === 0 ? "Fasilitas tidak ditemukan dalam radius pencarian" : "",
    });
  } catch (error) {
    console.error("GET /api/facilities/nearest", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Terjadi kesalahan server",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
