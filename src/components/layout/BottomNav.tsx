'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bookmark, Users, User, ShieldCheck, Inbox } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useI18n } from '@/components/providers/I18nProvider';

export default function BottomNav({ isAdmin: isAdminProp }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
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
      // Ungelesene Shares + Community-Benachrichtigungen zusammenzählen
      Promise.all([
        supabase
          .from('shares')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false),
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false),
      ]).then(([sharesRes, notifRes]) => {
        const n = (sharesRes.count ?? 0) + (notifRes.count ?? 0);
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
      const ts = last ? parseInt(last, 10) : NaN;
      if (isNaN(ts) || Date.now() - ts > FOUR_HOURS) {
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

  // restoreScroll: ScrollRestoration setzt die Position selbst — Next soll
  // hier nicht vorab nach oben springen (verhindert Flackern beim Tab-Wechsel).
  const navItems = [
    { href: '/',          label: t('nav.home'),      icon: Home,    dot: false,        badge: 0,           restoreScroll: true },
    { href: '/community', label: t('nav.community'), icon: Users,   dot: communityDot, badge: 0,           restoreScroll: true },
    { href: '/inbox',     label: t('nav.inbox'),     icon: Inbox,   dot: false,        badge: inboxUnread, restoreScroll: true },
    { href: '/saved',     label: t('nav.saved'),     icon: Bookmark,dot: false,        badge: 0,           restoreScroll: true },
    { href: '/profile',   label: t('nav.profile'),   icon: User,    dot: false,        badge: 0,           restoreScroll: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 glass border-t border-slate-200/60 dark:border-slate-700/60 safe-bottom max-w-2xl mx-auto">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon, dot, badge, restoreScroll }) => {
          const active = pathname === href;
          const ariaLabel = badge > 0
            ? `${label}, ${badge} ungelesen`
            : dot
              ? `${label}, neue Aktivität`
              : undefined;
          return (
            <Link
              key={href}
              href={href}
              scroll={!restoreScroll}
              aria-current={active ? 'page' : undefined}
              aria-label={ariaLabel}
              className={clsx(
                'flex-1 flex flex-col items-center pt-2 pb-1.5 text-[11px] gap-0.5 transition-all duration-200',
                active
                  ? 'text-forest-700 dark:text-forest-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-500 active:text-slate-500'
              )}
            >
              <span className="relative">
                <Icon size={21} strokeWidth={active ? 2.2 : 1.5} />
                {badge > 0 && (
                  <span aria-hidden="true" className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center px-0.5 leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {dot && badge === 0 && (
                  <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-forest-500 rounded-full border border-white dark:border-slate-800" />
                )}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            aria-current={pathname === '/admin' ? 'page' : undefined}
            className={clsx(
              'flex-1 flex flex-col items-center pt-2 pb-1.5 text-[11px] gap-0.5 transition-all duration-200',
              pathname === '/admin'
                ? 'text-forest-700 dark:text-forest-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-500'
            )}
          >
            <ShieldCheck size={21} strokeWidth={pathname === '/admin' ? 2.2 : 1.5} />
            <span>{t('nav.admin')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
