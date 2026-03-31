'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Heart, Bookmark, BookmarkPlus, Send, ExternalLink, MessageCircle, RotateCcw, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import CommentSection from './CommentSection';
import CardVerification from './CardVerification';
import { clsx } from 'clsx';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { getCategoryStyle, getCategoryLabel } from '@/lib/categories';
import { toggleLike, toggleBookmark } from '@/lib/actions/news';
import { useUX } from '@/components/providers/UXProvider';
import type { EvidenceLevel, NewsCard as NewsCardType } from '@/types/database';

interface Props {
  card: NewsCardType;
  userId: string | null;
  onRequireAuth?: () => void;
  onShare?: (cardId: string) => void;
}

const RELEVANCE_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Theoretisch', color: 'text-slate-400' },
  2: { label: 'Hintergrund', color: 'text-slate-500' },
  3: { label: 'Relevant', color: 'text-amber-600 dark:text-amber-400' },
  4: { label: 'Praxisnah', color: 'text-forest-600 dark:text-forest-400' },
  5: { label: 'Sofort umsetzbar', color: 'text-forest-700 dark:text-forest-300 font-semibold' },
};

function PracticeRelevanceIndicator({ score }: { score: number | null }) {
  if (!score) return null;
  const clamped = Math.min(5, Math.max(1, score));
  const meta = RELEVANCE_LABELS[clamped];
  return (
    <div
      className="flex items-center gap-1"
      title={`Praxisrelevanz ${clamped}/5: ${meta.label}`}
    >
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className={clsx(
            'w-1.5 h-1.5 rounded-full transition-colors',
            i <= clamped
              ? clamped >= 4 ? 'bg-forest-500' : clamped === 3 ? 'bg-amber-400' : 'bg-slate-400'
              : 'bg-slate-200 dark:bg-slate-600'
          )}
        />
      ))}
      <span className={clsx('text-[10px] ml-0.5', meta.color)}>{meta.label}</span>
    </div>
  );
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
  const ux = useUX();
  const inReadLater = ux.isInReadLater(card.id);
  const isRead = ux.readHistory.some(e => e.cardId === card.id);

  const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];
  const readMin = Math.ceil((card.read_time_sec ?? 45) / 60);
  const isLayPress = card.source_type === 'laienpresse';

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
            className={clsx(
              'rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border overflow-hidden cursor-pointer active:scale-[0.985] transition-transform duration-150',
              isLayPress
                ? 'bg-amber-50/50 border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800/40'
                : isRead
                  ? 'bg-slate-50/80 border-slate-100/60 dark:bg-slate-800/70 dark:border-slate-700/50 opacity-90'
                  : 'bg-white border-slate-100/60 dark:bg-slate-800 dark:border-slate-700/60'
            )}
            onClick={() => {
              setFlipped(true);
              ux.markAsRead(card.id, card.headline, card.category_main);
            }}
          >
            {/* Laienpresse-Label */}
            {isLayPress && (
              <div className="bg-amber-100 dark:bg-amber-900/40 px-5 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                  📰 Was Ihre Patienten gerade lesen
                </span>
              </div>
            )}

            {/* Category + Evidence + Praxisrelevanz bar */}
            <div className="flex items-center justify-between px-5 pt-4 pb-1">
              <span className={clsx(
                'text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full',
                getCategoryStyle(card.category_main)
              )}>
                {getCategoryLabel(card.category_main)}
              </span>
              <div className="flex items-center gap-2">
                <PracticeRelevanceIndicator score={card.practice_relevance_score} />
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
              <h2 className="font-semibold text-[15px] leading-snug text-slate-900 dark:text-slate-100 tracking-[-0.01em]">
                {card.headline}
              </h2>
            </div>

            {/* Laienpresse: Fact-Check Gegenüberstellung */}
            {isLayPress && card.lay_press_fact_check && (
              <div className="mx-5 mb-3 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-amber-200 dark:border-amber-700/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                  Faktencheck
                </p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
                  {card.lay_press_fact_check}
                </p>
              </div>
            )}

            {/* Therapist-Check */}
            <div className={clsx(
              'mx-5 mb-4 rounded-2xl px-4 py-3 border',
              isLayPress ? 'bg-forest-50/50 border-forest-100 dark:bg-forest-900/20 dark:border-forest-800/40' : 'bg-forest-50/70 border-forest-100 dark:bg-forest-900/20 dark:border-forest-800/40'
            )}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400 mb-1">
                Therapist-Check
              </p>
              <p className="text-[13px] leading-relaxed text-forest-900 dark:text-forest-100">
                {card.therapist_check}
              </p>
            </div>

            {/* Flip hint + read indicator */}
            <div className="flex items-center justify-between px-5 pb-2">
              {isRead ? (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <CheckCircle2 size={13} className="text-forest-400 dark:text-forest-500" />
                  Gelesen
                </span>
              ) : (
                <span />
              )}
              <span className="flex items-center gap-1 text-[11px] text-forest-600 dark:text-forest-400 font-medium bg-forest-50 dark:bg-forest-900/30 px-3 py-1 rounded-full border border-forest-100 dark:border-forest-800/40">
                Details
                <ChevronRight size={13} strokeWidth={2.5} />
              </span>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100/80 dark:border-slate-700/60">
              <button
                onClick={handleLike}
                disabled={isPending}
                title={liked ? 'Gefällt mir entfernen' : 'Gefällt mir'}
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium transition-all duration-200 px-2 py-1 rounded-lg',
                  liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                )}
              >
                <Heart size={15} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 1.5} />
                <span>{likeCount > 0 ? likeCount : ''}</span>
              </button>
              <button
                onClick={handleBookmark}
                disabled={isPending}
                title={bookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen setzen'}
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium transition-all duration-200 px-2 py-1 rounded-lg',
                  bookmarked
                    ? 'text-forest-600 dark:text-forest-400'
                    : 'text-slate-400 hover:text-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20'
                )}
              >
                <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} strokeWidth={bookmarked ? 0 : 1.5} />
                <span className="hidden xs:inline">{bookmarked ? 'Gespeichert' : 'Speichern'}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); ux.toggleReadLater(card.id); }}
                title={inReadLater ? 'Aus Leseliste entfernen' : 'Für später merken'}
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium transition-all duration-200 px-2 py-1 rounded-lg',
                  inReadLater
                    ? 'text-amber-500'
                    : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                )}
              >
                <Clock size={15} fill={inReadLater ? 'currentColor' : 'none'} strokeWidth={inReadLater ? 0 : 1.5} />
                <span className="hidden xs:inline">{inReadLater ? 'Merkliste' : 'Später'}</span>
              </button>
              <button
                onClick={handleCommentToggle}
                title="Kommentare"
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium transition-colors px-2 py-1 rounded-lg',
                  showComments
                    ? 'text-forest-600 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/20'
                    : 'text-slate-400 hover:text-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20'
                )}
              >
                <MessageCircle size={15} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleShare}
                title="Kollegen teilen"
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-forest-500 hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-colors px-2 py-1 rounded-lg"
              >
                <Send size={15} strokeWidth={1.5} />
              </button>
              <span className="text-[10px] text-slate-300 dark:text-slate-500 tabular-nums">
                {readMin} Min
              </span>
            </div>

            {/* Community verification */}
            <CardVerification
              newsCardId={card.id}
              userId={userId}
              counts={{ praxisrelevant: 0, fachlich_korrekt: 0, korrektur_noetig: 0, quelle_zweifelhaft: 0 }}
              onRequireAuth={onRequireAuth}
            />

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
            className="bg-white dark:bg-slate-800 rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 dark:border-slate-700/60 overflow-hidden cursor-pointer"
            onClick={() => setFlipped(false)}
          >
            {/* Back header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full',
                  getCategoryStyle(card.category_main)
                )}>
                  {getCategoryLabel(card.category_main)}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Details</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                className="flex items-center gap-1 text-[12px] text-forest-600 dark:text-forest-400 font-semibold hover:text-forest-700 dark:hover:text-forest-300 transition-colors"
              >
                <RotateCcw size={13} />
                Zurück
              </button>
            </div>

            {/* Headline (smaller on back) */}
            <div className="px-5 pb-3">
              <h3 className="font-semibold text-[14px] leading-snug text-slate-700 dark:text-slate-200">
                {card.headline}
              </h3>
            </div>

            {/* Detail fields */}
            <div className="px-5 space-y-3 pb-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Was?</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.snack_what}</p>
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Ergebnis</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.snack_result}</p>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-2xl px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1">Konsequenz</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.snack_consequence}</p>
              </div>

              {/* Evidenz-Einordnung (NEU) */}
              {card.evidence_summary && (
                <div className="bg-indigo-50/60 dark:bg-indigo-900/20 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">
                    {evidence.icon} Evidenz-Einordnung
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.evidence_summary}</p>
                </div>
              )}

              {/* Handlungsempfehlung (NEU) */}
              {card.action_recommendation && (
                <div className="bg-forest-50/60 dark:bg-forest-900/20 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-forest-500 dark:text-forest-400 mb-1">
                    Handlungsempfehlung
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.action_recommendation}</p>
                </div>
              )}

              {/* Patientenfrage (NEU) */}
              {card.patient_question_anticipation && (
                <div className="bg-rose-50/60 dark:bg-rose-900/20 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">
                    Erwartbare Patientenfrage
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 italic">
                    &ldquo;{card.patient_question_anticipation}&rdquo;
                  </p>
                </div>
              )}

              {/* Berufspolitik: Handlungsbedarf */}
              {card.policy_action_needed && (
                <div className="bg-orange-50/60 dark:bg-orange-900/20 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-1">
                    Was ist zu tun?
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.policy_action_needed}</p>
                </div>
              )}

              {/* International: Relevanz für DE */}
              {card.international_relevance_de && (
                <div className="bg-sky-50/60 dark:bg-sky-900/20 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-1">
                    Relevanz für Deutschland
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.international_relevance_de}</p>
                </div>
              )}

              {/* KI-Transparenz-Label */}
              {card.curated_by_agent && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    KI-zusammengefasst
                  </span>
                  <span className="text-[10px] text-slate-300 dark:text-slate-500">
                    {card.source_name}
                  </span>
                </div>
              )}
            </div>

            {/* Source + Evidence footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className={clsx('text-[11px] font-medium px-2.5 py-1 rounded-full', evidence.color)}>
                  {evidence.icon} {evidence.label}
                </span>
                <PracticeRelevanceIndicator score={card.practice_relevance_score} />
                <span className="text-[11px] text-slate-400">{readMin} Min</span>
              </div>
              <a
                href={card.source_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[12px] text-forest-600 dark:text-forest-400 font-semibold hover:text-forest-700 dark:hover:text-forest-300 transition-colors"
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
