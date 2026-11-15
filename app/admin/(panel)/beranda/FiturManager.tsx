'use client';

import { useCallback, useEffect, useState } from 'react';
import { IKON_KEYS } from '@/lib/beranda/katalog';

type Fitur = {
  id: number;
  judul: string;
  deskripsi: string;
  ikonKey: string;
  tautan: string | null;
  urutan: number;
  aktif: boolean;
};

type Form = Omit<Fitur, 'id'>;

const KOSONG: Form = { judul: '', deskripsi: '', ikonKey: IKON_KEYS[0], tautan: null, urutan: 0, aktif: true };

const IKON_LABEL: Record<string, string> = {
  peta: 'Peta',
  kategori: 'Kategori',
  lokasi: 'Lokasi',
  '3d': 'Mode 3D',
  kesehatan: 'Kesehatan',
  keamanan: 'Keamanan',
  olahraga: 'Olahraga',
  info: 'Info',
};

const inputCls =
  'rounded-xl border border-[#3F4945] bg-white px-3 py-2 text-sm text-[#1B2433] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]';
const btnPrimer =
  'rounded-xl bg-[#1F5FD1] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1B7F37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433] disabled:opacity-60';
const btnSekunder =
  'rounded-xl border border-[#3F4945] px-4 py-2.5 text-sm font-bold text-[#1B2433] hover:bg-[#EFEEE6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] disabled:opacity-60';
const btnHapus =
  'rounded-xl border border-[#C8261E] px-3 py-1.5 text-xs font-bold text-[#C8261E] hover:bg-[#FBE9E8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8261E] disabled:opacity-60';

