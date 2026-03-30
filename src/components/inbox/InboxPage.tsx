'use client';

import { useState, useTransition } from 'react';
import { Inbox, ExternalLink, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { getCategoryStyle } from '@/lib/categories';
import { markShareRead } from '@/lib/actions/news';

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
  userId: string;
}

export default function InboxPage({ shares: initialShares, userId }: Props) {
  const [shares, setShares] = useState(initialShares);
  const [isPending, startTransition] = useTransition();

  const unreadCount = shares.filter(s => !s.read).length;

  function handleMarkRead(shareId: string) {
    setShares(prev => prev.map(s => s.id === shareId ? { ...s, read: true } : s));
    startTransition(async () => {
      await markShareRead(shareId);
    });
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
    <div className="pt-4">
      <div className="px-4 mb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Posteingang</h1>
        {unreadCount > 0 && (
          <p className="text-xs text-forest-600 font-medium">{unreadCount} ungelesene Nachricht{unreadCount > 1 ? 'en' : ''}</p>
        )}
      </div>

      {shares.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Inbox size={40} className="mb-3 opacity-30" />
          <p className="text-sm">Noch keine geteilten News.</p>
          <p className="text-xs mt-1">Wenn Kollegen dir News teilen, erscheinen sie hier.</p>
        </div>
      ) : (
        <div className="px-3 space-y-2">
          {shares.map(share => (
            <div
              key={share.id}
              className={clsx(
                'bg-white rounded-xl border overflow-hidden transition-colors',
                share.read ? 'border-slate-100' : 'border-forest-200 bg-forest-50/30'
              )}
            >
              <div className="px-4 py-3">
                {/* Sender info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-xs font-bold text-forest-700">
                      {(share.sender?.full_name || share.sender?.email || '?')[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">
                      {share.sender?.full_name || share.sender?.email || 'Unbekannt'}
                    </span>
                    {!share.read && (
                      <span className="w-2 h-2 rounded-full bg-forest-500" />
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{formatTime(share.created_at)}</span>
                </div>

                {/* Message */}
                {share.message && (
                  <p className="text-sm text-slate-600 mb-2 italic">&quot;{share.message}&quot;</p>
                )}

                {/* Shared card preview */}
                {share.news_cards && (
                  <div className="bg-slate-50 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', getCategoryStyle(share.news_cards.category_main))}>
                        {share.news_cards.category_main}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-slate-800">{share.news_cards.headline}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{share.news_cards.therapist_check}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!share.read && (
                    <button
                      onClick={() => handleMarkRead(share.id)}
                      disabled={isPending}
                      className="flex items-center gap-1 text-xs text-forest-600 font-medium hover:text-forest-800 transition-colors"
                    >
                      <Check size={14} />
                      Als gelesen markieren
                    </button>
                  )}
                  {share.news_cards?.source_url && (
                    <a
                      href={share.news_cards.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto"
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
      )}
    </div>
  );
}
