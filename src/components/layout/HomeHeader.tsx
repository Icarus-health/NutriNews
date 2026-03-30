'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES } from '@/lib/categories';
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
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 safe-top">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center">
            <img src="/icon.svg" alt="" className="w-5 h-5" />
          </div>
          <span className="font-bold text-forest-800 text-lg">Nutri News</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(s => !s)}
            className={clsx('p-1.5 rounded-lg transition-colors', showSearch ? 'bg-forest-100 text-forest-700' : 'text-slate-400 hover:text-slate-600')}
          >
            <Search size={20} />
          </button>
          {user && (
            <span className="text-xs text-slate-400">{user.email?.split('@')[0]}</span>
          )}
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="News durchsuchen..."
              value={query}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:bg-white"
            />
            {query && (
              <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category chips - horizontally scrollable */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => selectCategory(null)}
          className={clsx(
            'flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
            !activeCategory ? 'bg-forest-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          Alle
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => selectCategory(activeCategory === cat.id ? null : cat.id)}
            className={clsx(
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap',
              activeCategory === cat.id ? 'bg-forest-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  );
}
