'use client';

import { useState, useTransition, useRef, useEffect, useCallback, memo } from 'react';
import { useMinuteTick } from '@/hooks/useMinuteTick';
import { Heart, Bookmark, Send, ExternalLink, MessageCircle, RotateCcw, ChevronRight, ChevronDown, Link2, PenLine, Printer, EyeOff, Languages, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import dynamic from 'next/dynamic';

const CommentSection = dynamic(() => import('./CommentSection'), { ssr: false });
const CardVerification = dynamic(() => import('./CardVerification'), { ssr: false });
import { EVIDENCE_CONFIG, getEvidenceLabel } from '@/lib/evidence';
import { getCategoryStyle, getCategoryLabel, getCategoryCardAccent } from '@/lib/categories';
import { toggleLike, toggleBookmark, upsertNote, getNote } from '@/lib/actions/news';
import { getCardVerifications } from '@/lib/actions/community';
import { getCardTranslation } from '@/lib/actions/translate';
import type { CardTranslation } from '@/lib/translate-fields';
import { useUX } from '@/components/providers/UXProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import { sanitizeExternalUrl } from '@/lib/url';
import type { EvidenceLevel, NewsCard as NewsCardType, SourceType } from '@/types/database';

interface Props {
  card: NewsCardType;
  userId: string | null;
  onRequireAuth?: () => void;
  onShare?: (cardId: string) => void;
  defaultFlipped?: boolean;
  /**
   * Vom Feed bereitgestellte Batch-Übersetzung (locale != de).
   * undefined = kein Batch-Kontext (z.B. Detailseite) → Karte holt selbst;
   * null = Batch läuft/lieferte nichts → deutsches Original zeigen.
   */
  batchTranslation?: CardTranslation | null;
}

const SOURCE_TYPE_ACCENT: Record<string, { gradient: string; bgLight: string; bgDark: string; emoji: string }> = {
  forschung:     { gradient: 'from-blue-500 to-indigo-500',    bgLight: 'bg-blue-50',    bgDark: 'dark:bg-blue-950/30',    emoji: '🔬' },
  fachpresse:    { gradient: 'from-forest-500 to-emerald-500', bgLight: 'bg-emerald-50', bgDark: 'dark:bg-emerald-950/30', emoji: '📋' },
  laienpresse:   { gradient: 'from-amber-400 to-orange-500',   bgLight: 'bg-amber-50',   bgDark: 'dark:bg-amber-950/30',   emoji: '📰' },
  berufspolitik: { gradient: 'from-orange-500 to-red-500',     bgLight: 'bg-orange-50',  bgDark: 'dark:bg-orange-950/30',  emoji: '⚖️' },
  supplement:    { gradient: 'from-emerald-400 to-teal-500',   bgLight: 'bg-teal-50',    bgDark: 'dark:bg-teal-950/30',    emoji: '💊' },
  international: { gradient: 'from-sky-400 to-blue-500',       bgLight: 'bg-sky-50',     bgDark: 'dark:bg-sky-950/30',     emoji: '🌍' },
};

// Parst "MEDIEN: [...] → FACH: [...]" (oder die englische "CLAIM:/EXPERT:"-Variante) in zwei Teile
function parseFactCheck(text: string): { medien: string; fach: string } | null {
  const match = text.match(/(?:MEDIEN|CLAIM):\s*([\s\S]+?)\s*→\s*(?:FACH|EXPERT):\s*([\s\S]+)/);
  if (match) return { medien: match[1].trim(), fach: match[2].trim() };
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

function formatTime(dateStr: string | null, t: (k: string, v?: Record<string, string | number>) => string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('time.now');
  if (mins < 60) return t('time.min', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('time.hour', { n: hours });
  const days = Math.floor(hours / 24);
  return t(days > 1 ? 'time.days' : 'time.day', { n: days });
}

function NewsCard({ card, userId, onRequireAuth, onShare, defaultFlipped = false, batchTranslation }: Props) {
  const [flipped, setFlipped] = useState(defaultFlipped);
  const [showAllDetails, setShowAllDetails] = useState(false);
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
  const [translation, setTranslation] = useState<CardTranslation | null>(null);
  const [translating, setTranslating] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const swipeTouchStartX = useRef(0);
  const swipeTouchStartY = useRef(0);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ux = useUX();
  const { locale, t } = useI18n();
  const isRead = ux.readHistory.some(e => e.cardId === card.id);
  const isNew = ux.isNewCard(card.published_at);
  const noteKey = `nn-note-${card.id}`;

  const noteServerLoaded = useRef(false);

  // On mount: synchronous localStorage check only — no network call
  useEffect(() => {
    try {
      const stored = localStorage.getItem(noteKey);
      if (stored) { setNote(stored); setHasNote(true); }
    } catch { /* ignore */ }
  }, [noteKey]);

  // Cleanup debounce timer on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    };
  }, []);

  // Deferred: fetch from Supabase only when note panel is first opened
  useEffect(() => {
    if (!showNote || noteServerLoaded.current || hasNote || !userId) return;
    noteServerLoaded.current = true;
    let cancelled = false;
    getNote(card.id).then(remote => {
      if (cancelled || !remote) return;
      setNote(remote);
      setHasNote(true);
      try { localStorage.setItem(noteKey, remote); } catch { /* ignore */ }
    });
    return () => { cancelled = true; };
  }, [showNote, hasNote, card.id, userId, noteKey]);

  // Content translation for non-German locales — cached in localStorage + DB.
  // Im Feed liefert NewsFeed die Übersetzung gebündelt als Prop (1 API-Call
  // für den ganzen Batch); der Einzel-Fetch bleibt als Fallback für die
  // Detailseite (card/[id]), wo keine Batch-Prop ankommt.
  useEffect(() => {
    if (locale === 'de') { setTranslation(null); return; }
    if (batchTranslation !== undefined) {
      setTranslation(batchTranslation);
      setTranslating(batchTranslation === null);
      return;
    }
    const cacheKey = `nn-tr-${locale}-${card.id}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setTranslation(JSON.parse(cached)); return; }
    } catch { /* ignore */ }
    let cancelled = false;
    setTranslating(true);
    getCardTranslation(card.id, locale)
      .then(res => {
        if (cancelled || !res) return;
        setTranslation(res);
        try { localStorage.setItem(cacheKey, JSON.stringify(res)); } catch { /* ignore */ }
      })
      .finally(() => { if (!cancelled) setTranslating(false); });
    return () => { cancelled = true; };
  }, [locale, card.id, batchTranslation]);

  // Update relative time every 60s via shared singleton timer
  useMinuteTick();

  // Lazy-load verifications when card is first flipped
  useEffect(() => {
    if (flipped && verifications === null) {
      getCardVerifications(card.id).then(setVerifications);
    }
  }, [flipped, verifications, card.id]);

  const evidence = EVIDENCE_CONFIG[card.evidence_level as EvidenceLevel] ?? EVIDENCE_CONFIG['Expertenmeinung'];
  const evidenceLabel = getEvidenceLabel((card.evidence_level as EvidenceLevel) in EVIDENCE_CONFIG ? card.evidence_level as EvidenceLevel : 'Expertenmeinung', locale);
  const isLayPress = card.source_type === 'laienpresse';
  const accent = SOURCE_TYPE_ACCENT[card.source_type] ?? SOURCE_TYPE_ACCENT.forschung;
  const sourceTypeLabel = t(`sourceType.${card.source_type ?? 'forschung'}`);
  const categoryLabel = getCategoryLabel(card.category_main, locale);
  const categoryAccent = getCategoryCardAccent(card.category_main);

  // Translated text fields (fall back to German source when no translation yet).
  const tField = (field: keyof CardTranslation, fallback: string | null): string => {
    if (locale !== 'de' && translation && typeof translation[field] === 'string' && translation[field]) {
      return translation[field] as string;
    }
    return fallback ?? '';
  };
  const headline = tField('headline', card.headline);
  const kernbotschaft = tField('kernbotschaft', card.kernbotschaft);
  const snackWhat = tField('snack_what', card.snack_what);
  const snackResult = tField('snack_result', card.snack_result);
  const snackConsequence = tField('snack_consequence', card.snack_consequence);
  const therapistCheck = tField('therapist_check', card.therapist_check);
  const actionRecommendation = tField('action_recommendation', card.action_recommendation);
  const patientQuestion = tField('patient_question_anticipation', card.patient_question_anticipation);
  const evidenceSummary = tField('evidence_summary', card.evidence_summary);
  const layPressFactCheck = tField('lay_press_fact_check', card.lay_press_fact_check);
  const policyActionNeeded = tField('policy_action_needed', card.policy_action_needed);
  const internationalRelevanceDe = tField('international_relevance_de', card.international_relevance_de);

  useEffect(() => {
    if (backRef.current) {
      setBackHeight(backRef.current.scrollHeight);
    }
  }, [flipped, showComments, showAllDetails, translation]);

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
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#b45309;margin:0 0 6px;">${escapeHtml(t('card.addNote'))}</p>
          <p style="font-size:13px;color:#1e293b;white-space:pre-wrap;margin:0;">${escapeHtml(note)}</p>
        </div>`
      : '';
    const html = `<!DOCTYPE html><html lang="${locale}"><head><meta charset="UTF-8"><title>${escapeHtml(headline)}</title>
    <style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 24px;color:#1e293b}
    h1{font-size:20px;font-weight:700;line-height:1.3;margin:0 0 12px}
    .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin:0 0 4px}
    .box{background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:10px}
    .cat{display:inline-block;font-size:11px;font-weight:600;background:#f1f5f9;padding:2px 8px;border-radius:99px;margin-bottom:8px}
    .footer{font-size:10px;color:#94a3b8;margin-top:16px;padding-top:10px;border-top:1px solid #e2e8f0}
    @media print{body{margin:20px}}</style></head><body>
    <p class="cat">${escapeHtml(categoryLabel)}</p>
    <h1>${escapeHtml(headline)}</h1>
    ${kernbotschaft ? `<div class="box"><p style="font-size:15px;font-weight:600;margin:0">${escapeHtml(kernbotschaft)}</p></div>` : ''}
    <div class="box"><p class="label">${escapeHtml(t('card.what'))}</p><p style="font-size:13px;margin:0">${escapeHtml(snackWhat)}</p></div>
    <div class="box"><p class="label">${escapeHtml(t('card.result'))}</p><p style="font-size:13px;margin:0">${escapeHtml(snackResult)}</p></div>
    <div class="box"><p class="label">${escapeHtml(t('card.consequence'))}</p><p style="font-size:13px;margin:0">${escapeHtml(snackConsequence)}</p></div>
    ${actionRecommendation ? `<div class="box"><p class="label">${escapeHtml(t('card.actionRecommendation'))}</p><p style="font-size:13px;margin:0">${escapeHtml(actionRecommendation)}</p></div>` : ''}
    ${noteHtml}
    <div class="footer">${escapeHtml(t('common.source'))}: ${escapeHtml(card.source_name ?? '')} · NutriNews</div>
    <script>window.onload=()=>{window.print();window.close();}<\/script></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) w.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
  }

  function openCard() {
    vibrate(5);
    setFlipped(true);
    ux.markAsRead(card.id, card.headline, card.category_main);
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const cardUrl = getCardUrl();
    if (navigator.share) {
      try {
        const parts = [
          `${accent.emoji} ${headline}`,
          '',
          kernbotschaft ? `💡 ${kernbotschaft}` : (therapistCheck ? `💡 ${therapistCheck}` : ''),
          snackWhat ? `📌 ${snackWhat}` : '',
          snackResult ? `📊 ${snackResult}` : '',
        ].filter(Boolean);
        await navigator.share({
          title: headline,
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
            role="button"
            tabIndex={0}
            aria-label={`Artikel öffnen: ${headline}`}
            aria-expanded={flipped}
            className={clsx(
              'rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)] border border-l-[3px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-200',
              categoryAccent,
              isRead
                ? 'bg-white/80 dark:bg-slate-800/70 border-slate-100/40 dark:border-slate-700/40 opacity-80'
                : 'bg-white dark:bg-slate-800 border-slate-100/40 dark:border-slate-700/40'
            )}
            onClick={openCard}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault();
                openCard();
              }
            }}
          >
            {/* ── Kompakter Header: Quellentyp + Kategorie + Evidenz in einer Zeile ── */}
            <div className={clsx('relative px-4 pt-2.5 pb-2 overflow-hidden', accent.bgLight, accent.bgDark)}>
              {/* Gradient accent bar */}
              <div className={clsx('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r', accent.gradient)} />

              {/* Alles in einer Zeile: Quellentyp · Kategorie · Evidenz · Zeit */}
              <div className="relative flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {accent.emoji} {sourceTypeLabel}
                </span>
                <span className="text-slate-300 dark:text-slate-600 text-[11px]">&middot;</span>
                <span className={clsx(
                  'text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full',
                  getCategoryStyle(card.category_main)
                )}>
                  {categoryLabel}
                </span>
                <span className={clsx('text-[11px] font-semibold px-1.5 py-0.5 rounded-full', evidence.color)}>
                  {evidence.icon} {evidenceLabel}
                </span>
                {isNew && !isRead && (
                  <span className="text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 text-white px-1.5 py-0.5 rounded-full">
                    {t('common.new')}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1">
                  {card.published_at && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatTime(card.published_at, t)}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); ux.hideCard(card.id); }}
                    title={t('card.hide')}
                    aria-label="Artikel ausblenden"
                    className="p-0.5 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100/60 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <EyeOff size={12} strokeWidth={1.5} />
                  </button>
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="px-4 pt-3 pb-1.5">
              <h2 className="font-bold text-[17px] leading-[1.3] text-slate-900 dark:text-slate-100 tracking-[-0.02em]">
                {headline}
              </h2>
            </div>

            {/* Kernbotschaft (Hero) — die zentrale Aussage, direkt an die Leser:in
                gerichtet. Fallback auf "Was?" für Altkarten ohne Kernbotschaft. */}
            {kernbotschaft ? (
              <div className="px-4 pb-2.5">
                <p className="text-[15px] font-semibold leading-snug text-slate-800 dark:text-slate-100">
                  {kernbotschaft}
                </p>
              </div>
            ) : snackWhat ? (
              <div className="mx-4 mb-2 flex items-baseline gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex-shrink-0">{t('card.what')}</span>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {snackWhat}
                </p>
              </div>
            ) : null}

            {/* Praxisrelevanz — kompakte Dots ohne Label */}
            {card.practice_relevance_score != null && (
              <div className="mx-4 mb-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <span
                    key={i}
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full',
                      i <= (card.practice_relevance_score ?? 0)
                        ? 'bg-forest-500 dark:bg-forest-400'
                        : 'bg-slate-200 dark:bg-slate-600'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Laienpresse: kompakter Hinweis */}
            {isLayPress && layPressFactCheck && (
              <div className="mx-4 mb-2 flex items-center">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/30">
                  {t('card.factCheckAvailable')}
                </span>
              </div>
            )}

            {/* Tap hint — kompakter CTA */}
            <div className="px-4 pb-2">
              <div className="flex items-center justify-center gap-1 bg-forest-600 dark:bg-forest-700 hover:bg-forest-700 dark:hover:bg-forest-600 py-1.5 rounded-xl transition-colors">
                <span className="text-[12px] font-bold text-white">{t('card.readDetails')}</span>
                <ChevronRight size={13} strokeWidth={2.5} className="text-white/80" />
              </div>
            </div>

            {/* ── Instagram-style action bar ── */}
            <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-100/80 dark:border-slate-700/60">
              <button
                onClick={handleLike}
                disabled={isPending}
                aria-label={liked ? 'Gefällt mir entfernen' : 'Gefällt mir'}
                aria-pressed={liked}
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
                aria-label="Kommentare anzeigen"
                aria-pressed={showComments}
                className={clsx(
                  'flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-all',
                  showComments ? 'text-forest-600 dark:text-forest-400' : 'text-slate-400 hover:text-forest-500'
                )}
              >
                <MessageCircle size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleShare}
                aria-label="Artikel teilen"
                className="flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-forest-500 px-2.5 py-1.5 rounded-lg transition-all"
              >
                <Send size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleCopyLink}
                aria-label="Link kopieren"
                className={clsx(
                  'flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-lg transition-all',
                  linkCopied ? 'text-forest-600' : 'text-slate-400 hover:text-forest-500'
                )}
              >
                <Link2 size={18} strokeWidth={1.5} />
                {linkCopied && <span className="text-[11px]">{t('card.copied')}</span>}
              </button>
              {/* Note dot indicator */}
              {hasNote && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFlipped(true); setTimeout(() => setShowNote(true), 350); }}
                  aria-label="Notiz anzeigen"
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
                  aria-label={bookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen setzen'}
                  aria-pressed={bookmarked}
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
            className={clsx(
              'bg-white dark:bg-slate-800 rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)] border border-l-[3px] border-slate-100/40 dark:border-slate-700/40 overflow-hidden',
              categoryAccent
            )}
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
                  'text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full',
                  getCategoryStyle(card.category_main)
                )}>
                  {categoryLabel}
                </span>
                {translating && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Languages size={11} /> {t('card.translating')}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                className="flex items-center gap-1 text-[12px] text-forest-600 dark:text-forest-400 font-semibold"
              >
                <RotateCcw size={13} />
                {t('common.back')}
              </button>
            </div>

            {/* Headline (smaller on back) */}
            <div className="px-4 pb-3">
              <h3 className="font-semibold text-[14px] leading-snug text-slate-700 dark:text-slate-200">
                {headline}
              </h3>
            </div>

            {/* Detail fields */}
            <div className="px-4 space-y-2.5 pb-4">

              {/* Laienpresse: vollständiger Faktencheck auf Rückseite */}
              {isLayPress && layPressFactCheck && (() => {
                const parsed = parseFactCheck(layPressFactCheck);
                if (parsed) {
                  return (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <div className="bg-amber-50 dark:bg-amber-900/20 px-3.5 py-2.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">📰 {t('card.mediaReport')}</p>
                        <p className="text-[13px] leading-relaxed text-amber-900 dark:text-amber-100 italic">„{parsed.medien}"</p>
                      </div>
                      <div className="bg-forest-50/80 dark:bg-forest-900/20 px-3.5 py-2.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-forest-600 dark:text-forest-400 mb-1">🔬 {t('card.expertContext')}</p>
                        <p className="text-[13px] leading-relaxed text-forest-900 dark:text-forest-100">{parsed.fach}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl px-3.5 py-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-0.5">{t('card.factCheck')}</p>
                    <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{layPressFactCheck}</p>
                  </div>
                );
              })()}

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3.5 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">{t('card.what')}</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{snackWhat}</p>
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-xl px-3.5 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">{t('card.result')}</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{snackResult}</p>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl px-3.5 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-0.5">{t('card.consequence')}</p>
                <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{snackConsequence}</p>
              </div>

              {/* ── Optionale Details — ausklappbar für weniger Textwand ── */}
              {(evidenceSummary || actionRecommendation || patientQuestion || policyActionNeeded || internationalRelevanceDe) && (
                <>
                  {!showAllDetails && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAllDetails(true); }}
                      aria-expanded={showAllDetails}
                      aria-label={t('card.moreDetails')}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-[12px] font-semibold text-forest-600 dark:text-forest-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-slate-700"
                    >
                      <ChevronDown size={14} />
                      {t('card.moreDetails')}
                    </button>
                  )}

                  {showAllDetails && (
                    <div className="space-y-2.5 animate-fade-in">
                      {evidenceSummary && (
                        <div className="bg-indigo-50/60 dark:bg-indigo-900/20 rounded-xl px-3.5 py-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">
                            {evidence.icon} {t('card.evidenceContext')}
                          </p>
                          <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{evidenceSummary}</p>
                        </div>
                      )}

                      {actionRecommendation && (
                        <div className="bg-forest-50/60 dark:bg-forest-900/20 rounded-xl px-3.5 py-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-forest-500 dark:text-forest-400 mb-0.5">{t('card.actionRecommendation')}</p>
                          <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{actionRecommendation}</p>
                        </div>
                      )}

                      {patientQuestion && (
                        <div className="bg-rose-50/60 dark:bg-rose-900/20 rounded-xl px-3.5 py-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-rose-400 mb-0.5">{t('card.patientQuestion')}</p>
                          <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 italic">
                            &ldquo;{patientQuestion}&rdquo;
                          </p>
                        </div>
                      )}

                      {policyActionNeeded && (
                        <div className="bg-orange-50/60 dark:bg-orange-900/20 rounded-xl px-3.5 py-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500 dark:text-orange-400 mb-0.5">{t('card.policyAction')}</p>
                          <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{policyActionNeeded}</p>
                        </div>
                      )}

                      {internationalRelevanceDe && (
                        <div className="bg-sky-50/60 dark:bg-sky-900/20 rounded-xl px-3.5 py-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-0.5">{t('card.relevanceDE')}</p>
                          <p className="text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{internationalRelevanceDe}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {card.curated_by_agent && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    {t('card.aiSummary')}
                  </span>
                  <span className="text-[11px] text-slate-300 dark:text-slate-500">{card.source_name}</span>
                </div>
              )}
            </div>

            {/* Bibliographic references */}
            {(card.doi || card.pubmed_id) && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {card.doi && (
                  <a href={`https://doi.org/${card.doi}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors">
                    DOI: {card.doi}
                  </a>
                )}
                {card.pubmed_id && (
                  <a href={`https://pubmed.ncbi.nlm.nih.gov/${card.pubmed_id}/`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors">
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

            {/* Personal note + Read Later */}
            <div className="px-4 pb-3 flex items-start justify-between gap-3">
              <div className="flex-1">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNote(n => !n); }}
                className={clsx(
                  'flex items-center gap-1.5 text-[12px] font-semibold transition-colors',
                  showNote || hasNote ? 'text-amber-500' : 'text-slate-400 hover:text-amber-400'
                )}
              >
                <PenLine size={14} strokeWidth={2} />
                {showNote ? t('card.hideNote') : hasNote ? t('card.editNote') : t('card.addNote')}
                {hasNote && !showNote && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />}
              </button>
              {showNote && (
                <div className="mt-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                  <textarea
                    value={note}
                    onChange={e => handleNoteChange(e.target.value)}
                    placeholder={t('card.notePlaceholder')}
                    rows={3}
                    className="w-full text-[13px] bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50 resize-none"
                  />
                </div>
              )}
              </div>
              {/* Read Later toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); vibrate(ux.isInReadLater(card.id) ? 3 : [4,1,4]); ux.toggleReadLater(card.id); }}
                aria-label={ux.isInReadLater(card.id) ? 'Aus "Später lesen" entfernen' : 'Für später merken'}
                aria-pressed={ux.isInReadLater(card.id)}
                className={clsx(
                  'flex items-center gap-1 text-[12px] font-semibold transition-colors px-2 py-1 rounded-lg shrink-0 mt-0.5',
                  ux.isInReadLater(card.id)
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20'
                    : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50/60 dark:hover:bg-sky-900/10'
                )}
              >
                <Clock size={14} strokeWidth={ux.isInReadLater(card.id) ? 2.5 : 1.5} />
                <span className="hidden sm:inline">{ux.isInReadLater(card.id) ? 'Gemerkt' : 'Später'}</span>
              </button>
            </div>

            {/* Source footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className={clsx('text-[11px] font-medium px-2 py-0.5 rounded-full', evidence.color)}>
                  {evidence.icon} {evidenceLabel}
                </span>
                {card.published_at && <span className="text-[11px] text-slate-500 dark:text-slate-400">{formatTime(card.published_at, t)}</span>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  aria-label="Artikel drucken"
                  className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Printer size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
                  className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold transition-colors"
                >
                  <RotateCcw size={13} strokeWidth={1.5} /> {t('common.back')}
                </button>
                {sanitizeExternalUrl(card.source_url) && (
                  <a
                    href={sanitizeExternalUrl(card.source_url) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1 text-[12px] text-forest-600 dark:text-forest-400 font-semibold"
                  >
                    {t('common.source')} <ExternalLink size={12} />
                  </a>
                )}
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
  prev.userId === next.userId &&
  prev.batchTranslation === next.batchTranslation
);
