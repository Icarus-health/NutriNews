'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, Inbox, User, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/',        label: 'Home',       icon: Home },
  { href: '/saved',   label: 'Gespeichert', icon: Bookmark },
  { href: '/inbox',   label: 'Posteingang', icon: Inbox },
  { href: '/profile', label: 'Profil',      icon: User },
];

export default function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 safe-bottom max-w-2xl mx-auto">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors',
                active ? 'text-forest-700 font-semibold' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={clsx(
              'flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors',
              pathname === '/admin' ? 'text-forest-700 font-semibold' : 'text-slate-400'
            )}
          >
            <ShieldCheck size={22} />
            <span>Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
