import Link from 'next/link';
import { ArrowRight, Building, Compass, ExternalLink, HeartPulse, MapPin, Plus, Shield } from 'lucide-react';
import { getDataSource } from '@/lib/data-source';
import { Kategori, LokasiLayanan } from '@/entities';

export const dynamic = 'force-dynamic';

async function hitung() {
  try {
    const ds = await getDataSource();
    const total = await ds.getRepository<LokasiLayanan>('LokasiLayanan').count();
    const perKategori = await ds
      .getRepository<Kategori>('Kategori')
      .createQueryBuilder('k')
      .leftJoin('k.subKategori', 's')
      .leftJoin('s.lokasiLayanan', 'l')
      .select('k.namaKategori', 'nama')
      .addSelect('COUNT(l.id)', 'jumlah')
      .groupBy('k.namaKategori')
      .getRawMany<{ nama: string; jumlah: string }>();

    const tanpaKoordinat = await ds
      .getRepository<LokasiLayanan>('LokasiLayanan')
      .createQueryBuilder('l')
      .where('l.deskripsi IS NULL AND l.alamat IS NULL')
      .getCount();

    const terbaru = await ds
      .getRepository<LokasiLayanan>('LokasiLayanan')
      .createQueryBuilder('l')
      .innerJoinAndSelect('l.subKategori', 's')
      .innerJoinAndSelect('s.kategori', 'k')
      .orderBy('l.id', 'DESC')
      .take(5)
      .getMany();

    return { total, perKategori, tanpaKoordinat, terbaru };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await hitung();

  const getJumlah = (katName: string) => {
    const f = data?.perKategori.find((k) => k.nama.toLowerCase() === katName.toLowerCase());
    return f ? Number(f.jumlah) : 0;
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B2433] md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[#5A6478]">Ringkasan data fasilitas dan sistem SIGAP Bogor.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#DFE5F1] bg-white px-4 py-2.5 text-xs font-bold text-[#1B2433] hover:bg-[#F8FAFC]"
          >
            <ExternalLink size={14} aria-hidden="true" /> Lihat Peta Publik
          </Link>
          <Link
            href="/admin/lokasi"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F5FD1] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1A50B4] focus-visible:outline-2 focus-visible:outline-[#1B2433]"
          >
            <Plus size={15} aria-hidden="true" /> Kelola Fasilitas
          </Link>
        </div>
      </header>

      {!data ? (
        <div role="alert" className="rounded-2xl border border-[#C8261E] bg-[#FBE9E8] p-5 text-sm font-semibold text-[#A91F19]">
          Data belum bisa dimuat. Periksa koneksi basis data.
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <section aria-label="Statistik Fasilitas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#DFE5F1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#5A6478]">
                <p className="text-xs font-bold uppercase tracking-wider">Total Fasilitas</p>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#EFF4FF] text-[#1F5FD1]">
                  <Building size={16} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#1B2433]">{data.total}</p>
              <p className="mt-1 text-[11px] text-[#5A6478]">Tersebar di Kota &amp; Kab. Bogor</p>
            </div>

            <div className="rounded-2xl border border-[#DFE5F1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#005F50]">
                <p className="text-xs font-bold uppercase tracking-wider">Kesehatan</p>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#DDF5EA] text-[#005144]">
                  <HeartPulse size={16} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#1B2433]">{getJumlah('Kesehatan')}</p>
              <p className="mt-1 text-[11px] text-[#5A6478]">RS, Puskesmas, dan Klinik</p>
            </div>

            <div className="rounded-2xl border border-[#DFE5F1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#1F5FD1]">
                <p className="text-xs font-bold uppercase tracking-wider">Keamanan</p>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#EFF4FF] text-[#1F5FD1]">
                  <Shield size={16} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#1B2433]">{getJumlah('Keamanan')}</p>
              <p className="mt-1 text-[11px] text-[#5A6478]">Polres, Polsek, dan Pos Polisi</p>
            </div>

            <div className="rounded-2xl border border-[#DFE5F1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-[#C8261E]">
                <p className="text-xs font-bold uppercase tracking-wider">Hiburan &amp; Publik</p>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#FFF3D6] text-[#8C6D00]">
                  <Compass size={16} aria-hidden="true" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-[#1B2433]">{getJumlah('Hiburan')}</p>
              <p className="mt-1 text-[11px] text-[#5A6478]">Taman kota dan fasilitas umum</p>
            </div>
          </section>

          {/* Fasilitas Terbaru & Info Status */}
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-[#DFE5F1] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#DFE5F1] bg-[#F8FAFC] px-5 py-4">
                <h2 className="text-sm font-extrabold text-[#1B2433]">Fasilitas Terbaru Ditambahkan</h2>
                <Link href="/admin/lokasi" className="text-xs font-bold text-[#1F5FD1] hover:underline">
                  Lihat Semua
                </Link>
              </div>
              <div className="divide-y divide-[#EFEEE6]">
                {data.terbaru.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#F8FAFC] transition">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#1B2433]">{f.nama}</p>
                      <p className="text-[11px] text-[#5A6478]">
                        {f.subKategori.kategori.namaKategori} &gt; {f.subKategori.namaSubKategori} · {f.wilayah}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        f.subKategori.kategori.namaKategori.toLowerCase() === 'kesehatan'
                          ? 'bg-[#DDF5EA] text-[#005144]'
                          : f.subKategori.kategori.namaKategori.toLowerCase() === 'keamanan'
                          ? 'bg-[#EFF4FF] text-[#1F5FD1]'
                          : 'bg-[#FFF3D6] text-[#8C6D00]'
                      }`}
                    >
                      {f.subKategori.kategori.namaKategori}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Aksi & Kelengkapan */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#DFE5F1] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#1B2433]">Kelengkapan Data</h2>
                <p className="mt-1 text-xs text-[#5A6478]">
                  <span className="font-bold text-[#C8261E]">{data.tanpaKoordinat}</span> fasilitas belum memiliki alamat dan deskripsi lengkap.
                </p>
                <Link
                  href="/admin/lokasi"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F5FD1] hover:underline"
                >
                  Lengkapi data sekarang <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              <div className="rounded-2xl border border-[#DFE5F1] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-extrabold text-[#1B2433]">Aksi Cepat</h2>
                <div className="mt-3 space-y-2">
                  <Link
                    href="/admin/lokasi"
                    className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3.5 py-2.5 text-xs font-bold text-[#1B2433] hover:bg-[#EFF4FF] hover:text-[#1F5FD1]"
                  >
                    <span>+ Tambah Fasilitas Baru</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3.5 py-2.5 text-xs font-bold text-[#1B2433] hover:bg-[#EFF4FF] hover:text-[#1F5FD1]"
                  >
                    <span>Buka Peta Publik</span>
                    <MapPin size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
