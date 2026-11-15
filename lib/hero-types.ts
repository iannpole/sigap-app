export type FacilityCategoryType = "medical" | "safety" | "sport";

export interface NearestFacility {
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
}

export interface NearestResponseData {
  type: FacilityCategoryType;
  origin: { lat: number; lng: number };
  radiusMeters: number;
  facility: NearestFacility | null;
  metadata: { incompleteDataWarning: boolean };
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string;
  code?: string;
}

export type OriginSource = "browser" | "fallback";

export interface Origin {
  lat: number;
  lng: number;
  source: OriginSource;
}

export type CardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; facility: NearestFacility | null; incomplete: boolean }
  | { status: "error"; message: string };

export interface FacilityCategoryMeta {
  type: FacilityCategoryType;
  label: string;
  image: string;
  accent: string;
  description: string;
}

export const FACILITY_CATEGORIES: FacilityCategoryMeta[] = [
  {
    type: "medical",
    label: "Medis",
    image: "/assets/bogor/hero/facility-medical.png",
    accent: "#0e7490",
    description: "Rumah sakit, puskesmas, klinik, dan apotek terdekat",
  },
  {
    type: "safety",
    label: "Keamanan",
    image: "/assets/bogor/hero/facility-safety.png",
    accent: "#b91c1c",
    description: "Polisi, pos keamanan, dan pemadam kebakaran terdekat",
  },
  {
    type: "sport",
    label: "Olahraga",
    image: "/assets/bogor/hero/facility-sport.png",
    accent: "#4d9a2e",
    description: "Lapangan, GOR, dan kolam renang terdekat",
  },
];
