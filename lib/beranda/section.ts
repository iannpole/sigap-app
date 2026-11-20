import { getDataSource } from '@/lib/data-source';
import { BerandaSection, BerandaGambar } from '@/entities';

export const MAX_GAMBAR = 5;

export interface SectionInput {
  eyebrow: string;
  judul: string;
  deskripsi: string;
}

export class BatasGambarError extends Error {
  constructor() {
    super(`Gambar maksimal ${MAX_GAMBAR}`);
  }
}

export async function bacaSection() {
  const ds = await getDataSource();
  return ds.getRepository<BerandaSection>('BerandaSection').findOne({ where: {} });
}

export async function bacaGambarList() {
  const ds = await getDataSource();
  return ds
    .getRepository<BerandaGambar>('BerandaGambar')
    .find({ order: { urutan: 'ASC', id: 'ASC' } });
}

export async function simpanSection(v: SectionInput) {
  const ds = await getDataSource();
  const repo = ds.getRepository<BerandaSection>('BerandaSection');
  const existing = await repo.findOne({ where: {} });
  await repo.save(repo.create({ id: existing?.id, ...v }));
}

export async function tambahGambar(v: { label: string; data: Buffer; mime: string }) {
  const ds = await getDataSource();
  return ds.transaction(async (manager) => {
    await manager.query('SELECT pg_advisory_xact_lock($1)', [917302]);
    const repo = manager.getRepository<BerandaGambar>('BerandaGambar');
    const jumlah = await repo.count();
    if (jumlah >= MAX_GAMBAR) throw new BatasGambarError();
    return repo.save(repo.create({ label: v.label, gambar: v.data, gambarMime: v.mime, urutan: jumlah + 1 }));
  });
}

export async function ubahLabelGambar(id: number, label: string) {
  const ds = await getDataSource();
  await ds.getRepository<BerandaGambar>('BerandaGambar').update({ id }, { label });
}

export async function hapusGambar(id: number) {
  const ds = await getDataSource();
  await ds.getRepository<BerandaGambar>('BerandaGambar').delete({ id });
}

export async function bacaGambar(id: number) {
  const ds = await getDataSource();
  return ds
    .getRepository<BerandaGambar>('BerandaGambar')
    .createQueryBuilder('g')
    .addSelect('g.gambar')
    .where('g.id = :id', { id })
    .getOne();
}
