import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-session';
import LogoutButton from './LogoutButton';
import NavAdmin from './NavAdmin';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();
  if (!admin) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-white text-[#1B2433]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EFEEE6] px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-baseline gap-3">
            <span className="text-base font-extrabold">SIGAP Admin</span>
            <span className="text-sm text-[#3F4945]">{admin.username}</span>
          </div>
          <NavAdmin />
        </div>
        <LogoutButton />
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
