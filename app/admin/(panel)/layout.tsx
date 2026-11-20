import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ExternalLink, Menu } from 'lucide-react';
import { getAdminSession } from '@/lib/admin-session';
import LogoutButton from './LogoutButton';
import NavAdmin from './NavAdmin';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#1B2433] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden bg-[#11152E] px-4 py-5 text-white lg:flex lg:flex-col">
        <Link href="/admin" className="mb-8 flex items-center gap-2">
          <Image src="/logo/sigap-logo-trim.png" alt="SIGAP" width={1229} height={305} className="h-8 w-auto" />
          <span className="rounded bg-[#F5C400] px-1.5 py-0.5 text-[10px] font-extrabold text-[#1B2433]">ADMIN</span>
        </Link>
        <NavAdmin />
        <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
          <p className="text-xs text-[#8D97B4]">Masuk sebagai</p>
          <p className="truncate text-sm font-bold">{admin.username}</p>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#C3CADA] hover:text-white">
            <ExternalLink size={14} aria-hidden="true" /> Lihat situs
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b border-[#DFE5F1] bg-white px-4 py-3 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo/sigap-logo-trim.png" alt="SIGAP" width={1229} height={305} className="h-7 w-auto" />
            <span className="rounded bg-[#F5C400] px-1.5 py-0.5 text-[10px] font-extrabold">ADMIN</span>
          </Link>
          <details className="relative">
            <summary className="grid h-11 w-11 place-items-center rounded-xl border border-[#DFE5F1]" aria-label="Menu admin">
              <Menu size={18} aria-hidden="true" />
            </summary>
            <div className="absolute right-0 top-12 z-10 w-60 rounded-2xl border border-[#DFE5F1] bg-white p-2 shadow-xl">
              <NavAdmin />
              <div className="mt-2 border-t border-[#DFE5F1] p-2">
                <p className="mb-1 text-xs text-[#5A6478]">{admin.username}</p>
                <LogoutButton />
              </div>
            </div>
          </details>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
