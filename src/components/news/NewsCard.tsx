'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Heart, Bookmark, Send, ExternalLink, MessageCircle, RotateCcw, ChevronRight, Link2 } from 'lucide-react';
import CommentSection from './CommentSection';
import { clsx } from 'clsx';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { getCategoryStyle, getCategoryLabel } from '@/lib/categories';
import { toggleLike, toggleBookmark } from '@/lib/actions/news';
import { useUX } from '@/components/providers/UXProvider';
import type { EvidenceLevel, NewsCard as NewsCardType, SourceType } from '@/types/database';

interface Props {
  card: NewsCardType;
  userId: string | null;
  onRequireAuth?: () => void;
  onShare?: (cardId: string) => void;
}

const SOURCE_TYPE_ACCENT: Record<string, { color: string; label: string; emoji: string }> = {
  forschung:     { color: 'from-blue-500 to-indigo-500',   label: 'Forschung',      emoji: '🔬' },
  fachpresse:    { color: 'from-forest-500 to-emerald-500', label: 'Fachpresse',     emoji: '📋' },
  laienpresse:   { color: 'from-amber-400 to-orange-500',  label: 'Laienpresse',    emoji: '📰' },
  berufspolitik: { color: 'from-orange-500 to-red-500',    label: 'Berufspolitik',  emoji: '⚖️' },
  supplement:    { color: 'from-emerald-400 to-teal-500',  label: 'Supplements',    emoji: '💊' },
  international: { color: 'from-sky-400 to-blue-500',      label: 'International',  emoji: '🌍' },
};

const THERAPIST_CHECK_LABELS: Record<string, string> = {
  fachpresse: 'Therapist-Check',
  forschung: 'Was ändert sich in der Beratung?',
  laienpresse: 'Fachliche Einordnung',
  berufspolitik: 'Was bedeutet das für meine Arbeit?',
  supplement: 'Evidenz-Check',
  international: 'Relevanz für Deutschland',
};

