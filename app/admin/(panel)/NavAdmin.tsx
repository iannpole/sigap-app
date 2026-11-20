'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, PanelBottom } from 'lucide-react';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/lokasi', label: 'Kelola fasilitas', icon: MapPin },
  { href: '/admin/beranda', label: 'Beranda', icon: PanelBottom },
  { href: '/admin/footer', label: 'Footer', icon: PanelBottom },
];

export default function NavAdmin() {
  const path = usePathname();
  return (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-1">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const aktif = path === href || (href !== '/admin' && path.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={aktif ? 'page' : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5C400] ${
              aktif ? 'bg-[#1F5FD1] text-white' : 'text-[#C3CADA] hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
