import { z } from 'zod';
import { IKON_KEYS, SOSIAL_DOMAIN, type SosialPlatform } from './katalog';

const PLATFORMS = Object.keys(SOSIAL_DOMAIN) as [SosialPlatform, ...SosialPlatform[]];

function isHttps(v: string): boolean {
  try {
    return new URL(v).protocol === 'https:';
  } catch {
    return false;
  }
}

function hostCocok(v: string, domain: string): boolean {
  try {
    const host = new URL(v).hostname;
    return host === domain || host.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

// Satu kalimat: tanpa baris baru, dan tidak ada tanda akhir kalimat di tengah teks.
const satuKalimat = (v: string) => !/\n/.test(v) && !/[.!?]\s+\S/.test(v);

const urlOpsional = z
  .string()
  .trim()
  .max(2048)
  .nullish()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || isHttps(v), 'Tautan harus memakai https');

export const fiturSchema = z.object({
  judul: z.string().trim().min(1, 'Judul wajib diisi').max(80),
  deskripsi: z
    .string()
    .trim()
    .min(1, 'Deskripsi wajib diisi')
    .max(160)
    .refine(satuKalimat, 'Deskripsi harus satu kalimat'),
  ikonKey: z.enum(IKON_KEYS),
  tautan: urlOpsional,
  urutan: z.number().int().min(0).max(1000),
  aktif: z.boolean(),
});

export const footerSchema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi').max(80),
  tagline: z.string().trim().min(1, 'Tagline wajib diisi').max(200),
  email: z
    .string()
    .trim()
    .max(120)
    .nullish()
    .transform((v) => (v ? v : null))
    .pipe(z.email('Email tidak valid').nullable()),
  hakCipta: z.string().trim().min(1, 'Teks hak cipta wajib diisi').max(200),
  alamat: z
    .string()
    .trim()
    .max(300)
    .nullish()
    .transform((v) => (v ? v : null)),
  tampilkanAlamat: z.boolean(),
  tautan: z
    .array(
      z.object({
        label: z.string().trim().min(1, 'Label wajib diisi').max(60),
        url: z.string().trim().max(2048).refine(isHttps, 'Tautan harus memakai https'),
        urutan: z.number().int().min(0).max(1000),
      })
    )
    .max(10),
  sosial: z
    .array(
      z
        .object({
          platform: z.enum(PLATFORMS),
          url: z.string().trim().max(2048),
          urutan: z.number().int().min(0).max(1000),
        })
        .refine((s) => isHttps(s.url) && hostCocok(s.url, SOSIAL_DOMAIN[s.platform]), {
          message: 'Tautan media sosial harus https dan dari domain platform yang dipilih',
          path: ['url'],
        })
    )
    .max(PLATFORMS.length),
});

export type FiturInput = z.infer<typeof fiturSchema>;
export type FooterInput = z.infer<typeof footerSchema>;
