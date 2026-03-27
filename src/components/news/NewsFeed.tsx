'use client';

import { useState } from 'react';
import NewsCardComponent from './NewsCard';
import type { NewsCard } from '@/types/database';

interface Props {
  initialCards: NewsCard[];
  userId: string | null;
  onCategoryChange?: (cat: string | null) => void;
}

function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3 animate-pulse">
      <div className="px-4 pt-4 pb-2">
        <div className="flex justify-between mb-3">
          <div className="h-5 w-24 bg-slate-100 rounded-full"/>
          <div className="h-5 w-16 bg-slate-100 rounded-full"/>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded mb-1"/>
        <div className="h-4 w-3/4 bg-slate-100 rounded"/>
      </div>
      <div className="px-4 py-3">
        <div className="h-16 bg-slate-50 rounded-xl"/>
      </div>
      <div className="flex gap-6 px-4 py-3 border-t border-slate-100">
        <div className="h-5 w-8 bg-slate-100 rounded"/>
        <div className="h-5 w-5 bg-slate-100 rounded"/>
        <div className="h-5 w-5 bg-slate-100 rounded"/>
      </div>
    </div>
  );
}

export default function NewsFeed({ initialCards, userId }: Props) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const filtered = selectedCat
    ? initialCards.filter(c => c.category_main === selectedCat)
    : initialCards;

  function handleRequireAuth() {
    // Could be replaced with a modal
    alert('Bitte anmelde, um diese Funktion zu nutzen.');
  }

  if (initialCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <span className="text-5xl mb-4">📭</span>
        <p className="text-sm font-medium">Noch keine News vorhanden.</p>
        <p className="text-xs mt-1 text-slate-300">Verwende den Admin-Bereich, um erste Karten hinzuzufügen.</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <span className="text-4xl mb-3">🔍</span>
        <p className="text-sm">Keine Artikel in dieser Kategorie.</p>
      </div>
    );
  }

  return (
    <div className="px-3 pt-3">
      {filtered.map((card) => (
        <NewsCardComponent
          key={card.id}
          card={card}
          userId={userId}
          onRequireAuth={handleRequireAuth}
        />
      ))}
    </div>
  );
}

export { NewsCardSkeleton };
