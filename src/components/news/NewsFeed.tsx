'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { RefreshCw, WifiOff, Loader2 } from 'lucide-react';
import NewsCardComponent from './NewsCard';
import { loadMoreCards, loadNewCards } from '@/lib/actions/news';
import { getCardTranslations } from '@/lib/actions/translate';
import type { CardTranslation } from '@/lib/translate-fields';
import { useUX } from '@/components/providers/UXProvider';
import { useI18n } from '@/components/providers/I18nProvider';

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
  const { locale, t } = useI18n();
  const [cards, setCards] = useState(initialCards);
  const [hasMore, setHasMore] = useState(initialCards.length >= 15);
  const [shareCardId, setShareCardId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCards, setPendingCards] = useState<import('@/types/database').NewsCard[]>([]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Batch-Übersetzungen (locale != de): ein Server-Call pro Karten-Batch
  // statt ein Call pro Karte. requested verhindert doppelte Anfragen.
  const [translations, setTranslations] = useState<Record<string, CardTranslation>>({});
  const requestedTranslations = useRef<Set<string>>(new Set());
  // Stable refs for use inside event listeners / intervals (avoid stale closures)
  const cardsRef = useRef(initialCards);
  const filtersRef = useRef(filters);

  // Pull-to-refresh — use refs to avoid re-renders on every touchmove
  const pullStartY = useRef(0);
  const pullYRef = useRef(0);
  const pullIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCards(initialCards);
    setHasMore(initialCards.length >= 15);
    setPendingCards([]);
    cardsRef.current = initialCards;
  }, [initialCards]);

  useEffect(() => { filtersRef.current = filters; }, [filters]);
  useEffect(() => { cardsRef.current = cards; }, [cards]);

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

  // Check for new articles on visibility change and every 15 min — shows a banner instead of
  // silently auto-prepending (lets the user decide when to refresh their reading position).
  useEffect(() => {
    const check = async () => {
      if (document.visibilityState !== 'visible' || !isOnline) return;
      const latestTs = cardsRef.current[0]?.published_at;
      if (!latestTs) return;
      try {
        const result = await loadNewCards(latestTs, filtersRef.current);
        if (result.cards.length === 0) return;
        const known = new Set(cardsRef.current.map(c => c.id));
        const fresh = result.cards.filter(c => !known.has(c.id));
        if (fresh.length > 0) setPendingCards(fresh);
      } catch { /* offline or transient error */ }
    };
    document.addEventListener('visibilitychange', check);
    const interval = setInterval(check, 15 * 60 * 1000);
    return () => {
      document.removeEventListener('visibilitychange', check);
      clearInterval(interval);
    };
  }, [isOnline]);

  function handleLoadPending() {
    if (pendingCards.length === 0) return;
    setCards(prev => {
      const known = new Set(prev.map(c => c.id));
      return [...pendingCards.filter(c => !known.has(c.id)), ...prev];
    });
    setPendingCards([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

  // Übersetzungen für alle geladenen Karten besorgen (localStorage → DB-Cache → Claude-Batch)
  useEffect(() => {
    if (locale === 'de') return;
    const fromLocal: Record<string, CardTranslation> = {};
    const missing: string[] = [];
    for (const card of cards) {
      if (requestedTranslations.current.has(card.id)) continue;
      requestedTranslations.current.add(card.id);
      try {
        const cached = localStorage.getItem(`nn-tr-${locale}-${card.id}`);
        if (cached) { fromLocal[card.id] = JSON.parse(cached); continue; }
      } catch { /* ignore */ }
      missing.push(card.id);
    }
    if (Object.keys(fromLocal).length > 0) setTranslations(prev => ({ ...prev, ...fromLocal }));
    if (missing.length === 0) return;
    let cancelled = false;
    getCardTranslations(missing, locale).then(map => {
      if (cancelled) return;
      setTranslations(prev => ({ ...prev, ...map }));
      for (const [id, tr] of Object.entries(map)) {
        try { localStorage.setItem(`nn-tr-${locale}-${id}`, JSON.stringify(tr)); } catch { /* ignore */ }
      }
    });
    return () => { cancelled = true; };
  }, [cards, locale]);

  // Sprachwechsel: bereits angefragte IDs neu zulassen
  useEffect(() => {
    requestedTranslations.current = new Set();
    setTranslations({});
  }, [locale]);

  function handleRequireAuth() {
    router.push('/login');
  }

  // Pull-to-Refresh: nur NEUE Karten oben anhängen statt die ganze Seite neu
  // zu evaluieren (router.refresh() lief gegen den 30-Min-Cache und fühlte
  // sich träge an). loadNewCards fragt die DB direkt ab.
  function handleRefresh() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    (async () => {
      try {
        const newest = cards[0]?.published_at;
        if (!newest) {
          router.refresh();
          return;
        }
        const result = await loadNewCards(newest, filters);
        if (result.cards.length > 0) {
          setCards(prev => {
            const known = new Set(prev.map(c => c.id));
            const fresh = result.cards.filter(c => !known.has(c.id));
            return fresh.length > 0 ? [...fresh, ...prev] : prev;
          });
        }
      } catch { /* Offline o.ä. — Indikator einfach wieder ausblenden */ }
      finally {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    })();
  }

  const handleLoadMore = useCallback(() => {
    const lastCard = cards[cards.length - 1];
    if (!lastCard?.published_at || isPending || !hasMore || !isOnline) return;
    startTransition(async () => {
      const result = await loadMoreCards(lastCard.published_at!, filters);
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

  // Pull-to-refresh touch handlers — direct DOM updates avoid React re-renders at 60fps+
  function onTouchStart(e: React.TouchEvent) {
    pullStartY.current = e.touches[0].clientY;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (window.scrollY > 5 || isRefreshing) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) {
      const y = Math.min(delta * 0.45, 80);
      pullYRef.current = y;
      const el = pullIndicatorRef.current;
      if (el) {
        const progress = Math.min(y / 62, 1);
        el.style.height = `${y}px`;
        el.style.opacity = String(progress);
        const icon = el.querySelector<HTMLDivElement>('[data-pull-icon]');
        if (icon) icon.style.transform = `rotate(${progress * 180}deg)`;
      }
    }
  }
  function onTouchEnd() {
    if (pullYRef.current >= 62) handleRefresh();
    pullYRef.current = 0;
    const el = pullIndicatorRef.current;
    if (el) { el.style.height = '0px'; el.style.opacity = '0'; }
  }

  if (cards.length === 0) {
    const hasActiveFilters = filters && (
      (filters.categories && filters.categories.length > 0) ||
      filters.q ||
      (filters.evidence && filters.evidence.length > 0) ||
      filters.days ||
      filters.minRelevance
    );
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 px-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <span className="text-2xl">{hasActiveFilters ? '🔍' : '☕'}</span>
        </div>
        <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">
          {hasActiveFilters ? t('feed.emptyFiltered.title') : t('feed.empty.title')}
        </p>
        <p className="text-[13px] mt-1 text-center text-slate-500 dark:text-slate-500">
          {hasActiveFilters ? t('feed.emptyFiltered.body') : t('feed.empty.body')}
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
      {/* Pull-to-refresh indicator — height/opacity driven by direct DOM ref */}
      <div
        ref={pullIndicatorRef}
        className="flex items-center justify-center mb-2 overflow-hidden"
        style={{ height: 0, opacity: 0 }}
      >
        <div
          data-pull-icon
          className="w-9 h-9 rounded-full bg-forest-100 dark:bg-forest-900/40 flex items-center justify-center shadow-sm"
        >
          <RefreshCw size={16} className="text-forest-600 dark:text-forest-400" />
        </div>
      </div>

      {/* New articles banner — appears when fresh content is detected */}
      {pendingCards.length > 0 && (
        <button
          onClick={handleLoadPending}
          className="w-full flex items-center justify-center gap-2 mb-3 py-2.5 bg-forest-700 text-white text-[13px] font-semibold rounded-2xl shadow-lg shadow-forest-900/20 animate-fade-in hover:bg-forest-800 active:scale-[0.98] transition-all"
        >
          <RefreshCw size={14} />
          {pendingCards.length === 1 ? '1 neuer Artikel' : `${pendingCards.length} neue Artikel`}
        </button>
      )}

      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 text-[13px] font-medium animate-fade-in">
          <WifiOff size={14} />
          {t('feed.offline')}
        </div>
      )}

      {cards.filter(card => !ux.isHidden(card.id)).map((card, i) => (
        <div key={card.id} style={{ animationDelay: `${Math.min(i, 14) * 60}ms` }} className="animate-scale-in">
          <NewsCardComponent
            card={card}
            userId={userId}
            onRequireAuth={handleRequireAuth}
            onShare={(cardId) => setShareCardId(cardId)}
            batchTranslation={locale === 'de' ? undefined : (translations[card.id] ?? null)}
          />
        </div>
      ))}

      {/* Infinite scroll sentinel + loading indicator */}
      {hasMore && (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {isPending && (
            <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              {t('feed.loading')}
            </div>
          )}
          {!isOnline && (
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{t('feed.offlineNoMore')}</p>
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
