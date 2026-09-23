import { Dumbbell, HeartPulse, Hospital, Landmark, Pill, Stethoscope, Tent, TreePine, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Group, Sub } from "./types";

export const GROUPS: Record
  Group,
  { label: string; color: string; soft: string; icon: LucideIcon; subs: Sub[] }
> = {
  kesehatan: {
    label: "Kesehatan",
    color: "#0e7490",
    soft: "#d6f1f6",
    icon: HeartPulse,
    subs: ["Klinik", "Puskesmas", "Rumah Sakit", "Apotek"],
  },
  rekreasi: {
    label: "Refresh / Rekreasi",
    color: "#4d9a2e",
    soft: "#e2f3d2",
    icon: Leaf,
    subs: ["Taman", "Ruang Publik", "Area Rekreasi", "Fasilitas Olahraga"],
  },
};

export const SUB_META: Record<Sub, { group: Group; icon: LucideIcon }> = {
  Klinik: { group: "kesehatan", icon: Stethoscope },
  Puskesmas: { group: "kesehatan", icon: HeartPulse },
  "Rumah Sakit": { group: "kesehatan", icon: Hospital },
  Apotek: { group: "kesehatan", icon: Pill },
  Taman: { group: "rekreasi", icon: TreePine },
  "Ruang Publik": { group: "rekreasi", icon: Landmark },
  "Area Rekreasi": { group: "rekreasi", icon: Tent },
  "Fasilitas Olahraga": { group: "rekreasi", icon: Dumbbell },
};

export const ALL_SUBS: Sub[] = [...GROUPS.kesehatan.subs, ...GROUPS.rekreasi.subs];