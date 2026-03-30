'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Heart, Bookmark, Send, ExternalLink, MessageCircle, RotateCcw } from 'lucide-react';
import CommentSection from './CommentSection';
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
  const [flipped, setFlipped] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(card.user_has_liked ?? false);
  const [likeCount, setLikeCount] = useState(card.like_count ?? 0);
  const [bookmarked, setBookmarked] = useState(card.user_has_bookmarked ?? false);
  const [isPending, startTransition] = useTransition();
  const [backHeight, setBackHeight] = useState<number | null>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];
  const readMin = Math.ceil((card.read_time_sec ?? 45) / 60);

  // Measure back content to set card height when flipped
  useEffect(() => {
    if (backRef.current) {
      setBackHeight(backRef.current.scrollHeight);
    }
  }, [flipped, showComments]);

  const frontHeight = frontRef.current?.scrollHeight ?? 0;
  const cardHeight = flipped ? (backHeight ?? frontHeight) : frontHeight;

  function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    if (!userId) { onRequireAuth?.(); return; }
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    startTransition(async () => {
      const result = await toggleLike(card.id);
      if (result.error) {
        setLiked(prev => !prev);
        setLikeCount(prev => liked ? prev + 1 : prev - 1);
      }
    });
  }

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    if (!userId) { onRequireAuth?.(); return; }
    setBookmarked(prev => !prev);
    startTransition(async () => {
      const result = await toggleBookmark(card.id);
      if (result.error) {
        setBookmarked(prev => !prev);
      }
    });
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    if (!userId) { onRequireAuth?.(); return; }
    if (navigator.share) {
      try {
        await navigator.share({
          title: card.headline,
          text: `${card.headline}\n\n${card.therapist_check}`,
          url: card.source_url,
        });
        return;
      } catch { /* fall through */ }
    }
    onShare?.(card.id);
  }

  function handleCommentToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setShowComments(p => !p);
  }

  return (
    <div className="flip-card mb-4">
      <div
        className={clsx('flip-card-inner', flipped && 'flipped')}
        style={{ height: cardHeight || 'auto', transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), height 0.4s ease' }}
      >
        {/* ═══ FRONT ═══ */}
        <div ref={frontRef} className="flip-card-front">
          <article
            className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 overflow-hidden cursor-pointer active:scale-[0.985] transition-transform duration-150"
            onClick={() => setFlipped(true)}
          >
            {/* Category + Evidence bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-1">
              <span className={clsx(
                'text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full',
                getCategoryStyle(card.category_main)
              )}>
                {card.category_main}
              </span>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'text-[11px] font-medium px-2.5 py-1 rounded-full',
                  evidence.color
                )}>
                  {evidence.icon} {evidence.label}
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="px-5 pt-2 pb-3">
              <h2 className="font-semibold text-[15px] leading-snug text-slate-900 tracking-[-0.01em]">
                {card.headline}
              </h2>
            </div>

            {/* Therapist-Check */}
            <div className="mx-5 mb-4 bg-forest-50/70 rounded-2xl px-4 py-3 border border-forest-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-forest-600 mb-1">
                Therapist-Check
              </p>
              <p className="text-[13px] leading-relaxed text-forest-900">
                {card.therapist_check}
              </p>
            </div>

            {/* Flip hint */}
            <div className="flex items-center justify-center pb-2">
              <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                Antippen für Details
              </span>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/80">
              <button
                onClick={handleLike}
                disabled={isPending}
                className={clsx(
                  'flex items-center gap-1.5 text-[13px] font-medium transition-all duration-200',
                  liked ? 'text-red-500 scale-110' : 'text-slate-400 hover:text-red-400'
                )}
              >
                <Heart size={17} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={handleBookmark}
                disabled={isPending}
                className={clsx(
                  'transition-all duration-200',
                  bookmarked ? 'text-forest-600 scale-110' : 'text-slate-400 hover:text-forest-500'
                )}
              >
                <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 0 : 1.5} />
              </button>
              <button
                onClick={handleCommentToggle}
                className={clsx(
                  'transition-colors',
                  showComments ? 'text-forest-600' : 'text-slate-400 hover:text-forest-500'
                )}
              >
                <MessageCircle size={17} strokeWidth={1.5} />
              </button>
              <button onClick={handleShare} className="text-slate-400 hover:text-forest-500 transition-colors">
                <Send size={17} strokeWidth={1.5} />
              </button>
              <span className="text-[11px] text-slate-300 font-medium tabular-nums">{readMin} Min</span>
            </div>

            {/* Comments (front side, below card visually) */}
            {showComments && (
              <div className="animate-fade-in" onClick={e => e.stopPropagation()}>
                <CommentSection newsCardId={card.id} userId={userId} onRequireAuth={onRequireAuth} />
              </div>
            )}
          </article>
        </div>

        {/* ═══ BACK ═══ */}
        <div ref={backRef} className="flip-card-back">
          <article
            className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 overflow-hidden cursor-pointer"
            onClick={() => setFlipped(false)}
          >
            {/* Back header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full',
                  getCategoryStyle(card.category_main)
                )}>
                  {card.category_main}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Details</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                className="flex items-center gap-1 text-[12px] text-forest-600 font-semibold hover:text-forest-700 transition-colors"
              >
                <RotateCcw size={13} />
                Zurück
              </button>
            </div>

            {/* Headline (smaller on back) */}
            <div className="px-5 pb-3">
              <h3 className="font-semibold text-[14px] leading-snug text-slate-700">
                {card.headline}
              </h3>
            </div>

            {/* Detail fields */}
            <div className="px-5 space-y-3 pb-4">
              <div className="bg-slate-50 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Was?</p>
                <p className="text-[13px] leading-relaxed text-slate-800">{card.snack_what}</p>
              </div>

              <div className="bg-blue-50/60 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Ergebnis</p>
                <p className="text-[13px] leading-relaxed text-slate-800">{card.snack_result}</p>
              </div>

              <div className="bg-amber-50/60 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Konsequenz</p>
                <p className="text-[13px] leading-relaxed text-slate-800">{card.snack_consequence}</p>
              </div>
            </div>

            {/* Source + Evidence footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/80">
              <div className="flex items-center gap-2">
                <span className={clsx('text-[11px] font-medium px-2.5 py-1 rounded-full', evidence.color)}>
                  {evidence.icon} {evidence.label}
                </span>
                <span className="text-[11px] text-slate-400">{readMin} Min</span>
              </div>
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[12px] text-forest-600 font-semibold hover:text-forest-700 transition-colors"
              >
                Quelle
                <ExternalLink size={13} />
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
