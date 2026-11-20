export type Moda = "driving" | "walking" | "transit" | "bicycling";

export const MODA_LABEL: Record<Moda, string> = {
  driving: "Berkendara",
  walking: "Jalan kaki",
  transit: "Angkutan umum",
  bicycling: "Bersepeda",
};

/**
 * URL petunjuk arah Google Maps. Tanpa origin, Google memakai lokasi pengguna.
 * api=1 dipakai agar travelmode dihormati.
 */
export function ruteGoogle(
  tujuan: { lat: number; lng: number },
  asal?: { lat: number; lng: number } | null,
  moda: Moda = "driving"
) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${tujuan.lat},${tujuan.lng}`,
    travelmode: moda,
  });
  if (asal) params.set("origin", `${asal.lat},${asal.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function ruteOsm(tujuan: { lat: number; lng: number }, asal?: { lat: number; lng: number } | null) {
  if (!asal) return `https://www.openstreetmap.org/?mlat=${tujuan.lat}&mlon=${tujuan.lng}#map=17/${tujuan.lat}/${tujuan.lng}`;
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${asal.lat}%2C${asal.lng}%3B${tujuan.lat}%2C${tujuan.lng}`;
}
