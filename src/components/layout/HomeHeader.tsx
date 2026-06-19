'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, X, Clock, SlidersHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES, getCategoryLabel } from '@/lib/categories';
import { EVIDENCE_CONFIG, evidenceLevelToKey, getEvidenceLabel } from '@/lib/evidence';
import { useUX } from '@/components/providers/UXProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import type { User } from '@supabase/supabase-js';
import type { EvidenceLevel } from '@/types/database';

const EVIDENCE_LEVELS = Object.keys(EVIDENCE_CONFIG) as EvidenceLevel[];

const DATE_RANGES = [
  { value: '7', label: '7 Tage' },
  { value: '30', label: '30 Tage' },
  { value: '90', label: '90 Tage' },
] as const;

interface Props {
  user: User | null;
  activeCategories: string[];
  searchQuery: string;
  evidenceFilter?: string[];
  daysFilter?: string;
  minRelevance?: string;
}

export default function HomeHeader({ user, activeCategories, searchQuery, evidenceFilter = [], daysFilter, minRelevance }: Props) {
  const router = useRouter();
  const ux = useUX();
  const { locale, t } = useI18n();
  const [showSearch, setShowSearch] = useState(!!searchQuery);
  const [showFilters, setShowFilters] = useState(evidenceFilter.length > 0 || !!daysFilter || !!minRelevance);
  const [query, setQuery] = useState(searchQuery);
  const [selected, setSelected] = useState<Set<string>>(new Set(activeCategories));
  const [selectedEvidence, setSelectedEvidence] = useState<Set<string>>(new Set(evidenceFilter));
  const [days, setDays] = useState(daysFilter ?? '');
  const [relevance, setRelevance] = useState(minRelevance ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedFilters, setSavedFilters] = useState<string[] | null>(null);

  // Sync selected with URL on prop change
  useEffect(() => {
    setSelected(new Set(activeCategories));
  }, [activeCategories]);

  // Persist last-used categories; offer restore when URL has no active filters
  useEffect(() => {
    if (activeCategories.length > 0) {
      localStorage.setItem('nn-last-categories', JSON.stringify(activeCategories));
      setSavedFilters(null);
    } else {
      try {
        const saved = localStorage.getItem('nn-last-categories');
        if (saved) setSavedFilters(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategories.join(',')]);

  function buildUrl(cats: Set<string>, q: string, ev?: Set<string>, d?: string, r?: string) {
    const params = new URLSearchParams();
    if (cats.size > 0) params.set('categories', Array.from(cats).join(','));
    if (q) params.set('q', q);
    const evSet = ev ?? selectedEvidence;
    if (evSet.size > 0) params.set('evidence', Array.from(evSet).map(evidenceLevelToKey).join(','));
    const dVal = d ?? days;
    if (dVal) params.set('days', dVal);
    const rVal = r ?? relevance;
    if (rVal) params.set('minRelevance', rVal);
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  }

  function toggleCategory(catId: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      router.replace(buildUrl(next, query));
      return next;
    });
  }

  function clearCategories() {
    setSelected(new Set());
    router.replace(buildUrl(new Set(), query));
  }

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (value) ux.addSearchQuery(value);
      // replace instead of push: avoids polluting history with every debounced keystroke
      router.replace(buildUrl(selected, value));
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, router, ux, selectedEvidence, days, relevance]);

  function clearSearch() {
    setQuery('');
    setShowSearch(false);
    router.replace(buildUrl(selected, ''));
  }

  const categoryCount = selected.size;

  return (
    <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 dark:border-slate-700/60 safe-top">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden dark:bg-forest-800">
            <Image src="/logo-header.webp" alt="NutriNews" className="w-full h-full object-cover dark:scale-110" width={36} height={36} priority />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-none tracking-tight">
                NutriNews
              </span>
              {ux.streak.days >= 2 && (
                <span className="text-[11px] font-bold bg-gradient-to-r from-orange-400 to-amber-400 text-white px-1.5 py-0.5 rounded-full leading-none">
                  🔥 {ux.streak.days}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-none font-medium">
              {user ? user.email?.split('@')[0] : t('header.subtitle')}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(s => !s)}
          aria-label="Suche"
          aria-expanded={showSearch}
          className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
            showSearch
              ? 'bg-forest-100 dark:bg-forest-900/40 text-forest-700 dark:text-forest-400'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          )}
        >
          <Search size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-5 pb-3 animate-fade-in">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              aria-label={t('header.searchPlaceholder')}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white dark:focus:bg-slate-600 transition-all border border-transparent focus:border-forest-200 dark:focus:border-forest-700"
            />
            {query && (
              <button onClick={clearSearch} aria-label="Suche zurücksetzen" className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-500 flex items-center justify-center hover:bg-slate-400 transition-colors">
                <X size={11} className="text-white" strokeWidth={3} />
              </button>
            )}
          </div>
          {/* Search history suggestions */}
          {!query && ux.searchHistory.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ux.searchHistory.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(q)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Clock size={10} />
                  {q}
                </button>
              ))}
              <button
                onClick={() => ux.clearSearchHistory()}
                className="px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
              >
                {t('header.searchDelete')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category quick-filter pills — horizontal scroll */}
      <div className="pb-2">
        <div
          className="flex gap-1.5 overflow-x-auto px-5 pb-1"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        >
          <button
            onClick={clearCategories}
            className={clsx(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap',
              selected.size === 0
                ? 'bg-forest-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
          >
            {t('header.allCategories')}
          </button>
          {CATEGORIES.map(cat => {
            const isActive = selected.has(cat.id);
            return (
              <button
                key={cat.id}
                aria-pressed={isActive}
                onClick={() => toggleCategory(cat.id)}
                className={clsx(
                  'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-forest-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                )}
              >
                {getCategoryLabel(cat.id, locale)}
              </button>
            );
          })}
        </div>

        {/* Restore last filter suggestion */}
        {categoryCount === 0 && savedFilters && savedFilters.length > 0 && (
          <div className="flex items-center gap-2 mt-1.5 px-5 animate-fade-in">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">{t('header.recent')}</span>
            {savedFilters.slice(0, 3).map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              return (
                <button
                  key={catId}
                  onClick={() => {
                    const next = new Set(savedFilters);
                    setSelected(next);
                    router.replace(buildUrl(next, query));
                    setSavedFilters(null);
                  }}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] text-slate-500 dark:text-slate-400 hover:bg-forest-50 hover:text-forest-700 dark:hover:bg-forest-900/20 dark:hover:text-forest-400 transition-colors border border-slate-200 dark:border-slate-600"
                >
                  {getCategoryLabel(cat.id, locale)}
                </button>
              );
            })}
            <button
              onClick={() => setSavedFilters(null)}
              aria-label="Vorschlag ausblenden"
              className="text-[11px] text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors ml-auto"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        )}
      </div>

      {/* Extended filters toggle — kompakter für Mobile */}
      <div className="px-5 pb-2">
        <button
          onClick={() => setShowFilters(f => !f)}
          aria-expanded={showFilters}
          className={clsx(
            'flex items-center gap-1.5 text-[11px] font-semibold transition-colors',
            showFilters || selectedEvidence.size > 0 || days || relevance
              ? 'text-forest-700 dark:text-forest-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-600'
          )}
        >
          <SlidersHorizontal size={13} />
          {t('header.filter')}
          {(selectedEvidence.size > 0 || days || relevance) && (
            <span className="w-4 h-4 rounded-full bg-forest-700 text-white text-[11px] flex items-center justify-center font-bold">
              {(selectedEvidence.size > 0 ? 1 : 0) + (days ? 1 : 0) + (relevance ? 1 : 0)}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-2 space-y-2 animate-fade-in">
            {/* Evidence Level — kompaktere Chips */}
            <div className="flex flex-wrap gap-1">
              {EVIDENCE_LEVELS.map(level => {
                const config = EVIDENCE_CONFIG[level];
                const isActive = selectedEvidence.has(level);
                return (
                  <button
                    key={level}
                    aria-pressed={isActive}
                    onClick={() => {
                      setSelectedEvidence(prev => {
                        const next = new Set(prev);
                        if (next.has(level)) next.delete(level); else next.add(level);
                        router.replace(buildUrl(selected, query, next));
                        return next;
                      });
                    }}
                    className={clsx(
                      'px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border',
                      isActive
                        ? 'bg-forest-700 text-white border-forest-700'
                        : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    )}
                  >
                    {config.icon} {getEvidenceLabel(level, locale)}
                  </button>
                );
              })}
            </div>

            {/* Date range + Min relevance — kompakter in einer Zeile */}
            <div className="flex gap-2">
              <div className="flex-1 flex gap-1">
                {DATE_RANGES.map(dr => (
                  <button
                    key={dr.value}
                    aria-pressed={days === dr.value}
                    onClick={() => {
                      const next = days === dr.value ? '' : dr.value;
                      setDays(next);
                      router.replace(buildUrl(selected, query, undefined, next));
                    }}
                    className={clsx(
                      'flex-1 py-1 rounded-lg text-[11px] font-semibold transition-all border text-center',
                      days === dr.value
                        ? 'bg-forest-700 text-white border-forest-700'
                        : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                    )}
                  >
                    {t(`header.days${dr.value}`)}
                  </button>
                ))}
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    aria-label={`Mindestrelevanz ${score}`}
                    aria-pressed={Number(relevance) >= 1 && score <= Number(relevance)}
                    onClick={() => {
                      const next = relevance === String(score) ? '' : String(score);
                      setRelevance(next);
                      router.replace(buildUrl(selected, query, undefined, undefined, next));
                    }}
                    className={clsx(
                      'w-6 h-6 rounded-md text-[11px] font-bold transition-all border text-center',
                      Number(relevance) >= 1 && score <= Number(relevance)
                        ? 'bg-forest-700 text-white border-forest-700'
                        : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                    )}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear extended filters */}
            {(selectedEvidence.size > 0 || days || relevance) && (
              <button
                onClick={() => {
                  setSelectedEvidence(new Set());
                  setDays('');
                  setRelevance('');
                  router.replace(buildUrl(selected, query, new Set(), '', ''));
                }}
                className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-red-400 transition-colors"
              >
                {t('header.reset')}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
