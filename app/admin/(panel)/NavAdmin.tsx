'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/admin/beranda', label: 'Beranda' },
  { href: '/admin/footer', label: 'Footer' },
];

export default function NavAdmin() {
  const path = usePathname();
  return (
    <nav aria-label="Navigasi admin">
      <ul className="flex gap-2">
        {ITEMS.map((item) => {
          const aktif = path === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={aktif ? 'page' : undefined}
                className={`inline-block rounded-xl px-3 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5FD1] ${
                  aktif ? 'bg-[#1F5FD1] text-white' : 'text-[#1B2433] hover:bg-[#EFEEE6]'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
