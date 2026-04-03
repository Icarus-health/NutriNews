'use client';

import { useState, useTransition, useRef, useEffect, useCallback, memo } from 'react';
import { useMinuteTick } from '@/hooks/useMinuteTick';
import dynamic from 'next/dynamic';
import { Heart, Bookmark, Send, ExternalLink, MessageCircle, RotateCcw, ChevronRight, Link2, PenLine, Printer, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

const CommentSection = dynamic(() => import('./CommentSection'), { ssr: false });
const CardVerification = dynamic(() => import('./CardVerification'), { ssr: false });
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { getCategoryStyle, getCategoryLabel } from '@/lib/categories';
import { toggleLike, toggleBookmark, upsertNote, getNote } from '@/lib/actions/news';
import { getCardVerifications } from '@/lib/actions/community';
import { useUX } from '@/components/providers/UXProvider';
import type { EvidenceLevel, NewsCard as NewsCardType, SourceType } from '@/types/database';

interface Props {
  card: NewsCardType;
  userId: string | null;
  onRequireAuth?: () => void;
  onShare?: (cardId: string) => void;
  defaultFlipped?: boolean;
}

const SOURCE_TYPE_ACCENT: Record<string, { gradient: string; bgLight: string; bgDark: string; label: string; emoji: string }> = {
  forschung:     { gradient: 'from-blue-500 to-indigo-500',    bgLight: 'bg-blue-50',    bgDark: 'dark:bg-blue-950/30',    label: 'Forschung',      emoji: '🔬' },
  fachpresse:    { gradient: 'from-forest-500 to-emerald-500', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/30', label: 'Fachpresse',     emoji: '📋' },
  laienpresse:   { gradient: 'from-amber-400 to-orange-500',   bgLight: 'bg-amber-50',   bgDark: 'dark:bg-amber-950/30',   label: 'Laienpresse',    emoji: '📰' },
  berufspolitik: { gradient: 'from-orange-500 to-red-500',     bgLight: 'bg-orange-50',  bgDark: 'dark:bg-orange-950/30',  label: 'Berufspolitik',  emoji: '⚖️' },
  supplement:    { gradient: 'from-emerald-400 to-teal-500',   bgLight: 'bg-teal-50',    bgDark: 'dark:bg-teal-950/30',    label: 'Supplements',    emoji: '💊' },
  international: { gradient: 'from-sky-400 to-blue-500',       bgLight: 'bg-sky-50',     bgDark: 'dark:bg-sky-950/30',     label: 'International',  emoji: '🌍' },
};

const THERAPIST_CHECK_LABELS: Record<string, string> = {
  fachpresse: 'Therapist-Check',
  forschung: 'Was ändert sich in der Beratung?',
  laienpresse: 'Fachliche Einordnung',
  berufspolitik: 'Was bedeutet das für meine Arbeit?',
  supplement: 'Evidenz-Check',
  international: 'Relevanz für Deutschland',
};

// Parst "MEDIEN: [...] → FACH: [...]" in zwei Teile
function parseFactCheck(text: string): { medien: string; fach: string } | null {
  const match = text.match(/MEDIEN:\s*([\s\S]+?)\s*→\s*FACH:\s*([\s\S]+)/);
  if (match) return { medien: match[1].trim(), fach: match[2].trim() };
  // Fallback: kein Split möglich
  return null;
}

/** Escapes a string for safe insertion into HTML attribute/content context */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade eben';
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
}

function NewsCard({ card, userId, onRequireAuth, onShare, defaultFlipped = false }: Props) {
  const [flipped, setFlipped] = useState(defaultFlipped);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(card.user_has_liked ?? false);
  const [likeCount, setLikeCount] = useState(card.like_count ?? 0);
  const [bookmarked, setBookmarked] = useState(card.user_has_bookmarked ?? false);
  const [isPending, startTransition] = useTransition();
  const [backHeight, setBackHeight] = useState<number | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [hasNote, setHasNote] = useState(false);
  const [verifications, setVerifications] = useState<{ praxisrelevant: number; fachlich_korrekt: number; korrektur_noetig: number; quelle_zweifelhaft: number } | null>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const swipeTouchStartX = useRef(0);
  const swipeTouchStartY = useRef(0);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ux = useUX();
  const isRead = ux.readHistory.some(e => e.cardId === card.id);
  const isNew = ux.isNewCard(card.published_at);
  const noteKey = `nn-note-${card.id}`;

  // Load note: localStorage first; if empty and user is logged in, try Supabase once
  useEffect(() => {
    let cancelled = false;
    try {
      const stored = localStorage.getItem(noteKey);
      if (stored) { setNote(stored); setHasNote(true); return; }
    } catch { /* ignore */ }
    if (userId) {
      getNote(card.id).then(remote => {
        if (cancelled || !remote) return;
        setNote(remote);
        setHasNote(true);
        try { localStorage.setItem(noteKey, remote); } catch { /* ignore */ }
      });
    }
    return () => { cancelled = true; };
  }, [noteKey, card.id, userId]);

  // Update relative time every 60s via shared singleton timer
  useMinuteTick();

  // Lazy-load verifications when card is first flipped
  useEffect(() => {
    if (flipped && verifications === null) {
      getCardVerifications(card.id).then(setVerifications);
    }
  }, [flipped, verifications, card.id]);

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
    vibrate(!liked ? [4, 1, 4] : 3);
    const wasLiked = liked;
    setLiked(prev => !prev);
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
    startTransition(async () => {
      const result = await toggleLike(card.id);
      if (result.error) {
        // Rollback using captured state
        setLiked(wasLiked);
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
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

  function vibrate(pattern: number | number[]) {
    try { navigator.vibrate(pattern); } catch { /* not supported */ }
  }

  function handleSwipeTouchStart(e: React.TouchEvent) {
    swipeTouchStartX.current = e.touches[0].clientX;
    swipeTouchStartY.current = e.touches[0].clientY;
  }

  function handleSwipeTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - swipeTouchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - swipeTouchStartY.current);
    if (Math.abs(dx) < 60 || dy > Math.abs(dx) * 0.75) return;
    if (!flipped && dx > 0) {
      vibrate(5);
      setFlipped(true);
      ux.markAsRead(card.id, card.headline, card.category_main);
    } else if (flipped && dx < 0) {
      vibrate(3);
      setFlipped(false);
    }
  }

  const handleNoteChange = useCallback((value: string) => {
    setNote(value);
    setHasNote(value.trim().length > 0);
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      // Persist to localStorage
      try {
        if (value.trim()) {
          localStorage.setItem(noteKey, value);
        } else {
          localStorage.removeItem(noteKey);
        }
      } catch { /* quota */ }
      // Sync to Supabase for cross-device access (only when logged in)
      if (userId) {
        upsertNote(card.id, value).catch(() => { /* non-blocking */ });
      }
    }, 1500);
  }, [noteKey, card.id, userId]);

  function handlePrint(e: React.MouseEvent) {
    e.stopPropagation();
    const noteHtml = note.trim()
      ? `<div style="margin-top:16px;padding:12px;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#b45309;margin:0 0 6px;">Meine Notiz</p>
          <p style="font-size:13px;color:#1e293b;white-space:pre-wrap;margin:0;">${escapeHtml(note)}</p>
        </div>`
      : '';
    const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${escapeHtml(card.headline)}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 24px;color:#1e293b}
    h1{font-size:20px;font-weight:700;line-height:1.3;margin:0 0 12px}
    .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin:0 0 4px}
    .box{background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:10px}
    .cat{display:inline-block;font-size:11px;font-weight:600;background:#f1f5f9;padding:2px 8px;border-radius:99px;margin-bottom:8px}
    .footer{font-size:10px;color:#94a3b8;margin-top:16px;padding-top:10px;border-top:1px solid #e2e8f0}
    @media print{body{margin:20px}}</style></head><body>
    <p class="cat">${escapeHtml(card.category_main)}</p>
    <h1>${escapeHtml(card.headline)}</h1>
    <div class="box"><p class="label">Therapist-Check</p><p style="font-size:13px;margin:0">${escapeHtml(card.therapist_check ?? '')}</p></div>
    <div class="box"><p class="label">Was?</p><p style="font-size:13px;margin:0">${escapeHtml(card.snack_what ?? '')}</p></div>
    <div class="box"><p class="label">Ergebnis</p><p style="font-size:13px;margin:0">${escapeHtml(card.snack_result ?? '')}</p></div>
    <div class="box"><p class="label">Konsequenz</p><p style="font-size:13px;margin:0">${escapeHtml(card.snack_consequence ?? '')}</p></div>
    ${card.action_recommendation ? `<div class="box"><p class="label">Handlungsempfehlung</p><p style="font-size:13px;margin:0">${escapeHtml(card.action_recommendation)}</p></div>` : ''}
    ${noteHtml}
    <div class="footer">Quelle: ${escapeHtml(card.source_name ?? '')} · NutriNews</div>
    <script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const cardUrl = getCardUrl();
    if (navigator.share) {
      try {
        const parts = [
          `${accent.emoji} ${card.headline}`,
          '',
          card.therapist_check ? `💡 ${card.therapist_check}` : '',
          card.snack_what ? `📌 ${card.snack_what}` : '',
          card.snack_result ? `📊 ${card.snack_result}` : '',
        ].filter(Boolean);
        await navigator.share({
          title: card.headline,
          text: parts.join('\n'),
          url: cardUrl,
        });
        vibrate(4);
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
    <div
      className="flip-card mb-4"
      onTouchStart={handleSwipeTouchStart}
      onTouchEnd={handleSwipeTouchEnd}
    >
      <div
        className={clsx('flip-card-inner', flipped && 'flipped')}
        style={{ height: cardHeight || 'auto', transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1), height 0.4s ease' }}
      >
        {/* ═══ FRONT ═══ */}
        <div ref={frontRef} className="flip-card-front">
          <article
            className={clsx(
              'rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)] border overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-200',
              isRead
                ? 'bg-white/80 dark:bg-slate-800/70 border-slate-100/40 dark:border-slate-700/40 opacity-80'
                : 'bg-white dark:bg-slate-800 border-slate-100/40 dark:border-slate-700/40'
            )}
            onClick={() => {
              vibrate(5);
              setFlipped(true);
              ux.markAsRead(card.id, card.headline, card.category_main);
            }}
          >
            {/* ── Visual hero header with gradient + decorative emoji ── */}
            <div className={clsx('relative px-4 pt-4 pb-3 overflow-hidden', accent.bgLight, accent.bgDark)}>
              {/* Decorative large emoji (background) */}
              <span className="absolute -right-2 -top-2 text-[72px] opacity-[0.08] select-none pointer-events-none leading-none">
                {accent.emoji}
              </span>
              {/* Gradient accent bar */}
              <div className={clsx('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', accent.gradient)} />

              {/* Source type + Evidence row */}
              <div className="relative flex items-center gap-2 mb-2.5">
                <span className="text-base">{accent.emoji}</span>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                  {accent.label}
                </span>
                <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full', evidence.color)}>
                  {evidence.icon} {evidence.label}
                </span>
                {isNew && !isRead && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 text-white px-1.5 py-0.5 rounded-full">
                    Neu
                  </span>
                )}
                {card.published_at && (
                  <span className="ml-auto text-[10px] text-slate-400 tabular-nums">
                    {formatTime(card.published_at)}
                  </span>
                )}
                {/* Hide card button */}
                <button
                  onClick={(e) => { e.stopPropagation(); ux.hideCard(card.id); }}
                  title="Nicht mehr anzeigen"
                  className="ml-1 p-1 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <EyeOff size={13} strokeWidth={1.5} />
                </button>
              </div>

              {/* Category badge */}
              <span className={clsx(
                'text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full inline-block',
                getCategoryStyle(card.category_main)
              )}>
                {getCategoryLabel(card.category_main)}
              </span>
            </div>

            {/* Headline */}
            <div className="px-4 pt-3 pb-2">
              <h2 className="font-bold text-[17px] leading-[1.3] text-slate-900 dark:text-slate-100 tracking-[-0.02em] line-clamp-4">
                {card.headline}
              </h2>
            </div>

            {/* Therapist-Check */}
            <div className="mx-4 mb-3 bg-forest-50/50 dark:bg-forest-900/10 rounded-2xl px-4 py-3 border border-forest-100/60 dark:border-forest-800/30">
              <p className="text-[10px] font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400 mb-1">
                {THERAPIST_CHECK_LABELS[card.source_type] ?? 'Therapist-Check'}
              </p>
              <p className="text-[13px] leading-relaxed text-forest-900 dark:text-forest-100 line-clamp-5">
                {card.therapist_check}
              </p>
            </div>

            {/* Laienpresse: Fact-Check — MEDIEN vs. FACH */}
            {isLayPress && card.lay_press_fact_check && (() => {
              const parsed = parseFactCheck(card.lay_press_fact_check);
              if (parsed) {
                return (
                  <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/40">
                    {/* MEDIEN-Teil */}
                    <div className="bg-amber-50/80 dark:bg-amber-900/20 px-4 py-2.5 flex gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0 w-12">Medien</span>
                      <p className="text-[12px] leading-relaxed text-amber-900 dark:text-amber-100 line-clamp-3 italic">
                        „{parsed.medien}"
                      </p>
                    </div>
                    {/* Trennlinie mit Pfeil */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 px-4 py-1">
                      <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600" />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Fachliche Einordnung ↓</span>
                      <div className="flex-1 h-px bg-slate-300 dark:bg-slate-600" />
                    </div>
                    {/* FACH-Teil */}
                    <div className="bg-forest-50/80 dark:bg-forest-900/20 px-4 py-2.5 flex gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-forest-600 dark:text-forest-400 mt-0.5 flex-shrink-0 w-12">Evidenz</span>
                      <p className="text-[12px] leading-relaxed text-forest-900 dark:text-forest-100 line-clamp-3">
                        {parsed.fach}
                      </p>
                    </div>
                  </div>
                );
              }
              // Fallback wenn Format nicht geparst werden kann
              return (
                <div className="mx-4 mb-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl px-4 py-3 border border-amber-200/60 dark:border-amber-800/30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                    Faktencheck
                  </p>
                  <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-3">
                    {card.lay_press_fact_check}
                  </p>
                </div>
              );
            })()}

            {/* Tap hint — prominent CTA */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-center gap-1.5 bg-forest-600 dark:bg-forest-700 hover:bg-forest-700 dark:hover:bg-forest-600 py-2.5 rounded-2xl transition-colors">
                <span className="text-[13px] font-bold text-white">Alle Details lesen</span>
                <ChevronRight size={14} strokeWidth={2.5} className="text-white/80" />
              </div>
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
              {/* Note dot indicator */}
              {hasNote && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFlipped(true); setTimeout(() => setShowNote(true), 350); }}
                  className="relative flex items-center justify-center w-8 h-8"
                >
                  <PenLine size={16} strokeWidth={1.5} className="text-amber-400" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                </button>
              )}
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
            className="bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)] border border-slate-100/40 dark:border-slate-700/40 overflow-hidden"
          >
            {/* Reading progress bar — animates over estimated read time */}
            <div className="relative h-1 overflow-hidden">
              <div className={clsx('absolute inset-0 bg-gradient-to-r opacity-30', accent.gradient)} />
              {flipped && (
                <div
                  key={`progress-${card.id}`}
                  className={clsx('absolute inset-0 bg-gradient-to-r origin-left', accent.gradient)}
                  style={{ animation: `read-progress ${card.read_time_sec ?? 45}s linear forwards` }}
                />
              )}
            </div>

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

              {/* Laienpresse: vollständiger Faktencheck auf Rückseite */}
              {isLayPress && card.lay_press_fact_check && (() => {
                const parsed = parseFactCheck(card.lay_press_fact_check);
                if (parsed) {
                  return (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="bg-amber-50 dark:bg-amber-900/20 px-3.5 py-2.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">📰 Medienbericht</p>
                        <p className="text-[13px] leading-relaxed text-amber-900 dark:text-amber-100 italic">„{parsed.medien}"</p>
                      </div>
                      <div className="bg-forest-50/80 dark:bg-forest-900/20 px-3.5 py-2.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-forest-600 dark:text-forest-400 mb-1">🔬 Fachliche Einordnung</p>
                        <p className="text-[13px] leading-relaxed text-forest-900 dark:text-forest-100">{parsed.fach}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl px-3.5 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-0.5">Faktencheck</p>
                    <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{card.lay_press_fact_check}</p>
                  </div>
                );
              })()}

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

            {/* Community verification */}
            {verifications && (
              <div className="px-4 pb-2" onClick={e => e.stopPropagation()}>
                <CardVerification
                  newsCardId={card.id}
                  userId={userId}
                  counts={verifications}
                  onRequireAuth={onRequireAuth}
                />
              </div>
            )}

            {/* Personal note */}
            <div className="px-4 pb-3">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNote(n => !n); }}
                className={clsx(
                  'flex items-center gap-1.5 text-[12px] font-semibold transition-colors',
                  showNote || hasNote ? 'text-amber-500' : 'text-slate-400 hover:text-amber-400'
                )}
              >
                <PenLine size={14} strokeWidth={2} />
                {showNote ? 'Notiz ausblenden' : hasNote ? 'Notiz bearbeiten' : 'Notiz hinzufügen'}
                {hasNote && !showNote && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />}
              </button>
              {showNote && (
                <div className="mt-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                  <textarea
                    value={note}
                    onChange={e => handleNoteChange(e.target.value)}
                    placeholder="Persönliche Notiz zu dieser Karte..."
                    rows={3}
                    className="w-full text-[13px] bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Source footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className={clsx('text-[10px] font-medium px-2 py-0.5 rounded-full', evidence.color)}>
                  {evidence.icon} {evidence.label}
                </span>
                {card.published_at && <span className="text-[10px] text-slate-400">{formatTime(card.published_at)}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Printer size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                  className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors"
                >
                  <RotateCcw size={13} strokeWidth={1.5} /> Zurück
                </button>
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
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default memo(NewsCard, (prev, next) =>
  prev.card.id === next.card.id &&
  prev.card.like_count === next.card.like_count &&
  prev.card.user_has_liked === next.card.user_has_liked &&
  prev.card.user_has_bookmarked === next.card.user_has_bookmarked &&
  prev.userId === next.userId
);
