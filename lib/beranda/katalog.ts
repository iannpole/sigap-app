export const IKON_KEYS = ['peta', 'kategori', 'lokasi', '3d', 'kesehatan', 'keamanan', 'olahraga', 'info'] as const;
export type IkonKey = (typeof IKON_KEYS)[number];

export const SOSIAL_DOMAIN = {
  instagram: 'instagram.com',
  youtube: 'youtube.com',
  x: 'x.com',
  facebook: 'facebook.com',
  tiktok: 'tiktok.com',
} as const;
export type SosialPlatform = keyof typeof SOSIAL_DOMAIN;

export const FITUR_AKTIF_MIN = 4;
export const FITUR_AKTIF_MAKS = 6;
