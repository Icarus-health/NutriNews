'use client';

import { clsx } from 'clsx';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { getCategoryStyle, getCategoryLabel } from '@/lib/categories';
import type { BriefingItem, EvidenceLevel } from '@/types/database';
import { ExternalLink, Newspaper } from 'lucide-react';

interface Props {
  items: BriefingItem[];
  date: string;
  isYesterday?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function DailyBriefing({ items, date, isYesterday }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="bg-gradient-to-br from-forest-700 to-forest-800 rounded-[20px] p-5 shadow-lg shadow-forest-900/10">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <Newspaper size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-[15px] leading-none">
              {isYesterday ? 'Gestriges Briefing' : 'Dein Morgen-Briefing'}
            </h2>
            <p className="text-forest-200 text-[11px] mt-0.5">
              {formatDate(date)} &middot; {items.length} Meldungen
            </p>
          </div>
        </div>

        {/* Briefing items */}
        <div className="space-y-3">
          {items.map((item, i) => {
            const evidence = EVIDENCE_CONFIG[item.evidence_level as EvidenceLevel];
            return (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10"
              >
                {/* Top row: Category + Evidence */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={clsx(
                    'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full',
                    getCategoryStyle(item.category_main)
                  )}>
                    {getCategoryLabel(item.category_main)}
                  </span>
                  {evidence && (
                    <span className="text-[10px] text-forest-200">
                      {evidence.icon} {evidence.label}
                    </span>
                  )}
                  {/* Praxisrelevanz */}
                  <div className="flex items-center gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map(j => (
                      <div
                        key={j}
                        className={clsx(
                          'w-1 h-1 rounded-full',
                          j <= item.practice_relevance_score ? 'bg-emerald-300' : 'bg-white/20'
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Headline */}
                <p className="text-white font-semibold text-[13px] leading-snug mb-1">
                  {item.headline}
                </p>

                {/* Summary */}
                <p className="text-forest-100 text-[12px] leading-relaxed">
                  {item.summary}
                </p>

                {/* Source link */}
                {item.source_url && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-forest-300">
                      {item.source_name}
                    </span>
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-forest-200 hover:text-white transition-colors"
                    >
                      Quelle <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
