'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/categories';
import type { User } from '@supabase/supabase-js';

interface Props {
  user: User | null;
  onCategoryChange?: (cat: string | null) => void;
}

export default function HomeHeader({ user, onCategoryChange }: Props) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  function handleSelect(id: string | null) {
    setSelectedCat(id);
    onCategoryChange?.(id);
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #B8960C 0%, #236829 100%)' }}>
            <span className="text-sm">🐦</span>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">NutriNews</span>
        </div>
        {user && (
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gold-100 border border-gold-300 flex items-center justify-center text-xs font-bold text-gold-700">
              {user.email?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => handleSelect(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedCat === null
              ? 'bg-forest-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Alle
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => handleSelect(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCat === c.id
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </header>
  );
}
