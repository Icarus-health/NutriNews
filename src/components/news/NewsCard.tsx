'use client';

import { useState, useTransition } from 'react';
import { Heart, Bookmark, Send, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { getCategoryStyle } from '@/lib/categories';
import { toggleLike, toggleBookmark } from '@/lib/actions/news';
import type { EvidenceLevel, NewsCard as NewsCardType } from '@/types/database';

interface Props {
  card: NewsCardType;
  userId: string | null;
  onRequireAuth?: () => void;
  onShare?: (cardId: string) => void;
}

export default function NewsCard({ card, userId, onRequireAuth, onShare }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(card.user_has_liked ?? false);
  const [likeCount, setLikeCount] = useState(card.like_count ?? 0);
  const [bookmarked, setBookmarked] = useState(card.user_has_bookmarked ?? false);
  const [isPending, startTransition] = useTransition();

  const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];
  const readMin = Math.ceil((card.read_time_sec ?? 45) / 60);

  function handleLike() {
    if (!userId) { onRequireAuth?.(); return; }
    // Optimistic update
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    startTransition(async () => {
      const result = await toggleLike(card.id);
      if (result.error) {
        // Revert on error
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
      }
    });
  }

  function handleBookmark() {
    if (!userId) { onRequireAuth?.(); return; }
    setBookmarked(prev => !prev);
    startTransition(async () => {
      const result = await toggleBookmark(card.id);
      if (result.error) {
        setBookmarked(prev => !prev);
      }
    });
  }

  async function handleShare() {
    if (!userId) { onRequireAuth?.(); return; }

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.headline,
          text: `${card.headline}\n\n${card.therapist_check}`,
          url: card.source_url,
        });
        return;
      } catch {
        // User cancelled or not supported - fall through to in-app share
      }
    }

    // In-app share modal
    onShare?.(card.id);
  }

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-3 tap-highlight">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', getCategoryStyle(card.category_main))}>
            {card.category_main}
          </span>
          <div className="flex items-center gap-2">
            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', evidence.color)}>
              {evidence.icon} {evidence.label}
            </span>
            <span className="text-xs text-slate-400">{readMin} Min</span>
          </div>
        </div>
        <h2 className="font-bold text-slate-900 text-base leading-snug">{card.headline}</h2>
      </div>

      <div className="px-4 py-2">
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1 text-xs text-forest-700 font-semibold mb-2"
        >
          {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          {expanded ? 'Weniger' : 'Details'}
        </button>
        {expanded && (
          <ul className="space-y-1.5 mb-3 animate-fade-in">
            <li className="text-sm text-slate-700"><span className="font-semibold">Was?</span> {card.snack_what}</li>
            <li className="text-sm text-slate-700"><span className="font-semibold">Ergebnis:</span> {card.snack_result}</li>
            <li className="text-sm text-slate-700"><span className="font-semibold">Konsequenz:</span> {card.snack_consequence}</li>
          </ul>
        )}
        <div className="bg-forest-50 border border-forest-200 rounded-xl px-3 py-2">
          <p className="text-xs text-forest-800 font-medium">Therapist-Check</p>
          <p className="text-sm text-forest-900 mt-0.5">{card.therapist_check}</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <button
          onClick={handleLike}
          disabled={isPending}
          className={clsx('flex items-center gap-1.5 text-sm transition-colors', liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400')}
        >
          <Heart size={18} fill={liked ? 'currentColor' : 'none'}/>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={handleBookmark}
          disabled={isPending}
          className={clsx('flex items-center gap-1.5 text-sm transition-colors', bookmarked ? 'text-forest-600' : 'text-slate-400 hover:text-forest-500')}
        >
          <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'}/>
        </button>
        <button
          onClick={handleShare}
          className="text-slate-400 hover:text-forest-500 transition-colors"
        >
          <Send size={18}/>
        </button>
        <a
          href={card.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-forest-500 transition-colors"
        >
          <ExternalLink size={18}/>
        </a>
      </div>
    </article>
  );
}
