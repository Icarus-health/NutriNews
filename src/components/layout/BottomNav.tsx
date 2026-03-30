'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, Users, User, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/',           label: 'Home',       icon: Home },
  { href: '/community',  label: 'Community',  icon: Users },
  { href: '/saved',      label: 'Gespeichert', icon: Bookmark },
  { href: '/profile',    label: 'Profil',     icon: User },
];

export default function BottomNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 glass border-t border-slate-200/60 safe-bottom max-w-2xl mx-auto">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center pt-2 pb-1.5 text-[10px] gap-0.5 transition-all duration-200',
                active
                  ? 'text-forest-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-500 active:text-slate-500'
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.2 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={clsx(
              'flex-1 flex flex-col items-center pt-2 pb-1.5 text-[10px] gap-0.5 transition-all duration-200',
              pathname === '/admin'
                ? 'text-forest-700 font-semibold'
                : 'text-slate-400 hover:text-slate-500'
            )}
          >
            <ShieldCheck size={21} strokeWidth={pathname === '/admin' ? 2.2 : 1.5} />
            <span>Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
