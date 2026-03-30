'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES, CATEGORY_CONTEXTS } from '@/lib/categories';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
  activeCategory: string | null;
  searchQuery: string;
}

export default function HomeHeader({ user, activeCategory, searchQuery }: Props) {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(!!searchQuery);
  const [query, setQuery] = useState(searchQuery);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function selectCategory(catId: string | null) {
    const params = new URLSearchParams();
    if (catId) params.set('category', catId);
    if (query) params.set('q', query);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (value) params.set('q', value);
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : '/');
    }, 400);
  }, [activeCategory, router]);

  function clearSearch() {
    setQuery('');
    setShowSearch(false);
    const params = new URLSearchParams();
    if (activeCategory) params.set('category', activeCategory);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  }

  return (
    <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 safe-top">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] overflow-hidden shadow-sm">
            <img src="/icon.svg" alt="NutriNews" className="w-full h-full" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-[17px] tracking-[-0.02em] leading-none">
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
              ? 'bg-forest-100 text-forest-700'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 rounded-xl text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white transition-all border border-transparent focus:border-forest-200"
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center hover:bg-slate-400 transition-colors">
                <X size={11} className="text-white" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category chips — gruppiert nach Berufskontext */}
      <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => selectCategory(null)}
          className={clsx(
            'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200',
            !activeCategory
              ? 'bg-forest-700 text-white shadow-sm shadow-forest-700/20'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 active:bg-slate-200'
          )}
        >
          Alle
        </button>
        {CATEGORY_CONTEXTS.map((ctx) => (
          <div key={ctx.id} className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider pl-1.5 pr-0.5">
              {ctx.label.split(' ')[0]}
            </span>
            {CATEGORIES.filter(cat => (ctx.topics as readonly string[]).includes(cat.id)).map(cat => (
              <button
                key={cat.id}
                onClick={() => selectCategory(activeCategory === cat.id ? null : cat.id)}
                className={clsx(
                  'flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-forest-700 text-white shadow-sm shadow-forest-700/20'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 active:bg-slate-200'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </header>
  );
}
