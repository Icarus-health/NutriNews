'use client';

import { useState } from 'react';
import NewsCardComponent from './NewsCard';
import ShareModal from './ShareModal';
import type { NewsCard } from '@/types/database';

interface Props {
  initialCards: NewsCard[];
  userId: string | null;
}

export default function NewsFeed({ initialCards, userId }: Props) {
  const [cards] = useState(initialCards);
  const [shareCardId, setShareCardId] = useState<string | null>(null);

  function handleRequireAuth() {
    alert('Bitte anmelden, um diese Funktion zu nutzen.');
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 px-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-[15px] font-semibold text-slate-500">Noch keine News</p>
        <p className="text-[13px] mt-1 text-center">Verwende den Admin-Bereich, um erste Karten hinzuzufügen.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4">
      {cards.map((card, i) => (
        <div key={card.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-scale-in">
          <NewsCardComponent
            card={card}
            userId={userId}
            onRequireAuth={handleRequireAuth}
            onShare={(cardId) => setShareCardId(cardId)}
          />
        </div>
      ))}

      {shareCardId && (
        <ShareModal
          newsCardId={shareCardId}
          onClose={() => setShareCardId(null)}
        />
      )}
    </div>
  );
}
