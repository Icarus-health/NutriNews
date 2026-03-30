'use client';

import { useState } from 'react';
import NewsCardComponent from './NewsCard';
import ShareModal from './ShareModal';
import type { NewsCard } from '@/types/database';

interface Props {
  cards: NewsCard[];
  userId: string | null;
}

export default function LayPressFeed({ cards, userId }: Props) {
  const [shareCardId, setShareCardId] = useState<string | null>(null);

  function handleRequireAuth() {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  if (cards.length === 0) return null;

  return (
    <div className="px-4 pt-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-lg">📰</span>
        <div>
          <h2 className="text-[14px] font-bold text-slate-800">
            Was Ihre Patienten gerade lesen
          </h2>
          <p className="text-[11px] text-slate-400">
            Laienpresse-Monitoring mit fachlicher Einordnung
          </p>
        </div>
      </div>

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

      {/* Separator */}
      <div className="flex items-center gap-3 py-2 px-1 mb-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[11px] text-slate-400 font-medium">Fachnews</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {shareCardId && (
        <ShareModal
          newsCardId={shareCardId}
          onClose={() => setShareCardId(null)}
        />
      )}
    </div>
  );
}
