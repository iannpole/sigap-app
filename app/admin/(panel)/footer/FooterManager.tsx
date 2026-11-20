'use client';

import { useCallback, useEffect, useState } from 'react';

type Tautan = { label: string; url: string; urutan: number };
type Sosial = { platform: 'instagram' | 'youtube' | 'x' | 'facebook' | 'tiktok'; url: string; urutan: number };

type Form = {
  nama: string;
  tagline: string;
  email: string;
  hakCipta: string;
  alamat: string;
  tampilkanAlamat: boolean;
  tautan: Tautan[];
  sosial: Sosial[];
  urlLogo: string;
};

const KOSONG: Form = {
  nama: '',
  tagline: '',
  email: '',
  hakCipta: '',
  alamat: '',
  tampilkanAlamat: false,
  tautan: [],
  sosial: [],
  urlLogo: '/logo/sigap-logo.png',
};

const PLATFORM: Sosial['platform'][] = ['instagram', 'youtube', 'x', 'facebook', 'tiktok'];

const inputCls =
  'rounded-xl border border-[#3F4945] bg-white px-3 py-2 text-sm text-[#1B2433] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]';
const btnPrimer =
  'rounded-xl bg-[#1F5FD1] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1B7F37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433] disabled:opacity-60';
const btnSekunder =
  'rounded-xl border border-[#3F4945] px-4 py-2.5 text-sm font-bold text-[#1B2433] hover:bg-[#EFEEE6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] disabled:opacity-60';
const btnHapus =
  'rounded-xl border border-[#C8261E] px-3 py-1.5 text-xs font-bold text-[#C8261E] hover:bg-[#FBE9E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8261E] disabled:opacity-60';

