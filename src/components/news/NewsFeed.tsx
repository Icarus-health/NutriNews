'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import NewsCardComponent from './NewsCard';
import ShareModal from './ShareModal';
import { loadMoreCards } from '@/lib/actions/news';
import type { NewsCard } from '@/types/database';

interface Props {
  initialCards: NewsCard[];
  userId: string | null;
  filters?: {
    categories?: string[];
    q?: string;
    evidence?: string[];
    days?: number;
    minRelevance?: number;
  };
}

export default function NewsFeed({ initialCards, userId, filters }: Props) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [hasMore, setHasMore] = useState(initialCards.length >= 15);
  const [shareCardId, setShareCardId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state when server re-renders with new initialCards (e.g. after router.refresh())
  useEffect(() => {
    setCards(initialCards);
    setHasMore(initialCards.length >= 15);
  }, [initialCards]);

  function handleRequireAuth() {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
    // Reset state after refresh triggers new server render
    setTimeout(() => setIsRefreshing(false), 1500);
  }

  function handleLoadMore() {
    const lastCard = cards[cards.length - 1];
    if (!lastCard?.published_at) return;

    startTransition(async () => {
      const result = await loadMoreCards(lastCard.published_at!, [], filters);
      setCards(prev => [...prev, ...result.cards]);
      setHasMore(result.hasMore);
    });
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 px-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <span className="text-2xl">📭</span>
        </div>
        <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">Keine Beiträge gefunden</p>
        <p className="text-[13px] mt-1 text-center text-slate-400 dark:text-slate-500">
          Für diese Auswahl sind aktuell keine Meldungen vorhanden. Bitte Filter anpassen oder später zurückkommen.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-xl text-[13px] font-semibold text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/20 hover:bg-forest-100 dark:hover:bg-forest-900/30 transition-colors disabled:opacity-50 border border-forest-100 dark:border-forest-800/40"
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        {isRefreshing ? 'Wird aktualisiert...' : 'Feed aktualisieren'}
      </button>

      {cards.map((card, i) => (
        <div key={card.id} style={{ animationDelay: `${Math.min(i, 14) * 60}ms` }} className="animate-scale-in">
          <NewsCardComponent
            card={card}
            userId={userId}
            onRequireAuth={handleRequireAuth}
            onShare={(cardId) => setShareCardId(cardId)}
          />
        </div>
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={isPending}
          className="w-full py-3 mt-2 mb-4 rounded-xl text-[14px] font-semibold transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 border border-slate-200 dark:border-slate-700"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Wird geladen...
            </span>
          ) : (
            'Mehr laden'
          )}
        </button>
      )}

      {shareCardId && (
        <ShareModal
          newsCardId={shareCardId}
          onClose={() => setShareCardId(null)}
        />
      )}
    </div>
  );
}
