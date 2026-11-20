'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building,
  Check,
  CheckCircle2,
  Compass,
  HeartPulse,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import type { Kategori, Lokasi } from '@/lib/types';
import type { DetailFasilitas } from '@/lib/lokasi-input';

type ItemLokasi = Omit<Lokasi, 'jarakMeter'>;

type Form = {
  nama: string;
  kategoriId: number | '';
  subKategoriId: number | '';
  alamat: string;
  wilayah: string;
  lat: string;
  lng: string;
  noKontak: string;
  jamOperasional: string;
  deskripsi: string;
  fotoUrl: string;
  statusOperasional: string;
  terverifikasi: boolean;
  namaVerifikator: string;
  catatanStatus: string;
  kapasitasTempatTidur: string;
  tempatTidurTersedia: string;
  jumlahDokterJaga: string;
  waktuResponsMenit: string;
  aksesAmbulans: string;
  dokumenKedatangan: string;
  hotlineDarurat: string;
  hotlineMedis: string;
  layananUtama: string;
  galeri: string;
};

const KOSONG: Form = {
  nama: '',
  kategoriId: '',
  subKategoriId: '',
  alamat: '',
  wilayah: 'Kota Bogor',
  lat: '',
  lng: '',
  noKontak: '',
  jamOperasional: '',
  deskripsi: '',
  fotoUrl: '',
  statusOperasional: '',
  terverifikasi: false,
  namaVerifikator: '',
  catatanStatus: '',
  kapasitasTempatTidur: '',
  tempatTidurTersedia: '',
  jumlahDokterJaga: '',
  waktuResponsMenit: '',
  aksesAmbulans: '',
  dokumenKedatangan: '',
  hotlineDarurat: '',
  hotlineMedis: '',
  layananUtama: '',
  galeri: '',
};

function bentukDetail(d: DetailFasilitas | null | undefined): Pick<
  Form,
  | 'statusOperasional'
  | 'terverifikasi'
  | 'namaVerifikator'
  | 'catatanStatus'
  | 'kapasitasTempatTidur'
  | 'tempatTidurTersedia'
  | 'jumlahDokterJaga'
  | 'waktuResponsMenit'
  | 'aksesAmbulans'
  | 'dokumenKedatangan'
  | 'hotlineDarurat'
  | 'hotlineMedis'
  | 'layananUtama'
  | 'galeri'
> {
  return {
    statusOperasional: d?.statusOperasional ?? '',
    terverifikasi: d?.terverifikasi ?? false,
    namaVerifikator: d?.namaVerifikator ?? '',
    catatanStatus: d?.catatanStatus ?? '',
    kapasitasTempatTidur: d?.kapasitasTempatTidur?.toString() ?? '',
    tempatTidurTersedia: d?.tempatTidurTersedia?.toString() ?? '',
    jumlahDokterJaga: d?.jumlahDokterJaga?.toString() ?? '',
    waktuResponsMenit: d?.waktuResponsMenit?.toString() ?? '',
    aksesAmbulans: d?.aksesAmbulans ?? '',
    dokumenKedatangan: d?.dokumenKedatangan ?? '',
    hotlineDarurat: d?.hotlineDarurat ?? '',
    hotlineMedis: d?.hotlineMedis ?? '',
    layananUtama: (d?.layananUtama ?? []).join(', '),
    galeri: (d?.galeri ?? []).map((g) => g.url).join('\n'),
  };
}

function angkaAtauKosong(v: string): number | null {
  const t = v.trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isInteger(n) ? n : NaN;
}

function bangunDetail(f: Form): DetailFasilitas | null {
  const teks = (v: string) => (v.trim() === '' ? null : v.trim());
  const detail: DetailFasilitas = {
    statusOperasional: teks(f.statusOperasional),
    terverifikasi: f.terverifikasi,
    namaVerifikator: teks(f.namaVerifikator),
    catatanStatus: teks(f.catatanStatus),
    kapasitasTempatTidur: angkaAtauKosong(f.kapasitasTempatTidur),
    tempatTidurTersedia: angkaAtauKosong(f.tempatTidurTersedia),
    jumlahDokterJaga: angkaAtauKosong(f.jumlahDokterJaga),
    waktuResponsMenit: angkaAtauKosong(f.waktuResponsMenit),
    aksesAmbulans: teks(f.aksesAmbulans),
    dokumenKedatangan: teks(f.dokumenKedatangan),
    hotlineDarurat: teks(f.hotlineDarurat),
    hotlineMedis: teks(f.hotlineMedis),
    layananUtama: f.layananUtama.split(',').map((x) => x.trim()).filter(Boolean),
    galeri: f.galeri.split('\n').map((x) => x.trim()).filter(Boolean).map((url) => ({ url, caption: null })),
  };
  return detail;
}

