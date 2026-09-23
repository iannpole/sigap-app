import { SUB_META } from "./meta";
import type { Facility, FacilityCollection } from "./types";

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

export function toFacilities(fc: FacilityCollection, origin: { lat: number; lng: number }): Facility[] {
  return fc.features
    .map((f) => {
      const [lng, lat] = f.geometry.coordinates;
      return {
        ...f.properties,
        group: SUB_META[f.properties.sub].group,
        lat,
        lng,
        distance: distanceKm(origin.lat, origin.lng, lat, lng),
      };
    })
    .sort((a, b) => a.distance - b.distance);
}