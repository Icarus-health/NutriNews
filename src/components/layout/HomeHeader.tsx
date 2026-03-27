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

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value || null;
    setSelectedCat(val);
    onCategoryChange?.(val);
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-sm">
            🐦
          </div>
          <span className="font-bold text-forest-800 text-lg">Nutri News</span>
        </div>
        {user && (
          <span className="text-xs text-slate-400">👋 {user.email?.split('@')[0]}</span>
        )}
      </div>
      <select
        value={selectedCat ?? ''}
        onChange={handleChange}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-forest-500"
      >
        <option value="">Alle Kategorien</option>
        {CATEGORIES.map(c => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
    </header>
  );
}
