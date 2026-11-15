import type {
  ApiEnvelope,
  FacilityCategoryType,
  NearestResponseData,
  Origin,
  OriginSource,
} from "./hero-types";

export const FALLBACK_ORIGIN: Omit<Origin, "source"> = {
  lat: -6.5971,
  lng: 106.806,
};

export const SEARCH_RADIUS_METERS = 10_000;

const FALLBACK_LABEL = "Kota Bogor";

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 60_000,
    });
  });
}

export async function resolveOrigin(): Promise<Origin> {
  try {
    const pos = await getBrowserPosition();
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      source: "browser",
    };
  } catch {
    return { ...FALLBACK_ORIGIN, source: "fallback" };
  }
}

export function originLabel(origin: Origin): string {
  return origin.source === "fallback" ? FALLBACK_LABEL : "lokasi Anda";
}

export async function fetchNearest(
  type: FacilityCategoryType,
  origin: Origin
): Promise<ApiEnvelope<NearestResponseData>> {
  const url = new URL("/api/facilities/nearest", window.location.origin);
  url.searchParams.set("type", type);
  url.searchParams.set("lat", String(origin.lat));
  url.searchParams.set("lng", String(origin.lng));
  url.searchParams.set("radius", String(SEARCH_RADIUS_METERS));
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = (await res.json()) as ApiEnvelope<NearestResponseData>;
  return json;
}
