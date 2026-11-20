'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="min-h-11 rounded-xl border border-current/25 px-4 py-2 text-sm font-bold hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] disabled:opacity-60"
    >
      {pending ? 'Keluar…' : 'Keluar'}
    </button>
  );
}
