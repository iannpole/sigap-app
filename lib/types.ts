import type { FeatureCollection, Point } from "geojson";

export type Group = "kesehatan" | "rekreasi";

export type Sub =
  | "Klinik"
  | "Puskesmas"
  | "Rumah Sakit"
  | "Apotek"
  | "Taman"
  | "Ruang Publik"
  | "Area Rekreasi"
  | "Fasilitas Olahraga";

export interface FacilityProps {
  id: string;
  name: string;
  sub: Sub;
  description: string;
  address: string;
  open: boolean;
  hours: string;
}

export type FacilityCollection = FeatureCollection<Point, FacilityProps>;

export interface Facility extends FacilityProps {
  group: Group;
  lat: number;
  lng: number;
  distance: number;
}

export interface Filter {
  group: "all" | Group;
  sub: "all" | Sub;
}