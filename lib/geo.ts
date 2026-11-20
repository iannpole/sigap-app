import type { Lokasi, LokasiView } from "./types";

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export function formatKm(v: number) {
  return `${v.toFixed(1).replace(".", ",")} km`;
}

export function withDistance(items: Lokasi[], origin: { lat: number; lng: number }): LokasiView[] {
  return items
    .map((l) => ({
      ...l,
      distance: l.jarakMeter === null ? distanceKm(origin.lat, origin.lng, l.lat, l.lng) : l.jarakMeter / 1000,
    }))
    .sort((a, b) => a.distance - b.distance);
}
