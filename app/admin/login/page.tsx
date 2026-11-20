'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password'),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.message || 'Login gagal. Coba lagi.');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Tidak bisa terhubung ke server. Coba lagi.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6FB] px-4 py-10 text-[#1B2433]">
      <div className="w-full max-w-md rounded-2xl border border-[#DFE5F1] bg-white p-7 shadow-[0_18px_40px_-24px_rgba(27,36,51,.45)] sm:p-9">
        <span className="inline-flex items-center gap-2 rounded-lg bg-[#F5C400] px-2.5 py-1 text-[11px] font-extrabold">SIGAP ADMIN</span>
        <h1 className="mt-5 text-2xl font-extrabold">Masuk panel admin</h1>
        <p className="mt-1 text-sm text-[#5A6478]">Kelola fasilitas, beranda, dan footer SIGAP Bogor.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-bold">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              maxLength={50}
              className="min-h-11 rounded-xl border border-[#C3CADA] bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-bold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="min-h-11 rounded-xl border border-[#C3CADA] bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1]"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-[#C8261E] bg-[#FBE9E8] px-4 py-3 text-sm font-semibold text-[#A91F19]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="min-h-11 rounded-xl bg-[#1F5FD1] px-4 py-3 text-sm font-bold text-white hover:bg-[#1A50B4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433] disabled:opacity-60"
          >
            {pending ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
