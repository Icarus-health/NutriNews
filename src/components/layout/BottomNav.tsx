'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, Users, User, ShieldCheck, Inbox } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function BottomNav({ isAdmin: isAdminProp }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(isAdminProp ?? false);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [communityDot, setCommunityDot] = useState(false);

  useEffect(() => {
    if (isAdminProp !== undefined) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.role === 'admin') setIsAdmin(true);
        });
    });
  }, [isAdminProp]);

  // Inbox unread count — cached in localStorage (5-min TTL) to save DB calls
  useEffect(() => {
    const CACHE_KEY = 'nn-inbox-unread-cache';
    const TTL = 5 * 60 * 1000;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { count, ts } = JSON.parse(cached) as { count: number; ts: number };
        if (Date.now() - ts < TTL) { setInboxUnread(count); return; }
      }
    } catch { /* ignore */ }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('shares')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)
        .then(({ count }) => {
          const n = count ?? 0;
          setInboxUnread(n);
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ count: n, ts: Date.now() })); } catch { /* ignore */ }
        });
    });
  }, []);

  // Clear inbox badge when user visits inbox
  useEffect(() => {
    if (pathname === '/inbox') {
      setInboxUnread(0);
      try { localStorage.removeItem('nn-inbox-unread-cache'); } catch { /* ignore */ }
    }
  }, [pathname]);

  // Community activity dot — show if user hasn't visited community in > 4 hours
  useEffect(() => {
    try {
      const last = localStorage.getItem('nn-last-community-visit');
      const FOUR_HOURS = 4 * 60 * 60 * 1000;
      if (!last || Date.now() - parseInt(last, 10) > FOUR_HOURS) {
        setCommunityDot(true);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (pathname === '/community') {
      setCommunityDot(false);
      try { localStorage.setItem('nn-last-community-visit', Date.now().toString()); } catch { /* ignore */ }
    }
  }, [pathname]);

  const navItems = [
    { href: '/',          label: 'Home',        icon: Home,    dot: false,        badge: 0 },
    { href: '/community', label: 'Community',   icon: Users,   dot: communityDot, badge: 0 },
    { href: '/inbox',     label: 'Posteingang', icon: Inbox,   dot: false,        badge: inboxUnread },
    { href: '/saved',     label: 'Gespeichert', icon: Bookmark,dot: false,        badge: 0 },
    { href: '/profile',   label: 'Profil',      icon: User,    dot: false,        badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 glass border-t border-slate-200/60 dark:border-slate-700/60 safe-bottom max-w-2xl mx-auto">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon, dot, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center pt-2 pb-1.5 text-[10px] gap-0.5 transition-all duration-200',
                active
                  ? 'text-forest-700 dark:text-forest-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-500 active:text-slate-500'
              )}
            >
              <span className="relative">
                <Icon size={21} strokeWidth={active ? 2.2 : 1.5} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {dot && badge === 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-forest-500 rounded-full border border-white dark:border-slate-800" />
                )}
              </span>
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
                ? 'text-forest-700 dark:text-forest-400 font-semibold'
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
