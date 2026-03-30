'use client';

import { useState } from 'react';
import { Landmark, AlertTriangle, Eye, Info, ChevronRight, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { getCategoryStyle, getCategoryLabel } from '@/lib/categories';
import type { NewsCard, EvidenceLevel, PolicyImpactLevel } from '@/types/database';

interface Props {
  cards: NewsCard[];
}

const IMPACT_CONFIG: Record<PolicyImpactLevel, { label: string; icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  handeln: {
    label: 'Handeln',
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  beobachten: {
    label: 'Beobachten',
    icon: Eye,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  },
  info: {
    label: 'Info',
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
};

function PolicyImpactBadge({ level }: { level: PolicyImpactLevel }) {
  const config = IMPACT_CONFIG[level];
  const Icon = config.icon;
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border', config.bgColor, config.color)}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

export default function BerufspolitikMonitor({ cards }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (cards.length === 0) return null;

  // Sort: handeln first, then beobachten, then info
  const sortedCards = [...cards].sort((a, b) => {
    const order: Record<string, number> = { handeln: 0, beobachten: 1, info: 2 };
    return (order[a.policy_impact ?? 'info'] ?? 2) - (order[b.policy_impact ?? 'info'] ?? 2);
  });

  const displayCards = expanded ? sortedCards : sortedCards.slice(0, 3);
  const hasHandeln = sortedCards.some(c => c.policy_impact === 'handeln');

  return (
    <div className="mx-4 mt-4 mb-2">
      <div className={clsx(
        'rounded-[20px] p-5 border',
        hasHandeln
          ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 border-red-200/60 dark:border-red-800/40'
          : 'bg-gradient-to-br from-slate-50 to-orange-50/50 dark:from-slate-800 dark:to-orange-950/10 border-slate-200/60 dark:border-slate-700/60'
      )}>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center',
            hasHandeln ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
          )}>
            <Landmark size={16} className={hasHandeln ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'} />
          </div>
          <div>
            <h2 className="font-bold text-[15px] text-slate-900 dark:text-slate-100 leading-none">
              Berufspolitik-Monitor
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {cards.length} Meldung{cards.length !== 1 ? 'en' : ''} &middot; G-BA, Leitlinien, Recht
            </p>
          </div>
          {hasHandeln && (
            <span className="ml-auto text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full animate-pulse">
              Handlungsbedarf
            </span>
          )}
        </div>

        {/* Policy cards */}
        <div className="space-y-2.5">
          {displayCards.map((card) => {
            const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];
            const impact = (card.policy_impact as PolicyImpactLevel) ?? 'info';

            return (
              <div
                key={card.id}
                className={clsx(
                  'rounded-2xl px-4 py-3 border transition-colors',
                  IMPACT_CONFIG[impact].bgColor
                )}
              >
                {/* Top row */}
                <div className="flex items-center gap-2 mb-1.5">
                  <PolicyImpactBadge level={impact} />
                  <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', evidence.color)}>
                    {evidence.icon} {evidence.label}
                  </span>
                </div>

                {/* Headline */}
                <p className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 leading-snug mb-1.5">
                  {card.headline}
                </p>

                {/* Therapist check */}
                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                  {card.therapist_check}
                </p>

                {/* Action needed */}
                {card.policy_action_needed && (
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl px-3 py-2 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 mb-0.5">
                      Was ist zu tun?
                    </p>
                    <p className="text-[12px] text-slate-700 dark:text-slate-300">{card.policy_action_needed}</p>
                  </div>
                )}

                {/* Source + link */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{card.source_name}</span>
                  <a
                    href={card.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition-colors"
                  >
                    Details <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more / less */}
        {sortedCards.length > 3 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mt-3 w-full flex items-center justify-center gap-1 text-[12px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            {expanded ? 'Weniger anzeigen' : `Alle ${sortedCards.length} Meldungen`}
            <ChevronRight size={13} className={clsx('transition-transform', expanded && 'rotate-90')} />
          </button>
        )}
      </div>
    </div>
  );
}