export default function NewsCard({ card, userId, onRequireAuth, onShare }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(card.user_has_liked ?? false);
  const [likeCount, setLikeCount] = useState(card.like_count ?? 0);
  const [bookmarked, setBookmarked] = useState(card.user_has_bookmarked ?? false);
  const [isPending, startTransition] = useTransition();
  const [backHeight, setBackHeight] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const ux = useUX();
  const isRead = ux.readHistory.some(e => e.cardId === card.id);

  const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];
  const readMin = Math.ceil((card.read_time_sec ?? 45) / 60);
  const isLayPress = card.source_type === 'laienpresse';
  const accent = SOURCE_TYPE_ACCENT[card.source_type] ?? SOURCE_TYPE_ACCENT.forschung;

  useEffect(() => {
    if (backRef.current) {
      setBackHeight(backRef.current.scrollHeight);
    }
  }, [flipped, showComments]);

  const frontHeight = frontRef.current?.scrollHeight ?? 0;
  const cardHeight = flipped ? (backHeight ?? frontHeight) : frontHeight;

  function getCardUrl() {
    if (typeof window === 'undefined') return `/card/${card.id}`;
    return `${window.location.origin}/card/${card.id}`;
  }

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
    if (!userId) {
      setBookmarked(prev => {
        const next = !prev;
        try {
          const stored = JSON.parse(localStorage.getItem('nn-bookmarks') || '[]') as string[];
          if (next) {
            localStorage.setItem('nn-bookmarks', JSON.stringify([...stored, card.id]));
          } else {
            localStorage.setItem('nn-bookmarks', JSON.stringify(stored.filter(id => id !== card.id)));
          }
        } catch { /* ignore */ }
        return next;
      });
      return;
    }
    setBookmarked(prev => !prev);
    startTransition(async () => {
      const result = await toggleBookmark(card.id);
      if (result.error) {
        setBookmarked(prev => !prev);
      }
    });
  }

  async function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(getCardUrl());
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* ignore */ }
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const cardUrl = getCardUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: card.headline, text: card.therapist_check, url: cardUrl });
        return;
      } catch { /* fall through */ }
    }
    if (userId) {
      onShare?.(card.id);
    } else {
      handleCopyLink(e);
    }
  }

  return (
    <div className="flip-card mb-3">
      <div
        className={clsx('flip-card-inner', flipped && 'flipped')}
        style={{ height: cardHeight || 'auto', transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), height 0.4s ease' }}
      >
        {/* ═══ FRONT ═══ */}
        <div ref={frontRef} className="flip-card-front">
          <article
            className={clsx(
              'rounded-2xl shadow-sm border overflow-hidden cursor-pointer active:scale-[0.985] transition-transform duration-150',
              isRead
                ? 'bg-white/80 dark:bg-slate-800/70 border-slate-100/60 dark:border-slate-700/50 opacity-85'
                : 'bg-white dark:bg-slate-800 border-slate-100/60 dark:border-slate-700/60'
            )}
            onClick={() => {
              setFlipped(true);
              ux.markAsRead(card.id, card.headline, card.category_main);
            }}
          >
            {/* Source-type accent strip */}
            <div className={clsx('h-1 bg-gradient-to-r', accent.color)} />

            {/* Header: Source type + Evidence + Time */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px]">{accent.emoji}</span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {accent.label}
                </span>
                <span className="text-[10px] text-slate-300 dark:text-slate-600">&middot;</span>
                <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full', evidence.color)}>
                  {evidence.icon} {evidence.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 tabular-nums">{readMin} Min</span>
            </div>

            {/* Category badge */}
            <div className="px-4 pt-1 pb-1">
              <span className={clsx(
                'text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full inline-block',
                getCategoryStyle(card.category_main)
              )}>
                {getCategoryLabel(card.category_main)}
              </span>
            </div>

            {/* Headline — bigger, bolder */}
            <div className="px-4 pt-1.5 pb-2">
              <h2 className="font-bold text-[16px] leading-snug text-slate-900 dark:text-slate-100 tracking-[-0.01em] line-clamp-3">
                {card.headline}
              </h2>
            </div>

            {/* Therapist-Check — compact */}
            <div className="mx-4 mb-3 bg-forest-50/60 dark:bg-forest-900/15 rounded-xl px-3.5 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400 mb-0.5">
                {THERAPIST_CHECK_LABELS[card.source_type] ?? 'Therapist-Check'}
              </p>
              <p className="text-[13px] leading-relaxed text-forest-900 dark:text-forest-100 line-clamp-3">
                {card.therapist_check}
              </p>
            </div>

            {/* Laienpresse: Fact-Check (compact) */}
            {isLayPress && card.lay_press_fact_check && (
              <div className="mx-4 mb-3 bg-amber-50/60 dark:bg-amber-900/15 rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
                  Faktencheck
                </p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-2">
                  {card.lay_press_fact_check}
                </p>
              </div>
            )}

            {/* Tap hint */}
            <div className="flex items-center justify-end px-4 pb-1.5">
              <span className="flex items-center gap-1 text-[11px] text-forest-600 dark:text-forest-400 font-medium">
                Details <ChevronRight size={12} strokeWidth={2.5} />
              </span>
            </div>

            {/* ── Instagram-style action bar ── */}
            <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-100/80 dark:border-slate-700/60">
              <button
                onClick={handleLike}
                disabled={isPending}
                className={clsx(
                  'flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-all',
                  liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400'
                )}
              >
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
                {likeCount > 0 && <span className="text-[11px]">{likeCount}</span>}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowComments(p => !p); }}
                className={clsx(
                  'flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-all',
                  showComments ? 'text-forest-600 dark:text-forest-400' : 'text-slate-400 hover:text-forest-500'
                )}
              >
                <MessageCircle size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-forest-500 px-2.5 py-1.5 rounded-lg transition-all"
              >
                <Send size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleCopyLink}
                className={clsx(
                  'flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-all',
                  linkCopied ? 'text-forest-600' : 'text-slate-400 hover:text-forest-500'
                )}
              >
                <Link2 size={18} strokeWidth={1.5} />
                {linkCopied && <span className="text-[10px]">Kopiert</span>}
              </button>
              {/* Bookmark pushed to right */}
              <div className="ml-auto">
                <button
                  onClick={handleBookmark}
                  disabled={isPending}
                  className={clsx(
                    'flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-all',
                    bookmarked ? 'text-forest-600 dark:text-forest-400' : 'text-slate-400 hover:text-forest-500'
                  )}
                >
                  <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 0 : 1.5} />
                </button>
              </div>
            </div>

            {/* Comments */}
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
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100/60 dark:border-slate-700/60 overflow-hidden cursor-pointer"
            onClick={() => setFlipped(false)}
          >
            {/* Accent strip */}
            <div className={clsx('h-1 bg-gradient-to-r', accent.color)} />

            {/* Back header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full',
                  getCategoryStyle(card.category_main)
                )}>
                  {getCategoryLabel(card.category_main)}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                className="flex items-center gap-1 text-[12px] text-forest-600 dark:text-forest-400 font-semibold"
              >
                <RotateCcw size={13} />
                Zurück
              </button>
            </div>

            {/* Headline (smaller on back) */}
            <div className="px-4 pb-3">
              <h3 className="font-semibold text-[14px] leading-snug text-slate-700 dark:text-slate-200">
                {card.headline}
              </h3>
            </div>

            {/* Detail fields */}
            <div className="px-4 space-y-2.5 pb-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Was?</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.snack_what}</p>
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Ergebnis</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.snack_result}</p>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl px-3.5 py-2.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-0.5">Konsequenz</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.snack_consequence}</p>
              </div>

              {card.evidence_summary && (
                <div className="bg-indigo-50/60 dark:bg-indigo-900/20 rounded-xl px-3.5 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">
                    {evidence.icon} Evidenz-Einordnung
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.evidence_summary}</p>
                </div>
              )}

              {card.action_recommendation && (
                <div className="bg-forest-50/60 dark:bg-forest-900/20 rounded-xl px-3.5 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-forest-500 dark:text-forest-400 mb-0.5">Handlungsempfehlung</p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.action_recommendation}</p>
                </div>
              )}

              {card.patient_question_anticipation && (
                <div className="bg-rose-50/60 dark:bg-rose-900/20 rounded-xl px-3.5 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-0.5">Erwartbare Patientenfrage</p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 italic">
                    &ldquo;{card.patient_question_anticipation}&rdquo;
                  </p>
                </div>
              )}

              {card.policy_action_needed && (
                <div className="bg-orange-50/60 dark:bg-orange-900/20 rounded-xl px-3.5 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-0.5">Was ist zu tun?</p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.policy_action_needed}</p>
                </div>
              )}

              {card.international_relevance_de && (
                <div className="bg-sky-50/60 dark:bg-sky-900/20 rounded-xl px-3.5 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-0.5">Relevanz für Deutschland</p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.international_relevance_de}</p>
                </div>
              )}

              {card.curated_by_agent && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    KI-zusammengefasst
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-slate-500">{card.source_name}</span>
                </div>
              )}
            </div>

            {/* Bibliographic references */}
            {(card.doi || card.pubmed_id) && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {card.doi && (
                  <a href={`https://doi.org/${card.doi}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                    DOI: {card.doi}
                  </a>
                )}
                {card.pubmed_id && (
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${card.pubmed_id}/`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors">
                    PubMed: {card.pubmed_id}
                  </a>
                )}
              </div>
            )}

            {/* Source footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', evidence.color)}>
                  {evidence.icon} {evidence.label}
                </span>
                <span className="text-[10px] text-slate-400">{readMin} Min</span>
              </div>
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[12px] text-forest-600 dark:text-forest-400 font-semibold"
              >
                Quelle <ExternalLink size={12} />
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
