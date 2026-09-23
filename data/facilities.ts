import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import type { FacilityCollection, FacilityProps, Sub } from "@/lib/types";

export const USER = { lat: -6.301, lng: 106.652, label: "Jl. BSD Raya Utama, Serpong" };
export const RADIUS_KM = 3;

const pt = (
  id: string,
  name: string,
  sub: Sub,
  lat: number,
  lng: number,
  address: string,
  description: string,
  open: boolean,
  hours: string
): Feature<Point, FacilityProps> => ({
  type: "Feature",
  properties: { id, name, sub, description, address, open, hours },
  geometry: { type: "Point", coordinates: [lng, lat] },
});

// BACKEND: replace this local FeatureCollection with a fetch to your facilities GeoJSON endpoint
export const facilities: FacilityCollection = {
  type: "FeatureCollection",
  features: [
    pt("k1", "RS Eka Hospital BSD", "Rumah Sakit", -6.3028, 106.6437, "Jl. Boulevard BSD Timur, Serpong", "Rumah sakit umum dengan IGD dan layanan spesialis.", true, "Buka 24 Jam"),
    pt("k2", "RS Medika BSD", "Rumah Sakit", -6.2906, 106.6689, "Jl. Letnan Sutopo, BSD City", "Layanan rawat jalan, rawat inap, dan IGD.", true, "Buka 24 Jam"),
    pt("k3", "Puskesmas Serpong I", "Puskesmas", -6.3126, 106.6672, "Jl. Raya Puspiptek, Serpong", "Pusat kesehatan masyarakat untuk layanan dasar dan imunisasi.", true, "Buka s.d. 16.00"),
    pt("k4", "Puskesmas Setu", "Puskesmas", -6.339, 106.696, "Jl. Raya Setu, Setu", "Layanan kesehatan dasar untuk wilayah Setu.", true, "Buka s.d. 16.00"),
    pt("k5", "Klinik Sehat Sinar Mas", "Klinik", -6.2985, 106.656, "Jl. Griya Loka, BSD City", "Klinik umum dan dokter keluarga dengan jam praktik panjang.", true, "Buka s.d. 21.00"),
    pt("k6", "Klinik Pratama Griya Serpong", "Klinik", -6.319, 106.652, "Jl. Griya Serpong Asri", "Klinik pratama untuk pemeriksaan umum dan gigi.", false, "Tutup · Buka 08.00"),
    pt("k7", "Apotek Kimia Farma BSD", "Apotek", -6.3005, 106.661, "Ruko Sektor 1.2, BSD City", "Apotek dengan layanan resep dan obat bebas.", true, "Buka s.d. 22.00"),
    pt("k8", "Apotek Sehat Jelupang", "Apotek", -6.311, 106.64, "Jl. Raya Jelupang, Serpong Utara", "Apotek keluarga dengan layanan antar.", true, "Buka s.d. 21.00"),
    pt("k9", "RSUD Kota Tangerang Selatan", "Rumah Sakit", -6.273, 106.712, "Jl. Pajajaran, Pamulang", "Rumah sakit umum daerah rujukan Kota Tangerang Selatan.", true, "Buka 24 Jam"),
    pt("r1", "Taman Kota 2 BSD", "Taman", -6.296, 106.648, "Jl. Boulevard Raya, BSD City", "Taman kota dengan jogging track dan area bermain anak.", true, "Buka s.d. 22.00"),
    pt("r2", "Ruang Publik Green Office Park", "Ruang Publik", -6.301, 106.655, "Green Office Park, BSD City", "Ruang terbuka hijau untuk bersantai dan berkumpul.", true, "Buka 24 Jam"),
    pt("r3", "Area Rekreasi Situ Jombang", "Area Rekreasi", -6.323, 106.639, "Jl. Situ Jombang, Serpong", "Area tepi situ untuk memancing dan berjalan santai.", true, "Buka s.d. 18.00"),
    pt("r4", "Lapangan Olahraga Rawa Buntu", "Fasilitas Olahraga", -6.317, 106.671, "Jl. Rawa Buntu, Serpong", "Lapangan multifungsi untuk futsal dan basket.", true, "Buka s.d. 21.00"),
    pt("r5", "Sport Center BSD Green", "Fasilitas Olahraga", -6.306, 106.639, "Jl. BSD Green, Serpong", "Fasilitas olahraga indoor dan kolam renang.", false, "Tutup · Buka 06.00"),
    pt("r6", "Taman Ekowisata Cisadane", "Taman", -6.287, 106.656, "Bantaran Sungai Cisadane, Serpong", "Taman tepi sungai dengan jalur sepeda.", true, "Buka s.d. 18.00"),
    pt("r7", "Alun-Alun Serpong", "Ruang Publik", -6.319, 106.662, "Jl. Raya Serpong", "Ruang publik dengan area kuliner dan panggung terbuka.", true, "Buka s.d. 23.00"),
    pt("r8", "Area Rekreasi Situ Gintung", "Area Rekreasi", -6.308, 106.759, "Jl. Situ Gintung, Ciputat", "Danau wisata untuk berperahu dan piknik.", true, "Buka s.d. 17.00"),
  ],
};

export const area: FeatureCollection<Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.6, -6.265],
            [106.72, -6.262],
            [106.78, -6.3],
            [106.7, -6.36],
            [106.62, -6.35],
            [106.6, -6.265],
          ],
        ],
      },
    },
  ],
};