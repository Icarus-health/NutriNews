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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="text-4xl mb-3">📭</span>
        <p className="text-sm">Noch keine News vorhanden.</p>
        <p className="text-xs mt-1">Verwende den Admin-Bereich, um erste Karten hinzuzufuegen.</p>
      </div>
    );
  }

  return (
    <div className="px-3 pt-3">
      {cards.map((card) => (
        <NewsCardComponent
          key={card.id}
          card={card}
          userId={userId}
          onRequireAuth={handleRequireAuth}
          onShare={(cardId) => setShareCardId(cardId)}
        />
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
