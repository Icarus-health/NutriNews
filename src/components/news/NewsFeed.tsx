'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { RefreshCw, WifiOff, Loader2 } from 'lucide-react';
import NewsCardComponent from './NewsCard';
import { loadMoreCards } from '@/lib/actions/news';
import { useUX } from '@/components/providers/UXProvider';

const ShareModal = dynamic(() => import('./ShareModal'), { ssr: false });
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
  const ux = useUX();
  const [cards, setCards] = useState(initialCards);
  const [hasMore, setHasMore] = useState(initialCards.length >= 15);
  const [shareCardId, setShareCardId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh
  const pullStartY = useRef(0);
  const [pullY, setPullY] = useState(0);

  useEffect(() => {
    setCards(initialCards);
    setHasMore(initialCards.length >= 15);
  }, [initialCards]);

  // Online/offline detection
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // App badge: unread count (Badging API, iOS 16.4+ when installed as PWA)
  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;
    const unread = cards.filter(c => !ux.readHistory.some(h => h.cardId === c.id)).length;
    if (unread > 0) {
      navigator.setAppBadge(unread).catch(() => {});
    } else {
      (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.().catch(() => {});
    }
  }, [cards, ux.readHistory]);

  useEffect(() => {
    const clearBadge = () => {
      if (document.visibilityState === 'visible') {
        (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', clearBadge);
    return () => document.removeEventListener('visibilitychange', clearBadge);
  }, []);

  function handleRequireAuth() {
    if (typeof window !== 'undefined') window.location.href = '/login';
  }

  function handleRefresh() {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1500);
  }

  const handleLoadMore = useCallback(() => {
    const lastCard = cards[cards.length - 1];
    if (!lastCard?.published_at || isPending || !hasMore || !isOnline) return;
    startTransition(async () => {
      const result = await loadMoreCards(lastCard.published_at!, [], filters);
      setCards(prev => [...prev, ...result.cards]);
      setHasMore(result.hasMore);
    });
  }, [cards, isPending, hasMore, isOnline, filters]);

  // Infinite scroll: trigger load when sentinel enters viewport (300px before)
  useEffect(() => {
    if (!hasMore || isPending || !isOnline) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) handleLoadMore(); },
      { rootMargin: '300px' }
    );
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isPending, isOnline, handleLoadMore]);

  // Pull-to-refresh touch handlers
  function onTouchStart(e: React.TouchEvent) {
    pullStartY.current = e.touches[0].clientY;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (window.scrollY > 5 || isRefreshing) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.45, 80));
  }
  function onTouchEnd() {
    if (pullY >= 62) handleRefresh();
    setPullY(0);
  }

  const pullProgress = Math.min(pullY / 62, 1);

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
    <div
      className="px-4 pt-4 pb-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullY > 0 && (
        <div
          className="flex items-center justify-center mb-2 transition-all"
          style={{ height: pullY, opacity: pullProgress }}
        >
          <div
            className="w-9 h-9 rounded-full bg-forest-100 dark:bg-forest-900/40 flex items-center justify-center shadow-sm"
            style={{ transform: `rotate(${pullProgress * 180}deg)` }}
          >
            <RefreshCw size={16} className="text-forest-600 dark:text-forest-400" />
          </div>
        </div>
      )}

      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 text-[13px] font-medium animate-fade-in">
          <WifiOff size={14} />
          Offline — du siehst zwischengespeicherte Inhalte
        </div>
      )}

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

      {/* Infinite scroll sentinel + loading indicator */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {isPending && (
            <div className="flex items-center gap-2 text-[13px] text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              Lädt...
            </div>
          )}
          {!isOnline && (
            <p className="text-[12px] text-slate-400">Offline — kein Nachladen möglich</p>
          )}
        </div>
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
