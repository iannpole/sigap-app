import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Ambulance, Bed, Clock3, ExternalLink, FileCheck2, MapPin, Phone, ShieldCheck, Stethoscope } from "lucide-react";
import TombolRute from "@/components/TombolRute";
import { ruteOsm } from "@/lib/rute";
import { notFound } from "next/navigation";
import FacilityVisual from "@/components/FacilityVisual";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDataSource } from "@/lib/data-source";
import type { DetailFasilitas } from "@/lib/lokasi-input";
import { LokasiLayanan } from "@/entities";
import { warnaKategori, warnaKategoriGelap } from "@/lib/category-color";

export const dynamic = "force-dynamic";
type Params = { params: Promise<{ id: string }> };

function parseId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

async function ambilLokasi(id: number) {
  const ds = await getDataSource();
  const lokasi = await ds.getRepository<LokasiLayanan>("LokasiLayanan").createQueryBuilder("l")
    .innerJoinAndSelect("l.subKategori", "s").innerJoinAndSelect("s.kategori", "k")
    .where("l.id = :id", { id }).getOne();
  if (!lokasi) return null;

  const sekitar = await ds.getRepository<LokasiLayanan>("LokasiLayanan").createQueryBuilder("dekat")
    .innerJoinAndSelect("dekat.subKategori", "ds").innerJoinAndSelect("ds.kategori", "dk")
    .addSelect("ST_Distance(dekat.koordinat::geography, lokasi.koordinat::geography)", "jarak")
    .innerJoin("lokasi_layanans", "lokasi", "lokasi.id = :id", { id })
    .where("dekat.id <> :id", { id })
    .andWhere("dk.namaKategori <> :tersembunyi", { tersembunyi: "Keselamatan" })
    .andWhere("ST_DWithin(dekat.koordinat::geography, lokasi.koordinat::geography, 1000)")
    .orderBy("jarak", "ASC").take(5).getRawAndEntities();

  return {
    lokasi,
    sekitar: sekitar.entities.map((item, index) => ({ item, jarak: Number(sekitar.raw[index].jarak) })),
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = parseId((await params).id);
  if (id === null) return { title: "Lokasi tidak ditemukan | SIGAP Bogor" };
  const hasil = await ambilLokasi(id).catch(() => null);
  if (!hasil) return { title: "Lokasi tidak ditemukan | SIGAP Bogor" };
  const { lokasi } = hasil;
  const deskripsi = lokasi.deskripsi ?? `${lokasi.subKategori.namaSubKategori} di ${lokasi.wilayah}.`;
  return { title: `${lokasi.nama} | SIGAP Bogor`, description: `${lokasi.nama}, ${lokasi.subKategori.namaSubKategori}, ${lokasi.wilayah}. ${deskripsi}`.slice(0, 300) };
}

function Info({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return <div className="flex gap-4 rounded-xl bg-[var(--mist)] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#DCE8FF] text-[#1F5FD1] dark:bg-[#2A3D61] dark:text-[#8FB4FF]"><Icon size={20} aria-hidden="true" /></span><div><dt className="text-xs font-bold text-[var(--abu)]">{label}</dt><dd className="mt-1 text-sm leading-6 text-[var(--tinta)]">{children}</dd></div></div>;
}

export default async function DetailLayananPage({ params }: Params) {
  const id = parseId((await params).id);
  if (id === null) notFound();
  const hasil = await ambilLokasi(id).catch(() => null);
  if (!hasil) notFound();
  const { lokasi, sekitar } = hasil;

  const kategori = lokasi.subKategori.kategori.namaKategori;
  const warna = warnaKategori(kategori);
  const warnaGelap = warnaKategoriGelap(kategori);
  const lat = lokasi.koordinat.coordinates[1];
  const lng = lokasi.koordinat.coordinates[0];
  const peta = ruteOsm({ lat, lng });
  const telepon = lokasi.noKontak?.replace(/[^\d+]/g, "") ?? null;
  const detail = (lokasi.detailFasilitas ?? {}) as DetailFasilitas;
  const angka = [detail.kapasitasTempatTidur, detail.tempatTidurTersedia, detail.jumlahDokterJaga, detail.waktuResponsMenit].some((x) => x !== null && x !== undefined);
  const panduan = Boolean(detail.aksesAmbulans || detail.dokumenKedatangan || detail.hotlineDarurat || detail.hotlineMedis);

  return <>
    <Header />
    <main className="bg-[var(--mist)] px-4 pb-16 pt-24 md:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <nav aria-label="Remah" className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/layanan" className="font-bold text-[#1F5FD1] underline-offset-2 hover:underline dark:text-[#8FB4FF]">← Kembali ke daftar</Link>
          <span className="text-[var(--abu)]">/ {kategori} / {lokasi.nama}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <span className="kategori-label rounded-lg bg-[var(--panel)] px-3 py-2 text-xs font-extrabold shadow-soft" style={{ "--kategori": warna, "--kategori-gelap": warnaGelap } as React.CSSProperties}>{kategori}</span>
                <span className="rounded-lg bg-[#DCE8FF] px-3 py-2 text-xs font-bold text-[#1B2433]">{lokasi.subKategori.namaSubKategori}</span>
                <span className="rounded-lg bg-[var(--panel)] px-3 py-2 font-mono text-xs text-[var(--abu)]">ID: {lokasi.id}</span>
              </div>
              <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[var(--tinta)] md:text-5xl">{lokasi.nama}</h1>
              {lokasi.deskripsi && <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--abu)]">{lokasi.deskripsi}</p>}
            </header>

            {(detail.statusOperasional || detail.terverifikasi || detail.catatanStatus) && <section className="rounded-2xl border border-[#D7E1F5] bg-[#EEF3FF] p-5 text-[#1B2433] dark:border-[#344766] dark:bg-[#202D44] dark:text-[#F1EFE6]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {detail.statusOperasional && <p className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#005144]">● {detail.statusOperasional}</p>}
                {detail.terverifikasi && <p className="flex items-center gap-2 text-xs font-bold"><ShieldCheck size={16} aria-hidden="true" /> Terverifikasi{detail.namaVerifikator ? ` ${detail.namaVerifikator}` : ""}</p>}
              </div>
              {detail.catatanStatus && <p className="mt-4 text-sm leading-6">{detail.catatanStatus}</p>}
            </section>}

            <div className="rounded-2xl bg-[var(--panel)] p-5 shadow-card">
              <p className="mb-3 text-sm font-extrabold text-[var(--tinta)]">Petunjuk arah</p>
              <TombolRute tujuan={{ lat, lng }} nama={lokasi.nama} telepon={lokasi.noKontak} />
            </div>

            <section className="rounded-2xl bg-[var(--panel)] p-6 shadow-card" aria-labelledby="info-fasilitas">
              <h2 id="info-fasilitas" className="text-xl font-extrabold text-[var(--tinta)]">Informasi fasilitas lengkap</h2>
              <dl className="mt-5 grid gap-4">
                {lokasi.alamat && <Info icon={MapPin} label="Alamat lengkap">{lokasi.alamat}</Info>}
                {lokasi.noKontak && <Info icon={Phone} label="Kontak"><a href={`tel:${telepon}`} className="font-bold text-[#1F5FD1] underline-offset-2 hover:underline dark:text-[#8FB4FF]">{lokasi.noKontak}</a></Info>}
                {lokasi.jamOperasional && <Info icon={Clock3} label="Jam operasional">{lokasi.jamOperasional}</Info>}
                <Info icon={MapPin} label="Wilayah administrasi">{lokasi.wilayah}</Info>
              </dl>
            </section>

            {detail.layananUtama && detail.layananUtama.length > 0 && <section className="rounded-2xl bg-[var(--panel)] p-6 shadow-card"><h2 className="text-xl font-extrabold text-[var(--tinta)]">Fasilitas layanan utama</h2><ul className="mt-5 flex flex-wrap gap-3">{detail.layananUtama.map((item) => <li key={item} className="rounded-lg bg-[#E7EEFF] px-3 py-2 text-sm font-bold text-[#1B2433]">{item}</li>)}</ul></section>}

            {angka && <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {detail.kapasitasTempatTidur != null && <div className="rounded-xl bg-[var(--panel)] p-5 shadow-card"><Bed aria-hidden="true" /><p className="mt-3 text-3xl font-extrabold">{detail.kapasitasTempatTidur}</p><p className="text-xs text-[var(--abu)]">Kapasitas tempat tidur</p></div>}
              {detail.tempatTidurTersedia != null && <div className="rounded-xl bg-[var(--panel)] p-5 shadow-card"><Bed aria-hidden="true" /><p className="mt-3 text-3xl font-extrabold">{detail.tempatTidurTersedia}</p><p className="text-xs text-[var(--abu)]">Tempat tidur tersedia</p></div>}
              {detail.jumlahDokterJaga != null && <div className="rounded-xl bg-[var(--panel)] p-5 shadow-card"><Stethoscope aria-hidden="true" /><p className="mt-3 text-3xl font-extrabold">{detail.jumlahDokterJaga}</p><p className="text-xs text-[var(--abu)]">Dokter jaga</p></div>}
              {detail.waktuResponsMenit != null && <div className="rounded-xl bg-[var(--panel)] p-5 shadow-card"><Clock3 aria-hidden="true" /><p className="mt-3 text-3xl font-extrabold">{detail.waktuResponsMenit}</p><p className="text-xs text-[var(--abu)]">Menit waktu respons</p></div>}
            </section>}

            {detail.galeri && detail.galeri.length > 0 && <section className="grid gap-4 sm:grid-cols-2">{detail.galeri.map((item, index) => <figure key={`${item.url}-${index}`} className="overflow-hidden rounded-xl bg-[var(--panel)] shadow-card"><div className="relative aspect-video">                <Image src={item.url} alt={item.caption || `Foto ${lokasi.nama} ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" unoptimized className="object-cover" /></div>{item.caption && <figcaption className="p-3 text-sm font-bold">{item.caption}</figcaption>}</figure>)}</section>}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="overflow-hidden rounded-2xl bg-[var(--panel)] shadow-card">
              <FacilityVisual nama={lokasi.nama} kategori={kategori} fotoUrl={lokasi.fotoUrl} className="h-64 w-full" />
              <div className="p-5"><h2 className="text-lg font-extrabold">Lokasi fasilitas</h2><p className="mt-3 font-mono text-xs text-[var(--abu)]">{lat.toFixed(6)}, {lng.toFixed(6)}</p><a href={peta} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#DCE8FF] px-4 py-3 text-sm font-bold text-[#005144]"><ExternalLink size={17} aria-hidden="true" /> Buka di peta</a></div>
            </section>

            {panduan && <section className="rounded-2xl bg-[var(--panel)] p-6 shadow-card"><h2 className="text-lg font-extrabold text-[var(--tinta)]">Panduan akses cepat & darurat</h2><div className="mt-5 space-y-4">
              {detail.aksesAmbulans && <div className="flex gap-3 rounded-xl bg-[var(--mist)] p-4"><Ambulance className="shrink-0 text-[#005144]" size={20} aria-hidden="true" /><div><h3 className="text-sm font-bold">Akses ambulans</h3><p className="mt-1 text-sm leading-6 text-[var(--abu)]">{detail.aksesAmbulans}</p></div></div>}
              {detail.dokumenKedatangan && <div className="flex gap-3 rounded-xl bg-[var(--mist)] p-4"><FileCheck2 className="shrink-0 text-[#005144]" size={20} aria-hidden="true" /><div><h3 className="text-sm font-bold">Dokumen kedatangan</h3><p className="mt-1 text-sm leading-6 text-[var(--abu)]">{detail.dokumenKedatangan}</p></div></div>}
              <div className="grid gap-3 sm:grid-cols-2">{detail.hotlineDarurat && <a href={`tel:${detail.hotlineDarurat.replace(/[^\d+]/g, "")}`} className="rounded-lg bg-[#FBE9E8] p-3 text-sm font-bold text-[#A91F19]">Darurat {detail.hotlineDarurat}</a>}{detail.hotlineMedis && <a href={`tel:${detail.hotlineMedis.replace(/[^\d+]/g, "")}`} className="rounded-lg bg-[#DDF5EA] p-3 text-sm font-bold text-[#005144]">Medis {detail.hotlineMedis}</a>}</div>
            </div></section>}

            {sekitar.length > 0 && <section className="rounded-2xl bg-[var(--panel)] p-6 shadow-card"><h2 className="text-lg font-extrabold text-[var(--tinta)]">Fasilitas sekitar (radius 1 km)</h2><ul className="mt-4 divide-y divide-black/10">{sekitar.map(({ item, jarak }) => <li key={item.id}><Link href={`/layanan/${item.id}`} className="flex min-h-12 items-center justify-between gap-4 py-3 text-sm hover:text-[#1F5FD1]"><span><span className="font-bold">{item.nama}</span><span className="block text-xs text-[var(--abu)]">{item.subKategori.kategori.namaKategori}</span></span><span className="shrink-0 font-mono text-xs">{jarak < 1000 ? `${Math.round(jarak)} m` : `${(jarak / 1000).toFixed(1)} km`}</span></Link></li>)}</ul></section>}
          </aside>
        </section>
      </div>
    </main>
    <Footer />
  </>;
}
