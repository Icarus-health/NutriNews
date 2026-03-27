'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, Inbox, User, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/',        label: 'Home',        icon: Home },
  { href: '/saved',   label: 'Gespeichert', icon: Bookmark },
  { href: '/inbox',   label: 'Posteingang', icon: Inbox },
  { href: '/profile', label: 'Profil',      icon: User },
];

export default function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const allItems = isAdmin
    ? [...navItems, { href: '/admin', label: 'Admin', icon: ShieldCheck }]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 safe-bottom">
      <div className="flex max-w-2xl mx-auto">
        {allItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 transition-colors"
            >
              <div className={clsx(
                'flex items-center justify-center w-10 h-6 rounded-full transition-all',
                active ? 'bg-forest-100' : ''
              )}>
                <Icon
                  size={20}
                  className={clsx(
                    'transition-colors',
                    active ? 'text-forest-700' : 'text-slate-400'
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span className={clsx(
                'text-[10px] font-medium transition-colors',
                active ? 'text-forest-700' : 'text-slate-400'
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
