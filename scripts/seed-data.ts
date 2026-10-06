import 'reflect-metadata';
import * as nextEnv from '@next/env';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { EntityManager } from 'typeorm';
import { getDataSource } from '../lib/data-source';
import { Kategori, SubKategori, LokasiLayanan } from '../entities';

const loadEnvConfig =
  (nextEnv as any).loadEnvConfig || (nextEnv as any).default?.loadEnvConfig;
if (typeof loadEnvConfig === 'function') loadEnvConfig(process.cwd());

interface Source {
  file: string;
  kategori: string;
  namaField: string;
  subField: string;
}

const SOURCES: Source[] = [
  { file: 'kesehatan.geojson', kategori: 'Kesehatan', namaField: 'nama_faskes', subField: 'kategori' },
  { file: 'kepolisian.geojson', kategori: 'Keamanan', namaField: 'nama_kantor', subField: 'tingkat' },
  { file: 'damkar.geojson', kategori: 'Keselamatan', namaField: 'nama_pos', subField: 'kategori' },
  { file: 'umum.geojson', kategori: 'Hiburan', namaField: 'nama_taman', subField: 'kategori' },
];

const WILAYAH = ['Kota Bogor', 'Kabupaten Bogor'];
// Kasar, hanya untuk peringatan (tidak men-skip).
const BOGOR_BBOX = { minLng: 106.4, maxLng: 107.3, minLat: -7.0, maxLat: -6.2 };
const CHUNK = 200;

const skipLog: string[] = [];
const warnLog: string[] = [];
const skip = (src: string, idx: number, why: string) =>
  skipLog.push(`[${src}] feature #${idx}: ${why}`);

interface Row {
  nama: string;
  sub: string;
  wilayah: string;
  lng: number;
  lat: number;
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

function parseFile(src: Source): Row[] {
  const full = path.join(process.cwd(), 'data', 'geojson', src.file);
  const json = JSON.parse(readFileSync(full, 'utf8'));
  const feats: any[] = Array.isArray(json?.features) ? json.features : [];
  const rows: Row[] = [];

  feats.forEach((f, i) => {
    if (f?.type !== 'Feature') {
      return skip(src.file, i, `type "${f?.type}" bukan Feature (di-exclude)`);
    }
    const p = f.properties ?? {};
    const nama = str(p[src.namaField]);
    if (!nama) return skip(src.file, i, `${src.namaField} kosong`);
    const sub = str(p[src.subField]);
    if (!sub) return skip(src.file, i, `${src.subField} kosong (nama: ${nama})`);
    const wilayah = str(p.wilayah);
    if (!wilayah || !WILAYAH.includes(wilayah)) {
      return skip(src.file, i, `wilayah tidak valid "${p.wilayah}" (nama: ${nama})`);
    }
    const g = f.geometry;
    const c = g?.coordinates;
    if (
      g?.type !== 'Point' ||
      !Array.isArray(c) ||
      c.length < 2 ||
      typeof c[0] !== 'number' ||
      typeof c[1] !== 'number' ||
      !Number.isFinite(c[0]) ||
      !Number.isFinite(c[1]) ||
      Math.abs(c[0]) > 180 ||
      Math.abs(c[1]) > 90
    ) {
      return skip(src.file, i, `geometry/koordinat tidak valid (nama: ${nama})`);
    }
    const [lng, lat] = c as [number, number];
    if (
      lng < BOGOR_BBOX.minLng || lng > BOGOR_BBOX.maxLng ||
      lat < BOGOR_BBOX.minLat || lat > BOGOR_BBOX.maxLat
    ) {
      warnLog.push(`[${src.file}] feature #${i} "${nama}": koordinat [${lng}, ${lat}] di luar bbox Bogor (tetap di-insert)`);
    }
    rows.push({ nama, sub, wilayah, lng, lat });
  });
  return rows;
}

async function findOrCreateKategori(em: EntityManager, nama: string) {
  const repo = em.getRepository(Kategori);
  return (
    (await repo.findOneBy({ namaKategori: nama })) ??
    (await repo.save(repo.create({ namaKategori: nama })))
  );
}

async function findOrCreateSub(em: EntityManager, kategoriId: number, nama: string) {
  const repo = em.getRepository(SubKategori);
  return (
    (await repo.findOneBy({ kategoriId, namaSubKategori: nama })) ??
    (await repo.save(repo.create({ kategoriId, namaSubKategori: nama })))
  );
}

async function main() {
  const parsed = SOURCES.map((s) => ({ src: s, rows: parseFile(s) }));
  const ds = await getDataSource();

  const summary: Record<string, { subs: Record<string, number>; inserted: number }> = {};

  await ds.transaction(async (em) => {
    await em.query('TRUNCATE "lokasi_layanans" RESTART IDENTITY');

    for (const { src, rows } of parsed) {
      const kat = await findOrCreateKategori(em, src.kategori);
      const subIds = new Map<string, number>();
      const stat = (summary[src.kategori] = { subs: {}, inserted: 0 });

      for (const r of rows) {
        if (!subIds.has(r.sub)) {
          subIds.set(r.sub, (await findOrCreateSub(em, kat.id, r.sub)).id);
        }
        stat.subs[r.sub] = (stat.subs[r.sub] ?? 0) + 1;
      }

      for (let i = 0; i < rows.length; i += CHUNK) {
        const values = rows.slice(i, i + CHUNK).map((r) => ({
          nama: r.nama,
          subKategoriId: subIds.get(r.sub)!,
          wilayah: r.wilayah,
          // lng/lat sudah divalidasi sebagai number finite, aman diinterpolasi.
          koordinat: () => `ST_SetSRID(ST_MakePoint(${r.lng}, ${r.lat}), 4326)::geography`,
          alamat: null,
          noKontak: null,
          jamOperasional: null,
          fotoUrl: null,
          createdById: null,
        }));
        await em
          .createQueryBuilder()
          .insert()
          .into(LokasiLayanan)
          .values(values as any)
          .execute();
        stat.inserted += values.length;
      }
    }
  });

  console.log('\n=== RINGKASAN SEED ===');
  let total = 0;
  for (const [kat, s] of Object.entries(summary)) {
    total += s.inserted;
    console.log(`${kat}: ${Object.keys(s.subs).length} sub-kategori, ${s.inserted} lokasi`);
    for (const [sub, n] of Object.entries(s.subs)) console.log(`   - ${sub}: ${n}`);
  }
  console.log(`Total lokasi ter-insert: ${total}`);

  const [{ k }] = await ds.query('SELECT COUNT(*)::int AS k FROM "kategori"');
  const [{ s }] = await ds.query('SELECT COUNT(*)::int AS s FROM "sub_kategori"');
  const [{ l }] = await ds.query('SELECT COUNT(*)::int AS l FROM "lokasi_layanans"');
  console.log(`DB: kategori=${k}, sub_kategori=${s}, lokasi_layanans=${l}`);

  console.log(`\nSkipped: ${skipLog.length}`);
  skipLog.forEach((m) => console.log('  ' + m));
  console.log(`Warnings: ${warnLog.length}`);
  warnLog.forEach((m) => console.log('  ' + m));

  await ds.destroy();
}

main().catch((err) => {
  console.error('Seed gagal (transaksi di-rollback):', err);
  process.exit(1);
});
