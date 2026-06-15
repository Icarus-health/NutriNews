'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Inbox, ExternalLink, Check, CheckCheck, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { getCategoryLabel, getCategoryStyle } from '@/lib/categories';
import { markShareRead } from '@/lib/actions/news';
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/community';
import { sanitizeExternalUrl } from '@/lib/url';
import type { AppNotification } from '@/types/database';

interface ShareItem {
  id: string;
  message: string | null;
  read: boolean;
  created_at: string;
  news_cards: {
    id: string;
    headline: string;
    category_main: string;
    therapist_check: string;
    source_url: string;
    evidence_level: string;
  } | null;
  sender: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

interface Props {
  shares: ShareItem[];
  notifications?: AppNotification[];
  userId: string;
}

export default function InboxPage({ shares: initialShares, notifications: initialNotifications = [], userId }: Props) {
  const [shares, setShares] = useState(initialShares);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  const unreadShares = shares.filter(s => !s.read).length;
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadCount = unreadShares + unreadNotifs;

  function handleMarkRead(shareId: string) {
    setShares(prev => prev.map(s => s.id === shareId ? { ...s, read: true } : s));
    startTransition(async () => { await markShareRead(shareId); });
  }

  function handleMarkAllSharesRead() {
    setShares(prev => prev.map(s => ({ ...s, read: true })));
    startTransition(async () => {
      await Promise.all(shares.filter(s => !s.read).map(s => markShareRead(s.id)));
    });
  }

  function handleNotificationRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    startTransition(async () => { await markNotificationRead(id); });
  }

  function handleAllNotificationsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    startTransition(async () => { await markAllNotificationsRead(); });
  }

  function formatTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'gerade eben';
    if (mins < 60) return `vor ${mins} Min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  }

  return (
    <div>
      <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 dark:border-slate-700/60 safe-top">
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h1 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">Posteingang</h1>
            {unreadCount > 0 && (
              <p className="text-[11px] text-forest-600 dark:text-forest-400 font-medium mt-0.5">
                {unreadCount} ungelesen
              </p>
            )}
          </div>
          {(unreadShares > 0 || unreadNotifs > 0) && (
            <button
              onClick={() => {
                if (unreadShares > 0) handleMarkAllSharesRead();
                if (unreadNotifs > 0) handleAllNotificationsRead();
              }}
              disabled={isPending}
              className="flex items-center gap-1.5 text-[12px] text-forest-600 dark:text-forest-400 font-semibold hover:text-forest-800 dark:hover:text-forest-300 transition-colors"
            >
              <CheckCheck size={15} />
              Alle gelesen
            </button>
          )}
        </div>
      </header>

      <div className="pt-3">
        {/* Community replies */}
        {notifications.length > 0 && (
          <div className="px-3 mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Antworten</p>
            </div>
            <div className="space-y-2">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={clsx(
                    'rounded-xl border overflow-hidden transition-colors',
                    n.read
                      ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                      : 'bg-forest-50/50 dark:bg-forest-900/20 border-forest-200 dark:border-forest-700/50'
                  )}
                >
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-forest-100 dark:bg-forest-800 flex items-center justify-center flex-shrink-0">
                        <MessageCircle size={12} className="text-forest-700 dark:text-forest-400" />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 flex-1 min-w-0">
                        <span className="font-semibold">{n.actor?.full_name ?? 'Jemand'}</span>{' '}
                        {n.type === 'quick_answer'
                          ? 'hat auf deine Schnellfrage geantwortet'
                          : 'hat auf deinen Beitrag geantwortet'}
                      </p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-forest-500 flex-shrink-0" />}
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{formatTime(n.created_at)}</span>
                    </div>
                    {n.preview && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2 italic">&quot;{n.preview}&quot;</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Link
                        href="/community"
                        onClick={() => { if (!n.read) handleNotificationRead(n.id); }}
                        className="text-xs text-forest-600 dark:text-forest-400 font-medium hover:text-forest-800 transition-colors"
                      >
                        Zur Community
                      </Link>
                      {!n.read && (
                        <button
                          onClick={() => handleNotificationRead(n.id)}
                          disabled={isPending}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ml-auto"
                        >
                          <Check size={14} />
                          Gelesen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shared news */}
        {shares.length === 0 && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Inbox size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Noch keine Nachrichten.</p>
            <p className="text-xs mt-1 text-center text-slate-400">Geteilte News und Antworten auf deine Beiträge erscheinen hier.</p>
          </div>
        ) : shares.length > 0 ? (
          <div className="px-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Von Kollegen geteilt</p>
            </div>
            <div className="space-y-2">
              {shares.map(share => (
                <div
                  key={share.id}
                  className={clsx(
                    'rounded-xl border overflow-hidden transition-colors',
                    share.read
                      ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                      : 'bg-forest-50/50 dark:bg-forest-900/20 border-forest-200 dark:border-forest-700/50'
                  )}
                >
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-800 flex items-center justify-center text-xs font-bold text-forest-700 dark:text-forest-300 flex-shrink-0">
                          {(share.sender?.full_name || share.sender?.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {share.sender?.full_name || share.sender?.email || 'Unbekannt'}
                        </span>
                        {!share.read && <span className="w-2 h-2 rounded-full bg-forest-500" />}
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{formatTime(share.created_at)}</span>
                    </div>

                    {share.message && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 italic">&quot;{share.message}&quot;</p>
                    )}

                    {share.news_cards && (
                      <Link
                        href={`/card/${share.news_cards.id}`}
                        onClick={() => { if (!share.read) handleMarkRead(share.id); }}
                        className="block bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 mb-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', getCategoryStyle(share.news_cards.category_main))}>
                            {getCategoryLabel(share.news_cards.category_main)}
                          </span>
                        </div>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">{share.news_cards.headline}</p>
                        {share.news_cards.therapist_check && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{share.news_cards.therapist_check}</p>
                        )}
                      </Link>
                    )}

                    <div className="flex items-center gap-2">
                      {!share.read && (
                        <button
                          onClick={() => handleMarkRead(share.id)}
                          disabled={isPending}
                          className="flex items-center gap-1 text-xs text-forest-600 dark:text-forest-400 font-medium hover:text-forest-800 transition-colors"
                        >
                          <Check size={14} />
                          Als gelesen markieren
                        </button>
                      )}
                      {sanitizeExternalUrl(share.news_cards?.source_url) && (
                        <a
                          href={sanitizeExternalUrl(share.news_cards?.source_url) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ml-auto"
                        >
                          <ExternalLink size={14} />
                          Quelle
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
