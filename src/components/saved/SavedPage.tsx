'use client';

import { useState } from 'react';
import { Bookmark, FolderOpen } from 'lucide-react';
import { clsx } from 'clsx';
import NewsCardComponent from '@/components/news/NewsCard';
import type { NewsCard, Collection } from '@/types/database';

interface Props {
  cards: NewsCard[];
  collections: Collection[];
  userId: string | null;
}

export default function SavedPage({ cards, collections, userId }: Props) {
  const [tab, setTab] = useState<'bookmarks' | 'collections'>('bookmarks');

  return (
    <div className="pt-4">
      <div className="px-4 mb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-3">Gespeichert</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('bookmarks')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === 'bookmarks' ? 'bg-forest-700 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            <Bookmark size={14} />
            Lesezeichen ({cards.length})
          </button>
          <button
            onClick={() => setTab('collections')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === 'collections' ? 'bg-forest-700 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            <FolderOpen size={14} />
            Sammlungen ({collections.length})
          </button>
        </div>
      </div>

      {tab === 'bookmarks' && (
        <div className="px-3">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Bookmark size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Noch keine Lesezeichen.</p>
              <p className="text-xs mt-1">Tippe auf das Lesezeichen-Symbol bei einer News-Karte.</p>
            </div>
          ) : (
            cards.map(card => (
              <NewsCardComponent
                key={card.id}
                card={{ ...card, user_has_bookmarked: true }}
                userId={userId}
              />
            ))
          )}
        </div>
      )}

      {tab === 'collections' && (
        <div className="px-4">
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FolderOpen size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Noch keine Sammlungen.</p>
              <p className="text-xs mt-1">Sammlungen helfen dir, News thematisch zu ordnen.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map(col => (
                <div key={col.id} className="bg-white rounded-xl p-3 border border-slate-100 flex items-center gap-3">
                  <span className="text-xl">{col.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{col.name}</p>
                    <p className="text-xs text-slate-400">
                      Erstellt am {new Date(col.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
