'use client';

import { useState, useTransition } from 'react';
import { Heart, Bookmark, Send, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { getCategoryStyle } from '@/lib/categories';
import type { EvidenceLevel, NewsCard as NewsCardType } from '@/types/database';
import { toggleLike, toggleBookmark } from '@/lib/actions';

interface Props {
  card: NewsCardType;
  userId: string | null;
  onRequireAuth?: () => void;
}

export default function NewsCard({ card, userId, onRequireAuth }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(card.user_has_liked ?? false);
  const [likeCount, setLikeCount] = useState(card.like_count ?? 0);
  const [bookmarked, setBookmarked] = useState(card.user_has_bookmarked ?? false);
  const [isPending, startTransition] = useTransition();

  const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];
  const readMin = Math.max(1, Math.ceil((card.read_time_sec ?? 60) / 60));

  function handleLike() {
    if (!userId) { onRequireAuth?.(); return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c + 1 : c - 1);
    startTransition(async () => {
      await toggleLike(card.id, newLiked);
    });
  }

  function handleBookmark() {
    if (!userId) { onRequireAuth?.(); return; }
    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);
    startTransition(async () => {
      await toggleBookmark(card.id, newBookmarked);
    });
  }

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-3 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', getCategoryStyle(card.category_main))}>
            {card.category_main}
          </span>
          <div className="flex items-center gap-2">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', evidence.color)}>
              {evidence.icon} {evidence.label}
            </span>
            <span className="text-xs text-slate-400">{readMin} Min</span>
          </div>
        </div>
        <h2 className="font-bold text-slate-900 text-[15px] leading-snug">{card.headline}</h2>
      </div>

      {/* Body */}
      <div className="px-4 py-2">
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1 text-xs text-forest-700 font-semibold mb-2 hover:text-forest-800 transition-colors"
        >
          {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          {expanded ? 'Weniger anzeigen' : 'Details anzeigen'}
        </button>

        {expanded && (
          <div className="space-y-2 mb-3">
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Was?</p>
              <p className="text-sm text-slate-800">{card.snack_what}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Ergebnis</p>
              <p className="text-sm text-slate-800">{card.snack_result}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Konsequenz</p>
              <p className="text-sm text-slate-800">{card.snack_consequence}</p>
            </div>
          </div>
        )}

        {/* Therapist Check */}
        <div className="bg-forest-50 border border-forest-200 rounded-xl px-3 py-2.5">
          <p className="text-xs text-forest-600 font-semibold uppercase tracking-wide mb-1">💡 Therapist-Check</p>
          <p className="text-sm text-forest-900 leading-relaxed">{card.therapist_check}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <button
          onClick={handleLike}
          disabled={isPending}
          className={clsx('flex items-center gap-1.5 text-sm font-medium transition-all active:scale-90',
            liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
          )}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.8}/>
          <span className="text-xs">{likeCount > 0 ? likeCount : ''}</span>
        </button>

        <button
          onClick={handleBookmark}
          disabled={isPending}
          className={clsx('transition-all active:scale-90',
            bookmarked ? 'text-gold-500' : 'text-slate-400 hover:text-gold-400'
          )}
        >
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 0 : 1.8}/>
        </button>

        <button
          onClick={() => { if (!userId) { onRequireAuth?.(); return; } }}
          className="text-slate-400 hover:text-forest-500 transition-colors active:scale-90"
        >
          <Send size={18} strokeWidth={1.8}/>
        </button>

        <a
          href={card.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-forest-500 transition-colors"
          title={card.source_name ?? 'Quelle öffnen'}
        >
          <ExternalLink size={18} strokeWidth={1.8}/>
        </a>
      </div>
    </article>
  );
}