const inputCls =
  'min-h-11 w-full rounded-xl border border-[#C3CADA] bg-white px-3.5 py-2.5 text-sm text-[#1B2433] placeholder:text-[#8D97B4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] transition';

const WILAYAH = ['Kota Bogor', 'Kabupaten Bogor'];
const PER_HALAMAN = 10;

export default function LokasiManager() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [items, setItems] = useState<ItemLokasi[]>([]);
  const [status, setStatus] = useState<'memuat' | 'siap' | 'gagal'>('memuat');
  const [errorMsg, setErrorMsg] = useState('');
  const [cari, setCari] = useState('');
  const [filterKategori, setFilterKategori] = useState<number | ''>('');
  const [filterWilayah, setFilterWilayah] = useState<string>('');
  const [halaman, setHalaman] = useState(1);
  const [editId, setEditId] = useState<number | 'baru' | null>(null);
  const [form, setForm] = useState<Form>(KOSONG);
  const [formErr, setFormErr] = useState('');
  const [pending, setPending] = useState(false);
  const [suksesMsg, setSuksesMsg] = useState('');
  const [hapusId, setHapusId] = useState<number | null>(null);

  const muat = useCallback(async () => {
    setStatus('memuat');
    try {
      const [resKategori, resLokasi] = await Promise.all([
        fetch('/api/kategori', { cache: 'no-store' }),
        fetch('/api/lokasi?limit=100', { cache: 'no-store' }),
      ]);
      const jsonKategori = await resKategori.json().catch(() => null);
      const jsonLokasi = await resLokasi.json().catch(() => null);
      if (!resKategori.ok || !jsonKategori?.success) throw new Error(jsonKategori?.message || 'Gagal memuat kategori');
      if (!resLokasi.ok || jsonLokasi?.type !== 'FeatureCollection') throw new Error(jsonLokasi?.error || 'Gagal memuat lokasi');

      setKategori(jsonKategori.data as Kategori[]);
      setItems(
        (jsonLokasi.features as { properties: Record<string, unknown>; geometry: { coordinates: number[] } }[]).map((f) => ({
          ...(f.properties as unknown as Omit<ItemLokasi, 'lat' | 'lng'>),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }))
      );
      setStatus('siap');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Gagal memuat lokasi');
      setStatus('gagal');
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(muat, 0);
    return () => window.clearTimeout(timer);
  }, [muat]);

  const jumlahPerKategori = useMemo(() => {
    const counts: Record<string, number> = { total: items.length };
    for (const item of items) {
      counts[item.kategori] = (counts[item.kategori] || 0) + 1;
    }
    return counts;
  }, [items]);

  const subOptions = useMemo(
    () => kategori.flatMap((k) => k.subKategori.map((s) => ({ ...s, kategoriId: k.id, kategori: k.namaKategori }))),
    [kategori]
  );

  const subOptionsForm = useMemo(() => {
    if (form.kategoriId === '') return subOptions;
    return subOptions.filter((s) => s.kategoriId === form.kategoriId);
  }, [subOptions, form.kategoriId]);

  const terlihat = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return items.filter(
      (item) =>
        (filterKategori === '' || item.kategoriId === filterKategori) &&
        (filterWilayah === '' || item.wilayah === filterWilayah) &&
        (!q || `${item.nama} ${item.alamat ?? ''} ${item.sub}`.toLowerCase().includes(q))
    );
  }, [items, cari, filterKategori, filterWilayah]);

  const totalHalaman = Math.max(1, Math.ceil(terlihat.length / PER_HALAMAN));
  const halamanAman = Math.min(halaman, totalHalaman);
  const paginasiItems = useMemo(() => {
    const mulai = (halamanAman - 1) * PER_HALAMAN;
    return terlihat.slice(mulai, mulai + PER_HALAMAN);
  }, [terlihat, halamanAman]);

  function mulaiTambah() {
    setEditId('baru');
    setForm(KOSONG);
    setFormErr('');
    setSuksesMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function mulaiEdit(item: ItemLokasi) {
    setEditId(item.id);
    setForm({
      nama: item.nama,
      kategoriId: item.kategoriId,
      subKategoriId: item.subKategoriId,
      alamat: item.alamat ?? '',
      wilayah: item.wilayah,
      lat: String(item.lat),
      lng: String(item.lng),
      noKontak: item.noKontak ?? '',
      jamOperasional: item.jamOperasional ?? '',
      deskripsi: item.deskripsi ?? '',
      fotoUrl: item.fotoUrl ?? '',
      ...bentukDetail(item.detailFasilitas),
    });
    setFormErr('');
    setSuksesMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function batalEdit() {
    setEditId(null);
    setFormErr('');
  }

  async function simpan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormErr('');
    setSuksesMsg('');

    const lat = Number(form.lat.replace(',', '.'));
    const lng = Number(form.lng.replace(',', '.'));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setFormErr('Koordinat harus berupa angka desimal valid. Contoh: -6.5971 dan 106.8060');
      return;
    }
    if (form.subKategoriId === '') {
      setFormErr('Pilih subkategori fasilitas.');
      return;
    }
    const detailFasilitas = bangunDetail(form);
    if (
      [
        detailFasilitas?.kapasitasTempatTidur,
        detailFasilitas?.tempatTidurTersedia,
        detailFasilitas?.jumlahDokterJaga,
        detailFasilitas?.waktuResponsMenit,
      ].some(Number.isNaN)
    ) {
      setFormErr('Kapasitas tempat tidur, jumlah dokter, dan waktu respons harus berupa bilangan bulat positif.');
      return;
    }

    setPending(true);
    try {
      const url = editId === 'baru' ? '/api/lokasi' : `/api/lokasi/${editId}`;
      const res = await fetch(url, {
        method: editId === 'baru' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          nama: form.nama,
          subKategoriId: form.subKategoriId,
          wilayah: form.wilayah,
          lat,
          lng,
          alamat: form.alamat || null,
          noKontak: form.noKontak || null,
          jamOperasional: form.jamOperasional || null,
          deskripsi: form.deskripsi || null,
          fotoUrl: form.fotoUrl || null,
          detailFasilitas,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setFormErr(json?.message || 'Gagal menyimpan fasilitas');
        return;
      }
      setSuksesMsg(editId === 'baru' ? 'Fasilitas baru berhasil ditambahkan!' : 'Perubahan fasilitas berhasil disimpan!');
      setEditId(null);
      await muat();
    } catch {
      setFormErr('Tidak bisa terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setPending(false);
    }
  }

  async function hapus(id: number) {
    setPending(true);
    try {
      const res = await fetch(`/api/lokasi/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMsg(json?.message || 'Gagal menghapus fasilitas');
        setStatus('gagal');
        return;
      }
      setHapusId(null);
      setSuksesMsg('Fasilitas berhasil dihapus.');
      await muat();
    } catch {
      setErrorMsg('Tidak bisa terhubung ke server saat menghapus.');
      setStatus('gagal');
    } finally {
      setPending(false);
    }
  }

  const itemDiedit = typeof editId === 'number' ? items.find((x) => x.id === editId) : null;

  /* ========================================================================= */
  /* FORM VIEW: TAMBAH / EDIT FASILITAS (Screen 13 & 14)                      */
  /* ========================================================================= */
  if (editId !== null) {
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={batalEdit}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1F5FD1] hover:underline"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Kembali ke Kelola Fasilitas
          </button>
          <h1 className="mt-2 text-2xl font-extrabold text-[#1B2433] md:text-3xl">
            {editId === 'baru' ? 'Tambah Fasilitas Baru' : `Edit Fasilitas: ${itemDiedit?.nama ?? 'Fasilitas'}`}
          </h1>
          <p className="mt-1 text-sm text-[#5A6478]">
            {editId === 'baru'
              ? 'Lengkapi formulir di bawah ini untuk menambahkan fasilitas layanan publik baru ke peta SIGAP Bogor.'
              : 'Perbarui data identitas, lokasi koordinat, kontak, dan detail kapasitas fasilitas.'}
          </p>
        </div>

        {formErr && (
          <div role="alert" className="rounded-2xl border border-[#C8261E] bg-[#FBE9E8] p-4 text-sm font-semibold text-[#A91F19]">
            {formErr}
          </div>
        )}

        <form onSubmit={simpan} noValidate className="space-y-6">
          {/* Bagian 1: Informasi Dasar */}
          <div className="rounded-2xl border border-[#DFE5F1] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#1B2433]">
              <Building size={18} className="text-[#1F5FD1]" aria-hidden="true" /> Informasi Dasar
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="l-nama" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Nama Fasilitas <span className="text-[#C8261E]">*</span>
                </label>
                <input
                  id="l-nama"
                  className={inputCls}
                  maxLength={150}
                  required
                  placeholder="Contoh: RS PMI Kota Bogor, Polsek Bogor Tengah"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-kat" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Kategori <span className="text-[#C8261E]">*</span>
                </label>
                <select
                  id="l-kat"
                  className={inputCls}
                  value={form.kategoriId}
                  onChange={(e) => {
                    const kid = e.target.value === '' ? '' : Number(e.target.value);
                    setForm({ ...form, kategoriId: kid, subKategoriId: '' });
                  }}
                >
                  <option value="">Pilih Kategori</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.namaKategori}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="l-sub" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Subkategori <span className="text-[#C8261E]">*</span>
                </label>
                <select
                  id="l-sub"
                  className={inputCls}
                  required
                  value={form.subKategoriId}
                  onChange={(e) => {
                    const sid = e.target.value === '' ? '' : Number(e.target.value);
                    const subItem = subOptions.find((s) => s.id === sid);
                    setForm({
                      ...form,
                      subKategoriId: sid,
                      kategoriId: subItem ? subItem.kategoriId : form.kategoriId,
                    });
                  }}
                >
                  <option value="">Pilih Subkategori</option>
                  {subOptionsForm.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.kategori} &gt; {s.namaSubKategori}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="l-wilayah" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Wilayah Cakupan <span className="text-[#C8261E]">*</span>
                </label>
                <select
                  id="l-wilayah"
                  className={inputCls}
                  value={form.wilayah}
                  onChange={(e) => setForm({ ...form, wilayah: e.target.value })}
                >
                  {WILAYAH.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="l-status-op" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Status Operasional
                </label>
                <input
                  id="l-status-op"
                  className={inputCls}
                  maxLength={100}
                  placeholder="Contoh: Tersedia 24 Jam, Buka 08:00 - 17:00"
                  value={form.statusOperasional}
                  onChange={(e) => setForm({ ...form, statusOperasional: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 rounded-xl bg-[#F8FAFC] p-4 border border-[#DFE5F1]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded text-[#1F5FD1] focus:ring-[#1F5FD1]"
                      checked={form.terverifikasi}
                      onChange={(e) => setForm({ ...form, terverifikasi: e.target.checked })}
                    />
                    <div>
                      <p className="text-xs font-extrabold text-[#1B2433]">Status Verifikasi Resmi</p>
                      <p className="text-[11px] text-[#5A6478]">Tandai jika fasilitas telah diverifikasi oleh Pemkot/Dinkes</p>
                    </div>
                  </label>
                  {form.terverifikasi && (
                    <div className="w-full sm:w-72">
                      <input
                        className={inputCls}
                        maxLength={100}
                        placeholder="Nama instansi verifikator"
                        value={form.namaVerifikator}
                        onChange={(e) => setForm({ ...form, namaVerifikator: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bagian 2: Lokasi & Koordinat */}
          <div className="rounded-2xl border border-[#DFE5F1] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#1B2433]">
              <MapPin size={18} className="text-[#C8261E]" aria-hidden="true" /> Lokasi &amp; Koordinat
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="l-alamat" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Alamat Lengkap
                </label>
                <textarea
                  id="l-alamat"
                  className={`${inputCls} min-h-20`}
                  maxLength={500}
                  placeholder="Nama jalan, nomor, kelurahan, kecamatan, Kota Bogor"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-lat" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Latitude <span className="text-[#C8261E]">*</span>
                </label>
                <input
                  id="l-lat"
                  className={inputCls}
                  required
                  inputMode="decimal"
                  placeholder="-6.5971"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-lng" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Longitude <span className="text-[#C8261E]">*</span>
                </label>
                <input
                  id="l-lng"
                  className={inputCls}
                  required
                  inputMode="decimal"
                  placeholder="106.8060"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-2 text-xs">
                <span className="text-[#5A6478]">Pintasan koordinat:</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, lat: '-6.5971', lng: '106.8060' })}
                  className="font-bold text-[#1F5FD1] hover:underline"
                >
                  Pusat Kota Bogor (-6.5971, 106.8060)
                </button>
              </div>
            </div>
          </div>

          {/* Bagian 3: Kontak & Jam Operasional */}
          <div className="rounded-2xl border border-[#DFE5F1] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#1B2433]">
              <Phone size={18} className="text-[#005F50]" aria-hidden="true" /> Kontak &amp; Jam Operasional
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="l-kontak" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Nomor Telepon Utama
                </label>
                <input
                  id="l-kontak"
                  className={inputCls}
                  maxLength={50}
                  placeholder="Contoh: 0251-8324080"
                  value={form.noKontak}
                  onChange={(e) => setForm({ ...form, noKontak: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-jam" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Jam Operasional
                </label>
                <input
                  id="l-jam"
                  className={inputCls}
                  maxLength={100}
                  placeholder="Contoh: Senin - Minggu (24 Jam)"
                  value={form.jamOperasional}
                  onChange={(e) => setForm({ ...form, jamOperasional: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-hotline-darurat" className="mb-1.5 block text-xs font-bold text-[#C8261E]">
                  Hotline Darurat
                </label>
                <input
                  id="l-hotline-darurat"
                  className={inputCls}
                  maxLength={100}
                  placeholder="Contoh: 119 / 0251-8324080 Ext. 1"
                  value={form.hotlineDarurat}
                  onChange={(e) => setForm({ ...form, hotlineDarurat: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-hotline-medis" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Hotline Informasi / Medis
                </label>
                <input
                  id="l-hotline-medis"
                  className={inputCls}
                  maxLength={100}
                  placeholder="Contoh: 0251-8324080 Ext. 2"
                  value={form.hotlineMedis}
                  onChange={(e) => setForm({ ...form, hotlineMedis: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="l-deskripsi" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Deskripsi Fasilitas ({form.deskripsi.length}/500)
                </label>
                <textarea
                  id="l-deskripsi"
                  className={`${inputCls} min-h-24`}
                  maxLength={500}
                  placeholder="Deskripsi profil fasilitas, layanan umum, dan keunggulan."
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Bagian 4: Detail Kapasitas & Fasilitas Tambahan */}
          <div className="rounded-2xl border border-[#DFE5F1] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#1B2433]">
              <HeartPulse size={18} className="text-[#C8261E]" aria-hidden="true" /> Kapasitas &amp; Fasilitas Tambahan (Opsional)
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="l-kapasitas-tidur" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Kapasitas Tempat Tidur
                </label>
                <input
                  id="l-kapasitas-tidur"
                  type="number"
                  min="0"
                  step="1"
                  className={inputCls}
                  placeholder="250"
                  value={form.kapasitasTempatTidur}
                  onChange={(e) => setForm({ ...form, kapasitasTempatTidur: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-tidur-tersedia" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Tempat Tidur Tersedia
                </label>
                <input
                  id="l-tidur-tersedia"
                  type="number"
                  min="0"
                  step="1"
                  className={inputCls}
                  placeholder="18"
                  value={form.tempatTidurTersedia}
                  onChange={(e) => setForm({ ...form, tempatTidurTersedia: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-dokter" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Jumlah Dokter Jaga
                </label>
                <input
                  id="l-dokter"
                  type="number"
                  min="0"
                  step="1"
                  className={inputCls}
                  placeholder="6"
                  value={form.jumlahDokterJaga}
                  onChange={(e) => setForm({ ...form, jumlahDokterJaga: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="l-respons" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Waktu Respons (menit)
                </label>
                <input
                  id="l-respons"
                  type="number"
                  min="0"
                  step="1"
                  className={inputCls}
                  placeholder="10"
                  value={form.waktuResponsMenit}
                  onChange={(e) => setForm({ ...form, waktuResponsMenit: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label htmlFor="l-layanan-utama" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Layanan Utama (pisahkan dengan koma)
                </label>
                <input
                  id="l-layanan-utama"
                  className={inputCls}
                  placeholder="IGD 24 Jam, Bank Darah, Ambulans Gawat Darurat, Poli Anak"
                  value={form.layananUtama}
                  onChange={(e) => setForm({ ...form, layananUtama: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="l-ambulans" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Akses Ambulans
                </label>
                <textarea
                  id="l-ambulans"
                  className={`${inputCls} min-h-20`}
                  maxLength={200}
                  placeholder="Panduan akses jalur ambulans dan drop zone IGD"
                  value={form.aksesAmbulans}
                  onChange={(e) => setForm({ ...form, aksesAmbulans: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="l-dokumen" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Dokumen Kedatangan
                </label>
                <textarea
                  id="l-dokumen"
                  className={`${inputCls} min-h-20`}
                  maxLength={200}
                  placeholder="Dokumen yang perlu dibawa: KTP, Kartu BPJS, Rujukan"
                  value={form.dokumenKedatangan}
                  onChange={(e) => setForm({ ...form, dokumenKedatangan: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Bagian 5: Foto & Dokumentasi */}
          <div className="rounded-2xl border border-[#DFE5F1] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#1B2433]">
              <Compass size={18} className="text-[#1F5FD1]" aria-hidden="true" /> Foto &amp; Dokumentasi
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="l-foto" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  URL Foto Utama (opsional)
                </label>
                <input
                  id="l-foto"
                  className={inputCls}
                  maxLength={255}
                  placeholder="https://... atau /facilities/..."
                  value={form.fotoUrl}
                  onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })}
                />
                <p className="mt-1 text-xs text-[#5A6478]">Jika kosong, sistem menampilkan visual ilustrasi berdasarkan kategori.</p>
              </div>

              <div>
                <label htmlFor="l-galeri" className="mb-1.5 block text-xs font-bold text-[#1B2433]">
                  Galeri Foto Tambahan (satu URL per baris)
                </label>
                <textarea
                  id="l-galeri"
                  className={`${inputCls} min-h-24`}
                  placeholder="https://example.com/foto1.jpg&#10;https://example.com/foto2.jpg"
                  value={form.galeri}
                  onChange={(e) => setForm({ ...form, galeri: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi Simpan / Batal */}
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-[#DFE5F1] bg-white p-4">
            <button
              type="button"
              onClick={batalEdit}
              disabled={pending}
              className="min-h-11 rounded-xl border border-[#C3CADA] bg-white px-5 py-2.5 text-sm font-bold text-[#1B2433] hover:bg-[#F4F6FB] focus-visible:outline-2 focus-visible:outline-[#1F5FD1]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F5FD1] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1A50B4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433] disabled:opacity-60"
            >
              <Check size={16} aria-hidden="true" />
              {pending ? 'Menyimpan...' : editId === 'baru' ? 'Simpan Fasilitas' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ========================================================================= */
  /* TABLE VIEW: KELOLA FASILITAS (Screen 12)                                 */
  /* ========================================================================= */
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-[#1B2433] md:text-3xl">Kelola Fasilitas</h1>
        <p className="mt-1 text-sm text-[#5A6478]">
          Kelola data fasilitas layanan publik di Kota dan Kabupaten Bogor.
        </p>
      </header>

      {/* Kartu Ringkasan Filter Cepat */}
      <section aria-label="Statistik Fasilitas" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setFilterKategori('');
            setHalaman(1);
          }}
          className={`rounded-2xl border p-4 text-left transition ${
            filterKategori === '' ? 'border-[#1F5FD1] bg-white shadow-sm ring-2 ring-[#1F5FD1]' : 'border-[#DFE5F1] bg-white hover:border-[#C3CADA]'
          }`}
        >
          <div className="flex items-center justify-between text-[#5A6478]">
            <span className="text-xs font-bold">Total Fasilitas</span>
            <Building size={16} aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#1B2433]">{jumlahPerKategori.total || 0}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            const kat = kategori.find((k) => k.namaKategori.toLowerCase() === 'kesehatan');
            setFilterKategori(kat ? kat.id : '');
            setHalaman(1);
          }}
          className={`rounded-2xl border p-4 text-left transition ${
            filterKategori !== '' && kategori.find((k) => k.id === filterKategori)?.namaKategori.toLowerCase() === 'kesehatan'
              ? 'border-[#005F50] bg-white shadow-sm ring-2 ring-[#005F50]'
              : 'border-[#DFE5F1] bg-white hover:border-[#C3CADA]'
          }`}
        >
          <div className="flex items-center justify-between text-[#005F50]">
            <span className="text-xs font-bold">Kesehatan</span>
            <HeartPulse size={16} aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#1B2433]">{jumlahPerKategori.Kesehatan || 0}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            const kat = kategori.find((k) => k.namaKategori.toLowerCase() === 'keamanan');
            setFilterKategori(kat ? kat.id : '');
            setHalaman(1);
          }}
          className={`rounded-2xl border p-4 text-left transition ${
            filterKategori !== '' && kategori.find((k) => k.id === filterKategori)?.namaKategori.toLowerCase() === 'keamanan'
              ? 'border-[#1F5FD1] bg-white shadow-sm ring-2 ring-[#1F5FD1]'
              : 'border-[#DFE5F1] bg-white hover:border-[#C3CADA]'
          }`}
        >
          <div className="flex items-center justify-between text-[#1F5FD1]">
            <span className="text-xs font-bold">Keamanan</span>
            <Shield size={16} aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#1B2433]">{jumlahPerKategori.Keamanan || 0}</p>
        </button>

        <button
          type="button"
          onClick={() => {
            const kat = kategori.find((k) => k.namaKategori.toLowerCase() === 'hiburan');
            setFilterKategori(kat ? kat.id : '');
            setHalaman(1);
          }}
          className={`rounded-2xl border p-4 text-left transition ${
            filterKategori !== '' && kategori.find((k) => k.id === filterKategori)?.namaKategori.toLowerCase() === 'hiburan'
              ? 'border-[#C8261E] bg-white shadow-sm ring-2 ring-[#C8261E]'
              : 'border-[#DFE5F1] bg-white hover:border-[#C3CADA]'
          }`}
        >
          <div className="flex items-center justify-between text-[#C8261E]">
            <span className="text-xs font-bold">Hiburan</span>
            <Compass size={16} aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#1B2433]">{jumlahPerKategori.Hiburan || 0}</p>
        </button>
      </section>

      {/* Toolbar Pencarian, Filter & Tambah */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DFE5F1] bg-white p-4 shadow-sm">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8D97B4]" aria-hidden="true" />
            <input
              id="cari-lokasi"
              className={`${inputCls} pl-10`}
              value={cari}
              maxLength={100}
              onChange={(e) => {
                setCari(e.target.value);
                setHalaman(1);
              }}
              placeholder="Cari nama fasilitas, alamat, subkategori..."
            />
            {cari && (
              <button
                type="button"
                onClick={() => setCari('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D97B4] hover:text-[#1B2433]"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="w-44">
            <select
              id="filter-kategori"
              className={inputCls}
              value={filterKategori}
              onChange={(e) => {
                setFilterKategori(e.target.value === '' ? '' : Number(e.target.value));
                setHalaman(1);
              }}
            >
              <option value="">Semua Kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKategori}
                </option>
              ))}
            </select>
          </div>

          <div className="w-44">
            <select
              id="filter-wilayah"
              className={inputCls}
              value={filterWilayah}
              onChange={(e) => {
                setFilterWilayah(e.target.value);
                setHalaman(1);
              }}
            >
              <option value="">Semua Wilayah</option>
              {WILAYAH.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={mulaiTambah}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1F5FD1] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1A50B4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433]"
        >
          <Plus size={16} aria-hidden="true" /> Tambah Fasilitas
        </button>
      </div>

      {suksesMsg && (
        <div role="status" className="flex items-center gap-2 rounded-2xl border border-[#005F50] bg-[#DDF5EA] p-4 text-sm font-bold text-[#005144]">
          <CheckCircle2 size={18} aria-hidden="true" />
          {suksesMsg}
        </div>
      )}

      {status === 'memuat' && <p role="status" className="text-sm text-[#5A6478]">Memuat daftar fasilitas...</p>}

      {status === 'gagal' && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-[#C8261E] bg-[#FBE9E8] p-5">
          <p className="text-sm font-semibold text-[#A91F19]">Lokasi belum bisa dimuat. {errorMsg}</p>
          <button
            type="button"
            onClick={muat}
            className="min-h-10 rounded-xl border border-[#C8261E] bg-white px-4 py-2 text-xs font-bold text-[#C8261E]"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Tabel Fasilitas (Screen 12) */}
      {status === 'siap' && (
        <div className="overflow-hidden rounded-2xl border border-[#DFE5F1] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DFE5F1] bg-[#F8FAFC] text-[11px] font-extrabold uppercase tracking-wider text-[#5A6478]">
                <tr>
                  <th scope="col" className="px-5 py-3.5">Fasilitas</th>
                  <th scope="col" className="px-5 py-3.5">Kategori</th>
                  <th scope="col" className="px-5 py-3.5">Wilayah</th>
                  <th scope="col" className="px-5 py-3.5">Status &amp; Operasional</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEEE6]">
                {paginasiItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#5A6478]">
                      Tidak ada fasilitas yang cocok dengan filter atau pencarian.
                    </td>
                  </tr>
                ) : (
                  paginasiItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F8FAFC]/80 transition">
                      <td className="px-5 py-4">
                        <div className="min-w-0 max-w-xs">
                          <p className="truncate text-sm font-extrabold text-[#1B2433]">{item.nama}</p>
                          <p className="mt-0.5 text-[11px] text-[#5A6478]">{item.sub}</p>
                          <p className="mt-0.5 truncate text-[11px] text-[#8D97B4]">
                            {item.alamat || 'Alamat belum dilengkapi'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            item.kategori.toLowerCase() === 'kesehatan'
                              ? 'bg-[#DDF5EA] text-[#005144]'
                              : item.kategori.toLowerCase() === 'keamanan'
                              ? 'bg-[#EFF4FF] text-[#1F5FD1]'
                              : 'bg-[#FFF3D6] text-[#8C6D00]'
                          }`}
                        >
                          {item.kategori}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#1B2433]">{item.wilayah}</td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="inline-block rounded-md bg-[#F4F6FB] px-2 py-0.5 text-[11px] font-medium text-[#1B2433]">
                            {item.detailFasilitas?.statusOperasional || item.jamOperasional || 'Operasional'}
                          </span>
                          {item.detailFasilitas?.terverifikasi && (
                            <p className="text-[10px] font-bold text-[#005F50]">✓ Terverifikasi</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => mulaiEdit(item)}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DFE5F1] bg-white px-3 py-1.5 text-xs font-bold text-[#1B2433] shadow-sm hover:bg-[#F4F6FB] focus-visible:outline-2 focus-visible:outline-[#1F5FD1]"
                          >
                            <Pencil size={13} aria-hidden="true" /> Ubah
                          </button>

                          {hapusId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => hapus(item.id)}
                                disabled={pending}
                                className="min-h-9 rounded-lg bg-[#C8261E] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#A91F19]"
                              >
                                Ya, hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setHapusId(null)}
                                className="min-h-9 rounded-lg border border-[#DFE5F1] px-2.5 py-1.5 text-xs font-bold text-[#5A6478]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setHapusId(item.id)}
                              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#C8261E]/30 px-2.5 py-1.5 text-xs font-bold text-[#C8261E] hover:bg-[#FBE9E8]"
                              aria-label={`Hapus ${item.nama}`}
                            >
                              <Trash2 size={13} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {terlihat.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DFE5F1] bg-[#F8FAFC] px-5 py-3.5 text-xs">
              <p className="text-[#5A6478]">
                Menampilkan <span className="font-bold text-[#1B2433]">{(halamanAman - 1) * PER_HALAMAN + 1}</span> -{' '}
                <span className="font-bold text-[#1B2433]">
                  {Math.min(halamanAman * PER_HALAMAN, terlihat.length)}
                </span>{' '}
                dari <span className="font-bold text-[#1B2433]">{terlihat.length}</span> fasilitas
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setHalaman((h) => Math.max(1, h - 1))}
                  disabled={halamanAman <= 1}
                  className="rounded-lg border border-[#DFE5F1] bg-white px-3 py-1.5 text-xs font-bold text-[#1B2433] hover:bg-[#F4F6FB] disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: totalHalaman }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalHalaman || Math.abs(p - halamanAman) <= 1)
                  .map((p, idx, arr) => {
                    const separator = idx > 0 && p - arr[idx - 1] > 1;
                    return (
                      <span key={p} className="flex items-center">
                        {separator && <span className="px-1 text-[#8D97B4]">...</span>}
                        <button
                          type="button"
                          onClick={() => setHalaman(p)}
                          className={`min-w-8 rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                            p === halamanAman
                              ? 'bg-[#1F5FD1] text-white shadow-sm'
                              : 'border border-[#DFE5F1] bg-white text-[#1B2433] hover:bg-[#F4F6FB]'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}
                <button
                  type="button"
                  onClick={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
                  disabled={halamanAman >= totalHalaman}
                  className="rounded-lg border border-[#DFE5F1] bg-white px-3 py-1.5 text-xs font-bold text-[#1B2433] hover:bg-[#F4F6FB] disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
