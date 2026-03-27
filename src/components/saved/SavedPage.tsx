'use client';
import type { Collection, NewsCard } from '@/types/database';
import { Bookmark, FolderOpen } from 'lucide-react';
import { getCategoryStyle } from '@/lib/categories';

type BookmarkWithCard = { news_card_id: string; news_card: NewsCard | null };

export default function SavedPage({
  bookmarks,
  collections,
}: {
  bookmarks: BookmarkWithCard[];
  collections: Collection[];
}) {
  if (bookmarks.length === 0 && collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Bookmark size={48} strokeWidth={1.2} className="mb-4 text-slate-300" />
        <p className="text-sm font-medium">Noch nichts gespeichert</p>
        <p className="text-xs mt-1 text-slate-300">Tippe auf das Lesezeichen-Symbol, um Artikel zu speichern.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Gespeichert</h1>

      {bookmarks.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Lesezeichen · {bookmarks.length}
          </h2>
          <div className="space-y-2">
            {bookmarks.map(bm => bm.news_card && (
              <div key={bm.news_card_id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getCategoryStyle(bm.news_card.category_main)}`}>
                    {bm.news_card.category_main}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 leading-snug">{bm.news_card.headline}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Sammlungen · {collections.length}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {collections.map(col => (
              <div key={col.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-2">
                <span className="text-xl">{col.emoji}</span>
                <span className="text-sm font-medium text-slate-800 truncate">{col.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
