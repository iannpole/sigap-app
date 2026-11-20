'use client';

import { useCallback, useEffect, useState } from 'react';

const MAX_GAMBAR = 5;

type Gambar = { id: number; label: string };

const inputCls =
  'w-full rounded-xl border border-[#3F4945] bg-white px-3 py-2 text-sm text-[#1B2433] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]';
const btnPrimer =
  'rounded-xl bg-[#1F5FD1] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1B7F37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433] disabled:opacity-60';
const btnSekunder =
  'rounded-xl border border-[#3F4945] px-3 py-2 text-sm font-bold text-[#1B2433] hover:bg-[#EFEEE6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] disabled:opacity-60';
const btnHapus =
  'rounded-xl border border-[#C8261E] px-3 py-2 text-sm font-bold text-[#C8261E] hover:bg-[#FBE9E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8261E] disabled:opacity-60';

export default function SectionManager() {
  const [eyebrow, setEyebrow] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [gambar, setGambar] = useState<Gambar[]>([]);
  const [labelBaru, setLabelBaru] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [labelEdit, setLabelEdit] = useState<Record<number, string>>({});
  const [pesan, setPesan] = useState('');
  const [pending, setPending] = useState(false);

  const muatGambar = useCallback(async () => {
    const res = await fetch('/api/beranda/section', { cache: 'no-store' });
    const json = await res.json().catch(() => null);
    const list = (json?.data?.gambar ?? []) as Gambar[];
    setGambar(list);
    setLabelEdit(Object.fromEntries(list.map((g) => [g.id, g.label])));
  }, []);

  useEffect(() => {
    fetch('/api/beranda/section', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!json?.success) return;
        setEyebrow(json.data.eyebrow ?? '');
        setJudul(json.data.judul ?? '');
        setDeskripsi(json.data.deskripsi ?? '');
        const list = (json.data.gambar ?? []) as Gambar[];
        setGambar(list);
        setLabelEdit(Object.fromEntries(list.map((g) => [g.id, g.label])));
      })
      .catch(() => setPesan('Data section belum bisa dimuat.'));
  }, []);

  async function simpanTeks(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setPesan('');
    const body = new FormData();
    body.set('eyebrow', eyebrow);
    body.set('judul', judul);
    body.set('deskripsi', deskripsi);
    try {
      const res = await fetch('/api/admin/beranda/section', { method: 'PUT', body, credentials: 'same-origin' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Gagal menyimpan');
      setPesan('Teks tersimpan.');
    } catch (err) {
      setPesan(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setPending(false);
    }
  }

  async function tambah(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setPesan('Pilih gambar dulu.');
      return;
    }
    setPending(true);
    setPesan('');
    const body = new FormData();
    body.set('label', labelBaru);
    body.set('gambar', file);
    try {
      const res = await fetch('/api/admin/beranda/section/gambar', {
        method: 'POST',
        body,
        credentials: 'same-origin',
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Gagal mengunggah');
      setFile(null);
      setLabelBaru('');
      await muatGambar();
      setPesan('Gambar ditambahkan.');
    } catch (err) {
      setPesan(err instanceof Error ? err.message : 'Gagal mengunggah');
    } finally {
      setPending(false);
    }
  }

  async function simpanLabel(id: number) {
    setPending(true);
    setPesan('');
    try {
      const res = await fetch(`/api/admin/beranda/section/gambar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ label: labelEdit[id] ?? '' }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Gagal menyimpan label');
      setPesan('Label tersimpan.');
    } catch (err) {
      setPesan(err instanceof Error ? err.message : 'Gagal menyimpan label');
    } finally {
      setPending(false);
    }
  }

  async function hapus(id: number) {
    setPending(true);
    setPesan('');
    try {
      const res = await fetch(`/api/admin/beranda/section/gambar/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Gagal menghapus');
      await muatGambar();
      setPesan('Gambar dihapus.');
    } catch (err) {
      setPesan(err instanceof Error ? err.message : 'Gagal menghapus');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={simpanTeks} className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-lg font-extrabold">Section gambar</h2>
        <p className="text-sm text-[#3F4945]">
          Ditampilkan di bawah hero: teks di kiri, galeri gambar beranimasi di kanan. Kosongkan teks dan gambar
          untuk menyembunyikan section ini.
        </p>

        <label className="block space-y-1">
          <span className="text-sm font-bold">Label kecil (opsional)</span>
          <input className={inputCls} value={eyebrow} maxLength={40} onChange={(e) => setEyebrow(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold">Judul</span>
          <input className={inputCls} value={judul} maxLength={120} onChange={(e) => setJudul(e.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold">Deskripsi</span>
          <textarea
            className={inputCls}
            rows={4}
            value={deskripsi}
            maxLength={400}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </label>

        <button type="submit" disabled={pending} className={btnPrimer}>
          {pending ? 'Menyimpan…' : 'Simpan teks'}
        </button>
      </form>

      <section aria-labelledby="judul-galeri" className="space-y-4 rounded-2xl border border-black/10 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="judul-galeri" className="text-lg font-extrabold">
            Gambar galeri
          </h2>
          <p className="text-sm text-[#3F4945]">
            {gambar.length} dari {MAX_GAMBAR} gambar
          </p>
        </div>

        {gambar.length === 0 ? (
          <p className="text-sm text-[#3F4945]">Belum ada gambar.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {gambar.map((g) => (
              <li key={g.id} className="space-y-2 rounded-xl border border-black/10 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/beranda/section/gambar/${g.id}`}
                  alt={g.label || 'Gambar galeri'}
                  width={480}
                  height={320}
                  className="h-32 w-full rounded-lg object-cover"
                />
                <label className="block space-y-1">
                  <span className="text-xs font-bold">Label gambar</span>
                  <input
                    className={inputCls}
                    maxLength={80}
                    value={labelEdit[g.id] ?? ''}
                    onChange={(e) => setLabelEdit({ ...labelEdit, [g.id]: e.target.value })}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => simpanLabel(g.id)} disabled={pending} className={btnSekunder}>
                    Simpan label
                  </button>
                  <button type="button" onClick={() => hapus(g.id)} disabled={pending} className={btnHapus}>
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {gambar.length < MAX_GAMBAR && (
          <form onSubmit={tambah} className="space-y-3 border-t border-black/10 pt-4">
            <h3 className="text-sm font-extrabold">Tambah gambar</h3>
            <label className="block space-y-1">
              <span className="text-sm font-bold">Label gambar (opsional)</span>
              <input
                className={inputCls}
                maxLength={80}
                value={labelBaru}
                onChange={(e) => setLabelBaru(e.target.value)}
                placeholder="Contoh: IGD Rumah Sakit"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-bold">File (PNG, JPG, atau WebP, maks 2 MB)</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
            </label>
            <button type="submit" disabled={pending} className={btnPrimer}>
              {pending ? 'Mengunggah…' : 'Tambah gambar'}
            </button>
          </form>
        )}

        {pesan && (
          <p role="status" className="text-sm text-[#3F4945]">
            {pesan}
          </p>
        )}
      </section>
    </div>
  );
}
