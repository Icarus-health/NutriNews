'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES, CATEGORY_CONTEXTS } from '@/lib/categories';
import { EVIDENCE_CONFIG, evidenceLevelToKey } from '@/lib/evidence';
import { useUX } from '@/components/providers/UXProvider';
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
  const [showSearch, setShowSearch] = useState(!!searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(evidenceFilter.length > 0 || !!daysFilter || !!minRelevance);
  const [query, setQuery] = useState(searchQuery);
  const [selected, setSelected] = useState<Set<string>>(new Set(activeCategories));
  const [selectedEvidence, setSelectedEvidence] = useState<Set<string>>(new Set(evidenceFilter));
  const [days, setDays] = useState(daysFilter ?? '');
  const [relevance, setRelevance] = useState(minRelevance ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync selected with URL on prop change
  useEffect(() => {
    setSelected(new Set(activeCategories));
  }, [activeCategories]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showDropdown]);

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
      router.push(buildUrl(next, query));
      return next;
    });
  }

  function clearCategories() {
    setSelected(new Set());
    router.push(buildUrl(new Set(), query));
    setShowDropdown(false);
  }

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (value) ux.addSearchQuery(value);
      router.push(buildUrl(selected, value));
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, router, ux, selectedEvidence, days, relevance]);

  function clearSearch() {
    setQuery('');
    setShowSearch(false);
    router.push(buildUrl(selected, ''));
  }

  const categoryCount = selected.size;

  return (
    <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 dark:border-slate-700/60 safe-top">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden">
            <img src="/logo-header.webp" alt="NutriNews" className="w-full h-full object-contain" width={36} height={36} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-none tracking-tight">
              NutriNews
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none font-medium">
              {user ? user.email?.split('@')[0] : 'Evidenzbasiert · Praxisnah'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(s => !s)}
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
              placeholder="News durchsuchen..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white dark:focus:bg-slate-600 transition-all border border-transparent focus:border-forest-200 dark:focus:border-forest-700"
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-500 flex items-center justify-center hover:bg-slate-400 transition-colors">
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
                className="px-2 py-1 text-[10px] text-slate-400 hover:text-red-400 transition-colors"
              >
                Löschen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category dropdown trigger */}
      <div className="px-5 pb-3 relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(d => !d)}
          className={clsx(
            'w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all border',
            categoryCount > 0
              ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-200 dark:border-forest-800 text-forest-700 dark:text-forest-400'
              : 'bg-slate-100 dark:bg-slate-700 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          )}
        >
          <span>
            {categoryCount === 0
              ? 'Alle Kategorien'
              : categoryCount === 1
                ? CATEGORIES.find(c => selected.has(c.id))?.label ?? '1 Kategorie'
                : `${categoryCount} Kategorien`}
          </span>
          <div className="flex items-center gap-2">
            {categoryCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); clearCategories(); }}
                className="w-5 h-5 rounded-full bg-forest-200 dark:bg-forest-800 flex items-center justify-center hover:bg-forest-300 dark:hover:bg-forest-700 transition-colors"
              >
                <X size={10} className="text-forest-700 dark:text-forest-300" strokeWidth={3} />
              </button>
            )}
            <ChevronDown size={16} className={clsx('transition-transform', showDropdown && 'rotate-180')} />
          </div>
        </button>

        {/* Selected chips (shown when dropdown closed and categories selected) */}
        {!showDropdown && categoryCount > 0 && categoryCount <= 5 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Array.from(selected).map(catId => {
              const cat = CATEGORIES.find(c => c.id === catId);
              if (!cat) return null;
              return (
                <button
                  key={catId}
                  onClick={() => toggleCategory(catId)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest-700 text-white text-[11px] font-semibold transition-colors hover:bg-forest-800"
                >
                  {cat.label}
                  <X size={10} strokeWidth={3} />
                </button>
              );
            })}
          </div>
        )}

        {/* Dropdown panel */}
        {showDropdown && (
          <div className="absolute left-5 right-5 top-full mt-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-black/30 max-h-[60vh] overflow-y-auto z-20 animate-fade-in">
            {CATEGORY_CONTEXTS.map((ctx) => {
              const ctxCategories = CATEGORIES.filter(cat => (ctx.topics as readonly string[]).includes(cat.id));
              return (
                <div key={ctx.id}>
                  {/* Context group label */}
                  <div className="sticky top-0 bg-slate-50 dark:bg-slate-750 px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {ctx.label}
                    </p>
                  </div>
                  {/* Category items */}
                  {ctxCategories.map(cat => {
                    const isSelected = selected.has(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={clsx(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'bg-forest-50 dark:bg-forest-900/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        )}
                      >
                        <div className={clsx(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0',
                          isSelected
                            ? 'bg-forest-700 border-forest-700'
                            : 'border-slate-300 dark:border-slate-600'
                        )}>
                          {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={clsx(
                          'text-[13px] font-medium',
                          isSelected ? 'text-forest-700 dark:text-forest-400' : 'text-slate-700 dark:text-slate-300'
                        )}>
                          {cat.label}
                        </span>
                        <span className={clsx('ml-auto text-[10px] px-2 py-0.5 rounded-full', cat.color)}>
                          {cat.id.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
              <button
                onClick={clearCategories}
                className="text-[12px] text-slate-400 hover:text-red-400 transition-colors"
              >
                Alle zurücksetzen
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="bg-forest-700 text-white px-4 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-forest-800 transition-colors"
              >
                Fertig {categoryCount > 0 && `(${categoryCount})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Extended filters toggle */}
      <div className="px-5 pb-3">
        <button
          onClick={() => setShowFilters(f => !f)}
          className={clsx(
            'flex items-center gap-1.5 text-[12px] font-semibold transition-colors',
            showFilters || selectedEvidence.size > 0 || days || relevance
              ? 'text-forest-700 dark:text-forest-400'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <SlidersHorizontal size={14} />
          Erweiterte Filter
          {(selectedEvidence.size > 0 || days || relevance) && (
            <span className="w-4 h-4 rounded-full bg-forest-700 text-white text-[9px] flex items-center justify-center font-bold">
              {(selectedEvidence.size > 0 ? 1 : 0) + (days ? 1 : 0) + (relevance ? 1 : 0)}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="mt-3 space-y-3 animate-fade-in">
            {/* Evidence Level multi-select */}
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Evidenz-Level</p>
              <div className="flex flex-wrap gap-1.5">
                {EVIDENCE_LEVELS.map(level => {
                  const config = EVIDENCE_CONFIG[level];
                  const isActive = selectedEvidence.has(level);
                  return (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedEvidence(prev => {
                          const next = new Set(prev);
                          if (next.has(level)) next.delete(level); else next.add(level);
                          router.push(buildUrl(selected, query, next));
                          return next;
                        });
                      }}
                      className={clsx(
                        'px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border',
                        isActive
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      )}
                    >
                      {config.icon} {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date range + Min relevance row */}
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Zeitraum</p>
                <div className="flex gap-1.5">
                  {DATE_RANGES.map(dr => (
                    <button
                      key={dr.value}
                      onClick={() => {
                        const next = days === dr.value ? '' : dr.value;
                        setDays(next);
                        router.push(buildUrl(selected, query, undefined, next));
                      }}
                      className={clsx(
                        'flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all border text-center',
                        days === dr.value
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                      )}
                    >
                      {dr.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-28">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Min. Relevanz</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      onClick={() => {
                        const next = relevance === String(score) ? '' : String(score);
                        setRelevance(next);
                        router.push(buildUrl(selected, query, undefined, undefined, next));
                      }}
                      className={clsx(
                        'flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all border text-center',
                        Number(relevance) >= 1 && score <= Number(relevance)
                          ? 'bg-forest-700 text-white border-forest-700'
                          : 'bg-white dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600'
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear extended filters */}
            {(selectedEvidence.size > 0 || days || relevance) && (
              <button
                onClick={() => {
                  setSelectedEvidence(new Set());
                  setDays('');
                  setRelevance('');
                  router.push(buildUrl(selected, query, new Set(), '', ''));
                }}
                className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
              >
                Erweiterte Filter zurücksetzen
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
