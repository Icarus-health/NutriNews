'use client';

import { useState } from 'react';
import { Globe, ExternalLink, ChevronRight, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import type { NewsCard, EvidenceLevel } from '@/types/database';

interface Props {
  cards: NewsCard[];
}

function PracticeRelevanceDots({ score }: { score: number | null }) {
  if (!score) return null;
  const clamped = Math.min(5, Math.max(1, score));
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={clsx(
            'w-1 h-1 rounded-full',
            i <= clamped ? 'bg-sky-400' : 'bg-slate-300 dark:bg-slate-600'
          )}
        />
      ))}
    </div>
  );
}

export default function InternationalFeed({ cards }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (cards.length === 0) return null;

  const displayCards = expanded ? cards : cards.slice(0, 3);

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className="bg-gradient-to-br from-sky-50 to-indigo-50/50 dark:from-sky-950/20 dark:to-indigo-950/10 rounded-[20px] p-5 border border-sky-200/60 dark:border-sky-800/40">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <Globe size={16} className="text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100 leading-none">
              Internationale Perspektive
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {cards.length} Beitr{cards.length !== 1 ? 'äge' : 'ag'} &middot; WHO, Lancet, BMJ, FAO
            </p>
          </div>
        </div>

        {/* International cards */}
        <div className="space-y-2.5">
          {displayCards.map((card) => {
            const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];

            return (
              <div
                key={card.id}
                className="bg-white/70 dark:bg-slate-800/60 rounded-2xl px-4 py-3 border border-sky-100 dark:border-sky-800/30"
              >
                {/* Top row */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', evidence.color)}>
                    {evidence.icon} {evidence.label}
                  </span>
                  <PracticeRelevanceDots score={card.practice_relevance_score} />
                  <span className="ml-auto text-[10px] text-slate-400">{card.source_name}</span>
                </div>

                {/* Headline */}
                <p className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 leading-snug mb-1.5">
                  {card.headline}
                </p>

                {/* Therapist check (short) */}
                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                  {card.therapist_check}
                </p>

                {/* Relevanz für Deutschland */}
                {card.international_relevance_de && (
                  <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl px-3 py-2 mb-2 border border-sky-100 dark:border-sky-800/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-0.5">
                      Relevanz für Deutschland
                    </p>
                    <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {card.international_relevance_de}
                    </p>
                  </div>
                )}

                {/* Source link */}
                <div className="flex items-center justify-end">
                  <a
                    href={card.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors"
                  >
                    Quelle <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more / less */}
        {cards.length > 3 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-[12px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
          >
            {expanded ? 'Weniger anzeigen' : `Alle ${cards.length} Beiträge`}
            <ChevronRight size={13} className={clsx('transition-transform', expanded && 'rotate-90')} />
          </button>
        )}
      </div>
    </div>
  );
}
