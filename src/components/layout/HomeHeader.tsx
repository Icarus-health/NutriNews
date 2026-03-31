'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES, CATEGORY_CONTEXTS } from '@/lib/categories';
import { useUX } from '@/components/providers/UXProvider';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
  activeCategories: string[];
  searchQuery: string;
}

export default function HomeHeader({ user, activeCategories, searchQuery }: Props) {
  const router = useRouter();
  const ux = useUX();
  const [showSearch, setShowSearch] = useState(!!searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState(searchQuery);
  const [selected, setSelected] = useState<Set<string>>(new Set(activeCategories));
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

  function buildUrl(cats: Set<string>, q: string) {
    const params = new URLSearchParams();
    if (cats.size > 0) params.set('categories', Array.from(cats).join(','));
    if (q) params.set('q', q);
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
  }, [selected, router, ux]);

  function clearSearch() {
    setQuery('');
    setShowSearch(false);
    router.push(buildUrl(selected, ''));
  }

  const categoryCount = selected.size;

  return (
    <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 dark:border-slate-700/60 safe-top">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-[100px] overflow-hidden flex items-center">
            <img src="/icarus-logo.png" alt="NutriNews" className="h-full w-full object-contain object-left" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-[17px] tracking-[-0.02em] leading-none">
              NutriNews
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {user ? user.email?.split('@')[0] : 'Evidenzbasiert'}
            </p>
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
    </header>
  );
}
