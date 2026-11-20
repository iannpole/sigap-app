import type { Repository } from 'typeorm';
import { getDataSource } from '@/lib/data-source';
import { HomepageFeature, SiteFooter, FooterLink, SocialLink } from '@/entities';
import { FITUR_AKTIF_MAKS, FITUR_AKTIF_MIN } from './katalog';
import type { FiturInput, FooterInput } from './validasi';

// Kunci advisory tetap untuk tabel fitur. Mencegah dua tulis paralel melewati batas aktif.
const KUNCI_FITUR = 917301;

export async function listFiturAdmin() {
  const ds = await getDataSource();
  return ds.getRepository<HomepageFeature>('HomepageFeature').find({ order: { urutan: 'ASC', id: 'ASC' } });
}

export async function listFiturPublik() {
  const ds = await getDataSource();
  return ds
    .getRepository<HomepageFeature>('HomepageFeature')
    .find({ where: { aktif: true }, order: { urutan: 'ASC', id: 'ASC' } });
}

/** Menjalankan perubahan fitur dengan kunci advisory agar batas 4 sampai 6 aktif tidak bisa dilewati paralel. */
export async function tulisFitur<T>(
  kerja: (repo: Repository<HomepageFeature>) => Promise<T>
): Promise<T> {
  const ds = await getDataSource();
  return ds.transaction(async (manager) => {
    await manager.query('SELECT pg_advisory_xact_lock($1)', [KUNCI_FITUR]);
    const repo = manager.getRepository<HomepageFeature>('HomepageFeature');
    const hasil = await kerja(repo);
    const aktif = await repo.countBy({ aktif: true });
    if (aktif < FITUR_AKTIF_MIN || aktif > FITUR_AKTIF_MAKS) {
      throw new BatasFiturError(aktif);
    }
    return hasil;
  });
}

export class BatasFiturError extends Error {
  constructor(public readonly jumlah: number) {
    super(`Jumlah fitur aktif harus ${FITUR_AKTIF_MIN} sampai ${FITUR_AKTIF_MAKS}, sekarang ${jumlah}`);
  }
}

export function pesanBatas(jumlah: number): string {
  return jumlah > FITUR_AKTIF_MAKS
    ? `Fitur aktif maksimal ${FITUR_AKTIF_MAKS}. Nonaktifkan salah satu dulu.`
    : `Fitur aktif minimal ${FITUR_AKTIF_MIN}. Aktifkan fitur lain dulu.`;
}

export function fiturData(v: FiturInput) {
  return {
    judul: v.judul,
    deskripsi: v.deskripsi,
    ikonKey: v.ikonKey,
    tautan: v.tautan,
    urutan: v.urutan,
    aktif: v.aktif,
  };
}

export async function getFooterAdmin() {
  const ds = await getDataSource();
  const footer = await ds.getRepository<SiteFooter>('SiteFooter').findOne({
    where: {},
    relations: { tautan: true, sosial: true },
    order: { tautan: { urutan: 'ASC' }, sosial: { urutan: 'ASC' } },
  });
  if (footer && !footer.urlLogo) {
    footer.urlLogo = '/logo/sigap-logo.png';
  }
  return footer;
}

export async function getFooterPublik() {
  const footer = await getFooterAdmin();
  if (!footer) return null;
  return {
    nama: footer.nama,
    tagline: footer.tagline,
    email: footer.email,
    hakCipta: footer.hakCipta,
    alamat: footer.tampilkanAlamat ? footer.alamat : null,
    tautan: footer.tautan.map((t) => ({ label: t.label, url: t.url, urutan: t.urutan })),
    sosial: footer.sosial.map((s) => ({ platform: s.platform, url: s.url, urutan: s.urutan })),
  };
}

export async function simpanFooter(v: FooterInput) {
  const ds = await getDataSource();
  return ds.transaction(async (manager) => {
    const repo = manager.getRepository<SiteFooter>('SiteFooter');
    const existing = await repo.findOne({ where: {} });
    const footer = repo.create({
      id: existing?.id,
      nama: v.nama,
      tagline: v.tagline,
      email: v.email,
      hakCipta: v.hakCipta,
      alamat: v.alamat,
      tampilkanAlamat: v.tampilkanAlamat,
      urlLogo: v.urlLogo,
    });
    const saved = await repo.save(footer);

    await manager.getRepository<FooterLink>('FooterLink').delete({ footerId: saved.id });
    await manager.getRepository<SocialLink>('SocialLink').delete({ footerId: saved.id });
    await manager.getRepository<FooterLink>('FooterLink').insert(
      v.tautan.map((t) => ({ ...t, footerId: saved.id }))
    );
    await manager.getRepository<SocialLink>('SocialLink').insert(
      v.sosial.map((s) => ({ ...s, footerId: saved.id }))
    );
    return saved.id;
  });
}
