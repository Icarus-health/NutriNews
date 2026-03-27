'use client';
import type { Collection } from '@/types/database';

type Bookmark = { news_card_id: string };

export default function SavedPage({ bookmarks, collections }: { bookmarks: Bookmark[]; collections: Collection[] }) {
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Gespeichert</h1>
      <p className="text-slate-400 text-sm">Lesezeichen ({bookmarks.length}) & Sammlungen ({collections.length})</p>
    </div>
  );
}
