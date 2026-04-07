'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface TopItem {
  id: string;
  headline: string;
  categoryStyle: string;
  categoryLabel: string;
  rank: number;
}

export default function TopOfWeekClient({ items }: { items: TopItem[] }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mx-4 mb-4 bg-gradient-to-br from-forest-50 to-emerald-50/50 dark:from-forest-900/20 dark:to-emerald-900/10 rounded-2xl border border-forest-100/60 dark:border-forest-800/30 overflow-hidden">
      <button
        onClick={() => setCollapsed(prev => !prev)}
        className="w-full flex items-center justify-between px-4 pt-3 pb-2 border-b border-forest-100/60 dark:border-forest-800/30"
      >
        <p className="text-[11px] font-black uppercase tracking-widest text-forest-600 dark:text-forest-400">
          🏆 Top der Woche
        </p>
        <ChevronDown
          size={16}
          className={clsx(
            'text-forest-500 dark:text-forest-400 transition-transform duration-200',
            collapsed && '-rotate-90'
          )}
        />
      </button>
      <div
        className={clsx(
          'transition-all duration-200 overflow-hidden',
          collapsed ? 'max-h-0' : 'max-h-[500px]'
        )}
      >
        <ol className="divide-y divide-forest-100/40 dark:divide-forest-800/20">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/card/${item.id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-forest-50/80 dark:hover:bg-forest-900/20 transition-colors"
              >
                <span className={clsx('flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5',
                  item.rank === 0 ? 'bg-amber-400 text-white' :
                  item.rank === 1 ? 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200' :
                  'bg-amber-700/60 text-white'
                )}>
                  {item.rank + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                    {item.headline}
                  </p>
                  <span className={clsx('inline-block mt-1 text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full', item.categoryStyle)}>
                    {item.categoryLabel}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
