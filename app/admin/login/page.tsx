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
    <div className="flex min-h-screen items-center justify-center bg-white px-6 text-ink">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold">Masuk Admin</h1>
        <p className="mt-1 text-sm text-[#3F4945]">Kelola konten beranda SIGAP Bogor.</p>

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
              className="rounded-xl border border-[#3F4945] bg-white px-4 py-2.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
              className="rounded-xl border border-[#3F4945] bg-white px-4 py-2.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-[#C8261E] bg-white px-4 py-3 text-sm font-semibold text-ink">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-[#1F5FD1] px-4 py-3 text-sm font-bold text-white hover:bg-[#1B7F37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2433] disabled:opacity-60"
          >
            {pending ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