export default function FooterManager() {
  const [form, setForm] = useState<Form>(KOSONG);
  const [status, setStatus] = useState<'memuat' | 'siap' | 'gagal'>('memuat');
  const [errorMsg, setErrorMsg] = useState('');
  const [pesan, setPesan] = useState('');
  const [pending, setPending] = useState(false);

  const muat = useCallback(async () => {
    setStatus('memuat');
    try {
      const res = await fetch('/api/admin/footer', { credentials: 'same-origin', cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Gagal memuat footer');
      const d = json.data;
      if (d) {
        setForm({
          nama: d.nama ?? '',
          tagline: d.tagline ?? '',
          email: d.email ?? '',
          hakCipta: d.hakCipta ?? '',
          alamat: d.alamat ?? '',
          tampilkanAlamat: !!d.tampilkanAlamat,
          tautan: (d.tautan ?? []).map((t: Tautan) => ({ label: t.label, url: t.url, urutan: t.urutan })),
          sosial: (d.sosial ?? []).map((s: Sosial) => ({ platform: s.platform, url: s.url, urutan: s.urutan })),
          urlLogo: d.urlLogo ?? '/logo/sigap-logo.png',
        });
      }
      setStatus('siap');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Gagal memuat footer');
      setStatus('gagal');
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  async function simpan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setPesan('');
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          ...form,
          email: form.email || null,
          alamat: form.alamat || null,
          urlLogo: form.urlLogo,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setPesan(json?.message || 'Gagal menyimpan footer');
        return;
      }
      setPesan('Footer disimpan.');
      await muat();
    } catch {
      setPesan('Tidak bisa terhubung ke server. Coba lagi.');
    } finally {
      setPending(false);
    }
  }

  function ubahTautan(i: number, patch: Partial<Tautan>) {
    setForm({ ...form, tautan: form.tautan.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  }
  function ubahSosial(i: number, patch: Partial<Sosial>) {
    setForm({ ...form, sosial: form.sosial.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  }

  if (status === 'memuat') return <p role="status" className="text-sm text-[#3F4945]">Memuat footer…</p>;

  if (status === 'gagal') {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-[#C8261E] p-5">
        <p className="text-sm font-semibold">Footer belum bisa dimuat. {errorMsg}</p>
        <button type="button" onClick={muat} className={btnSekunder}>Coba lagi</button>
      </div>
    );
  }

  return (
    <form onSubmit={simpan} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-base font-extrabold">Identitas</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ft-nama" className="text-sm font-bold">Nama</label>
          <input id="ft-nama" className={inputCls} maxLength={80} required value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ft-tagline" className="text-sm font-bold">Tagline</label>
          <input id="ft-tagline" className={inputCls} maxLength={200} required value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ft-email" className="text-sm font-bold">Email kontak (opsional)</label>
          <input id="ft-email" type="email" className={inputCls} maxLength={120} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ft-hak" className="text-sm font-bold">Teks hak cipta</label>
          <input id="ft-hak" className={inputCls} maxLength={200} required value={form.hakCipta}
            onChange={(e) => setForm({ ...form, hakCipta: e.target.value })} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-base font-extrabold">Alamat</legend>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={form.tampilkanAlamat}
            onChange={(e) => setForm({ ...form, tampilkanAlamat: e.target.checked })} />
          Tampilkan alamat di footer
        </label>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ft-alamat" className="text-sm font-bold">Alamat fisik</label>
          <input id="ft-alamat" className={inputCls} maxLength={300} value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
          <p className="text-xs text-[#3F4945]">Hanya tampil jika opsi di atas dicentang.</p>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-base font-extrabold">Tautan navigasi</legend>
        {form.tautan.map((t, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_2fr_6rem_auto] md:items-end">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`tl-${i}`} className="text-sm font-bold">Label</label>
              <input id={`tl-${i}`} className={inputCls} maxLength={60} value={t.label}
                onChange={(e) => ubahTautan(i, { label: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`tu-${i}`} className="text-sm font-bold">URL (https)</label>
              <input id={`tu-${i}`} type="url" className={inputCls} value={t.url}
                onChange={(e) => ubahTautan(i, { url: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`tr-${i}`} className="text-sm font-bold">Urutan</label>
              <input id={`tr-${i}`} type="number" min={0} max={1000} className={inputCls} value={t.urutan}
                onChange={(e) => ubahTautan(i, { urutan: Number(e.target.value) })} />
            </div>
            <button type="button" className={btnHapus}
              onClick={() => setForm({ ...form, tautan: form.tautan.filter((_, idx) => idx !== i) })}>
              Hapus tautan<span className="sr-only"> {i + 1}</span>
            </button>
          </div>
        ))}
        <button type="button" className={`${btnSekunder} self-start`} disabled={form.tautan.length >= 10}
          onClick={() => setForm({ ...form, tautan: [...form.tautan, { label: '', url: '', urutan: form.tautan.length + 1 }] })}>
          Tambah tautan
        </button>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-base font-extrabold">Media sosial (opsional)</legend>
        {form.sosial.map((s, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[1fr_2fr_6rem_auto] md:items-end">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`sp-${i}`} className="text-sm font-bold">Platform</label>
              <select id={`sp-${i}`} className={inputCls} value={s.platform}
                onChange={(e) => ubahSosial(i, { platform: e.target.value as Sosial['platform'] })}>
                {PLATFORM.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`su-${i}`} className="text-sm font-bold">URL profil</label>
              <input id={`su-${i}`} type="url" className={inputCls} value={s.url}
                onChange={(e) => ubahSosial(i, { url: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`sr-${i}`} className="text-sm font-bold">Urutan</label>
              <input id={`sr-${i}`} type="number" min={0} max={1000} className={inputCls} value={s.urutan}
                onChange={(e) => ubahSosial(i, { urutan: Number(e.target.value) })} />
            </div>
            <button type="button" className={btnHapus}
              onClick={() => setForm({ ...form, sosial: form.sosial.filter((_, idx) => idx !== i) })}>
              Hapus media<span className="sr-only"> {i + 1}</span>
            </button>
          </div>
        ))}
        <button type="button" className={`${btnSekunder} self-start`}
          onClick={() => setForm({ ...form, sosial: [...form.sosial, { platform: 'instagram', url: '', urutan: form.sosial.length + 1 }] })}>
          Tambah media sosial
        </button>
      </fieldset>

      {pesan && <p role="status" className="text-sm font-bold">{pesan}</p>}

      <div>
        <button type="submit" className={btnPrimer} disabled={pending}>Simpan footer</button>
      </div>
    </form>
  );
}