export default function FiturManager() {
  const [items, setItems] = useState<Fitur[]>([]);
  const [status, setStatus] = useState<'memuat' | 'siap' | 'gagal'>('memuat');
  const [errorMsg, setErrorMsg] = useState('');
  const [editId, setEditId] = useState<number | 'baru' | null>(null);
  const [form, setForm] = useState<Form>(KOSONG);
  const [formErr, setFormErr] = useState('');
  const [pending, setPending] = useState(false);
  const [hapusId, setHapusId] = useState<number | null>(null);

  const muat = useCallback(async () => {
    setStatus('memuat');
    try {
      const res = await fetch('/api/admin/beranda/fitur', { credentials: 'same-origin', cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message || 'Gagal memuat fitur');
      setItems(json.data as Fitur[]);
      setStatus('siap');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Gagal memuat fitur');
      setStatus('gagal');
    }
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const aktifCount = items.filter((i) => i.aktif).length;

  function mulaiTambah() {
    setEditId('baru');
    setForm({ ...KOSONG, urutan: items.length + 1 });
    setFormErr('');
  }

  function mulaiEdit(f: Fitur) {
    setEditId(f.id);
    setForm({ judul: f.judul, deskripsi: f.deskripsi, ikonKey: f.ikonKey, tautan: f.tautan, urutan: f.urutan, aktif: f.aktif });
    setFormErr('');
  }

  async function simpan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setFormErr('');
    try {
      const url = editId === 'baru' ? '/api/admin/beranda/fitur' : `/api/admin/beranda/fitur/${editId}`;
      const res = await fetch(url, {
        method: editId === 'baru' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...form, tautan: form.tautan || null }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setFormErr(json?.message || 'Gagal menyimpan');
        return;
      }
      setEditId(null);
      await muat();
    } catch {
      setFormErr('Tidak bisa terhubung ke server. Coba lagi.');
    } finally {
      setPending(false);
    }
  }

  async function hapus(id: number) {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/beranda/fitur/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMsg(json?.message || 'Gagal menghapus');
        setStatus('gagal');
        return;
      }
      setHapusId(null);
      await muat();
    } catch {
      setErrorMsg('Tidak bisa terhubung ke server. Coba lagi.');
      setStatus('gagal');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#3F4945]">
          Aktif: {aktifCount} dari {items.length}
        </p>
        <button type="button" onClick={mulaiTambah} className={btnPrimer} disabled={editId !== null}>
          Tambah fitur
        </button>
      </div>

      {editId !== null && (
        <form onSubmit={simpan} noValidate className="flex flex-col gap-4 rounded-2xl border border-[#EFEEE6] p-5">
          <h2 className="text-base font-extrabold">{editId === 'baru' ? 'Fitur baru' : 'Ubah fitur'}</h2>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-judul" className="text-sm font-bold">Judul</label>
            <input id="f-judul" className={inputCls} maxLength={80} required value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-deskripsi" className="text-sm font-bold">Deskripsi (satu kalimat)</label>
            <input id="f-deskripsi" className={inputCls} maxLength={160} required value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-ikon" className="text-sm font-bold">Ikon</label>
            <select id="f-ikon" className={inputCls} value={form.ikonKey}
              onChange={(e) => setForm({ ...form, ikonKey: e.target.value })}>
              {IKON_KEYS.map((k) => (
                <option key={k} value={k}>{IKON_LABEL[k] ?? k}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-tautan" className="text-sm font-bold">Tautan (opsional, https)</label>
            <input id="f-tautan" type="url" className={inputCls} value={form.tautan ?? ''}
              onChange={(e) => setForm({ ...form, tautan: e.target.value })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-urutan" className="text-sm font-bold">Urutan</label>
            <input id="f-urutan" type="number" min={0} max={1000} className={inputCls} value={form.urutan}
              onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} />
          </div>

          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} />
            Tampilkan di beranda
          </label>

          {formErr && <p role="alert" className="rounded-xl border border-[#C8261E] px-4 py-3 text-sm font-semibold">{formErr}</p>}

          <div className="flex gap-3">
            <button type="submit" className={btnPrimer} disabled={pending}>Simpan</button>
            <button type="button" className={btnSekunder} onClick={() => setEditId(null)} disabled={pending}>Batal</button>
          </div>
        </form>
      )}

      {status === 'memuat' && <p role="status" className="text-sm text-[#3F4945]">Memuat fitur…</p>}

      {status === 'gagal' && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-2xl border border-[#C8261E] p-5">
          <p className="text-sm font-semibold">Fitur belum bisa dimuat. {errorMsg}</p>
          <button type="button" onClick={muat} className={btnSekunder}>Coba lagi</button>
        </div>
      )}

      {status === 'siap' && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#3F4945] p-6 text-center text-sm text-[#3F4945]">
          Belum ada fitur. Tambahkan fitur pertama.
        </p>
      )}

      {status === 'siap' && items.length > 0 && (
        <ul className="flex flex-col divide-y divide-[#EFEEE6] rounded-2xl border border-[#EFEEE6]">
          {items.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold">
                  {f.judul}
                  <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-bold ${f.aktif ? 'bg-[#EFEEE6]' : 'bg-white border border-[#3F4945] text-[#3F4945]'}`}>
                    {f.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[#3F4945]">{f.deskripsi}</p>
                <p className="mt-1 text-xs text-[#3F4945]">Ikon: {IKON_LABEL[f.ikonKey] ?? f.ikonKey} · Urutan {f.urutan}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnSekunder} onClick={() => mulaiEdit(f)} disabled={editId !== null}>
                  Ubah<span className="sr-only"> {f.judul}</span>
                </button>
                {hapusId === f.id ? (
                  <>
                    <button type="button" className={btnHapus} onClick={() => hapus(f.id)} disabled={pending}>
                      Ya, hapus {f.judul}
                    </button>
                    <button type="button" className={btnSekunder} onClick={() => setHapusId(null)} disabled={pending}>
                      Batal
                    </button>
                  </>
                ) : (
                  <button type="button" className={btnHapus} onClick={() => setHapusId(f.id)} disabled={editId !== null}>
                    Hapus<span className="sr-only"> {f.judul}</span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
